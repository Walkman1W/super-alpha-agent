import React, { useState, useEffect, useMemo } from 'react';
import { Hero } from './components/Hero';
import { Sidebar } from './components/Sidebar';
import { AgentCard } from './components/AgentCard';
import { Agent, FilterState } from './types';
import { Bell, Search as SearchIcon, Terminal } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Nexus Prime',
    description: 'Autonomous financial analyst agent capable of real-time market sentiment analysis and portfolio rebalancing suggestions based on macro-economic indicators.',
    rank: 1,
    status: 'online',
    framework: 'LangChain',
    latency: 245,
    cost: 0.045,
    tags: ['Finance', 'Analysis', 'High-Speed'],
    lastPing: '2s ago'
  },
  {
    id: '2',
    name: 'Codex Weaver',
    description: 'Specialized code generation and refactoring agent. Integrates directly with GitHub PRs to fix linting errors and write unit tests autonomously.',
    rank: 2,
    status: 'online',
    framework: 'LlamaIndex',
    latency: 890,
    cost: 0.082,
    tags: ['DevTools', 'Coding', 'CI/CD'],
    lastPing: '5s ago'
  },
  {
    id: '3',
    name: 'Translate Pro',
    description: 'Real-time localization agent for technical documentation. Preserves code blocks and markdown formatting while translating contextually.',
    rank: 5,
    status: 'online',
    framework: 'LangChain',
    latency: 400,
    cost: 0.020,
    tags: ['Localization', 'Language'],
    lastPing: '12s ago'
  },
  {
    id: '4',
    name: 'Sentry Alpha',
    description: 'Security log monitor that detects anomalies in server access patterns using RAG-enhanced threat intelligence databases.',
    rank: 12,
    status: 'online',
    framework: 'Custom',
    latency: 150,
    cost: 0.005,
    tags: ['Security', 'Monitoring'],
    lastPing: '1m ago'
  },
  {
    id: '5',
    name: 'Data Munger',
    description: 'ETL pipeline assistant. Cleans messy CSV/JSON exports and maps them to strict database schemas with auto-correction capabilities.',
    rank: 15,
    status: 'online',
    framework: 'LangChain',
    latency: 670,
    cost: 0.015,
    tags: ['Data', 'ETL'],
    lastPing: '45s ago'
  },
  {
    id: '6',
    name: 'Support Bot X',
    description: 'Tier 1 customer support agent. Handles refunds, order tracking, and FAQ resolution with human handoff capability via Intercom API.',
    rank: 22,
    status: 'online',
    framework: 'BabyAGI',
    latency: 320,
    cost: 0.008,
    tags: ['Support', 'CX'],
    lastPing: '10s ago'
  },
  {
    id: '7',
    name: 'Copy Smith',
    description: 'Marketing copy generator optimized for social media engagement metrics. A/B tests headlines automatically.',
    rank: 31,
    status: 'online',
    framework: 'Custom',
    latency: 800,
    cost: 0.060,
    tags: ['Marketing', 'Social'],
    lastPing: '2m ago'
  },
  {
    id: '8',
    name: 'Pixel Gen',
    description: 'Image prompt optimizer and generation coordinator. Manages efficient queuing for Stable Diffusion XL pipelines.',
    rank: 45,
    status: 'online',
    framework: 'LangChain',
    latency: 450,
    cost: 0.010,
    tags: ['Creative', 'Image'],
    lastPing: '5m ago'
  },
  {
    id: '9',
    name: 'Research Owl',
    description: 'Academic paper synthesizer. Crawls Arxiv and generates literature reviews in LaTeX format.',
    rank: 8,
    status: 'online',
    framework: 'AutoGPT',
    latency: 1200,
    cost: 0.12,
    tags: ['Research', 'Academic'],
    lastPing: '30s ago'
  },
  {
    id: '10',
    name: 'Legal Eagle',
    description: 'Contract clause analyzer. Highlights potential risks in NDAs and Service Agreements.',
    rank: 18,
    status: 'offline',
    framework: 'LlamaIndex',
    latency: 0,
    cost: 0.00,
    tags: ['Legal', 'Analysis'],
    lastPing: 'Offline'
  }
];

const AVAILABLE_FRAMEWORKS = Array.from(new Set(MOCK_AGENTS.map(a => a.framework)));

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    maxLatency: 2000,
    minSuccess: 0,
    frameworks: []
  });

  const filteredAgents = useMemo(() => {
    return MOCK_AGENTS.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                            agent.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                            agent.tags.some(t => t.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesLatency = agent.latency <= filters.maxLatency || agent.status === 'offline';
      const matchesFramework = filters.frameworks.length === 0 || filters.frameworks.includes(agent.framework);
      
      return matchesSearch && matchesLatency && matchesFramework;
    });
  }, [filters]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-500/30">
      {/* Hero Section - Fixed height, but scrollable with page if needed, or fixed at top? 
          Design request implies it sits above dashboard. Let's make the main area scrollable. */}
      
      <div className="flex flex-1 overflow-hidden flex-col">
        {/* Top Hero */}
        <Hero onSearch={handleSearch} searchValue={filters.search} />
        
        {/* Main Workspace */}
        <div className="flex flex-1 overflow-hidden relative">
          
          <Sidebar 
            filters={filters} 
            setFilters={setFilters} 
            availableFrameworks={AVAILABLE_FRAMEWORKS}
          />
          
          <main className="flex-1 overflow-y-auto relative bg-zinc-950">
            {/* Grid Pattern Overlay for Main Content Area */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            {/* Content Header */}
            <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <SearchIcon className="w-4 h-4" />
                <span>Searching agents...</span>
                {filters.search && (
                   <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded text-xs font-mono">
                     "{filters.search}"
                   </span>
                )}
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-mono text-green-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  System Operational
                </div>
                <div className="text-xs font-mono text-zinc-500 border-l border-zinc-800 pl-6">
                  {filteredAgents.length} Signals Found
                </div>
                <Bell className="w-4 h-4 text-zinc-500 hover:text-zinc-300 cursor-pointer" />
              </div>
            </header>

            {/* Content Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredAgents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
              
              {filteredAgents.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
                  <Terminal className="w-8 h-8 mb-4 opacity-50" />
                  <p>No signals detected matching parameters.</p>
                  <button 
                    onClick={() => setFilters({ search: '', maxLatency: 2000, minSuccess: 0, frameworks: [] })}
                    className="mt-4 text-purple-400 text-sm hover:underline"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;