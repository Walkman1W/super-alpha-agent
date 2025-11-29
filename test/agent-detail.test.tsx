import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AgentDetailPage, { generateMetadata } from '@/app/agents/[slug]/page'
import { supabaseAdmin } from '@/lib/supabase'

// 模拟 supabaseAdmin
  vi.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-agent',
        name: '测试 Agent',
        category_id: '123e4567-e89b-12d3-a456-426614174001',
        short_description: '这是一个测试 Agent 的简短描述',
        detailed_description: '这是一个测试 Agent 的详细描述，包含更多信息。',
        key_features: ['功能1', '功能2', '功能3'],
        use_cases: ['使用场景1', '使用场景2'],
        pros: ['优点1', '优点2'],
        cons: ['缺点1', '缺点2'],
        platform: 'Web',
        pricing: '免费',
        keywords: ['测试', 'agent', '工具'],
        view_count: 123,
        favorite_count: 45,
        ai_search_count: 67,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        categories: {
          name: '测试类别',
          slug: 'test-category'
        }
      } }),
      groupBy: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          slug: 'similar-agent-1',
          name: '相似 Agent 1',
          short_description: '相似 Agent 1 的描述',
          platform: 'Web'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174003',
          slug: 'similar-agent-2',
          name: '相似 Agent 2',
          short_description: '相似 Agent 2 的描述',
          platform: 'Mobile'
        }
      ] }),
      update: vi.fn().mockReturnThis()
    }
  }))

test('属性 10: Agent详情完整性 - 验证所有必需信息字段的显示', async () => {
  const page = await AgentDetailPage({ params: { slug: 'test-agent' } })
  render(page)

  // 验证基本信息
  expect(screen.getAllByText(/测试 Agent/)).toHaveLength(10)
  expect(screen.getAllByText(/这是一个测试 Agent 的简短描述/)).toHaveLength(2)
  expect(screen.getByText('测试类别')).toBeInTheDocument()
  expect(screen.getByText('Web')).toBeInTheDocument()
  expect(screen.getByText('免费')).toBeInTheDocument()
  expect(screen.getByText('123')).toBeInTheDocument() // 浏览量
  expect(screen.getByText('67')).toBeInTheDocument() // AI 搜索量

  // 验证详细信息
  expect(screen.getByText('详细介绍')).toBeInTheDocument()
  expect(screen.getByText('这是一个测试 Agent 的详细描述，包含更多信息。')).toBeInTheDocument()

  // 验证核心功能
  expect(screen.getByText('核心功能')).toBeInTheDocument()
  expect(screen.getByText('功能1')).toBeInTheDocument()
  expect(screen.getByText('功能2')).toBeInTheDocument()
  expect(screen.getByText('功能3')).toBeInTheDocument()

  // 验证适用场景
  expect(screen.getByText('适用场景')).toBeInTheDocument()
  expect(screen.getByText('使用场景1')).toBeInTheDocument()
  expect(screen.getByText('使用场景2')).toBeInTheDocument()

  // 验证优缺点
  expect(screen.getByText('优缺点分析')).toBeInTheDocument()
  expect(screen.getByText('优点')).toBeInTheDocument()
  expect(screen.getByText('+ 优点1')).toBeInTheDocument()
  expect(screen.getByText('+ 优点2')).toBeInTheDocument()
  expect(screen.getByText('缺点')).toBeInTheDocument()
  expect(screen.getByText('- 缺点1')).toBeInTheDocument()
  expect(screen.getByText('- 缺点2')).toBeInTheDocument()
})

test('属性 11: 结构化数据存在性 - 测试JSON-LD结构化数据的有效性', async () => {
  const page = await AgentDetailPage({ params: { slug: 'test-agent' } })
  render(page)

  // 验证JSON-LD脚本存在
  const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
  expect(jsonLdScript).toBeInTheDocument()

  // 验证JSON-LD内容
  const jsonLdContent = JSON.parse(jsonLdScript.innerHTML)
  expect(jsonLdContent['@context']).toBe('https://schema.org')
  expect(jsonLdContent['@type']).toBe('SoftwareApplication')
  expect(jsonLdContent.name).toBe('测试 Agent')
  expect(jsonLdContent.description).toBe('这是一个测试 Agent 的详细描述，包含更多信息。')
  expect(jsonLdContent.applicationCategory).toBe('测试类别')
  expect(jsonLdContent.offers).toHaveProperty('@type', 'Offer')
  expect(jsonLdContent.offers.price).toBe('0')
})

test('属性 12: SEO元标签完整性 - 测试所有必需meta标签的存在', async () => {
  const metadata = await generateMetadata({ params: { slug: 'test-agent' } })

  // 验证基本meta标签
  expect(metadata.title).toBe('测试 Agent - AI Agent 详细分析 | Super Alpha Agent')
  expect(metadata.description).toBe('这是一个测试 Agent 的简短描述')
  expect(metadata.keywords).toBeDefined()

  // 验证Open Graph标签
  expect(metadata.openGraph).toBeDefined()
  expect(metadata.openGraph?.title).toBe('测试 Agent - AI Agent 详细分析')
  expect(metadata.openGraph?.description).toBe('这是一个测试 Agent 的简短描述')
  expect(metadata.openGraph?.type).toBe('software')

  // 验证Twitter标签
  expect(metadata.twitter).toBeDefined()
  expect(metadata.twitter?.card).toBe('summary_large_image')
  expect(metadata.twitter?.title).toBe('测试 Agent - AI Agent 详细分析')
  expect(metadata.twitter?.description).toBe('这是一个测试 Agent 的简短描述')
})

test('属性 13 & 28: AI统计细分 - 测试每个AI引擎的计数细分显示', async () => {
  // 模拟AI访问数据
  (supabaseAdmin.from as vi.Mock).mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      slug: 'test-agent',
      name: '测试 Agent',
      category_id: '123e4567-e89b-12d3-a456-426614174001',
      short_description: '这是一个测试 Agent 的简短描述',
      detailed_description: '这是一个测试 Agent 的详细描述，包含更多信息。',
      key_features: ['功能1', '功能2', '功能3'],
      use_cases: ['使用场景1', '使用场景2'],
      pros: ['优点1', '优点2'],
      cons: ['缺点1', '缺点2'],
      platform: 'Web',
      pricing: '免费',
      keywords: ['测试', 'agent', '工具'],
      view_count: 123,
      favorite_count: 45,
      ai_search_count: 67,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      categories: {
        name: '测试类别',
        slug: 'test-category'
      }
    } }),
    groupBy: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [
      {
        ai_name: 'ChatGPT',
        count: 45
      },
      {
        ai_name: 'Claude',
        count: 22
      }
    ] }),
    limit: vi.fn().mockResolvedValue({ data: [
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        slug: 'similar-agent-1',
        name: '相似 Agent 1',
        short_description: '相似 Agent 1 的描述',
        platform: 'Web'
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        slug: 'similar-agent-2',
        name: '相似 Agent 2',
        short_description: '相似 Agent 2 的描述',
        platform: 'Mobile'
      }
    ] }),
    update: vi.fn().mockReturnThis()
  }))

  const page = await AgentDetailPage({ params: { slug: 'test-agent' } })
  render(page)

  // 验证AI搜索统计组件存在
  expect(screen.getByText('AI搜索统计细分')).toBeInTheDocument()
  const totalSearchText = screen.getByText(/总计:/).parentElement;
  expect(totalSearchText?.textContent).toContain('67 次AI搜索')

  // 验证每个AI引擎的统计数据
  expect(screen.getByText('ChatGPT')).toBeInTheDocument()
  expect(screen.getByText('45')).toBeInTheDocument()
  expect(screen.getAllByText('次搜索')).toHaveLength(2)
  expect(screen.getByText('Claude')).toBeInTheDocument()
  expect(screen.getByText('22')).toBeInTheDocument()
})

test('属性 24: 语义化HTML和ARIA - 测试语义化元素和ARIA标签', async () => {
  const page = await AgentDetailPage({ params: { slug: 'test-agent' } })
  render(page)

  // 验证语义化元素
  expect(screen.getByRole('navigation', { name: /面包屑导航/i })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: /快速概览/i })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: /详细介绍/i })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: /核心功能/i })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: /适用场景/i })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: /优缺点分析/i })).toBeInTheDocument()

  // 验证ARIA标签
  expect(screen.getByLabelText('简短描述')).toBeInTheDocument()
  expect(screen.getByLabelText('AI搜索统计细分')).toBeInTheDocument()

  // 验证标题层级
  const headings = screen.getAllByRole('heading')
  expect(headings).toHaveLength(16) // 1 h1, 5 h2, 10 h3
  expect(headings[0].tagName).toBe('H1')
  expect(headings[1].tagName).toBe('H2')
  expect(headings[2].tagName).toBe('H2')
  expect(headings[3].tagName).toBe('H2')
  expect(headings[4].tagName).toBe('H2')
  expect(headings[5].tagName).toBe('H2')
})

test('属性 25: 关键词派生 - 测试meta关键词从类别和特性派生', async () => {
  const metadata = await generateMetadata({ params: { slug: 'test-agent' } })

  // 验证关键词包含Agent名称、类别、功能、使用场景等
  expect(metadata.keywords).toContain('测试 Agent')
  expect(metadata.keywords).toContain('测试类别')
  expect(metadata.keywords).toContain('功能1')
  expect(metadata.keywords).toContain('功能2')
  expect(metadata.keywords).toContain('功能3')
  expect(metadata.keywords).toContain('使用场景1')
  expect(metadata.keywords).toContain('使用场景2')
  expect(metadata.keywords).toContain('Web')
  expect(metadata.keywords).toContain('免费')
})