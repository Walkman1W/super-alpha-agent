import ModeSwitcher from '@/components/ui/mode-switcher'
import { AgentCard } from '@/components/ui/agent-card'

export default function TestPage() {
  // 模拟Agent数据
  const mockAgents = [
    {
      id: '1',
      name: '代码助手',
      description: '帮助你编写代码的AI助手',
      search_count: 1234,
      categories: ['开发', '编程'],
    },
    {
      id: '2',
      name: '写作助手',
      description: '帮助你写作的AI助手',
      search_count: 5678,
      categories: ['写作', '创意'],
    },
    {
      id: '3',
      name: '设计助手',
      description: '帮助你设计的AI助手',
      search_count: 9012,
      categories: ['设计', '创意'],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">测试页面</h1>
        
        {/* 模式切换器 */}
        <ModeSwitcher />
        
        {/* Agent卡片展示 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {mockAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  )
}