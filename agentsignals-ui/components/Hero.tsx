import React from 'react';
import { Search, Command, Terminal, Activity } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
  searchValue: string;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, searchValue }) => {
  return (
    <div className="relative w-full h-[450px] flex flex-col items-center justify-center border-b border-zinc-800 bg-zinc-950 overflow-hidden shrink-0 z-10">
      
      {/* 1. Background Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 pointer-events-none"></div>
      
      {/* Central Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* 2. Status Pill */}
      <div className="mb-8 flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-[10px] font-mono text-zinc-400 tracking-tight uppercase">
          Network Active // 1,240 Signals
        </span>
      </div>

      {/* 3. Main Headline */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 text-center z-10">
        Index the <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">Intelligence</span> Economy.
      </h1>
      <p className="text-zinc-500 text-base md:text-lg mb-10 text-center max-w-2xl font-light z-10 px-4">
        The machine-readable registry for autonomous agents. <br className="hidden md:block"/>
        Optimized for LLM discovery and semantic search.
      </p>

      {/* 4. The "Omnibar" Search */}
      <div className="relative w-full max-w-2xl group z-20 px-4 md:px-0">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700 to-zinc-800 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
        <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-3 md:p-4 shadow-2xl transition-all duration-300 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-800">
          <Terminal className="w-5 h-5 text-zinc-500 mr-3 shrink-0" />
          <div className="mr-2 text-zinc-500 animate-pulse font-mono font-bold">{`>`}</div>
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-zinc-100 font-mono placeholder-zinc-700 text-base md:text-lg h-full" 
            placeholder="Search signals (e.g. 'coding agent python')..." 
            autoFocus
          />
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-[10px] text-zinc-500 font-mono ml-2 shrink-0">
            <span className="text-xs">⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* 5. Coding Stream Marquee */}
      <div className="mt-12 w-full overflow-hidden relative opacity-40 hover:opacity-80 transition-opacity duration-300">
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex gap-12 items-center text-xs font-mono text-zinc-600 px-4">
             <span>GET /agent/nexus-prime 200 OK</span>
             <span>UPDATE agent_id:8821 schema_v2</span>
             <span className="text-green-900">New Signal: Codex-Weaver [DETECTED]</span>
             <span>LATENCY: 24ms</span>
             <span>UPTIME: 99.99%</span>
             <span>POST /api/v1/inference/batch 202 ACCEPTED</span>
             <span>Vector Index Rebalancing...</span>
             <span>AutoGPT-4 connected via WebSocket</span>
             <span className="text-purple-900">System Upgrade: v2.4.1</span>
             <span>GET /agent/sentry-alpha 200 OK</span>
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex gap-12 items-center text-xs font-mono text-zinc-600 px-4">
             <span>GET /agent/nexus-prime 200 OK</span>
             <span>UPDATE agent_id:8821 schema_v2</span>
             <span className="text-green-900">New Signal: Codex-Weaver [DETECTED]</span>
             <span>LATENCY: 24ms</span>
             <span>UPTIME: 99.99%</span>
             <span>POST /api/v1/inference/batch 202 ACCEPTED</span>
             <span>Vector Index Rebalancing...</span>
             <span>AutoGPT-4 connected via WebSocket</span>
             <span className="text-purple-900">System Upgrade: v2.4.1</span>
             <span>GET /agent/sentry-alpha 200 OK</span>
          </div>
        </div>
      </div>

    </div>
  );
};
