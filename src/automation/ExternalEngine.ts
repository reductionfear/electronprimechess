/**
 * External UCI engine connection via WebSocket
 * Allows connecting to remote chess engines
 */

export interface ExternalEngineConfig {
  url: string;
  passkey?: string;
}

export interface UCICommand {
  type: 'position' | 'go' | 'stop' | 'setoption';
  data: any;
}

export class ExternalEngine {
  private ws: WebSocket | null = null;
  private config: ExternalEngineConfig;
  private connected = false;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(config: ExternalEngineConfig) {
    this.config = config;
  }

  /**
   * Connect to external UCI server
   */
  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('Connected to external UCI server');
          this.connected = true;

          // Send authentication if passkey provided
          if (this.config.passkey) {
            this.send({
              type: 'auth',
              passkey: this.config.passkey,
            });
          }

          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connected = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from external UCI server');
          this.connected = false;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from external server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  /**
   * Send UCI command to external engine
   */
  sendCommand(command: UCICommand): boolean {
    if (!this.connected || !this.ws) {
      console.error('Not connected to external engine');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(command));
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  }

  /**
   * Send position to external engine
   */
  setPosition(fen: string): boolean {
    return this.sendCommand({
      type: 'position',
      data: { fen },
    });
  }

  /**
   * Start analysis
   */
  go(depth?: number, time?: number): boolean {
    return this.sendCommand({
      type: 'go',
      data: { depth, time },
    });
  }

  /**
   * Stop analysis
   */
  stop(): boolean {
    return this.sendCommand({
      type: 'stop',
      data: {},
    });
  }

  /**
   * Set engine option
   */
  setOption(name: string, value: any): boolean {
    return this.sendCommand({
      type: 'setoption',
      data: { name, value },
    });
  }

  /**
   * Register message handler
   */
  on(event: string, handler: (data: any) => void): void {
    this.messageHandlers.set(event, handler);
  }

  /**
   * Remove message handler
   */
  off(event: string): void {
    this.messageHandlers.delete(event);
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: any): void {
    if (data.type && this.messageHandlers.has(data.type)) {
      const handler = this.messageHandlers.get(data.type);
      if (handler) {
        handler(data.data);
      }
    }

    // Default handlers
    if (data.type === 'info') {
      console.log('Engine info:', data.data);
    } else if (data.type === 'bestmove') {
      console.log('Best move:', data.data);
    } else if (data.type === 'error') {
      console.error('Engine error:', data.data);
    }
  }

  /**
   * Send raw data
   */
  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
