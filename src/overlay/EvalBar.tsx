import React from 'react';
import { useStore } from '../renderer/store/useStore';

export const EvalBar: React.FC = () => {
  const { gameState } = useStore();

  const calculatePosition = (): number => {
    if (gameState.mate !== null) {
      // Mate detected
      return gameState.mate > 0 ? 100 : 0;
    }

    if (gameState.currentEval === null) {
      return 50; // Equal position
    }

    // Convert centipawn eval to percentage
    // Clamp between -10 and +10 pawns for display
    const clampedEval = Math.max(-1000, Math.min(1000, gameState.currentEval));
    const percentage = 50 + (clampedEval / 1000) * 50;

    return percentage;
  };

  const position = calculatePosition();

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 w-8 h-96 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700">
      {/* White advantage (top) */}
      <div
        className="absolute top-0 left-0 right-0 bg-white transition-all duration-300"
        style={{ height: `${position}%` }}
      />
      
      {/* Black advantage (bottom) */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gray-900 transition-all duration-300"
        style={{ height: `${100 - position}%` }}
      />

      {/* Center line */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-500" />

      {/* Eval display */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-mono text-gray-800 font-bold">
        {gameState.mate !== null ? (
          <span>M{Math.abs(gameState.mate)}</span>
        ) : gameState.currentEval !== null ? (
          <span>{(gameState.currentEval / 100).toFixed(1)}</span>
        ) : (
          <span>0.0</span>
        )}
      </div>
    </div>
  );
};
