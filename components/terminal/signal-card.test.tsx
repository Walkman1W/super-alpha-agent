import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, screen, fireEvent } from '@testing-library/react'
import { SignalCard } from './signal-card'
import type { SignalAgent, EntityType, AutonomyLevel, AgentStatus } from '@/lib/types/agent'

// 生成随机 SignalAgent 的 Arbitrary
const signalAgentArbitrary = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[^a-z0-9-]/gi, '-').toLowerCase()),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  short_description: fc.string({ minLength: 1, maxLength: 500 }),
  entity_type: fc.constantFrom<EntityType>('repo', 'saas', 'app'),
  autonomy_level: fc.constantFrom<AutonomyLevel>('L1', 'L2', 'L3', 'L4', 'L5'),
  status: fc.constantFrom<AgentStatus>('online', 'offline', 'maintenance'),
  metrics: fc.record({
    latency: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
    cost: fc.option(fc.float({ min: 0, max: 100 }), { nil: undefined }),
    stars: fc.option(fc.integer({ min: 0, max: 1000000 }), { nil: undefined }),
  }),
  framework: fc.option(fc.constantFrom('LangChain', 'AutoGPT', 'CrewAI', 'Custom', null), { nil: null }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
  rank: fc.integer({ min: 1, max: 100 }),
  geo_score: fc.float({ min: 0, max: 10, noNaN: true }),
  official_url: fc.option(fc.webUrl(), { nil: null }),
}) as fc.Arbitrary<SignalAgent>

// 生成带有效 official_url 的 Agent
const agentWithUrlArbitrary = signalAgentArbitrary.map(agent => ({
  ...agent,
  official_url: `https://example.com/${agent.slug}`,
}))

// 生成不带 official_url 的 Agent
const agentWithoutUrlArbitrary = signalAgentArbitrary.map(agent => ({
  ...agent,
  official_url: null,
}))

describe('SignalCard', () => {
  describe('Property Tests', () => {
    /**
     * **Feature: brand-content-ux-upgrade, Property 2: 卡片标题外部链接**
     * **Validates: Requirements 5.1**
     * 
     * 对于任意具有有效 official_url 的 Agent 卡片，点击标题应产生一个带有
     * `target="_blank"` 和 `rel="noopener noreferrer"` 属性的锚元素，指向官方 URL。
     */
    it('Property 2: 具有 official_url 的卡片标题应渲染为外部链接', () => {
      fc.assert(
        fc.property(
          agentWithUrlArbitrary,
          (agent) => {
            const { container } = render(<SignalCard agent={agent} />)
            
            // 查找标题链接
            const titleLink = container.querySelector('[data-testid="agent-name-link"]')
            
            // 验证链接存在
            expect(titleLink).not.toBeNull()
            
            // 验证 href 指向 official_url
            expect(titleLink?.getAttribute('href')).toBe(agent.official_url)
            
            // 验证 target="_blank"
            expect(titleLink?.getAttribute('target')).toBe('_blank')
            
            // 验证 rel="noopener noreferrer"
            expect(titleLink?.getAttribute('rel')).toBe('noopener noreferrer')
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * **Feature: brand-content-ux-upgrade, Property 2: 卡片标题外部链接**
     * **Validates: Requirements 5.1**
     * 
     * 对于没有 official_url 的 Agent，标题应渲染为普通文本而非链接
     */
    it('Property 2: 没有 official_url 的卡片标题应渲染为普通文本', () => {
      fc.assert(
        fc.property(
          agentWithoutUrlArbitrary,
          (agent) => {
            const { container } = render(<SignalCard agent={agent} />)
            
            // 不应存在标题链接
            const titleLink = container.querySelector('[data-testid="agent-name-link"]')
            expect(titleLink).toBeNull()
            
            // 应存在普通标题文本
            const titleText = container.querySelector('[data-testid="agent-name"]')
            expect(titleText).not.toBeNull()
            expect(titleText?.textContent).toBe(agent.name)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * **Feature: brand-content-ux-upgrade, Property 3: 卡片点击不导航到详情页**
     * **Validates: Requirements 5.5**
     * 
     * 对于任意卡片主体的点击事件，系统不应触发到 `/agents/[slug]` 路由的导航。
     * 卡片应该是一个 div 而非 Link，点击时触发 onCardClick 回调。
     */
    it('Property 3: 卡片点击应触发 onCardClick 而非导航', () => {
      fc.assert(
        fc.property(
          signalAgentArbitrary,
          (agent) => {
            const onCardClick = vi.fn()
            const { container } = render(
              <SignalCard agent={agent} onCardClick={onCardClick} />
            )
            
            // 获取卡片元素
            const card = container.querySelector('[data-testid="signal-card"]')
            expect(card).not.toBeNull()
            
            // 验证卡片不是 Link (不应有 href 属性)
            expect(card?.tagName.toLowerCase()).toBe('div')
            expect(card?.getAttribute('href')).toBeNull()
            
            // 点击卡片
            fireEvent.click(card!)
            
            // 验证 onCardClick 被调用
            expect(onCardClick).toHaveBeenCalledTimes(1)
            expect(onCardClick).toHaveBeenCalledWith(agent)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    /**
     * **Feature: brand-content-ux-upgrade, Property 3: 卡片点击不导航到详情页**
     * **Validates: Requirements 5.5**
     * 
     * 标题链接点击不应触发卡片的 onCardClick 回调（事件冒泡被阻止）
     */
    it('Property 3: 标题链接点击不应触发卡片 onCardClick', () => {
      fc.assert(
        fc.property(
          agentWithUrlArbitrary,
          (agent) => {
            const onCardClick = vi.fn()
            const { container } = render(
              <SignalCard agent={agent} onCardClick={onCardClick} />
            )
            
            // 获取标题链接
            const titleLink = container.querySelector('[data-testid="agent-name-link"]')
            expect(titleLink).not.toBeNull()
            
            // 点击标题链接
            fireEvent.click(titleLink!)
            
            // 验证 onCardClick 没有被调用（事件冒泡被阻止）
            expect(onCardClick).not.toHaveBeenCalled()
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Unit Tests', () => {
    const mockAgent: SignalAgent = {
      id: 'test-id',
      slug: 'test-agent',
      name: 'Test Agent',
      short_description: 'A test agent for unit testing',
      entity_type: 'repo',
      autonomy_level: 'L3',
      status: 'online',
      metrics: {
        latency: 100,
        stars: 1000,
      },
      framework: 'LangChain',
      tags: ['test', 'ai'],
      rank: 1,
      geo_score: 8.5,
      official_url: 'https://github.com/test/agent',
    }

    it('应正确渲染 Agent 名称', () => {
      render(<SignalCard agent={mockAgent} />)
      expect(screen.getByText('Test Agent')).toBeInTheDocument()
    })

    it('应正确渲染状态指示器', () => {
      render(<SignalCard agent={mockAgent} />)
      expect(screen.getByText('Online')).toBeInTheDocument()
    })

    it('应正确渲染自主等级徽章', () => {
      render(<SignalCard agent={mockAgent} />)
      const badge = screen.getByTestId('autonomy-badge')
      expect(badge).toBeInTheDocument()
    })

    it('应正确渲染 Signal Score', () => {
      render(<SignalCard agent={mockAgent} />)
      expect(screen.getByText('8.5')).toBeInTheDocument()
    })

    it('选中状态应添加高亮样式', () => {
      const { container } = render(<SignalCard agent={mockAgent} isSelected />)
      const card = container.querySelector('[data-testid="signal-card"]')
      expect(card?.className).toContain('ring-2')
      expect(card?.className).toContain('ring-purple-500')
    })

    it('键盘 Enter 应触发 onCardClick', () => {
      const onCardClick = vi.fn()
      const { container } = render(
        <SignalCard agent={mockAgent} onCardClick={onCardClick} />
      )
      
      const card = container.querySelector('[data-testid="signal-card"]')
      fireEvent.keyDown(card!, { key: 'Enter' })
      
      expect(onCardClick).toHaveBeenCalledTimes(1)
    })

    it('键盘 Space 应触发 onCardClick', () => {
      const onCardClick = vi.fn()
      const { container } = render(
        <SignalCard agent={mockAgent} onCardClick={onCardClick} />
      )
      
      const card = container.querySelector('[data-testid="signal-card"]')
      fireEvent.keyDown(card!, { key: ' ' })
      
      expect(onCardClick).toHaveBeenCalledTimes(1)
    })
  })
})
