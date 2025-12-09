import React from 'react';
import { FilterState } from '../types';
import { Box, Settings, Sliders, Activity, Wifi } from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableFrameworks: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ filters, setFilters, availableFrameworks }) => {
  const toggleFramework = (fw: string) => {
    const current = filters.frameworks;
    const next = current.includes(fw)
      ? current.filter(f => f !== fw)
      : [...current, fw];
    setFilters({ ...filters, frameworks: next });
  };

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex-shrink-0 flex flex-col justify-between hidden lg:flex h-full">
      <div className="p-4 space-y-8 overflow-y-auto">
        
        {/* Logo Area (Text-based) */}
        <div className="flex items-center gap-2 text-zinc-100 font-bold tracking-tighter text-lg px-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          AgentSignals
        </div>

        {/* Frameworks */}
        <div>
          <h3 className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 px-2">
            <Box className="w-3 h-3" /> Frameworks
          </h3>
          <div className="space-y-1">
            {availableFrameworks.map(fw => (
              <button
                key={fw}
                onClick={() => toggleFramework(fw)}
                className={`
                  w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center gap-2
                  ${filters.frameworks.includes(fw) ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}
                `}
              >
                <div className={`w-3 h-3 border rounded-sm ${filters.frameworks.includes(fw) ? 'bg-zinc-100 border-zinc-100' : 'border-zinc-700'}`}></div>
                {fw}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 px-2">
            <Sliders className="w-3 h-3" /> Constraints
          </h3>
          
          <div className="px-2">
             <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-2">
                <span>Max Latency</span>
                <span className="text-zinc-100">{filters.maxLatency}ms</span>
             </div>
             <input 
              type="range" 
              min="0" 
              max="2000" 
              step="50"
              value={filters.maxLatency}
              onChange={(e) => setFilters(prev => ({ ...prev, maxLatency: parseInt(e.target.value) }))}
              className="w-full"
             />
             <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-1">
                <span>0ms</span>
                <span>2000ms</span>
             </div>
          </div>

          <div className="px-2">
             <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-2">
                <span>Min Success Rate</span>
                <span className="text-zinc-100">{filters.minSuccess}%</span>
             </div>
             <input 
              type="range" 
              min="0" 
              max="100" 
              value={filters.minSuccess}
              onChange={(e) => setFilters(prev => ({ ...prev, minSuccess: parseInt(e.target.value) }))}
              className="w-full"
             />
             <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-1">
                <span>0%</span>
                <span>100%</span>
             </div>
          </div>
        </div>

      </div>

      {/* Bottom Status Box */}
      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded p-3">
          <div className="flex items-center gap-2 mb-2 text-zinc-100 text-xs font-medium">
            <Wifi className="w-3 h-3 text-green-500" />
            Live Connection
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
             Metrics are streaming via WebSocket. Signal strength indicates real-time popularity and throughput efficiency.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-0.5 w-full bg-zinc-800 rounded overflow-hidden">
               <div className="h-full bg-green-500 w-[80%] animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
            US
          </div>
          <div>
            <div className="text-xs text-zinc-200 font-medium">Guest User</div>
            <div className="text-[10px] text-zinc-500">Pro Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
