# Prime Chess

A high-performance Electron desktop application that functions as an intelligent overlay for web-based chess platforms (Chess.com, Lichess.org, Worldchess). The application provides real-time chess engine analysis, visual overlays, and automation capabilities.

## Features

- **Multi-Platform Support**: Chess.com, Lichess, and Worldchess integration
- **Stockfish 16+ Engine**: Powerful chess analysis with NNUE support
- **Visual Overlay**: Real-time move arrows and evaluation display
- **Autoplay**: Automated move execution with three modes:
  - DOM/Mouse: Humanized mouse movements with Bezier curves
  - WebSocket: Direct WebSocket integration (fastest)
  - External UCI: Connect to external chess engines
- **Customizable Settings**: Adjust engine depth, MultiPV, rating limits, delays
- **Dark Theme**: Cyberpunk-inspired UI

## Technology Stack

- **Core**: Electron + TypeScript + Node.js
- **Frontend**: React + Vite + Tailwind CSS
- **State Management**: Zustand
- **Chess Engine**: Stockfish 16+ (UCI Protocol)
- **UI Components**: Radix UI

## Installation

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production app
npm start
```

## Configuration

### Engine Settings
- **Depth**: Search depth (1-30)
- **Threads**: CPU threads to use (1-16)
- **Hash**: Memory allocation in MB (16-4096)
- **MultiPV**: Number of best lines to analyze (1-5)

### Autoplay Settings
- **Min/Max Delay**: Random delay range for move execution (ms)
- **Execution Mode**: Click or Drag
- **Move Mode**: DOM/Mouse, WebSocket, or External UCI

## Platform-Specific Notes

### Chess.com
- Handles shadow DOM elements
- TCN (Ternary Chess Notation) support
- WebSocket direct integration available

### Lichess
- Main board and CG board detection
- WebSocket move sending
- Partial FEN completion for castling

### Worldchess
- Basic support (placeholder for future implementation)

## Development

```bash
# Project structure
src/
├── main/              # Electron main process
│   ├── index.ts      # Main entry point
│   └── stockfish.ts  # UCI engine wrapper
├── renderer/         # React frontend
│   ├── App.tsx       # Main app component
│   ├── components/   # UI components
│   └── store/        # Zustand state management
├── adapters/         # Platform-specific adapters
├── automation/       # Move execution logic
├── overlay/          # Visual overlay system
└── utils/           # Utility functions
```

## Requirements

- Node.js 18+
- Stockfish binary (download separately and place in `resources/stockfish/`)

## Security & Safety

This application is designed for educational and analysis purposes. Use responsibly and in accordance with the terms of service of chess platforms.

## License

ISC
