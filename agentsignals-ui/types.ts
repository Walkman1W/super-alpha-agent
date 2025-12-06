export interface Agent {
  id: string;
  name: string;
  description: string;
  rank: number;
  status: 'online' | 'offline' | 'maintenance';
  framework: 'LangChain' | 'AutoGPT' | 'BabyAGI' | 'LlamaIndex' | 'Custom';
  latency: number;
  cost: number;
  tags: string[];
  lastPing: string;
}

export interface FilterState {
  search: string;
  maxLatency: number;
  minSuccess: number;
  frameworks: string[];
}
