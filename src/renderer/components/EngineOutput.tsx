import React from 'react';
import { useStore } from '../store/useStore';

export const EngineOutput: React.FC = () => {
  const { gameState } = useStore();

  const formatEval = (eval_: number | null, mate: number | null): string => {
    if (mate !== null) {
      return `M${mate > 0 ? mate : mate}`;
    }
    if (eval_ !== null) {
      return (eval_ / 100).toFixed(2);
    }
    return '--';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-3">Engine Analysis</h3>

      {/* Best Move */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Best Move</span>
          <span className="text-2xl font-mono text-green-400">
            {gameState.bestMove || '--'}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-gray-400 text-sm">Evaluation</span>
          <span
            className={`text-xl font-mono ${
              (gameState.currentEval || 0) > 0
                ? 'text-green-400'
                : (gameState.currentEval || 0) < 0
                ? 'text-red-400'
                : 'text-gray-400'
            }`}
          >
            {formatEval(gameState.currentEval, gameState.mate)}
          </span>
        </div>
      </div>

      {/* Lines */}
      <div className="space-y-2">
        {gameState.lines.slice(0, 3).map((line, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded p-2 border border-gray-700"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Line {index + 1}</span>
              <span
                className={`text-sm font-mono ${
                  (line.score || 0) > 0
                    ? 'text-green-400'
                    : (line.score || 0) < 0
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              >
                {formatEval(line.score || null, line.mate || null)}
              </span>
            </div>
            <div className="text-xs text-gray-400 font-mono overflow-x-auto">
              {line.moves.slice(0, 5).join(' ')}
              {line.moves.length > 5 && '...'}
            </div>
          </div>
        ))}
      </div>

      {gameState.lines.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Waiting for analysis...
        </div>
      )}
    </div>
  );
};
