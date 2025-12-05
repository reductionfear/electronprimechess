import { create } from 'zustand';

export type Platform = 'chesscom' | 'lichess' | 'worldchess';
export type MoveMode = 'dom' | 'websocket' | 'external';
export type ExecutionMode = 'click' | 'drag';

export interface EngineState {
  depth: number;
  threads: number;
  hash: number;
  multiPV: number;
  skillLevel?: number;
  uciElo?: number;
}

export interface GameState {
  fen: string | null;
  playerColor: 'white' | 'black' | null;
  isMyTurn: boolean;
  currentEval: number | null;
  mate: number | null;
  bestMove: string | null;
  lines: Array<{
    moves: string[];
    score?: number;
    mate?: number;
  }>;
}

export interface AutoplayState {
  enabled: boolean;
  minDelay: number;
  maxDelay: number;
  moveMode: MoveMode;
  executionMode: ExecutionMode;
}

export interface OverlayState {
  visible: boolean;
  showArrows: boolean;
  showEvalBar: boolean;
  arrowOpacity: number;
}

export interface AppState {
  // Platform
  selectedPlatform: Platform | null;
  setSelectedPlatform: (platform: Platform | null) => void;

  // Engine
  engineState: EngineState;
  updateEngineState: (state: Partial<EngineState>) => void;

  // Game
  gameState: GameState;
  updateGameState: (state: Partial<GameState>) => void;

  // Autoplay
  autoplayState: AutoplayState;
  updateAutoplayState: (state: Partial<AutoplayState>) => void;
  toggleAutoplay: () => void;

  // Overlay
  overlayState: OverlayState;
  updateOverlayState: (state: Partial<OverlayState>) => void;
  toggleOverlay: () => void;

  // Connection
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Status
  status: 'idle' | 'waiting' | 'thinking' | 'moving' | 'error';
  setStatus: (status: AppState['status']) => void;
  statusMessage: string;
  setStatusMessage: (message: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // Platform
  selectedPlatform: null,
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),

  // Engine
  engineState: {
    depth: 20,
    threads: 4,
    hash: 128,
    multiPV: 1,
    skillLevel: 20,
    uciElo: 3000,
  },
  updateEngineState: (state) =>
    set((prev) => ({
      engineState: { ...prev.engineState, ...state },
    })),

  // Game
  gameState: {
    fen: null,
    playerColor: null,
    isMyTurn: false,
    currentEval: null,
    mate: null,
    bestMove: null,
    lines: [],
  },
  updateGameState: (state) =>
    set((prev) => ({
      gameState: { ...prev.gameState, ...state },
    })),

  // Autoplay
  autoplayState: {
    enabled: false,
    minDelay: 500,
    maxDelay: 2000,
    moveMode: 'dom',
    executionMode: 'click',
  },
  updateAutoplayState: (state) =>
    set((prev) => ({
      autoplayState: { ...prev.autoplayState, ...state },
    })),
  toggleAutoplay: () =>
    set((state) => ({
      autoplayState: {
        ...state.autoplayState,
        enabled: !state.autoplayState.enabled,
      },
    })),

  // Overlay
  overlayState: {
    visible: true,
    showArrows: true,
    showEvalBar: true,
    arrowOpacity: 0.8,
  },
  updateOverlayState: (state) =>
    set((prev) => ({
      overlayState: { ...prev.overlayState, ...state },
    })),
  toggleOverlay: () =>
    set((state) => ({
      overlayState: {
        ...state.overlayState,
        visible: !state.overlayState.visible,
      },
    })),

  // Connection
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),

  // Status
  status: 'idle',
  setStatus: (status) => set({ status }),
  statusMessage: 'Ready',
  setStatusMessage: (message) => set({ statusMessage: message }),
}));
