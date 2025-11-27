import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { GlassCard } from './glass-card'

interface AgentCardProps {
  agent: {
    id: string
    slug: string
    name: string
    short_description: string
    platform?: string
    key_features?: string[]
    pros?: string[]
    use_cases?: string[]
    pricing?: string
    official_url?: string
    ai_search_count?: number
  }
  className?: string
}

// 格式化大数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function AgentCard({ agent, className }: AgentCardProps) {
  return (
    <GlassCard
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        className
      )}
    >
      {/* AI搜索统计 */}
      {agent.ai_search_count && agent.ai_search_count > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            <span>🔍</span>
            <span>{formatNumber(agent.ai_search_count)}</span>
          </div>
        </div>
      )}

      <article itemScope itemType="https://schema.org/SoftwareApplication">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors flex-1 pr-8" itemProp="name">
            {agent.name}
          </h3>
          {agent.platform && (
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">
              {agent.platform}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed" itemProp="description">
          {agent.short_description}
        </p>
        
        {agent.key_features && Array.isArray(agent.key_features) && agent.key_features.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 mb-2">✔ 核心功能</div>
            <div className="flex flex-wrap gap-2">
              {agent.key_features.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg" itemProp="featureList">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {agent.pros && Array.isArray(agent.pros) && agent.pros.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-green-600 mb-2">✅ 优势</div>
            <ul className="text-xs text-gray-600 space-y-1">
              {agent.pros.slice(0, 2).map((pro, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span className="line-clamp-1">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {agent.use_cases && Array.isArray(agent.use_cases) && agent.use_cases.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-purple-600 mb-2">🎯 适用场景</div>
            <div className="text-xs text-gray-600">{agent.use_cases.slice(0, 2).join(' · ')}</div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {agent.pricing && (
            <span className="text-xs font-semibold text-gray-700" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span itemProp="price">💰 {agent.pricing}</span>
            </span>
          )}
          <div className="flex items-center gap-2">
            {agent.official_url && (
              <a 
                href={agent.official_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                itemProp="url"
              >
                访问 →
              </a>
            )}
            <Link 
              href={`/agents/${agent.slug}`} 
              className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
            >
              详情 →
            </Link>
          </div>
        </div>
      </article>

      {/* 悬停效果增强 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </GlassCard>
  )
}
