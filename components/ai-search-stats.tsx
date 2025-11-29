'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'

interface AIStat {
  engine: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

interface AISearchStatsProps {
  stats: AIStat[]
  total: number
}

export function AISearchStats({ stats, total }: AISearchStatsProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6" aria-label="AI搜索统计细分">AI搜索统计细分</h2>
      
      {total > 0 ? (
        <>
          <div className="mb-4 text-sm text-gray-600">
            总计: <span className="font-semibold">{formatNumber(total)}</span> 次AI搜索
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="engine" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} 次`, '搜索次数']}
                labelFormatter={(label) => `AI引擎: ${label}`}
              />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {stats.map((stat) => (
              <div key={stat.engine} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{stat.engine}</span>
                  <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {stat.trendValue > 0 ? '+' : ''}{stat.trendValue}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{formatNumber(stat.count)}</span> 次搜索
                </div>
                <div className="text-sm text-gray-500">
                  {stat.percentage.toFixed(1)}% 的总搜索量
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          暂无AI搜索统计数据
        </div>
      )}
    </Card>
  )
}