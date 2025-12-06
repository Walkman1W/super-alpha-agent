/**
 * URL Analyzer Tests
 * 
 * Tests for URL validation, HTML parsing, and data validation
 * 
 * Note: These tests focus on pure functions that don't require
 * external API calls (OpenAI, Playwright)
 */

import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'

// Mock the openai module before importing url-analyzer
vi.mock('./openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }
}))

import {
  validateURL,
  sanitizeURL,
  parseHTML,
  validateAgentData
} from './url-analyzer'

describe('URL Validation', () => {
  describe('validateURL', () => {
    it('should accept valid http URLs', () => {
      const result = validateURL('http://example.com')
      expect(result.isValid).toBe(true)
      expect(result.url).toBe('http://example.com/')
    })

    it('should accept valid https URLs', () => {
      const result = validateURL('https://example.com/path?query=1')
      expect(result.isValid).toBe(true)
      expect(result.url).toBe('https://example.com/path?query=1')
    })

    it('should reject empty URLs', () => {
      const result = validateURL('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('URL不能为空')
    })

    it('should reject URLs with invalid protocols', () => {
      const result = validateURL('ftp://example.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('只允许http或https协议')
    })

    it('should reject javascript: URLs', () => {
      const result = validateURL('javascript:alert(1)')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('只允许http或https协议')
    })

    it('should reject invalid URL formats', () => {
      const result = validateURL('not a url')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('无效的URL格式')
    })

    it('should trim whitespace from URLs', () => {
      const result = validateURL('  https://example.com  ')
      expect(result.isValid).toBe(true)
      expect(result.url).toBe('https://example.com/')
    })
  })

  describe('sanitizeURL', () => {
    it('should return sanitized URL for valid input', () => {
      const result = sanitizeURL('https://example.com')
      expect(result).toBe('https://example.com/')
    })

    it('should throw error for invalid URL', () => {
      expect(() => sanitizeURL('invalid')).toThrow('无效的URL格式')
    })
  })
})

describe('HTML Parsing', () => {
  describe('parseHTML', () => {
    it('should extract title from HTML', () => {
      const html = '<html><head><title>Test Title</title></head><body></body></html>'
      const result = parseHTML(html)
      expect(result.title).toBe('Test Title')
    })

    it('should extract meta description', () => {
      const html = '<html><head><meta name="description" content="Test description"></head></html>'
      const result = parseHTML(html)
      expect(result.metaDescription).toBe('Test description')
    })

    it('should extract meta keywords', () => {
      const html = '<html><head><meta name="keywords" content="ai, agent, test"></head></html>'
      const result = parseHTML(html)
      expect(result.metaKeywords).toEqual(['ai', 'agent', 'test'])
    })

    it('should extract Open Graph title', () => {
      const html = '<html><head><meta property="og:title" content="OG Title"></head></html>'
      const result = parseHTML(html)
      expect(result.ogTitle).toBe('OG Title')
    })

    it('should extract Open Graph description', () => {
      const html = '<html><head><meta property="og:description" content="OG Description"></head></html>'
      const result = parseHTML(html)
      expect(result.ogDescription).toBe('OG Description')
    })

    it('should extract headings', () => {
      const html = '<html><body><h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3></body></html>'
      const result = parseHTML(html)
      expect(result.headings).toEqual(['Heading 1', 'Heading 2', 'Heading 3'])
    })

    it('should extract main content from main tag', () => {
      const html = '<html><body><main>Main content here</main></body></html>'
      const result = parseHTML(html)
      expect(result.mainContent).toBe('Main content here')
    })

    it('should extract content from body if no main tag', () => {
      const html = '<html><body>Body content here</body></html>'
      const result = parseHTML(html)
      expect(result.mainContent).toBe('Body content here')
    })

    it('should remove script tags from content', () => {
      const html = '<html><body><script>alert("test")</script>Clean content</body></html>'
      const result = parseHTML(html)
      expect(result.mainContent).toBe('Clean content')
    })

    it('should remove style tags from content', () => {
      const html = '<html><body><style>.test { color: red; }</style>Clean content</body></html>'
      const result = parseHTML(html)
      expect(result.mainContent).toBe('Clean content')
    })

    it('should extract links', () => {
      const html = '<html><body><a href="https://example.com">Link 1</a><a href="/path">Link 2</a></body></html>'
      const result = parseHTML(html)
      expect(result.links).toContain('https://example.com')
      expect(result.links).toContain('/path')
    })

    it('should ignore javascript: links', () => {
      const html = '<html><body><a href="javascript:void(0)">Bad Link</a></body></html>'
      const result = parseHTML(html)
      expect(result.links).not.toContain('javascript:void(0)')
    })

    it('should ignore anchor links', () => {
      const html = '<html><body><a href="#section">Anchor</a></body></html>'
      const result = parseHTML(html)
      expect(result.links).not.toContain('#section')
    })
  })
})

describe('Data Validation', () => {
  describe('validateAgentData', () => {
    it('should accept valid agent data', () => {
      const data = {
        name: 'Test Agent',
        short_description: 'This is a test agent description',
        key_features: ['Feature 1', 'Feature 2']
      }
      const result = validateAgentData(data)
      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Test Agent')
    })

    it('should reject empty name', () => {
      const data = {
        name: '',
        short_description: 'This is a test agent description',
        key_features: ['Feature 1']
      }
      const result = validateAgentData(data)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject short description less than 10 characters', () => {
      const data = {
        name: 'Test Agent',
        short_description: 'Short',
        key_features: ['Feature 1']
      }
      const result = validateAgentData(data)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject empty key_features array', () => {
      const data = {
        name: 'Test Agent',
        short_description: 'This is a test agent description',
        key_features: []
      }
      const result = validateAgentData(data)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should provide default values for optional fields', () => {
      const data = {
        name: 'Test Agent',
        short_description: 'This is a test agent description',
        key_features: ['Feature 1']
      }
      const result = validateAgentData(data)
      expect(result.success).toBe(true)
      expect(result.data?.use_cases).toEqual([])
      expect(result.data?.pros).toEqual([])
      expect(result.data?.cons).toEqual([])
      expect(result.data?.keywords).toEqual([])
    })

    it('should accept all optional fields', () => {
      const data = {
        name: 'Test Agent',
        short_description: 'This is a test agent description',
        detailed_description: 'Detailed description here',
        key_features: ['Feature 1', 'Feature 2'],
        use_cases: ['Use case 1'],
        pros: ['Pro 1'],
        cons: ['Con 1'],
        platform: 'Web',
        pricing: 'Free',
        category: '开发工具',
        keywords: ['ai', 'agent'],
        how_to_use: 'How to use this agent'
      }
      const result = validateAgentData(data)
      expect(result.success).toBe(true)
      expect(result.data?.platform).toBe('Web')
      expect(result.data?.pricing).toBe('Free')
    })
  })
})


// ============================================================================
// Property-Based Tests (属性测试)
// ============================================================================

/**
 * Feature: agent-brand-showcase, Property 14: URL格式验证
 * Validates: Requirements 5.2
 * 
 * 测试有效URL接受和无效URL拒绝
 */
describe('Property Tests: URL Format Validation', () => {
  it('should accept all valid http/https URLs', () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ['http', 'https'] }),
        (url) => {
          const result = validateURL(url)
          expect(result.isValid).toBe(true)
          expect(result.url).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject all URLs with non-http/https protocols', () => {
    const invalidProtocolGenerator = fc.oneof(
      fc.constant('ftp://example.com'),
      fc.constant('file:///path/to/file'),
      fc.constant('mailto:test@example.com'),
      fc.constant('tel:+1234567890'),
      fc.constant('data:text/html,<h1>Hello</h1>')
    )

    fc.assert(
      fc.property(
        invalidProtocolGenerator,
        (url) => {
          const result = validateURL(url)
          expect(result.isValid).toBe(false)
          expect(result.error).toBe('只允许http或https协议')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject all invalid URL formats', () => {
    const invalidURLGenerator = fc.oneof(
      fc.string().filter(s => !s.includes('://') && s.length > 0),
      fc.constant('://missing-protocol.com'),
      fc.constant('http//missing-colon.com'),
      fc.constant('just some random text')
    )

    fc.assert(
      fc.property(
        invalidURLGenerator,
        (url) => {
          const result = validateURL(url)
          expect(result.isValid).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should normalize URLs consistently (idempotence)', () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ['http', 'https'] }),
        (url) => {
          const result1 = validateURL(url)
          if (result1.isValid && result1.url) {
            const result2 = validateURL(result1.url)
            expect(result2.isValid).toBe(true)
            expect(result2.url).toBe(result1.url)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 19: HTML解析
 * Validates: Requirements 6.2
 * 
 * 测试HTML结构解析和文本提取
 */
describe('Property Tests: HTML Parsing', () => {
  // 生成有效的HTML文档
  const htmlGenerator = fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 0, maxLength: 200 }),
    keywords: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
    content: fc.string({ minLength: 0, maxLength: 500 })
  }).map(({ title, description, keywords, content }) => {
    const keywordsStr = keywords.join(', ')
    return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywordsStr}">
</head>
<body>
  <main>${content}</main>
</body>
</html>`
  })

  it('should extract title from any valid HTML', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('<') && !s.includes('>')),
        (title) => {
          const html = `<html><head><title>${title}</title></head><body></body></html>`
          const result = parseHTML(html)
          // HTML 解析器会规范化空白字符，所以我们只检查 trim 后的内容是否包含在结果中
          // 或者结果是规范化后的版本
          const normalizedTitle = title.trim().replace(/\s+/g, ' ')
          expect(result.title?.trim().replace(/\s+/g, ' ')).toBe(normalizedTitle)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should always remove script tags from content', () => {
    // 使用唯一标识符确保scriptContent和bodyContent不会重叠
    fc.assert(
      fc.property(
        fc.nat({ max: 1000 }),
        fc.nat({ max: 1000 }),
        (scriptId, bodyId) => {
          const scriptContent = `SCRIPT_UNIQUE_${scriptId}_MARKER`
          const bodyContent = `BODY_UNIQUE_${bodyId}_CONTENT`
          const html = `<html><body><script>${scriptContent}</script>${bodyContent}</body></html>`
          const result = parseHTML(html)
          // script内容应该被移除
          expect(result.mainContent).not.toContain(scriptContent)
          // body内容应该保留
          expect(result.mainContent).toContain(bodyContent)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should always remove style tags from content', () => {
    // 使用唯一标识符确保styleContent和bodyContent不会重叠
    fc.assert(
      fc.property(
        fc.nat({ max: 1000 }),
        fc.nat({ max: 1000 }),
        (styleId, bodyId) => {
          const styleContent = `STYLE_UNIQUE_${styleId}_MARKER`
          const bodyContent = `BODY_UNIQUE_${bodyId}_CONTENT`
          const html = `<html><body><style>${styleContent}</style>${bodyContent}</body></html>`
          const result = parseHTML(html)
          // style内容应该被移除
          expect(result.mainContent).not.toContain(styleContent)
          // body内容应该保留
          expect(result.mainContent).toContain(bodyContent)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should extract all h1-h3 headings', () => {
    fc.assert(
      fc.property(
        fc.array(
          // 生成简单的字母数字标题，避免空格压缩问题
          fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/),
          { minLength: 1, maxLength: 5 }
        ),
        (headingTexts) => {
          const headingsHtml = headingTexts.map((text, i) => `<h${(i % 3) + 1}>${text}</h${(i % 3) + 1}>`).join('')
          const html = `<html><body>${headingsHtml}</body></html>`
          const result = parseHTML(html)
          
          // 验证所有标题都被提取
          headingTexts.forEach(text => {
            expect(result.headings).toContain(text)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 21: Schema验证
 * Validates: Requirements 6.4
 * 
 * 测试AI生成数据的schema验证
 */
describe('Property Tests: Schema Validation', () => {
  // 生成有效的Agent数据 - 使用非空白字符串
  // 使用 fc.string 并过滤掉纯空白字符串，同时确保规范化后仍满足最小长度
  const nonEmptyString = (minLen: number, maxLen: number) => 
    fc.string({ minLength: minLen, maxLength: maxLen })
      .filter(s => {
        const normalized = s.trim().replace(/\s+/g, ' ')
        return normalized.length >= minLen
      })
  
  const validAgentDataGenerator = fc.record({
    name: nonEmptyString(1, 100),
    short_description: nonEmptyString(10, 200),
    key_features: fc.array(nonEmptyString(1, 50), { minLength: 1, maxLength: 10 })
  })

  it('should accept all valid agent data with required fields', () => {
    fc.assert(
      fc.property(
        validAgentDataGenerator,
        (data) => {
          const result = validateAgentData(data)
          expect(result.success).toBe(true)
          expect(result.data).toBeDefined()
          // 验证数据存在且非空（validateAgentData 可能会规范化空白字符）
          expect(result.data?.name.trim().length).toBeGreaterThan(0)
          expect(result.data?.short_description.trim().length).toBeGreaterThanOrEqual(10)
          expect(result.data?.key_features.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject all data with empty name', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.constant(''),
          short_description: fc.string({ minLength: 10, maxLength: 200 }),
          key_features: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 })
        }),
        (data) => {
          const result = validateAgentData(data)
          expect(result.success).toBe(false)
          expect(result.errors).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject all data with short description less than 10 chars', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          short_description: fc.string({ minLength: 0, maxLength: 9 }),
          key_features: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 })
        }),
        (data) => {
          const result = validateAgentData(data)
          expect(result.success).toBe(false)
          expect(result.errors).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject all data with empty key_features array', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          short_description: fc.string({ minLength: 10, maxLength: 200 }),
          key_features: fc.constant([])
        }),
        (data) => {
          const result = validateAgentData(data)
          expect(result.success).toBe(false)
          expect(result.errors).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should provide default values for all optional fields', () => {
    fc.assert(
      fc.property(
        validAgentDataGenerator,
        (data) => {
          const result = validateAgentData(data)
          expect(result.success).toBe(true)
          expect(result.data?.use_cases).toEqual([])
          expect(result.data?.pros).toEqual([])
          expect(result.data?.cons).toEqual([])
          expect(result.data?.keywords).toEqual([])
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: agent-brand-showcase, Property 16: 信息提取完整性
 * Validates: Requirements 5.4
 * 
 * 测试提取数据包含最少必需字段
 */
describe('Property Tests: Information Extraction Completeness', () => {
  it('should always include required fields in valid agent data', () => {
    // 生成规范化后仍满足最小长度的字符串
    const nonEmptyStr = (minLen: number, maxLen: number) => 
      fc.string({ minLength: minLen, maxLength: maxLen })
        .filter(s => s.trim().replace(/\s+/g, ' ').length >= minLen)
    
    const completeAgentDataGenerator = fc.record({
      name: nonEmptyStr(1, 100),
      short_description: nonEmptyStr(10, 200),
      detailed_description: fc.option(nonEmptyStr(10, 500)),
      key_features: fc.array(nonEmptyStr(1, 50), { minLength: 1, maxLength: 10 }),
      use_cases: fc.option(fc.array(nonEmptyStr(1, 50), { minLength: 0, maxLength: 5 })),
      pros: fc.option(fc.array(nonEmptyStr(1, 50), { minLength: 0, maxLength: 5 })),
      cons: fc.option(fc.array(nonEmptyStr(1, 50), { minLength: 0, maxLength: 5 })),
      platform: fc.option(fc.constantFrom('Web', 'Desktop', 'Mobile', 'API')),
      pricing: fc.option(fc.constantFrom('免费', '付费', 'Freemium')),
      category: fc.option(fc.constantFrom('开发工具', '内容创作', '数据分析', '设计', '其他')),
      keywords: fc.option(fc.array(nonEmptyStr(1, 20), { minLength: 0, maxLength: 5 })),
      how_to_use: fc.option(nonEmptyStr(10, 200))
    })

    fc.assert(
      fc.property(
        completeAgentDataGenerator,
        (data) => {
          const result = validateAgentData(data)
          if (result.success && result.data) {
            // 验证必需字段存在（规范化后）
            expect(result.data.name).toBeDefined()
            expect(result.data.name.trim().length).toBeGreaterThan(0)
            expect(result.data.short_description).toBeDefined()
            expect(result.data.short_description.trim().replace(/\s+/g, ' ').length).toBeGreaterThanOrEqual(10)
            expect(result.data.key_features).toBeDefined()
            expect(result.data.key_features.length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
