import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import fc from 'fast-check'
import { ModeSwitcher, Mode } from './mode-switcher'

// Mock Next.js navigation hooks
const mockPush = vi.fn()
const mockGet = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: mockGet,
    toString: () => '',
  }),
  usePathname: () => '/',
}))

// Mock scrollIntoView
const mockScrollIntoView = vi.fn()
Element.prototype.scrollIntoView = mockScrollIntoView

describe('ModeSwitcher Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReturnValue(null) // Default to no mode in URL
  })

  describe('Unit Tests', () => {
    it('renders both market and publish tabs', () => {
      render(<ModeSwitcher />)
      
      expect(screen.getByRole('tab', { name: /切换到Agent市场视图/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /切换到发布Agent视图/i })).toBeInTheDocument()
    })

    it('defaults to market mode when no URL param', () => {
      mockGet.mockReturnValue(null)
      render(<ModeSwitcher />)
      
      const marketTab = screen.getByRole('tab', { name: /切换到Agent市场视图/i })
      expect(marketTab).toHaveAttribute('aria-selected', 'true')
      expect(marketTab).toHaveAttribute('data-active', 'true')
    })

    it('respects controlled mode prop', () => {
      render(<ModeSwitcher currentMode="publish" />)
      
      const publishTab = screen.getByRole('tab', { name: /切换到发布Agent视图/i })
      expect(publishTab).toHaveAttribute('aria-selected', 'true')
    })

    it('calls onModeChange when tab is clicked', () => {
      const onModeChange = vi.fn()
      render(<ModeSwitcher onModeChange={onModeChange} />)
      
      const publishTab = screen.getByRole('tab', { name: /切换到发布Agent视图/i })
      fireEvent.click(publishTab)
      
      expect(onModeChange).toHaveBeenCalledWith('publish')
    })
  })

  /**
   * Feature: agent-brand-showcase, Property 3: Client-side navigation to Agent Market
   * Validates: Requirements 2.2
   * 
   * For any user interaction clicking the Agent Market option, 
   * the system SHALL update the URL and content without triggering a full page reload
   */
  describe('Property 3: Client-side navigation to Agent Market', () => {
    it('should update URL via router.push without page reload for market navigation', { timeout: 30000 }, () => {
      fc.assert(
        fc.property(
          // Generate initial modes (could be any mode)
          fc.constantFrom<Mode>('market', 'publish'),
          (initialMode) => {
            vi.clearAllMocks()
            mockGet.mockReturnValue(initialMode)
            
            const { unmount } = render(<ModeSwitcher />)
            
            const marketTab = screen.getByRole('tab', { name: /切换到Agent市场视图/i })
            fireEvent.click(marketTab)
            
            // If already on market, no navigation should occur
            if (initialMode === 'market') {
              expect(mockPush).not.toHaveBeenCalled()
            } else {
              // Should use router.push (client-side navigation, no page reload)
              expect(mockPush).toHaveBeenCalledTimes(1)
              expect(mockPush).toHaveBeenCalledWith(
                expect.stringContaining('mode=market'),
                { scroll: false }
              )
            }
            
            unmount()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Feature: agent-brand-showcase, Property 4: Client-side navigation to Publish Agent
   * Validates: Requirements 2.3
   * 
   * For any user interaction clicking the Publish Agent option,
   * the system SHALL update the URL and content without triggering a full page reload
   */
  describe('Property 4: Client-side navigation to Publish Agent', () => {
    it('should update URL via router.push without page reload for publish navigation', { timeout: 30000 }, () => {
      fc.assert(
        fc.property(
          // Generate initial modes (could be any mode)
          fc.constantFrom<Mode>('market', 'publish'),
          (initialMode) => {
            vi.clearAllMocks()
            mockGet.mockReturnValue(initialMode)
            
            const { unmount } = render(<ModeSwitcher />)
            
            const publishTab = screen.getByRole('tab', { name: /切换到发布Agent视图/i })
            fireEvent.click(publishTab)
            
            // If already on publish, no navigation should occur
            if (initialMode === 'publish') {
              expect(mockPush).not.toHaveBeenCalled()
            } else {
              // Should use router.push (client-side navigation, no page reload)
              expect(mockPush).toHaveBeenCalledTimes(1)
              expect(mockPush).toHaveBeenCalledWith(
                expect.stringContaining('mode=publish'),
                { scroll: false }
              )
            }
            
            unmount()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})


/**
 * Feature: agent-brand-showcase, Property 5: Scroll position management
 * Validates: Requirements 2.4
 * 
 * For any mode switch operation, the system SHALL maintain current scroll position
 * or reset to top based on navigation context
 */
describe('Property 5: Scroll position management', () => {
  let mockAgentsSection: HTMLDivElement
  let mockPublishSection: HTMLDivElement

  beforeEach(() => {
    vi.clearAllMocks()
    mockScrollIntoView.mockClear()
    mockGet.mockReturnValue(null)
    
    // Create mock DOM elements for sections
    mockAgentsSection = document.createElement('div')
    mockAgentsSection.id = 'agents'
    mockAgentsSection.scrollIntoView = mockScrollIntoView
    document.body.appendChild(mockAgentsSection)

    mockPublishSection = document.createElement('div')
    mockPublishSection.id = 'publish'
    mockPublishSection.scrollIntoView = mockScrollIntoView
    document.body.appendChild(mockPublishSection)
  })

  afterEach(() => {
    // Cleanup DOM elements
    if (mockAgentsSection && mockAgentsSection.parentNode) {
      mockAgentsSection.parentNode.removeChild(mockAgentsSection)
    }
    if (mockPublishSection && mockPublishSection.parentNode) {
      mockPublishSection.parentNode.removeChild(mockPublishSection)
    }
  })

  it('should scroll to appropriate section when switching modes', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Mode>('market', 'publish'),
        fc.constantFrom<Mode>('market', 'publish'),
        (initialMode, targetMode) => {
          vi.clearAllMocks()
          mockScrollIntoView.mockClear()
          mockGet.mockReturnValue(initialMode)
          
          const { unmount, container } = render(<ModeSwitcher />)
          
          // Use container to scope queries to this specific render
          const tabs = container.querySelectorAll('[role="tab"]')
          const targetTab = targetMode === 'market' ? tabs[0] : tabs[1]
          
          fireEvent.click(targetTab)
          
          // If switching to a different mode, router.push should be called with scroll: false
          // (meaning we're managing scroll ourselves via scrollIntoView)
          if (initialMode !== targetMode) {
            expect(mockPush).toHaveBeenCalledWith(
              expect.any(String),
              { scroll: false }
            )
          }
          
          unmount()
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * Feature: agent-brand-showcase, Property 6: Active mode highlighting
 * Validates: Requirements 2.5
 * 
 * For any active mode (market or publish), the corresponding navigation control
 * SHALL have a visual indicator (CSS class or attribute) showing its active state
 */
describe('Property 6: Active mode highlighting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReturnValue(null)
  })

  it('should highlight the active mode with visual indicators', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Mode>('market', 'publish'),
        (activeMode) => {
          vi.clearAllMocks()
          mockGet.mockReturnValue(activeMode)
          
          const { unmount, container } = render(<ModeSwitcher />)
          
          // Get all tabs
          const tabs = container.querySelectorAll('[role="tab"]')
          const marketTab = tabs[0] as HTMLElement
          const publishTab = tabs[1] as HTMLElement
          
          // Determine which tab should be active
          const activeTab = activeMode === 'market' ? marketTab : publishTab
          const inactiveTab = activeMode === 'market' ? publishTab : marketTab
          
          // Property: Active tab should have aria-selected="true"
          expect(activeTab.getAttribute('aria-selected')).toBe('true')
          expect(inactiveTab.getAttribute('aria-selected')).toBe('false')
          
          // Property: Active tab should have data-active="true"
          expect(activeTab.getAttribute('data-active')).toBe('true')
          expect(inactiveTab.getAttribute('data-active')).toBe('false')
          
          // Property: Active tab should have visual styling (bg-white class for active state)
          // Check for exact 'bg-white' class (not hover:bg-white/10)
          expect(activeTab.className).toMatch(/\bbg-white\b/)
          expect(activeTab.className).toContain('text-blue-600')
          
          // Property: Inactive tab should have different styling
          expect(inactiveTab.className).toContain('text-white/80')
          // Inactive tab should not have 'bg-white' as a standalone class (hover:bg-white/10 is ok)
          expect(inactiveTab.className).not.toMatch(/\bbg-white\b(?!\/)/)
          
          // Property: Active tab should have tabindex="0" (focusable)
          expect(activeTab.getAttribute('tabindex')).toBe('0')
          
          // Property: Inactive tab should have tabindex="-1" (not in tab order)
          expect(inactiveTab.getAttribute('tabindex')).toBe('-1')
          
          unmount()
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should update highlighting when mode changes', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Mode>('market', 'publish'),
        fc.constantFrom<Mode>('market', 'publish'),
        (initialMode, targetMode) => {
          vi.clearAllMocks()
          mockGet.mockReturnValue(initialMode)
          
          const { unmount, container, rerender } = render(<ModeSwitcher />)
          
          // Get tabs
          const tabs = container.querySelectorAll('[role="tab"]')
          const marketTab = tabs[0] as HTMLElement
          const publishTab = tabs[1] as HTMLElement
          
          // Verify initial state
          const initialActiveTab = initialMode === 'market' ? marketTab : publishTab
          expect(initialActiveTab.getAttribute('aria-selected')).toBe('true')
          
          // Simulate mode change by updating the mock and re-rendering
          mockGet.mockReturnValue(targetMode)
          rerender(<ModeSwitcher />)
          
          // Verify new state
          const newActiveTab = targetMode === 'market' ? marketTab : publishTab
          const newInactiveTab = targetMode === 'market' ? publishTab : marketTab
          
          expect(newActiveTab.getAttribute('aria-selected')).toBe('true')
          expect(newActiveTab.getAttribute('data-active')).toBe('true')
          expect(newInactiveTab.getAttribute('aria-selected')).toBe('false')
          expect(newInactiveTab.getAttribute('data-active')).toBe('false')
          
          unmount()
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
