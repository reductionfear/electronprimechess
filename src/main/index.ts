import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { StockfishEngine } from './stockfish';

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let engine: StockfishEngine | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#1a1a1a',
    title: 'Prime Chess',
    autoHideMenuBar: true,
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (overlayWindow) {
      overlayWindow.close();
    }
    if (engine) {
      engine.quit();
    }
  });
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 800,
    height: 800,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Make window click-through
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');

  // Load overlay content
  overlayWindow.loadURL('about:blank');

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  // Initialize Stockfish engine
  engine = new StockfishEngine({
    depth: 20,
    threads: 4,
    hash: 128,
    multiPV: 1,
  });

  engine.start().then(() => {
    console.log('Stockfish engine started');
    mainWindow?.webContents.send('engine-ready');
  }).catch((error) => {
    console.error('Failed to start Stockfish:', error);
  });

  // Engine event handlers
  engine.on('analysis', (analysis) => {
    mainWindow?.webContents.send('engine-analysis', analysis);
  });

  engine.on('info', (info) => {
    mainWindow?.webContents.send('engine-info', info);
  });

  engine.on('crashed', () => {
    console.error('Engine crashed, attempting restart...');
    mainWindow?.webContents.send('engine-crashed');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (engine) {
      engine.quit();
    }
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('engine-analyze', async (_event, fen: string) => {
  if (engine) {
    await engine.analyze(fen);
    return { success: true };
  }
  return { success: false, error: 'Engine not initialized' };
});

ipcMain.handle('engine-stop', async () => {
  if (engine) {
    engine.stop();
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('engine-config', async (_event, config: any) => {
  if (engine) {
    await engine.updateConfig(config);
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('create-overlay', async () => {
  if (!overlayWindow) {
    createOverlayWindow();
  }
  return { success: true };
});

ipcMain.handle('destroy-overlay', async () => {
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }
  return { success: true };
});

ipcMain.handle('move-overlay', async (_event, x: number, y: number, width: number, height: number) => {
  if (overlayWindow) {
    overlayWindow.setBounds({ x, y, width, height });
    return { success: true };
  }
  return { success: false };
});
