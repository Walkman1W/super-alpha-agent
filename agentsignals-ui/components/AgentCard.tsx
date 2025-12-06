import React from 'react';
import { Agent } from '../types';
import { Cpu, Terminal, Shield, PenTool, Database, Zap, Activity, ArrowUpRight } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'LangChain': return <Database className="w-5 h-5" />;
    case 'AutoGPT': return <Cpu className="w-5 h-5" />;
    case 'BabyAGI': return <Zap className="w-5 h-5" />;
    case 'LlamaIndex': return <Terminal className="w-5 h-5" />;
    default: return <PenTool className="w-5 h-5" />;
  }
};

const getGlowColor = (rank: number) => {
  if (rank <= 3) return 'shadow-[0_0_40px_-10px_rgba(168,85,247,0.15)] border-zinc-700';
  return 'shadow-none hover:border-zinc-600';
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const isTopTier = agent.rank <= 3;

  return (
    <div className={`
      group relative flex flex-col justify-between
      bg-zinc-900/40 backdrop-blur-sm
      border border-zinc-800 rounded-sm
      p-5 h-[280px] transition-all duration-300
      hover:-translate-y-1 hover:bg-zinc-900/60
      ${getGlowColor(agent.rank)}
    `}>
      {/* Top Tier Indicator */}
      {isTopTier && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-bl-sm shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
      )}

      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded border border-zinc-800 bg-zinc-950 
              ${isTopTier ? 'text-purple-400' : 'text-zinc-400'}
            `}>
              {getIcon(agent.framework)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-zinc-100 font-semibold tracking-tight text-sm flex items-center gap-1">
                  {agent.name}
                  {isTopTier && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono mt-0.5">
                <span className={`uppercase ${agent.status === 'online' ? 'text-green-500' : 'text-zinc-500'}`}>
                  {agent.status}
                </span>
                <span className="text-zinc-600">#{agent.rank.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors cursor-pointer" />
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed mb-4 line-clamp-3">
          {agent.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {agent.tags.map(tag => (
            <span key={tag} className="px-1.5 py-0.5 border border-zinc-800 bg-zinc-950/50 text-[10px] text-zinc-500 rounded-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-800/50 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-600 font-mono uppercase">Latency</span>
          <div className="flex items-center gap-1 text-zinc-300 font-mono text-xs">
            <Activity className="w-3 h-3" />
            {agent.latency}ms
          </div>
        </div>
        <div className="flex flex-col border-l border-zinc-800/50 pl-3">
          <span className="text-[10px] text-zinc-600 font-mono uppercase">Cost</span>
          <div className="text-zinc-300 font-mono text-xs">
            ${agent.cost.toFixed(3)}
          </div>
        </div>
        <div className="flex flex-col border-l border-zinc-800/50 pl-3">
          <span className="text-[10px] text-zinc-600 font-mono uppercase">Stack</span>
          <div className="text-zinc-300 font-mono text-xs truncate">
            {agent.framework}
          </div>
        </div>
      </div>
    </div>
  );
};
