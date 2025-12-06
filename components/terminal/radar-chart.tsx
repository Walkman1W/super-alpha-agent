'use client'

import { memo } from 'react'
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { cn } from '@/lib/utils'

interface RadarChartProps {
  data: {
    coding: number
    writing: number
    reasoning: number
    speed: number
    stability: number
  }
  className?: string
}

/**
 * 雷达图组件
 * 显示 Agent 的 5 维度能力评分
 * 
 * **Validates: Requirements 7.2**
 */
function RadarChartComponent({ data, className }: RadarChartProps) {
  // 转换数据格式为 Recharts 需要的格式
  const chartData = [
    { dimension: 'Coding', value: data.coding, fullMark: 100 },
    { dimension: 'Writing', value: data.writing, fullMark: 100 },
    { dimension: 'Reasoning', value: data.reasoning, fullMark: 100 },
    { dimension: 'Speed', value: data.speed, fullMark: 100 },
    { dimension: 'Stability', value: data.stability, fullMark: 100 }
  ]

  return (
    <div className={cn('w-full h-64', className)} data-testid="radar-chart">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid 
            stroke="#3f3f46" 
            strokeDasharray="3 3"
          />
          <PolarAngleAxis 
            dataKey="dimension" 
            tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#71717a', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Capabilities"
            dataKey="value"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#f4f4f5' }}
            itemStyle={{ color: '#a855f7' }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const RadarChart = memo(RadarChartComponent)
RadarChart.displayName = 'RadarChart'

export default RadarChart
