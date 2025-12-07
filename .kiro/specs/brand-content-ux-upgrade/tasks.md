# Implementation Plan

- [ ] 1. Create Tooltip component and autonomy level definitions
  - [ ] 1.1 Create Tooltip UI component with hover trigger and positioning
    - Create `components/ui/tooltip.tsx` with configurable position (top/bottom/left/right)
    - Support both string and ReactNode content
    - Handle viewport boundary detection to prevent overflow
    - _Requirements: 1.4, 1.5_
  - [ ] 1.2 Create autonomy level tooltip content definitions
    - Create `lib/tooltip-content.ts` with L1-L5 definitions including label, description, and industry reference
    - Add GEO score tooltip content with formula explanation
    - _Requirements: 1.4, 1.5_
  - [ ] 1.3 Write property test for autonomy tooltip consistency
    - **Property 1: Autonomy Level Tooltip Consistency**
    - **Validates: Requirements 1.4**

- [ ] 2. Update Omnibar search icon to terminal prompt
  - [ ] 2.1 Replace Search icon with terminal prompt symbol ">_"
    - Modify `components/terminal/omnibar.tsx`
    - Use monospace font for the prompt symbol
    - Maintain keyboard shortcut (Cmd+K) functionality
    - _Requirements: 4.1, 4.2_

- [ ] 3. Refactor SignalCard interaction logic
  - [ ] 3.1 Separate title click from card click handlers
    - Modify `components/terminal/signal-card.tsx`
    - Title click: open official_url in new tab (target="_blank")
    - Card body click: trigger onCardClick callback (opens drawer)
    - Remove Link wrapper that navigates to /agents/[slug]
    - _Requirements: 5.1, 5.2, 5.5_
  - [ ] 3.2 Add Tooltip to autonomy level badge
    - Wrap autonomy badge with Tooltip component
    - Display level definition on hover
    - _Requirements: 1.4_
  - [ ] 3.3 Add Tooltip to GEO score badge
    - Wrap GEO score with Tooltip component
    - Display scoring methodology on hover
    - _Requirements: 1.5_
  - [ ] 3.4 Write property test for card title external link
    - **Property 2: Card Title External Link**
    - **Validates: Requirements 5.1**
  - [ ] 3.5 Write property test for card click not navigating to detail
    - **Property 3: Card Click Does Not Navigate to Detail Page**
    - **Validates: Requirements 5.5**

- [ ] 4. Update InspectorDrawer actions
  - [ ] 4.1 Replace "Full Details" button with "Publish Agent" button
    - Modify `components/terminal/inspector-drawer.tsx`
    - "Visit Site" button: opens official_url in new tab
    - "Publish Agent" button: navigates to /publish page
    - _Requirements: 5.3_
  - [ ] 4.2 Implement drawer toggle on same card click
    - Update parent component (terminal-home-page.tsx) to track selected agent
    - If same agent clicked, close drawer; otherwise open with new agent
    - _Requirements: 5.4_

- [ ] 5. Checkpoint - Ensure card interactions work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Redesign Header component
  - [ ] 6.1 Create new Header component with updated navigation
    - Create `components/terminal/header.tsx` (or refactor in layout.tsx)
    - Add navigation links: Agents, About, Blog, Publish Agent, GitHub
    - Highlight "Publish" link with accent color
    - Apply gradient logo with subtle glow animation
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 6.2 Implement mobile hamburger menu
    - Add responsive menu toggle for mobile viewports
    - Slide-in menu with all navigation items
    - _Requirements: 2.4_
  - [ ] 6.3 Ensure sticky header with backdrop blur on scroll
    - Verify backdrop-blur effect is applied
    - _Requirements: 2.5_

- [ ] 7. Redesign Footer component
  - [ ] 7.1 Create new Footer component with updated layout
    - Refactor footer in `app/layout.tsx` or create `components/terminal/footer.tsx`
    - Brand section: logo, tagline, description
    - Links section: About, Blog, Publish Agent, GitHub
    - Tech stack section: compact format
    - Copyright and community attribution
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8. Create About page with L1-L5 article
  - [ ] 8.1 Create About page route and content
    - Create `app/about/page.tsx`
    - Render L1-L5 AI autonomy framework article from docs/about.md content
    - Use terminal-style typography with proper headings and formatting
    - Include citations and industry references
    - _Requirements: 1.1, 1.3_

- [ ] 9. Create Blog page with GEO article
  - [ ] 9.1 Create Blog page route and content
    - Create `app/blog/page.tsx`
    - Render GEO scoring algorithm article from docs/about.md content
    - Use terminal-style typography with proper headings and formatting
    - Include formula explanations and citations
    - _Requirements: 1.2, 1.3_

- [ ] 10. Checkpoint - Verify pages and navigation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement AI Bot detection for detail page routing
  - [ ] 11.1 Enhance User-Agent detection in ai-detector
    - Update `lib/ai-detector.ts` with comprehensive bot patterns
    - Add function to determine if request should be redirected
    - _Requirements: 6.3_
  - [ ] 11.2 Implement redirect logic in agent detail page
    - Modify `app/agents/[slug]/page.tsx`
    - Check User-Agent on server side
    - Redirect human users to homepage with agent slug as query param
    - Serve full page with JSON-LD for AI bots
    - _Requirements: 6.1, 6.2_
  - [ ] 11.3 Handle redirect on homepage
    - Update homepage to check for agent query param
    - Auto-open Inspector Drawer for specified agent
    - _Requirements: 6.1_
  - [ ] 11.4 Write property test for user agent routing
    - **Property 4: User Agent Based Routing**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
