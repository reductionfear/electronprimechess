# Prime Chess - Architecture Documentation

## Overview

Prime Chess is an Electron-based desktop application that provides real-time chess engine analysis and automation for web-based chess platforms. The architecture follows a modular design with clear separation between the Electron main process, renderer process, and various subsystems.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │Chess.com   │  │  Lichess   │  │ Worldchess │               │
│  │   Board    │  │   Board    │  │   Board    │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└───────────┬─────────────────────────────────────────────────────┘
            │ Board Detection / FEN Extraction
            │ Move Execution (DOM/WebSocket)
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                    Electron Application                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Main Process                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐     │ │
│  │  │   Window     │  │  Stockfish   │  │   Overlay   │     │ │
│  │  │  Management  │  │    Engine    │  │   Manager   │     │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘     │ │
│  │         │                  │                 │             │ │
│  │         └──────────────────┴─────────────────┘             │ │
│  │                          IPC                                │ │
│  └───────────────────────────┬──────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────────┐ │
│  │                    Renderer Process                          │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │                 React App                             │   │ │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │ │
│  │  │  │ Platform │  │ Control  │  │  Engine  │           │   │ │
│  │  │  │ Selector │  │  Panel   │  │  Output  │           │   │ │
│  │  │  └──────────┘  └──────────┘  └──────────┘           │   │ │
│  │  │                                                       │   │ │
│  │  │  ┌────────────────────────────────────────┐          │   │ │
│  │  │  │        Zustand State Store             │          │   │ │
│  │  │  │  - Engine State                        │          │   │ │
│  │  │  │  - Game State                          │          │   │ │
│  │  │  │  - Autoplay State                      │          │   │ │
│  │  │  │  - Overlay State                       │          │   │ │
│  │  │  └────────────────────────────────────────┘          │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │              Visual Overlay Layer                     │   │ │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │ │
│  │  │  │  Canvas  │  │  Arrows  │  │   Eval   │           │   │ │
│  │  │  │ Renderer │  │  System  │  │   Bar    │           │   │ │
│  │  │  └──────────┘  └──────────┘  └──────────┘           │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                   Subsystems                                 │ │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐              │ │
│  │  │ Platform  │  │Automation │  │  Utilities│              │ │
│  │  │ Adapters  │  │  System   │  │           │              │ │
│  │  └───────────┘  └───────────┘  └───────────┘              │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────┐
│   External UCI Engine      │
│   (Optional WebSocket)     │
└────────────────────────────┘
```

## Core Components

### 1. Main Process (`src/main/`)

**Responsibilities:**
- Window lifecycle management
- Stockfish engine process management
- IPC communication
- System-level operations

**Key Files:**
- `index.ts`: Application entry point, window creation
- `stockfish.ts`: UCI protocol wrapper, engine management

**Technologies:**
- Electron Main Process
- Node.js child_process for Stockfish
- IPC for renderer communication

### 2. Renderer Process (`src/renderer/`)

**Responsibilities:**
- User interface
- State management
- Event handling
- Visual feedback

**Key Files:**
- `App.tsx`: Main application component
- `components/`: UI components
- `store/useStore.ts`: Zustand state management
- `styles/`: Tailwind CSS styling

**Technologies:**
- React 19
- Zustand for state
- Tailwind CSS v4
- Radix UI components

### 3. Preload Scripts (`src/preload/`)

**Responsibilities:**
- Secure IPC bridge
- Context isolation
- API exposure to renderer

**Key Files:**
- `index.ts`: Context bridge setup

**Security:**
- Context isolation enabled
- Limited API exposure
- Type-safe communication

## Subsystems

### Platform Adapters (`src/adapters/`)

**Purpose:** Abstract platform-specific board detection and interaction

**Architecture:**
```typescript
BaseAdapter (Abstract)
├── ChessComAdapter
│   ├── Shadow DOM handling
│   ├── TCN decoding
│   └── Board detection
├── LichessAdapter
│   ├── WebSocket integration
│   ├── FEN completion
│   └── Board detection
└── WorldchessAdapter
    └── Basic support
```

**Key Methods:**
- `detectBoard()`: Find and measure board
- `getFEN()`: Extract current position
- `getPlayerColor()`: Determine orientation
- `executeMove()`: Send move to platform

### Automation System (`src/automation/`)

**Purpose:** Execute moves with human-like behavior

**Components:**

1. **MouseHumanizer** (`MouseHumanizer.ts`)
   - Bezier curve path generation
   - Random delays and jitter
   - Pause simulation
   - Speed variation

2. **WebSocketMove** (`WebSocketMove.ts`)
   - Direct WebSocket communication
   - Platform-specific protocols
   - Injection scripts
   - Fast execution

3. **ExternalEngine** (`ExternalEngine.ts`)
   - External UCI server connection
   - WebSocket-based UCI
   - Command routing
   - Event handling

### Stockfish Engine System

**Architecture:**

```typescript
StockfishEngine
├── Process Management
│   ├── spawn()
│   ├── restart()
│   └── quit()
├── UCI Communication
│   ├── sendCommand()
│   ├── parseOutput()
│   └── handleLine()
├── Configuration
│   ├── depth
│   ├── threads
│   ├── hash
│   ├── multiPV
│   └── skill level
└── Monitoring
    ├── heartbeat
    ├── crash detection
    └── auto-recovery
```

**Features:**
- Asynchronous analysis
- Multi-platform binary support
- Configurable strength
- Crash recovery
- Performance monitoring

### Visual Overlay System (`src/overlay/`)

**Purpose:** Display analysis on top of chess board

**Components:**

1. **OverlayCanvas** (`OverlayCanvas.tsx`)
   - Canvas-based rendering
   - Arrow drawing
   - Color coding (best move, alternatives)
   - Coordinate mapping

2. **EvalBar** (`EvalBar.tsx`)
   - Real-time evaluation display
   - Mate detection
   - Visual feedback
   - Position indicator

**Rendering:**
- 60fps target
- Click-through transparency
- Dynamic positioning
- Color-coded feedback

## State Management

### Zustand Store Structure

```typescript
AppState {
  // Platform
  selectedPlatform: Platform | null
  
  // Engine Configuration
  engineState: {
    depth: number
    threads: number
    hash: number
    multiPV: number
    skillLevel?: number
    uciElo?: number
  }
  
  // Game State
  gameState: {
    fen: string | null
    playerColor: 'white' | 'black' | null
    isMyTurn: boolean
    currentEval: number | null
    mate: number | null
    bestMove: string | null
    lines: Array<{
      moves: string[]
      score?: number
      mate?: number
    }>
  }
  
  // Autoplay
  autoplayState: {
    enabled: boolean
    minDelay: number
    maxDelay: number
    moveMode: 'dom' | 'websocket' | 'external'
    executionMode: 'click' | 'drag'
  }
  
  // Overlay
  overlayState: {
    visible: boolean
    showArrows: boolean
    showEvalBar: boolean
    arrowOpacity: number
  }
  
  // Connection
  isConnected: boolean
  status: 'idle' | 'waiting' | 'thinking' | 'moving' | 'error'
  statusMessage: string
}
```

### State Flow

```
User Action
    ↓
UI Component
    ↓
Zustand Action
    ↓
State Update
    ↓
Re-render
    ↓
IPC (if needed)
    ↓
Main Process
    ↓
Engine/System
    ↓
IPC Response
    ↓
State Update
    ↓
UI Update
```

## Communication Patterns

### IPC Communication

**Renderer → Main:**
```typescript
// Analyze position
window.electronAPI.engineAnalyze(fen)

// Stop analysis
window.electronAPI.engineStop()

// Update config
window.electronAPI.engineConfig(config)

// Overlay control
window.electronAPI.createOverlay()
window.electronAPI.moveOverlay(x, y, w, h)
```

**Main → Renderer:**
```typescript
// Engine events
mainWindow.webContents.send('engine-ready')
mainWindow.webContents.send('engine-analysis', analysis)
mainWindow.webContents.send('engine-info', info)
mainWindow.webContents.send('engine-crashed')
```

### UCI Protocol Flow

```
Main Process                 Stockfish
     |                            |
     |------- "uci" ----------->  |
     |                            |
     |<------ "uciok" -----------  |
     |                            |
     |--- "setoption name..." -->  |
     |                            |
     |------- "isready" -------->  |
     |                            |
     |<------ "readyok" ---------  |
     |                            |
     |--- "position fen ..." --->  |
     |                            |
     |--- "go depth 20" -------->  |
     |                            |
     |<---- "info depth 1..." ---  |
     |<---- "info depth 2..." ---  |
     |<---- "..." ---------------  |
     |                            |
     |<- "bestmove e2e4 ..." ----  |
     |                            |
```

## Data Flow

### Analysis Flow

```
1. User Action / Board Change
        ↓
2. FEN Extraction (Platform Adapter)
        ↓
3. State Update (Zustand)
        ↓
4. IPC: engineAnalyze(fen)
        ↓
5. UCI: position fen ... go depth X
        ↓
6. Stockfish Analysis
        ↓
7. UCI: info ... bestmove
        ↓
8. Parse Output
        ↓
9. IPC: engine-analysis event
        ↓
10. State Update (Zustand)
        ↓
11. UI Update (React)
        ↓
12. Overlay Update (Canvas)
```

### Move Execution Flow

```
1. Engine Analysis Complete
        ↓
2. Autoplay Check
        ↓
3. Delay Calculation
        ↓
4. Mode Selection
        ↓
   ┌────┴────┬────────────┐
   │         │            │
   ▼         ▼            ▼
  DOM    WebSocket    External
   │         │            │
   ▼         ▼            ▼
Mouse    Direct       UCI
Movement  Send      Command
   │         │            │
   └────┬────┴────────────┘
        ↓
   Move Executed
        ↓
   Board Update
        ↓
   New FEN
        ↓
   (Loop back to Analysis)
```

## Security Considerations

### Context Isolation
- Enabled by default
- Limited API exposure via contextBridge
- Type-safe IPC communication

### Engine Security
- Local process execution
- No network access
- Sandboxed environment

### Browser Integration
- Optional feature
- No code injection in default mode
- User consent required

## Performance Optimization

### Engine Performance
- Configurable depth for speed/strength trade-off
- Thread utilization
- Hash table size optimization
- Multi-PV analysis

### UI Performance
- React component optimization
- Zustand for efficient updates
- Canvas rendering for overlay
- requestAnimationFrame for smooth animations

### Memory Management
- Engine memory limits
- State cleanup
- Event listener cleanup
- Process monitoring

## Future Enhancements

### Planned Features
1. Browser extension integration
2. Actual robot.js/nut.js integration for mouse control
3. Complete WebSocket injection
4. Game recording and analysis
5. Opening book integration
6. Cloud engine support
7. Multi-language support

### Technical Debt
1. Complete platform adapter implementations
2. Browser window detection
3. Screen coordinate detection
4. Full overlay positioning
5. Comprehensive error handling
6. Unit and integration tests

## Development Guidelines

### Code Organization
- Modular design
- Single responsibility principle
- Type safety throughout
- Clear interfaces

### Testing Strategy
- Unit tests for utilities
- Integration tests for adapters
- E2E tests for workflows
- Performance benchmarks

### Build Process
- TypeScript compilation
- Vite bundling
- Electron packaging
- Multi-platform builds

## Deployment

### Distribution
- Electron Builder for packaging
- Platform-specific installers
- Auto-update mechanism (future)
- Version management

### System Requirements
- Node.js 18+
- Electron 33+
- Stockfish binary
- 4GB RAM minimum
- Modern CPU (for engine)

## Conclusion

Prime Chess uses a well-structured, modular architecture that separates concerns, enables maintainability, and provides a solid foundation for future enhancements. The combination of Electron, React, and Stockfish creates a powerful platform for chess analysis and automation.
