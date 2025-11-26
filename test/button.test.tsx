import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../components/ui/button'

describe('Button Component', () => {
  it('should render default button correctly', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button', { name: /default button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('should render different button variants', () => {
    render(
      <div>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    )

    expect(screen.getByText('Default')).toHaveClass('bg-primary')
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive')
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary')
    expect(screen.getByText('Ghost')).toHaveClass('hover:bg-accent')
    expect(screen.getByText('Link')).toHaveClass('underline-offset-4', 'hover:underline')
  })

  it('should render different button sizes', () => {
    render(
      <div>
        <Button size="default">Default</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Search"><span aria-hidden="true">🔍</span></Button>
      </div>
    )

    expect(screen.getByText('Default')).toHaveClass('h-10', 'px-4', 'py-2')
    expect(screen.getByText('Small')).toHaveClass('h-9', 'px-3')
    expect(screen.getByText('Large')).toHaveClass('h-11', 'px-8')
    expect(screen.getByRole('button', { name: /search/i })).toHaveClass('h-10', 'w-10')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render disabled button correctly', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none')
  })

  it('should render button with accessibility attributes', () => {
    render(
      <Button aria-label="Search" aria-describedby="search-help" id="search-button">
        Search
      </Button>
    )
    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toHaveAttribute('aria-label', 'Search')
    expect(button).toHaveAttribute('aria-describedby', 'search-help')
    expect(button).toHaveAttribute('id', 'search-button')
  })
})
