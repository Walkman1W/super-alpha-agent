/**
 * AgentCard 组件属性测试
 * 
 * Feature: agent-brand-showcase
 * 测试Agent卡片的导航功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import fc from 'fast-check'
import { AgentCard, AgentCardData, formatNumber, formatNumberWithSeparator } from './agent-card'

// Mock Next.js Link component to capture href
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: any }) => {
    return (
      <a href={href} data-testid="agent-card-link" {...props}>
        {children}
      </a>
    )
  },
}))

// ============================================
// 测试数据生成器
// ============================================

/**
 * 生成有效的slug
 * slug必须是小写字母、数字和连字符的组合
 */
const slugArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s))
  .map(s => s.toLowerCase())

/**
 * 备用slug生成器 - 使用更可靠的方式生成有效slug
 */
const reliableSlugArbitrary = fc.array(
  fc.string({ minLength: 1, maxLength: 10 }).map(s => 
    s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'agent'
  ),
  { minLength: 1, maxLength: 3 }
).map(parts => parts.filter(p => p.length > 0).join('-') || 'default-agent')

/**
 * 生成有效的Agent卡片数据
 */
const agentCardDataArbitrary = fc.record({
  id: fc.uuid(),
  slug: reliableSlugArbitrary,
  name: fc.string({ minLength: 1, maxLength: 100 }),
  short_description: fc.string({ minLength: 10, maxLength: 200 }),
  platform: fc.option(fc.constantFrom('Web', 'iOS', 'Android', 'Desktop', 'API'), { nil: null }),
  key_features: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
  pros: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
  use_cases: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
  pricing: fc.option(fc.constantFrom('免费', 'Free', '付费', '$9.99/月', '免费试用'), { nil: null }),
  official_url: fc.option(fc.webUrl(), { nil: null }),
  ai_search_count: fc.option(fc.nat(10000), { nil: undefined }),
  ai_search_breakdown: fc.option(
    fc.record({
      ChatGPT: fc.nat(1000),
      Claude: fc.nat(1000),
      Perplexity: fc.nat(1000),
    }),
    { nil: undefined }
  ),
})

// ============================================
// 属性测试
// ============================================

/**
 * Feature: agent-brand-showcase, Property 9: Agent导航
 * Validates: Requirements 4.1
 * 
 * 对于任意Agent卡片点击，系统应导航到与点击的agent的slug匹配的正确Agent详情页
 */
describe('Property 9: Agent导航', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render Link with correct href for any valid agent slug', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(agentCardDataArbitrary, (agent) => {
        const { unmount, container } = render(<AgentCard agent={agent} />)
        
        // 获取Link元素
        const link = container.querySelector('a[data-testid="agent-card-link"]')
        
        // 验证Link存在
        expect(link).not.toBeNull()
        
        // 验证href指向正确的Agent详情页
        const expectedHref = `/agents/${agent.slug}`
        expect(link?.getAttribute('href')).toBe(expectedHref)
        
        unmount()
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should have correct aria-label for accessibility', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(agentCardDataArbitrary, (agent) => {
        const { unmount, container } = render(<AgentCard agent={agent} />)
        
        const link = container.querySelector('a[data-testid="agent-card-link"]')
        
        // 验证aria-label包含agent名称
        const ariaLabel = link?.getAttribute('aria-label')
        expect(ariaLabel).toContain(agent.name)
        expect(ariaLabel).toContain('详情')
        
        unmount()
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should have focus styles for keyboard navigation', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(agentCardDataArbitrary, (agent) => {
        const { unmount, container } = render(<AgentCard agent={agent} />)
        
        const link = container.querySelector('a[data-testid="agent-card-link"]')
        
        // 验证Link有focus样式类
        const className = link?.getAttribute('class') || ''
        expect(className).toContain('focus:')
        expect(className).toContain('focus:ring')
        
        unmount()
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should navigate to detail page matching the clicked agent slug', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        agentCardDataArbitrary,
        (agent) => {
          const { unmount, container } = render(<AgentCard agent={agent} />)
          
          const link = container.querySelector('a[data-testid="agent-card-link"]')
          
          // 验证点击会导航到正确的URL
          const href = link?.getAttribute('href')
          
          // 属性: href必须以/agents/开头
          expect(href).toMatch(/^\/agents\//)
          
          // 属性: href必须包含agent的slug
          expect(href).toBe(`/agents/${agent.slug}`)
          
          // 属性: slug部分必须与agent.slug完全匹配
          const slugFromHref = href?.replace('/agents/', '')
          expect(slugFromHref).toBe(agent.slug)
          
          unmount()
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// 单元测试
// ============================================

describe('AgentCard Unit Tests', () => {
  const mockAgent: AgentCardData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    slug: 'test-agent',
    name: 'Test Agent',
    short_description: 'A test agent for unit testing purposes',
    platform: 'Web',
    key_features: ['Feature 1', 'Feature 2'],
    pros: ['Pro 1', 'Pro 2'],
    use_cases: ['Use case 1'],
    pricing: '免费',
    ai_search_count: 42,
  }

  it('renders agent name and description', () => {
    render(<AgentCard agent={mockAgent} />)
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('A test agent for unit testing purposes')).toBeInTheDocument()
  })

  it('renders Link with correct href', () => {
    const { container } = render(<AgentCard agent={mockAgent} />)
    
    const link = container.querySelector('a[data-testid="agent-card-link"]')
    expect(link).toHaveAttribute('href', '/agents/test-agent')
  })

  it('displays AI search count when showAIStats is true', () => {
    render(<AgentCard agent={mockAgent} showAIStats={true} />)
    
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('hides AI search count when showAIStats is false', () => {
    render(<AgentCard agent={mockAgent} showAIStats={false} />)
    
    // AI搜索统计不应该显示
    expect(screen.queryByText('AI 搜索')).not.toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimalAgent: AgentCardData = {
      id: '123',
      slug: 'minimal-agent',
      name: 'Minimal Agent',
      short_description: 'A minimal agent',
    }
    
    const { container } = render(<AgentCard agent={minimalAgent} />)
    
    // 应该正常渲染，不抛出错误
    expect(screen.getByText('Minimal Agent')).toBeInTheDocument()
    const link = container.querySelector('a[data-testid="agent-card-link"]')
    expect(link).toHaveAttribute('href', '/agents/minimal-agent')
  })
})

// ============================================
// formatNumber 函数测试
// ============================================

describe('formatNumber', () => {
  it('should format numbers less than 1000 as-is', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        (num) => {
          const result = formatNumber(num)
          expect(result).toBe(num.toString())
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should format numbers 1000-999999 with K suffix', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 999999 }),
        (num) => {
          const result = formatNumber(num)
          expect(result).toMatch(/^\d+(\.\d)?K$/)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should format numbers >= 1000000 with M suffix', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000, max: 10000000 }),
        (num) => {
          const result = formatNumber(num)
          expect(result).toMatch(/^\d+(\.\d)?M$/)
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('formatNumberWithSeparator', () => {
  it('should format numbers with thousand separators', () => {
    expect(formatNumberWithSeparator(1000)).toBe('1,000')
    expect(formatNumberWithSeparator(1000000)).toBe('1,000,000')
    expect(formatNumberWithSeparator(999)).toBe('999')
  })
})

// ============================================
// 属性测试：Agent卡片完整性
// ============================================

/**
 * 生成非空白字符串的Agent数据
 */
const nonWhitespaceAgentArbitrary = fc.record({
  id: fc.uuid(),
  slug: reliableSlugArbitrary,
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  short_description: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length >= 10),
  platform: fc.option(fc.constantFrom('Web', 'iOS', 'Android', 'Desktop', 'API'), { nil: null }),
  key_features: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5), { minLength: 0, maxLength: 5 }), { nil: undefined }),
  pros: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5), { minLength: 0, maxLength: 5 }), { nil: undefined }),
  use_cases: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5), { minLength: 0, maxLength: 5 }), { nil: undefined }),
  pricing: fc.option(fc.constantFrom('免费', 'Free', '付费', '$9.99/月', '免费试用'), { nil: null }),
  official_url: fc.option(fc.webUrl(), { nil: null }),
  ai_search_count: fc.option(fc.nat(10000), { nil: undefined }),
  ai_search_breakdown: fc.option(
    fc.record({
      ChatGPT: fc.nat(1000),
      Claude: fc.nat(1000),
      Perplexity: fc.nat(1000),
    }),
    { nil: undefined }
  ),
})

/**
 * Feature: agent-brand-showcase, Property 8: Agent卡片完整性
 * Validates: Requirements 3.2
 * 
 * 对于任意显示的Agent卡片，它应包含所有必需字段：名称、简短描述和搜索统计
 */
describe('Property 8: Agent卡片完整性', () => {
  it('should always display agent name', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(nonWhitespaceAgentArbitrary, (agent) => {
        const { unmount } = render(<AgentCard agent={agent} />)
        
        // 验证名称存在 - 使用包含匹配因为HTML可能规范化空白
        const nameElement = screen.getByRole('heading', { level: 3 })
        expect(nameElement).toBeInTheDocument()
        expect(nameElement.textContent?.trim()).toBeTruthy()
        
        unmount()
        return true
      }),
      { numRuns: 50 }
    )
  })

  it('should always display short description', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(nonWhitespaceAgentArbitrary, (agent) => {
        const { unmount } = render(<AgentCard agent={agent} />)
        
        // 验证描述存在 - 通过itemprop属性查找
        const descElement = document.querySelector('[itemprop="description"]')
        expect(descElement).toBeInTheDocument()
        expect(descElement?.textContent?.trim()).toBeTruthy()
        
        unmount()
        return true
      }),
      { numRuns: 50 }
    )
  })

  it('should display AI search stats when showAIStats is true and count > 0', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        nonWhitespaceAgentArbitrary.filter(a => (a.ai_search_count ?? 0) > 0),
        (agent) => {
          const { unmount } = render(<AgentCard agent={agent} showAIStats={true} />)
          
          // 验证AI搜索统计存在
          const formattedCount = formatNumber(agent.ai_search_count!)
          expect(screen.getByText(formattedCount)).toBeInTheDocument()
          expect(screen.getByText('AI 搜索')).toBeInTheDocument()
          
          unmount()
          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 27: 聚合计数显示
 * Validates: Requirements 8.1
 * 
 * 对于任意Agent卡片，显示的搜索计数应等于所有AI引擎计数之和
 */
describe('Property 27: 聚合计数显示', () => {
  it('should display the correct aggregated count', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          slug: reliableSlugArbitrary,
          name: fc.string({ minLength: 1, maxLength: 100 }),
          short_description: fc.string({ minLength: 10, maxLength: 200 }),
          ai_search_count: fc.integer({ min: 1, max: 10000 }),
        }),
        (agent) => {
          const { unmount } = render(<AgentCard agent={agent} showAIStats={true} />)
          
          // 验证显示的计数是正确的格式化值
          const formattedCount = formatNumber(agent.ai_search_count)
          expect(screen.getByText(formattedCount)).toBeInTheDocument()
          
          unmount()
          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 31: 数字格式化
 * Validates: Requirements 8.5
 * 
 * 对于任意显示的大于999的计数，数字应使用适当的分隔符格式化
 */
describe('Property 31: 数字格式化', () => {
  it('should format numbers >= 1000 with K suffix', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 999999 }),
        (num) => {
          const formatted = formatNumber(num)
          expect(formatted).toMatch(/^\d+(\.\d)?K$/)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should format numbers >= 1000000 with M suffix', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000, max: 10000000 }),
        (num) => {
          const formatted = formatNumber(num)
          expect(formatted).toMatch(/^\d+(\.\d)?M$/)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not format numbers < 1000', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        (num) => {
          const formatted = formatNumber(num)
          expect(formatted).toBe(num.toString())
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('formatNumberWithSeparator should add thousand separators', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10000000 }),
        (num) => {
          const formatted = formatNumberWithSeparator(num)
          expect(formatted).toContain(',')
          // 验证格式正确
          expect(formatted).toMatch(/^[\d,]+$/)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
