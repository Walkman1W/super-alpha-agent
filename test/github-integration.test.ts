/**
 * GitHub API Integration Tests
 * 
 * These tests verify the GitHub API client works correctly.
 * They require a valid GITHUB_TOKEN environment variable.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { searchRepos, fetchReadme, getRateLimitStatus } from '@/lib/github'

describe('GitHub API Client', () => {
  beforeAll(() => {
    // Skip tests if GITHUB_TOKEN is not set
    if (!process.env.GITHUB_TOKEN) {
      console.warn('⚠️  GITHUB_TOKEN not set, skipping GitHub integration tests')
    }
  })

  it('should search repositories with topic filter', async () => {
    if (!process.env.GITHUB_TOKEN) {
      return // Skip test
    }

    const repos = await searchRepos({
      topic: 'ai-agent',
      minStars: 100,
      maxResults: 5
    })

    expect(repos).toBeDefined()
    expect(Array.isArray(repos)).toBe(true)
    expect(repos.length).toBeGreaterThan(0)
    expect(repos.length).toBeLessThanOrEqual(5)

    // Verify repo structure
    const repo = repos[0]
    expect(repo).toHaveProperty('id')
    expect(repo).toHaveProperty('name')
    expect(repo).toHaveProperty('full_name')
    expect(repo).toHaveProperty('html_url')
    expect(repo).toHaveProperty('stargazers_count')
    expect(repo.stargazers_count).toBeGreaterThanOrEqual(100)
  }, 30000) // 30 second timeout

  it('should fetch README content', async () => {
    if (!process.env.GITHUB_TOKEN) {
      return // Skip test
    }

    // Use a well-known repo with README
    const readme = await fetchReadme('microsoft', 'vscode')

    expect(readme).toBeDefined()
    expect(typeof readme).toBe('string')
    expect(readme!.length).toBeGreaterThan(0)
  }, 15000)

  it('should handle missing README gracefully', async () => {
    if (!process.env.GITHUB_TOKEN) {
      return // Skip test
    }

    // Try to fetch README from a repo that likely doesn't have one
    const readme = await fetchReadme('nonexistent-user-12345', 'nonexistent-repo-67890')

    expect(readme).toBeNull()
  }, 15000)

  it('should get rate limit status', async () => {
    if (!process.env.GITHUB_TOKEN) {
      return // Skip test
    }

    const rateLimit = await getRateLimitStatus()

    expect(rateLimit).toBeDefined()
    expect(rateLimit).toHaveProperty('limit')
    expect(rateLimit).toHaveProperty('remaining')
    expect(rateLimit).toHaveProperty('reset')
    expect(typeof rateLimit.limit).toBe('number')
    expect(typeof rateLimit.remaining).toBe('number')
    expect(typeof rateLimit.reset).toBe('number')
  }, 15000)
})
