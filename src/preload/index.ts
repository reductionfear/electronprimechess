import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Engine API
  engineAnalyze: (fen: string) => ipcRenderer.invoke('engine-analyze', fen),
  engineStop: () => ipcRenderer.invoke('engine-stop'),
  engineConfig: (config: any) => ipcRenderer.invoke('engine-config', config),
  
  // Overlay API
  createOverlay: () => ipcRenderer.invoke('create-overlay'),
  destroyOverlay: () => ipcRenderer.invoke('destroy-overlay'),
  moveOverlay: (x: number, y: number, width: number, height: number) => 
    ipcRenderer.invoke('move-overlay', x, y, width, height),
  
  // Event listeners
  onEngineReady: (callback: () => void) => {
    ipcRenderer.on('engine-ready', callback);
  },
  onEngineAnalysis: (callback: (analysis: any) => void) => {
    ipcRenderer.on('engine-analysis', (_event, analysis) => callback(analysis));
  },
  onEngineInfo: (callback: (info: any) => void) => {
    ipcRenderer.on('engine-info', (_event, info) => callback(info));
  },
  onEngineCrashed: (callback: () => void) => {
    ipcRenderer.on('engine-crashed', callback);
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      engineAnalyze: (fen: string) => Promise<{ success: boolean; error?: string }>;
      engineStop: () => Promise<{ success: boolean }>;
      engineConfig: (config: any) => Promise<{ success: boolean }>;
      createOverlay: () => Promise<{ success: boolean }>;
      destroyOverlay: () => Promise<{ success: boolean }>;
      moveOverlay: (x: number, y: number, width: number, height: number) => Promise<{ success: boolean }>;
      onEngineReady: (callback: () => void) => void;
      onEngineAnalysis: (callback: (analysis: any) => void) => void;
      onEngineInfo: (callback: (info: any) => void) => void;
      onEngineCrashed: (callback: () => void) => void;
    };
  }
}
