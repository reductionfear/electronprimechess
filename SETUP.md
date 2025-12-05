# Prime Chess - Setup Guide

## Prerequisites

1. **Node.js**: Version 18 or higher
   ```bash
   node --version  # Should be v18.x.x or higher
   ```

2. **Stockfish Engine**: Download the appropriate binary for your system
   - Windows: [Stockfish Windows](https://stockfishchess.org/download/)
   - macOS: [Stockfish macOS](https://stockfishchess.org/download/)
   - Linux: [Stockfish Linux](https://stockfishchess.org/download/)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/reductionfear/electronprimechess.git
   cd electronprimechess
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Stockfish** (Optional for development)
   
   Place the Stockfish binary in the `resources/stockfish/` directory:
   - Windows: `stockfish.exe`
   - macOS: `stockfish-macos`
   - Linux: `stockfish-linux-x64`

   Or ensure Stockfish is available in your system PATH.

## Development

### Running in Development Mode

```bash
npm run dev
```

This will:
- Start the Vite development server (hot-reload for renderer)
- Launch Electron with the app
- Open DevTools automatically

### Building for Production

```bash
npm run build
```

This creates optimized builds in the `out/` directory.

### Starting Production Build

```bash
npm start
```

## Project Structure

```
electronprimechess/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts            # Main entry, window management
│   │   └── stockfish.ts        # UCI engine wrapper
│   ├── preload/                # Preload scripts
│   │   └── index.ts           # IPC bridge
│   ├── renderer/               # React frontend
│   │   ├── App.tsx            # Main app component
│   │   ├── components/        # UI components
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── EngineOutput.tsx
│   │   │   └── PlatformSelector.tsx
│   │   ├── store/             # Zustand state
│   │   │   └── useStore.ts
│   │   └── styles/            # Tailwind CSS
│   ├── adapters/              # Platform adapters
│   │   ├── BaseAdapter.ts
│   │   ├── ChessComAdapter.ts
│   │   ├── LichessAdapter.ts
│   │   └── WorldchessAdapter.ts
│   ├── automation/            # Move execution
│   │   ├── MouseHumanizer.ts
│   │   ├── WebSocketMove.ts
│   │   └── ExternalEngine.ts
│   ├── overlay/               # Visual overlay
│   │   ├── OverlayCanvas.tsx
│   │   └── EvalBar.tsx
│   └── utils/                 # Utilities
│       ├── fen.ts
│       ├── tcn.ts
│       └── coordinates.ts
├── resources/                  # Resources
│   └── stockfish/             # Engine binaries
└── out/                        # Build output
```

## Features

### 1. Platform Selection
- **Chess.com**: Shadow DOM support, TCN decoding
- **Lichess**: WebSocket integration, FEN completion
- **Worldchess**: Basic support (placeholder)

### 2. Engine Configuration
- **Depth**: Analysis search depth (1-30)
- **Threads**: CPU threads (1-16)
- **Hash**: Memory allocation in MB (16-4096)
- **MultiPV**: Number of principal variations (1-5)

### 3. Autoplay Settings
- **Min/Max Delay**: Random delay range for moves (50-10000ms)
- **Execution Mode**: Click or Drag
- **Move Mode**: 
  - DOM/Mouse: Humanized movements with Bezier curves
  - WebSocket: Direct WebSocket communication
  - External UCI: Connect to external engine server

### 4. Visual Overlay
- **Arrows**: Best move (green), 2nd best (orange)
- **Evaluation Bar**: Real-time position evaluation
- **Transparency**: Click-through overlay

## Usage

### Basic Workflow

1. **Launch the app**
   ```bash
   npm run dev
   ```

2. **Select a platform**
   - Click on Chess.com, Lichess, or Worldchess card

3. **Configure engine settings**
   - Adjust depth, threads, MultiPV using sliders
   - Higher depth = stronger but slower analysis

4. **Test the engine**
   - Click "Test Engine Analysis" button
   - Check console for analysis results
   - Watch engine output panel for best moves

5. **Enable autoplay** (when ready)
   - Toggle the Autoplay switch
   - Configure delay range for natural timing
   - Select execution mode (Click/Drag)
   - Choose move mode (DOM/WebSocket/External)

### Testing Engine Locally

The "Test Engine Analysis" button analyzes the starting position:
```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

Expected output:
- Best Move: e2e4, d2d4, or c2c4 (depending on Stockfish version)
- Evaluation: ~+0.3 to +0.5

## Troubleshooting

### Stockfish Not Found

If you see "Engine not initialized" errors:

1. Check Stockfish is installed:
   ```bash
   which stockfish  # macOS/Linux
   where stockfish  # Windows
   ```

2. Or place binary in `resources/stockfish/`

3. Verify execution permissions (macOS/Linux):
   ```bash
   chmod +x resources/stockfish/stockfish-*
   ```

### Build Errors

**Tailwind CSS errors**: Make sure you have the correct PostCSS plugin:
```bash
npm install --save-dev @tailwindcss/postcss
```

**TypeScript errors**: Ensure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Development Mode Issues

**Hot reload not working**: Restart the dev server:
```bash
# Kill existing process
pkill -f electron

# Restart
npm run dev
```

**White screen**: Check browser console (DevTools opens automatically)

## Advanced Configuration

### Custom Stockfish Path

Edit `src/main/stockfish.ts` and modify `getStockfishBinary()`:

```typescript
private getStockfishBinary(): string {
  return '/custom/path/to/stockfish';
}
```

### External UCI Server

To connect to an external UCI engine server:

1. Set up the server (e.g., `chesshook-intermediary`)
2. In autoplay settings, select "External UCI" mode
3. Configure connection in external engine settings

### Browser Integration

The platform adapters require browser integration (coming soon):
- Chrome DevTools Protocol for board detection
- WebSocket interception for move sending
- DOM injection for FEN extraction

## Development Tips

### Hot Reload

- Renderer changes: Instant hot-reload
- Main process changes: Requires app restart
- Preload changes: Requires app restart

### Debugging

- Renderer: DevTools opens automatically in dev mode
- Main process: Use `console.log()` or attach Node debugger
- Engine: Check stdout/stderr output in console

### Adding New Platforms

1. Create adapter in `src/adapters/YourPlatformAdapter.ts`
2. Extend `BaseAdapter` class
3. Implement required methods
4. Add to platform selector in `PlatformSelector.tsx`

## Performance

### Engine Analysis
- Target: <100ms from move to analysis start
- Factors: Depth, threads, hash size
- Optimization: Use lower depth for faster analysis

### Overlay Rendering
- Target: 60fps
- Current: Canvas-based rendering
- Optimization: Use requestAnimationFrame

### Memory Usage
- Base: ~100MB
- Engine: Depends on hash size setting
- Recommendation: Start with 128MB hash

## Security & Ethics

⚠️ **Important**: This application is for educational and analysis purposes only.

- Do not use to cheat in rated games
- Respect terms of service of chess platforms
- Use for learning and training only
- Consider ethical implications

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [electronprimechess/issues](https://github.com/reductionfear/electronprimechess/issues)
- Documentation: This file

## Acknowledgments

- **Stockfish**: Powerful open-source chess engine
- **Electron**: Cross-platform desktop apps
- **React**: UI framework
- **Tailwind CSS**: Styling
- **Zustand**: State management

## References

Referenced implementations for specific features:
- **Mephisto**: Board detection patterns
- **lichessb**: Lichess WebSocket integration
- **chesshook**: Chess.com TCN decoding
- **tool-play-chess-online**: Stockfish integration patterns
