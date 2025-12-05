import React from 'react';
import { useStore } from '../store/useStore';

interface PlatformCard {
  id: 'chesscom' | 'lichess' | 'worldchess';
  name: string;
  icon: string;
  color: string;
}

const platforms: PlatformCard[] = [
  {
    id: 'chesscom',
    name: 'Chess.com',
    icon: '♟',
    color: 'from-green-500 to-green-700',
  },
  {
    id: 'lichess',
    name: 'Lichess',
    icon: '♞',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'worldchess',
    name: 'Worldchess',
    icon: '♜',
    color: 'from-purple-500 to-purple-700',
  },
];

export const PlatformSelector: React.FC = () => {
  const { selectedPlatform, setSelectedPlatform } = useStore();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Select Platform</h2>
      <div className="grid grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            className={`
              relative p-6 rounded-lg transition-all duration-200
              bg-gradient-to-br ${platform.color}
              ${
                selectedPlatform === platform.id
                  ? 'ring-4 ring-cyan-400 scale-105'
                  : 'opacity-70 hover:opacity-100'
              }
            `}
          >
            <div className="text-5xl mb-2">{platform.icon}</div>
            <div className="text-sm font-semibold text-white">
              {platform.name}
            </div>
            {selectedPlatform === platform.id && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
