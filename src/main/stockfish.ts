import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as os from 'os';

export interface EngineConfig {
  depth: number;
  threads: number;
  hash: number;
  multiPV: number;
  skillLevel?: number;
  limitStrength?: boolean;
  uciElo?: number;
}

export interface EngineAnalysis {
  bestMove: string;
  ponder?: string;
  score?: number;
  mate?: number;
  depth: number;
  lines: Array<{
    moves: string[];
    score?: number;
    mate?: number;
  }>;
}

export class StockfishEngine extends EventEmitter {
  private process: ChildProcess | null = null;
  private config: EngineConfig;
  private isReady = false;
  private outputBuffer = '';
  private currentAnalysis: Partial<EngineAnalysis> = { lines: [] };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat = Date.now();

  constructor(config: EngineConfig) {
    super();
    this.config = config;
  }

  async start(): Promise<void> {
    const binaryPath = this.getStockfishBinary();
    
    this.process = spawn(binaryPath, [], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.process.stdout?.on('data', (data) => {
      this.lastHeartbeat = Date.now();
      this.handleOutput(data.toString());
    });

    this.process.stderr?.on('data', (data) => {
      console.error('Stockfish stderr:', data.toString());
    });

    this.process.on('error', (error) => {
      console.error('Stockfish process error:', error);
      this.emit('error', error);
    });

    this.process.on('exit', (code) => {
      console.log('Stockfish exited with code:', code);
      this.isReady = false;
      this.emit('exit', code);
    });

    // Start heartbeat monitoring
    this.startHeartbeat();

    // Initialize UCI
    await this.sendCommand('uci');
    await this.waitForReady();
    await this.configure();
  }

  private getStockfishBinary(): string {
    const platform = os.platform();
    const arch = os.arch();
    
    let binaryName = 'stockfish';
    
    if (platform === 'win32') {
      binaryName = 'stockfish.exe';
    } else if (platform === 'darwin') {
      binaryName = 'stockfish-macos';
    } else if (platform === 'linux') {
      binaryName = arch === 'x64' ? 'stockfish-linux-x64' : 'stockfish-linux';
    }

    // For now, try to find stockfish in PATH or resources folder
    const resourcePath = path.join(process.cwd(), 'resources', 'stockfish', binaryName);
    
    // In development, we might not have the binary yet
    // Try to use system stockfish
    return 'stockfish'; // Will use system PATH
  }

  private async configure(): Promise<void> {
    await this.sendCommand(`setoption name Threads value ${this.config.threads}`);
    await this.sendCommand(`setoption name Hash value ${this.config.hash}`);
    await this.sendCommand(`setoption name MultiPV value ${this.config.multiPV}`);
    
    if (this.config.limitStrength && this.config.uciElo) {
      await this.sendCommand(`setoption name UCI_LimitStrength value true`);
      await this.sendCommand(`setoption name UCI_Elo value ${this.config.uciElo}`);
    }
    
    if (this.config.skillLevel !== undefined) {
      await this.sendCommand(`setoption name Skill Level value ${this.config.skillLevel}`);
    }

    await this.sendCommand('isready');
    await this.waitForReady();
  }

  async updateConfig(newConfig: Partial<EngineConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.threads !== undefined) {
      await this.sendCommand(`setoption name Threads value ${newConfig.threads}`);
    }
    if (newConfig.hash !== undefined) {
      await this.sendCommand(`setoption name Hash value ${newConfig.hash}`);
    }
    if (newConfig.multiPV !== undefined) {
      await this.sendCommand(`setoption name MultiPV value ${newConfig.multiPV}`);
    }
    if (newConfig.skillLevel !== undefined) {
      await this.sendCommand(`setoption name Skill Level value ${newConfig.skillLevel}`);
    }
    if (newConfig.limitStrength !== undefined && newConfig.uciElo !== undefined) {
      await this.sendCommand(`setoption name UCI_LimitStrength value ${newConfig.limitStrength}`);
      await this.sendCommand(`setoption name UCI_Elo value ${newConfig.uciElo}`);
    }
  }

  async analyze(fen: string): Promise<void> {
    this.currentAnalysis = { lines: [] };
    await this.sendCommand(`position fen ${fen}`);
    await this.sendCommand(`go depth ${this.config.depth}`);
  }

  async getBestMove(fen: string): Promise<string> {
    return new Promise((resolve) => {
      const handler = (analysis: EngineAnalysis) => {
        if (analysis.bestMove) {
          this.off('analysis', handler);
          resolve(analysis.bestMove);
        }
      };
      this.on('analysis', handler);
      this.analyze(fen);
    });
  }

  stop(): void {
    this.sendCommand('stop');
  }

  quit(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.sendCommand('quit');
    
    setTimeout(() => {
      if (this.process) {
        this.process.kill();
      }
    }, 1000);
  }

  private sendCommand(command: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.process && this.process.stdin) {
        this.process.stdin.write(command + '\n', () => resolve());
      } else {
        resolve();
      }
    });
  }

  private handleOutput(data: string): void {
    this.outputBuffer += data;
    const lines = this.outputBuffer.split('\n');
    this.outputBuffer = lines.pop() || '';

    for (const line of lines) {
      this.parseLine(line.trim());
    }
  }

  private parseLine(line: string): void {
    if (!line) return;

    if (line === 'uciok') {
      this.emit('uciok');
    } else if (line === 'readyok') {
      this.isReady = true;
      this.emit('readyok');
    } else if (line.startsWith('info')) {
      this.parseInfo(line);
    } else if (line.startsWith('bestmove')) {
      this.parseBestMove(line);
    }
  }

  private parseInfo(line: string): void {
    const parts = line.split(' ');
    let depth = 0;
    let multipv = 1;
    let score: number | undefined;
    let mate: number | undefined;
    let pv: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'depth') {
        depth = parseInt(parts[i + 1]);
      } else if (parts[i] === 'multipv') {
        multipv = parseInt(parts[i + 1]);
      } else if (parts[i] === 'score') {
        if (parts[i + 1] === 'cp') {
          score = parseInt(parts[i + 2]);
        } else if (parts[i + 1] === 'mate') {
          mate = parseInt(parts[i + 2]);
        }
      } else if (parts[i] === 'pv') {
        pv = parts.slice(i + 1);
        break;
      }
    }

    if (pv.length > 0) {
      const lineIndex = multipv - 1;
      if (!this.currentAnalysis.lines) {
        this.currentAnalysis.lines = [];
      }
      
      while (this.currentAnalysis.lines.length <= lineIndex) {
        this.currentAnalysis.lines.push({ moves: [], score: undefined, mate: undefined });
      }
      
      this.currentAnalysis.lines[lineIndex] = { moves: pv, score, mate };
      this.currentAnalysis.depth = depth;
      
      this.emit('info', { depth, multipv, score, mate, pv });
    }
  }

  private parseBestMove(line: string): void {
    const parts = line.split(' ');
    const bestMove = parts[1];
    const ponder = parts[3];

    const analysis: EngineAnalysis = {
      bestMove,
      ponder,
      depth: this.currentAnalysis.depth || 0,
      lines: this.currentAnalysis.lines || [],
      score: this.currentAnalysis.lines?.[0]?.score,
      mate: this.currentAnalysis.lines?.[0]?.mate
    };

    this.emit('analysis', analysis);
    this.currentAnalysis = { lines: [] };
  }

  private waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isReady) {
        resolve();
      } else {
        const handler = () => {
          this.off('readyok', handler);
          resolve();
        };
        this.on('readyok', handler);
      }
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastHeartbeat > 30000) {
        // No response for 30 seconds, engine might be crashed
        console.error('Stockfish heartbeat timeout, attempting restart...');
        this.emit('crashed');
        this.restart();
      }
    }, 10000); // Check every 10 seconds
  }

  private async restart(): Promise<void> {
    if (this.process) {
      this.process.kill();
    }
    await this.start();
  }
}
