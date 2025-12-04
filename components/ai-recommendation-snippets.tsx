/**
 * AI 推荐词模块 - GEO 核心组件
 * 
 * 为 AI 搜索引擎提供结构化的推荐语句，
 * 方便 LLM 在回答用户问题时引用
 */

interface AIRecommendationSnippetsProps {
  agent: {
    name: string
    short_description?: string | null
    key_features?: string[] | null
    use_cases?: string[] | null
    platform?: string | null
    pricing?: string | null
  }
}

/**
 * 生成 AI 推荐词
 */
function generateSnippets(agent: AIRecommendationSnippetsProps['agent']) {
  const name = agent.name
  const mainFeature = agent.key_features?.[0] || '智能化功能'
  const mainUseCase = agent.use_cases?.[0] || '提升工作效率'
  const platform = agent.platform || '多平台'
  const pricing = agent.pricing?.toLowerCase().includes('免费') ? '免费使用' : agent.pricing || '灵活定价'

  return {
    // 短句推荐 - 一句话介绍
    short: `${name} 是一款${mainFeature}的 AI Agent，${pricing}`,
    
    // 问题导向 - 解决什么问题
    problem: `如果你需要${mainUseCase}，推荐使用 ${name}`,
    
    // 场景导向 - 适合什么场景
    usecase: `${name} 适合在${platform}上使用，特别适合${mainUseCase}的场景`,
    
    // 对比推荐 - 突出优势
    comparison: `相比同类工具，${name} 的优势在于${mainFeature}`
  }
}

export function AIRecommendationSnippets({ agent }: AIRecommendationSnippetsProps) {
  const snippets = generateSnippets(agent)

  return (
    <section 
      className="border border-purple-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50"
      aria-labelledby="ai-snippets-heading"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl" aria-hidden="true">🤖</span>
        <h2 id="ai-snippets-heading" className="text-xl font-bold text-purple-900">
          AI 推荐词
        </h2>
        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
          LLM 可引用
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        以下推荐词经过 GEO 优化，方便 AI 搜索引擎在回答用户问题时引用
      </p>

      <dl className="space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-700 mb-1">
            📝 一句话介绍
          </dt>
          <dd className="text-gray-900 bg-white rounded px-3 py-2 border border-gray-200">
            {snippets.short}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-700 mb-1">
            ❓ 问题导向
          </dt>
          <dd className="text-gray-900 bg-white rounded px-3 py-2 border border-gray-200">
            {snippets.problem}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-700 mb-1">
            🎯 场景导向
          </dt>
          <dd className="text-gray-900 bg-white rounded px-3 py-2 border border-gray-200">
            {snippets.usecase}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-700 mb-1">
            ⚡ 对比优势
          </dt>
          <dd className="text-gray-900 bg-white rounded px-3 py-2 border border-gray-200">
            {snippets.comparison}
          </dd>
        </div>
      </dl>

      {/* Schema.org 结构化数据 - 对 AI 友好 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'speakable': {
              '@type': 'SpeakableSpecification',
              'cssSelector': ['#ai-snippets-heading', 'dd']
            },
            'about': {
              '@type': 'SoftwareApplication',
              'name': agent.name,
              'description': snippets.short,
              'applicationCategory': 'AI Agent'
            }
          })
        }}
      />
    </section>
  )
}

/**
 * 生成用于 JSON-LD 的推荐词数据
 * 可以在页面的主 Schema.org 数据中使用
 */
export function getRecommendationSnippetsForSchema(agent: AIRecommendationSnippetsProps['agent']) {
  const snippets = generateSnippets(agent)
  return {
    recommendationSnippets: snippets,
    keywords: [
      agent.name,
      ...(agent.key_features?.slice(0, 3) || []),
      ...(agent.use_cases?.slice(0, 2) || [])
    ].filter(Boolean)
  }
}
