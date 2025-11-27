import * as React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/utils'
import { Search } from 'lucide-react'

interface AgentCardProps {
  agent: {
    id: string
    name: string
    description: string
    logo_url?: string
    search_count: number
    categories?: string[]
  }
  className?: string
}

const AgentCard = React.forwardRef<HTMLDivElement, AgentCardProps>(
  ({ agent, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2',
          className
        )}
        {...props}
      >
        {/* AI Search Stats Badge */}
        <div className="absolute top-4 right-4 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Search className="h-3 w-3" />
          <span>{formatNumber(agent.search_count)} searches</span>
        </div>

        <CardHeader>
          {agent.logo_url && (
            <div className="mb-4">
              <img
                src={agent.logo_url}
                alt={agent.name}
                className="h-16 w-16 object-contain rounded-lg"
              />
            </div>
          )}
          <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
          <CardDescription className="text-sm text-gray-600">{agent.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {agent.categories && agent.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {agent.categories.map((category) => (
                <span
                  key={category}
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-4">
          <div className="text-xs text-gray-500">
            <span className="font-medium">AI Optimized</span>
          </div>
          <div className="text-xs text-primary-600 font-medium">Learn More →</div>
        </CardFooter>
      </Card>
    )
  }
)

AgentCard.displayName = 'AgentCard'

export { AgentCard }