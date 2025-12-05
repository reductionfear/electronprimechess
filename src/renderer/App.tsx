import React, { useEffect } from 'react';
import { PlatformSelector } from './components/PlatformSelector';
import { ControlPanel } from './components/ControlPanel';
import { EngineOutput } from './components/EngineOutput';
import { EvalBar } from '../overlay/EvalBar';
import { useStore } from './store/useStore';
import './styles/index.css';

function App() {
  const { selectedPlatform, isConnected, setIsConnected, updateGameState, setStatus, setStatusMessage } = useStore();

  useEffect(() => {
    // Check if window.electronAPI is available
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Set up engine event listeners
      window.electronAPI.onEngineReady(() => {
        console.log('Engine ready');
        setIsConnected(true);
        setStatus('idle');
        setStatusMessage('Engine ready');
      });

      window.electronAPI.onEngineAnalysis((analysis) => {
        console.log('Engine analysis:', analysis);
        updateGameState({
          bestMove: analysis.bestMove,
          currentEval: analysis.score || null,
          mate: analysis.mate || null,
          lines: analysis.lines,
        });
        setStatus('idle');
        setStatusMessage(`Best: ${analysis.bestMove}`);
      });

      window.electronAPI.onEngineInfo((info) => {
        console.log('Engine info:', info);
        setStatus('thinking');
        setStatusMessage(`Depth: ${info.depth}`);
      });

      window.electronAPI.onEngineCrashed(() => {
        console.error('Engine crashed');
        setIsConnected(false);
        setStatus('error');
        setStatusMessage('Engine crashed');
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">♔</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  PRIME CHESS
                </h1>
                <p className="text-xs text-gray-400">
                  Chess Automation & Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`}
              />
              <span className="text-xs text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Platform Selection */}
          <PlatformSelector />

          {/* Control Panel */}
          {selectedPlatform && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ControlPanel />
              </div>
              <div>
                <EngineOutput />
              </div>
            </div>
          )}

          {!selectedPlatform && (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">♟</div>
              <p className="text-lg">Select a platform to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Eval Bar - shown when connected */}
      {isConnected && selectedPlatform && <EvalBar />}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Prime Chess v1.0.0</span>
            <span>Powered by Stockfish 16+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
