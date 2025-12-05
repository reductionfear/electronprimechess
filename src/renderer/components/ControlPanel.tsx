import React from 'react';
import { useStore } from '../store/useStore';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';

export const ControlPanel: React.FC = () => {
  const {
    engineState,
    updateEngineState,
    autoplayState,
    updateAutoplayState,
    toggleAutoplay,
    status,
    statusMessage,
  } = useStore();

  return (
    <div className="space-y-6">
      {/* Status Display */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Status:</span>
          <span className="text-cyan-400 font-mono">{statusMessage}</span>
        </div>
        <div className="mt-2">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                status === 'thinking'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse'
                  : status === 'moving'
                  ? 'bg-green-500'
                  : status === 'error'
                  ? 'bg-red-500'
                  : 'bg-gray-600'
              }`}
              style={{
                width: status === 'thinking' || status === 'moving' ? '100%' : '0%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Autoplay Toggle */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Autoplay</h3>
            <p className="text-xs text-gray-400">Automatically play best moves</p>
          </div>
          <Switch.Root
            checked={autoplayState.enabled}
            onCheckedChange={toggleAutoplay}
            className={`
              w-14 h-8 rounded-full transition-colors relative
              ${autoplayState.enabled ? 'bg-green-500' : 'bg-gray-600'}
            `}
          >
            <Switch.Thumb
              className="block w-6 h-6 bg-white rounded-full transition-transform
                         translate-x-1 data-[state=checked]:translate-x-7"
            />
          </Switch.Root>
        </div>
      </div>

      {/* Engine Settings */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
        <h3 className="text-lg font-semibold text-white">Engine Settings</h3>

        {/* Depth Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">Depth</label>
            <span className="text-sm text-cyan-400">{engineState.depth}</span>
          </div>
          <Slider.Root
            value={[engineState.depth]}
            onValueChange={([value]) => updateEngineState({ depth: value })}
            min={1}
            max={30}
            step={1}
            className="relative flex items-center w-full h-5"
          >
            <Slider.Track className="relative bg-gray-700 rounded-full h-2 flex-grow">
              <Slider.Range className="absolute bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          </Slider.Root>
        </div>

        {/* MultiPV Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">MultiPV (Lines)</label>
            <span className="text-sm text-cyan-400">{engineState.multiPV}</span>
          </div>
          <Slider.Root
            value={[engineState.multiPV]}
            onValueChange={([value]) => updateEngineState({ multiPV: value })}
            min={1}
            max={5}
            step={1}
            className="relative flex items-center w-full h-5"
          >
            <Slider.Track className="relative bg-gray-700 rounded-full h-2 flex-grow">
              <Slider.Range className="absolute bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </Slider.Root>
        </div>

        {/* Threads Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-400">Threads</label>
            <span className="text-sm text-cyan-400">{engineState.threads}</span>
          </div>
          <Slider.Root
            value={[engineState.threads]}
            onValueChange={([value]) => updateEngineState({ threads: value })}
            min={1}
            max={16}
            step={1}
            className="relative flex items-center w-full h-5"
          >
            <Slider.Track className="relative bg-gray-700 rounded-full h-2 flex-grow">
              <Slider.Range className="absolute bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </Slider.Root>
        </div>
      </div>

      {/* Autoplay Settings */}
      {autoplayState.enabled && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold text-white">Autoplay Settings</h3>

          {/* Min Delay */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Min Delay (ms)</label>
              <span className="text-sm text-cyan-400">{autoplayState.minDelay}</span>
            </div>
            <Slider.Root
              value={[autoplayState.minDelay]}
              onValueChange={([value]) => updateAutoplayState({ minDelay: value })}
              min={50}
              max={5000}
              step={50}
              className="relative flex items-center w-full h-5"
            >
              <Slider.Track className="relative bg-gray-700 rounded-full h-2 flex-grow">
                <Slider.Range className="absolute bg-gradient-to-r from-orange-500 to-red-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </Slider.Root>
          </div>

          {/* Max Delay */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Max Delay (ms)</label>
              <span className="text-sm text-cyan-400">{autoplayState.maxDelay}</span>
            </div>
            <Slider.Root
              value={[autoplayState.maxDelay]}
              onValueChange={([value]) => updateAutoplayState({ maxDelay: value })}
              min={100}
              max={10000}
              step={100}
              className="relative flex items-center w-full h-5"
            >
              <Slider.Track className="relative bg-gray-700 rounded-full h-2 flex-grow">
                <Slider.Range className="absolute bg-gradient-to-r from-orange-500 to-red-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </Slider.Root>
          </div>

          {/* Execution Mode */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Execution Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateAutoplayState({ executionMode: 'click' })}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  autoplayState.executionMode === 'click'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                Click
              </button>
              <button
                onClick={() => updateAutoplayState({ executionMode: 'drag' })}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  autoplayState.executionMode === 'drag'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                Drag
              </button>
            </div>
          </div>

          {/* Move Mode */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Move Mode</label>
            <select
              value={autoplayState.moveMode}
              onChange={(e) =>
                updateAutoplayState({ moveMode: e.target.value as any })
              }
              className="bg-gray-700 text-white px-3 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="dom">DOM/Mouse</option>
              <option value="websocket">WebSocket</option>
              <option value="external">External UCI</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
