'use client'

interface StatusPillProps {
  signalCount: number
  status?: 'active' | 'inactive' | 'connecting'
}

export function StatusPill({ signalCount, status = 'active' }: StatusPillProps) {
  const statusConfig = {
    active: {
      text: 'Network Active',
      dotClass: 'bg-emerald-500 animate-pulse',
      textClass: 'text-emerald-400'
    },
    inactive: {
      text: 'Network Offline',
      dotClass: 'bg-red-500',
      textClass: 'text-red-400'
    },
    connecting: {
      text: 'Connecting...',
      dotClass: 'bg-yellow-500 animate-pulse',
      textClass: 'text-yellow-400'
    }
  }

  const config = statusConfig[status]

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full font-mono text-xs">
      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      <span className={config.textClass}>{config.text}</span>
      <span className="text-zinc-500">|</span>
      <span className="text-zinc-300" data-testid="signal-count">
        {signalCount.toLocaleString()} signals
      </span>
    </div>
  )
}
