/**
 * URL 检测器测试
 * 
 * 包含单元测试和属性测试
 * 
 * Requirements: 1.1, 1.2, 1.3
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  isValidURL,
  normalizeURL,
  isGitHubURL,
  extractGitHubInfo,
  normalizeGitHubURL,
  detectURLType,
  detectURL,
  URLDetector
} from './url-detector'

// ============================================================================
// 单元测试
// ============================================================================

describe('URL Detector - Unit Tests', () => {
  describe('isValidURL', () => {
    it('should accept valid https URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true)
      expect(isValidURL('https://www.example.com')).toBe(true)
      expect(isValidURL('https://example.com/path')).toBe(true)
      expect(isValidURL('https://example.com/path?query=1')).toBe(true)
    })

    it('should accept valid http URLs', () => {
      expect(isValidURL('http://example.com')).toBe(true)
      expect(isValidURL('http://localhost:3000')).toBe(true)
    })

    it('should reject empty or null values', () => {
      expect(isValidURL('')).toBe(false)
      expect(isValidURL('   ')).toBe(false)
      expect(isValidURL(null as unknown as string)).toBe(false)
      expect(isValidURL(undefined as unknown as string)).toBe(false)
    })

    it('should reject invalid protocols', () => {
      expect(isValidURL('ftp://example.com')).toBe(false)
      expect(isValidURL('file:///path/to/file')).toBe(false)
      expect(isValidURL('javascript:alert(1)')).toBe(false)
      expect(isValidURL('data:text/html,<h1>Hi</h1>')).toBe(false)
    })

    it('should reject malformed URLs', () => {
      expect(isValidURL('not a url')).toBe(false)
      expect(isValidURL('://missing-protocol.com')).toBe(false)
      expect(isValidURL('http//missing-colon.com')).toBe(false)
    })

    it('should reject URLs without valid hostname', () => {
      expect(isValidURL('https://')).toBe(false)
    })
  })

  describe('normalizeURL', () => {
    it('should remove trailing slashes', () => {
      expect(normalizeURL('https://example.com/')).toBe('https://example.com')
      expect(normalizeURL('https://example.com/path/')).toBe('https://example.com/path')
      expect(normalizeURL('https://example.com///')).toBe('https://example.com')
    })

    it('should upgrade http to https for non-localhost', () => {
      expect(normalizeURL('http://example.com')).toBe('https://example.com')
      expect(normalizeURL('http://example.com/')).toBe('https://example.com')
      expect(normalizeURL('http://example.com/path')).toBe('https://example.com/path')
    })

    it('should keep http for localhost', () => {
      expect(normalizeURL('http://localhost:3000')).toBe('http://localhost:3000')
      expect(normalizeURL('http://localhost:3000/')).toBe('http://localhost:3000')
      expect(normalizeURL('http://localhost:3000/path')).toBe('http://localhost:3000/path')
    })

    it('should trim whitespace', () => {
      expect(normalizeURL('  https://example.com  ')).toBe('https://example.com')
      expect(normalizeURL('  https://example.com/  ')).toBe('https://example.com')
    })
  })

  describe('isGitHubURL', () => {
    it('should detect valid GitHub repository URLs', () => {
      expect(isGitHubURL('https://github.com/owner/repo')).toBe(true)
      expect(isGitHubURL('https://github.com/owner/repo/')).toBe(true)
      expect(isGitHubURL('https://www.github.com/owner/repo')).toBe(true)
      expect(isGitHubURL('http://github.com/owner/repo')).toBe(true)
    })

    it('should detect GitHub URLs with additional paths', () => {
      expect(isGitHubURL('https://github.com/owner/repo/tree/main')).toBe(true)
      expect(isGitHubURL('https://github.com/owner/repo/blob/main/README.md')).toBe(true)
      expect(isGitHubURL('https://github.com/owner/repo/issues')).toBe(true)
    })

    it('should reject GitHub URLs without repo', () => {
      expect(isGitHubURL('https://github.com/owner')).toBe(false)
      expect(isGitHubURL('https://github.com/')).toBe(false)
      expect(isGitHubURL('https://github.com')).toBe(false)
    })

    it('should reject GitHub reserved paths', () => {
      expect(isGitHubURL('https://github.com/settings/profile')).toBe(false)
      expect(isGitHubURL('https://github.com/explore/topics')).toBe(false)
      expect(isGitHubURL('https://github.com/marketplace/actions')).toBe(false)
    })

    it('should reject non-GitHub URLs', () => {
      expect(isGitHubURL('https://gitlab.com/owner/repo')).toBe(false)
      expect(isGitHubURL('https://bitbucket.org/owner/repo')).toBe(false)
      expect(isGitHubURL('https://example.com/github.com/owner/repo')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isGitHubURL('')).toBe(false)
      expect(isGitHubURL(null as unknown as string)).toBe(false)
      expect(isGitHubURL('github.com/owner/repo')).toBe(false) // missing protocol
    })
  })

  describe('extractGitHubInfo', () => {
    it('should extract owner and repo from valid URLs', () => {
      const result = extractGitHubInfo('https://github.com/facebook/react')
      expect(result).toEqual({ owner: 'facebook', repo: 'react' })
    })

    it('should handle URLs with additional paths', () => {
      const result = extractGitHubInfo('https://github.com/vercel/next.js/tree/main')
      expect(result).toEqual({ owner: 'vercel', repo: 'next.js' })
    })

    it('should remove .git suffix from repo', () => {
      const result = extractGitHubInfo('https://github.com/owner/repo.git')
      expect(result).toEqual({ owner: 'owner', repo: 'repo' })
    })

    it('should return null for invalid URLs', () => {
      expect(extractGitHubInfo('https://example.com')).toBeNull()
      expect(extractGitHubInfo('https://github.com/owner')).toBeNull()
      expect(extractGitHubInfo('')).toBeNull()
    })
  })

  describe('normalizeGitHubURL', () => {
    it('should normalize to standard format', () => {
      expect(normalizeGitHubURL('https://github.com/owner/repo/')).toBe('https://github.com/owner/repo')
      expect(normalizeGitHubURL('http://github.com/owner/repo')).toBe('https://github.com/owner/repo')
      expect(normalizeGitHubURL('https://www.github.com/owner/repo')).toBe('https://github.com/owner/repo')
    })

    it('should strip additional paths', () => {
      expect(normalizeGitHubURL('https://github.com/owner/repo/tree/main')).toBe('https://github.com/owner/repo')
      expect(normalizeGitHubURL('https://github.com/owner/repo/issues/123')).toBe('https://github.com/owner/repo')
    })

    it('should remove .git suffix', () => {
      expect(normalizeGitHubURL('https://github.com/owner/repo.git')).toBe('https://github.com/owner/repo')
    })
  })

  describe('detectURLType', () => {
    it('should detect GitHub URLs', () => {
      expect(detectURLType('https://github.com/owner/repo')).toBe('github')
    })

    it('should detect SaaS URLs', () => {
      expect(detectURLType('https://example.com')).toBe('saas')
      expect(detectURLType('https://openai.com/api')).toBe('saas')
    })

    it('should return invalid for bad URLs', () => {
      expect(detectURLType('not a url')).toBe('invalid')
      expect(detectURLType('')).toBe('invalid')
    })
  })

  describe('detectURL', () => {
    it('should return complete result for GitHub URLs', () => {
      const result = detectURL('https://github.com/facebook/react')
      expect(result.type).toBe('github')
      expect(result.normalizedUrl).toBe('https://github.com/facebook/react')
      expect(result.githubOwner).toBe('facebook')
      expect(result.githubRepo).toBe('react')
    })

    it('should return complete result for SaaS URLs', () => {
      const result = detectURL('https://openai.com/api/')
      expect(result.type).toBe('saas')
      expect(result.normalizedUrl).toBe('https://openai.com/api')
      expect(result.githubOwner).toBeUndefined()
      expect(result.githubRepo).toBeUndefined()
    })

    it('should return invalid result for bad URLs', () => {
      const result = detectURL('not a url')
      expect(result.type).toBe('invalid')
      expect(result.normalizedUrl).toBe('')
    })

    it('should handle empty input', () => {
      const result = detectURL('')
      expect(result.type).toBe('invalid')
      expect(result.normalizedUrl).toBe('')
    })
  })

  describe('URLDetector class', () => {
    const detector = new URLDetector()

    it('should provide all methods', () => {
      expect(typeof detector.detect).toBe('function')
      expect(typeof detector.isValid).toBe('function')
      expect(typeof detector.isGitHub).toBe('function')
      expect(typeof detector.normalize).toBe('function')
      expect(typeof detector.extractGitHubInfo).toBe('function')
    })

    it('should work correctly', () => {
      const result = detector.detect('https://github.com/owner/repo')
      expect(result.type).toBe('github')
      expect(detector.isValid('https://example.com')).toBe(true)
      expect(detector.isGitHub('https://github.com/owner/repo')).toBe(true)
    })
  })
})

// ============================================================================
// 属性测试
// ============================================================================

/**
 * **功能: agent-scanner-mvp, 属性 1: URL 验证正确性**
 * 对于任意字符串输入，URL 验证器应正确将其分类为有效（匹配 URL 模式）或无效，
 * 且有效 URL 应被一致地规范化。
 * **验证: 需求 1.1**
 */
describe('Property Tests: URL Validation (Property 1)', () => {
  it('should accept all valid http/https URLs', () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ['http', 'https'] }),
        (url) => {
          const result = isValidURL(url)
          expect(result).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject all URLs with non-http/https protocols', () => {
    const invalidProtocols = ['ftp', 'file', 'mailto', 'tel', 'data', 'javascript']
    
    fc.assert(
      fc.property(
        fc.constantFrom(...invalidProtocols),
        fc.domain(),
        (protocol, domain) => {
          const url = `${protocol}://${domain}`
          const result = isValidURL(url)
          expect(result).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject all random non-URL strings', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !s.includes('://') && s.length > 0 && s.trim().length > 0),
        (str) => {
          const result = isValidURL(str)
          expect(result).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should normalize URLs consistently (idempotence)', () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ['https'] }),
        (url) => {
          if (isValidURL(url)) {
            const normalized1 = normalizeURL(url)
            const normalized2 = normalizeURL(normalized1)
            // 规范化应该是幂等的：对已规范化的 URL 再次规范化应该得到相同结果
            expect(normalized2).toBe(normalized1)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should always trim whitespace from URLs', () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ['https'] }),
        fc.nat({ max: 5 }),
        fc.nat({ max: 5 }),
        (url, leadingCount, trailingCount) => {
          const leadingSpaces = ' '.repeat(leadingCount)
          const trailingSpaces = ' '.repeat(trailingCount)
          const paddedUrl = leadingSpaces + url + trailingSpaces
          const isValidPadded = isValidURL(paddedUrl)
          const isValidOriginal = isValidURL(url)
          // 带空格和不带空格的结果应该一致
          expect(isValidPadded).toBe(isValidOriginal)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **功能: agent-scanner-mvp, 属性 2: URL 类型检测准确性**
 * 对于任意有效 URL，URL 检测器应正确将其分类为 'github'（如果匹配 github.com/owner/repo 模式）
 * 或 'saas'（所有其他有效 URL），不得有错误分类。
 * **验证: 需求 1.2, 1.3**
 */
describe('Property Tests: URL Type Detection (Property 2)', () => {
  // GitHub URL 生成器
  const githubURLGenerator = fc.tuple(
    // owner: GitHub 用户名规则 (字母数字，可包含连字符但不能以连字符开头或结尾)
    fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9-]{0,37}[a-zA-Z0-9]$/).filter(s => !s.includes('--')),
    // repo: 仓库名规则
    fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,98}[a-zA-Z0-9]$/)
  ).map(([owner, repo]) => `https://github.com/${owner}/${repo}`)

  // 非 GitHub 的 SaaS URL 生成器
  const saasURLGenerator = fc.webUrl({ validSchemes: ['https'] })
    .filter(url => {
      try {
        const parsed = new URL(url)
        return parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com'
      } catch {
        return false
      }
    })

  it('should classify all valid GitHub URLs as github type', () => {
    fc.assert(
      fc.property(
        githubURLGenerator,
        (url) => {
          const result = detectURL(url)
          expect(result.type).toBe('github')
          expect(result.githubOwner).toBeDefined()
          expect(result.githubRepo).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should classify all non-GitHub valid URLs as saas type', () => {
    fc.assert(
      fc.property(
        saasURLGenerator,
        (url) => {
          const result = detectURL(url)
          expect(result.type).toBe('saas')
          expect(result.githubOwner).toBeUndefined()
          expect(result.githubRepo).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should extract correct owner/repo from GitHub URLs', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{1,10}$/),
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{1,10}$/),
        (owner, repo) => {
          const url = `https://github.com/${owner}/${repo}`
          const result = detectURL(url)
          
          expect(result.type).toBe('github')
          expect(result.githubOwner).toBe(owner)
          expect(result.githubRepo).toBe(repo)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should normalize GitHub URLs to standard format', () => {
    // GitHub 保留路径列表
    const reservedPaths = new Set([
      'settings', 'explore', 'topics', 'trending', 'collections',
      'events', 'sponsors', 'login', 'signup', 'pricing',
      'features', 'enterprise', 'team', 'marketplace', 'pulls',
      'issues', 'notifications', 'new', 'organizations', 'orgs',
      'about', 'security', 'contact', 'support', 'blog', 'apps',
      'codespaces', 'copilot', 'actions', 'packages', 'discussions'
    ])

    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{1,10}$/).filter(s => !reservedPaths.has(s.toLowerCase())),
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{1,10}$/),
        fc.constantFrom('', '/', '/tree/main', '/blob/main/README.md', '/issues'),
        (owner, repo, suffix) => {
          const url = `https://github.com/${owner}/${repo}${suffix}`
          const result = detectURL(url)
          
          expect(result.type).toBe('github')
          // 规范化后应该只保留 owner/repo
          expect(result.normalizedUrl).toBe(`https://github.com/${owner}/${repo}`)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should never classify invalid URLs as github or saas', () => {
    const invalidURLGenerator = fc.oneof(
      fc.constant(''),
      fc.constant('   '),
      fc.string().filter(s => !s.includes('://') && s.length > 0),
      fc.constant('ftp://example.com'),
      fc.constant('javascript:alert(1)')
    )

    fc.assert(
      fc.property(
        invalidURLGenerator,
        (url) => {
          const result = detectURL(url)
          expect(result.type).toBe('invalid')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle GitHub URLs with www prefix', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{1,10}$/),
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{1,10}$/),
        fc.boolean(),
        (owner, repo, useWww) => {
          const host = useWww ? 'www.github.com' : 'github.com'
          const url = `https://${host}/${owner}/${repo}`
          const result = detectURL(url)
          
          expect(result.type).toBe('github')
          expect(result.githubOwner).toBe(owner)
          expect(result.githubRepo).toBe(repo)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should reject GitHub reserved paths', () => {
    const reservedPaths = [
      'settings', 'explore', 'topics', 'trending', 'collections',
      'events', 'sponsors', 'login', 'signup', 'pricing',
      'features', 'enterprise', 'team', 'marketplace', 'pulls',
      'issues', 'notifications', 'new', 'organizations', 'orgs'
    ]

    fc.assert(
      fc.property(
        fc.constantFrom(...reservedPaths),
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{1,10}$/),
        (reservedPath, secondPart) => {
          const url = `https://github.com/${reservedPath}/${secondPart}`
          const result = detectURL(url)
          
          // 保留路径应该被识别为 SaaS 而不是 GitHub 仓库
          expect(result.type).not.toBe('github')
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * 额外属性测试: URL 规范化一致性
 */
describe('Property Tests: URL Normalization Consistency', () => {
  it('should always produce valid URLs after normalization', () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ['http', 'https'] }),
        (url) => {
          if (isValidURL(url)) {
            const normalized = normalizeURL(url)
            expect(isValidURL(normalized)).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve URL identity after normalization', () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ['https'] }),
        (url) => {
          if (isValidURL(url)) {
            const normalized = normalizeURL(url)
            // 规范化后的 URL 应该指向同一个资源
            const original = new URL(url)
            const normalizedParsed = new URL(normalized)
            
            expect(normalizedParsed.hostname).toBe(original.hostname)
            // 路径应该相同（移除所有尾部斜杠后比较）
            const originalPath = original.pathname.replace(/\/+$/, '') || '/'
            const normalizedPath = normalizedParsed.pathname.replace(/\/+$/, '') || '/'
            // 规范化会移除尾部斜杠，所以比较时需要考虑这一点
            // 如果原始路径只有斜杠，规范化后会变成空路径
            if (originalPath === '/') {
              expect(normalizedPath === '/' || normalizedPath === '').toBe(true)
            } else {
              expect(normalizedPath).toBe(originalPath)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should upgrade http to https for non-localhost URLs', () => {
    fc.assert(
      fc.property(
        fc.domain().filter(d => d !== 'localhost'),
        fc.webPath(),
        (domain, path) => {
          const httpUrl = `http://${domain}${path}`
          if (isValidURL(httpUrl)) {
            const normalized = normalizeURL(httpUrl)
            expect(normalized.startsWith('https://')).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
