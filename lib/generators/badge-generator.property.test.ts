import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  generateBadge,
  generateSvgContent,
  generateEmbedCode,
  generateMarkdownEmbed,
  getTierColor,
  getTierFromScore,
  isValidTier,
  TIER_COLORS,
  type SRTier
} from './badge-generator'

const srTierArb = fc.constantFrom<SRTier>('S', 'A', 'B', 'C')
const srScoreArb = fc.float({ min: 0, max: 10, noNaN: true }).map(n => Math.round(n * 10) / 10)
const slugArb = fc.stringMatching(/^[a-z0-9][a-z0-9-]{2,48}[a-z0-9]$/)
const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
const baseUrlArb = fc.constantFrom('https://agentsignals.ai', 'https://example.com')
const sTierScoreArb = fc.float({ min: Math.fround(9.0), max: Math.fround(10.0), noNaN: true }).map(n => Math.round(n * 10) / 10)
const aTierScoreArb = fc.float({ min: Math.fround(7.5), max: Math.fround(8.9), noNaN: true }).map(n => Math.round(n * 10) / 10)
const bTierScoreArb = fc.float({ min: Math.fround(5.0), max: Math.fround(7.4), noNaN: true }).map(n => Math.round(n * 10) / 10)
const cTierScoreArb = fc.float({ min: Math.fround(0.0), max: Math.fround(4.9), noNaN: true }).map(n => Math.round(n * 10) / 10)

describe('Badge Generator Property Tests', () => {
  describe('Property 21: Badge Color Mapping', () => {
    it('should return green for tier S', () => {
      fc.assert(fc.property(slugArb, sTierScoreArb, nameArb, (slug, score, name) => {
        const result = generateBadge(slug, 'S', score, name)
        expect(result.color).toBe('#00FF94')
        expect(result.tier).toBe('S')
      }), { numRuns: 100 })
    })

    it('should return blue for tier A', () => {
      fc.assert(fc.property(slugArb, aTierScoreArb, nameArb, (slug, score, name) => {
        const result = generateBadge(slug, 'A', score, name)
        expect(result.color).toBe('#3B82F6')
        expect(result.tier).toBe('A')
      }), { numRuns: 100 })
    })

    it('should return yellow for tier B', () => {
      fc.assert(fc.property(slugArb, bTierScoreArb, nameArb, (slug, score, name) => {
        const result = generateBadge(slug, 'B', score, name)
        expect(result.color).toBe('#EAB308')
        expect(result.tier).toBe('B')
      }), { numRuns: 100 })
    })

    it('should return gray for tier C', () => {
      fc.assert(fc.property(slugArb, cTierScoreArb, nameArb, (slug, score, name) => {
        const result = generateBadge(slug, 'C', score, name)
        expect(result.color).toBe('#6B7280')
        expect(result.tier).toBe('C')
      }), { numRuns: 100 })
    })

    it('should map all tiers to correct colors', () => {
      fc.assert(fc.property(srTierArb, (tier) => {
        const color = getTierColor(tier)
        switch (tier) {
          case 'S': expect(color).toBe('#00FF94'); break
          case 'A': expect(color).toBe('#3B82F6'); break
          case 'B': expect(color).toBe('#EAB308'); break
          case 'C': expect(color).toBe('#6B7280'); break
        }
      }), { numRuns: 100 })
    })

    it('should include tier color in SVG', () => {
      fc.assert(fc.property(srTierArb, srScoreArb, nameArb, (tier, score, name) => {
        const svgContent = generateSvgContent(tier, score, name)
        expect(svgContent).toContain(TIER_COLORS[tier])
      }), { numRuns: 100 })
    })
  })

  describe('Badge Generation', () => {
    it('should generate all required fields', () => {
      fc.assert(fc.property(slugArb, srTierArb, srScoreArb, nameArb, baseUrlArb, (slug, tier, score, name, baseUrl) => {
        const result = generateBadge(slug, tier, score, name, baseUrl)
        expect(result).toHaveProperty('svgUrl')
        expect(result).toHaveProperty('embedCode')
        expect(result).toHaveProperty('tier')
        expect(result).toHaveProperty('color')
        expect(result).toHaveProperty('svgContent')
      }), { numRuns: 100 })
    })

    it('should generate valid SVG URL', () => {
      fc.assert(fc.property(slugArb, srTierArb, srScoreArb, baseUrlArb, (slug, tier, score, baseUrl) => {
        const result = generateBadge(slug, tier, score, undefined, baseUrl)
        expect(result.svgUrl).toBe(baseUrl + '/api/badge/' + slug + '.svg')
      }), { numRuns: 100 })
    })
  })

  describe('SVG Content', () => {
    it('should generate valid SVG structure', () => {
      fc.assert(fc.property(srTierArb, srScoreArb, nameArb, (tier, score, name) => {
        const svgContent = generateSvgContent(tier, score, name)
        expect(svgContent).toContain('<svg')
        expect(svgContent).toContain('</svg>')
      }), { numRuns: 100 })
    })

    it('should include score in SVG', () => {
      fc.assert(fc.property(srTierArb, srScoreArb, (tier, score) => {
        const svgContent = generateSvgContent(tier, score)
        expect(svgContent).toContain(score.toFixed(1))
      }), { numRuns: 100 })
    })

    it('should include accessibility attributes', () => {
      fc.assert(fc.property(srTierArb, srScoreArb, (tier, score) => {
        const svgContent = generateSvgContent(tier, score)
        expect(svgContent).toContain('role="img"')
        expect(svgContent).toContain('aria-label=')
      }), { numRuns: 100 })
    })
  })

  describe('Embed Code', () => {
    it('should generate valid HTML embed', () => {
      fc.assert(fc.property(slugArb, srTierArb, srScoreArb, baseUrlArb, (slug, tier, score, baseUrl) => {
        const svgUrl = baseUrl + '/api/badge/' + slug + '.svg'
        const reportUrl = baseUrl + '/agents/' + slug
        const embedCode = generateEmbedCode(svgUrl, reportUrl, tier, score)
        expect(embedCode).toContain('<a href=')
        expect(embedCode).toContain('<img src=')
      }), { numRuns: 100 })
    })
  })

  describe('Markdown Embed', () => {
    it('should generate valid Markdown', () => {
      fc.assert(fc.property(srTierArb, srScoreArb, (tier, score) => {
        const markdown = generateMarkdownEmbed('https://example.com/badge.svg', 'https://example.com/agent', tier, score)
        expect(markdown).toMatch(/^\[!\[.*\]\(.*\)\]\(.*\)$/)
      }), { numRuns: 100 })
    })
  })

  describe('Tier Validation', () => {
    it('should validate valid tiers', () => {
      fc.assert(fc.property(srTierArb, (tier) => {
        expect(isValidTier(tier)).toBe(true)
      }), { numRuns: 100 })
    })

    it('should reject invalid tiers', () => {
      fc.assert(fc.property(fc.string().filter(s => !['S', 'A', 'B', 'C'].includes(s)), (invalidTier) => {
        expect(isValidTier(invalidTier)).toBe(false)
      }), { numRuns: 100 })
    })
  })

  describe('Score to Tier', () => {
    it('should return S for scores >= 9.0', () => {
      fc.assert(fc.property(sTierScoreArb, (score) => {
        expect(getTierFromScore(score)).toBe('S')
      }), { numRuns: 100 })
    })

    it('should return A for scores in [7.5, 9.0)', () => {
      fc.assert(fc.property(aTierScoreArb, (score) => {
        expect(getTierFromScore(score)).toBe('A')
      }), { numRuns: 100 })
    })

    it('should return B for scores in [5.0, 7.5)', () => {
      fc.assert(fc.property(bTierScoreArb, (score) => {
        expect(getTierFromScore(score)).toBe('B')
      }), { numRuns: 100 })
    })

    it('should return C for scores < 5.0', () => {
      fc.assert(fc.property(cTierScoreArb, (score) => {
        expect(getTierFromScore(score)).toBe('C')
      }), { numRuns: 100 })
    })

    it('should be consistent with getTierColor', () => {
      fc.assert(fc.property(srScoreArb, (score) => {
        const tier = getTierFromScore(score)
        const color = getTierColor(tier)
        expect(color).toBe(TIER_COLORS[tier])
      }), { numRuns: 100 })
    })
  })

  describe('Edge Cases', () => {
    it('should handle boundary 9.0 as S', () => { expect(getTierFromScore(9.0)).toBe('S') })
    it('should handle boundary 7.5 as A', () => { expect(getTierFromScore(7.5)).toBe('A') })
    it('should handle boundary 5.0 as B', () => { expect(getTierFromScore(5.0)).toBe('B') })
    it('should handle 0.0 as C', () => { expect(getTierFromScore(0.0)).toBe('C') })
    it('should handle 10.0 as S', () => { expect(getTierFromScore(10.0)).toBe('S') })
    it('should handle empty name', () => {
      const svgContent = generateSvgContent('S', 9.5, undefined)
      expect(svgContent).toContain('Agent')
    })
  })
})