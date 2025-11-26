import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'

describe('Card Component', () => {
  it('should render complete card structure correctly', () => {
    render(
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Card Title</h3>
        </CardHeader>
        <CardContent>
          <p>This is a card content example.</p>
        </CardContent>
        <CardFooter>
          <Button>Action</Button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('This is a card content example.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
  })

  it('should apply correct styles to card', () => {
    const { container } = render(<Card>Card Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm', 'hover:shadow-md', 'transition-shadow')
  })

  it('should apply custom class names', () => {
    const { container } = render(<Card className="custom-class">Card Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('custom-class')
  })

  it('should render without optional sections', () => {
    const { container } = render(<Card>Only Content</Card>)
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('should render card header and content only', () => {
    render(
      <Card>
        <CardHeader>
          <h3>Header Only</h3>
        </CardHeader>
        <CardContent>
          <p>Content Only</p>
        </CardContent>
      </Card>
    )

    expect(screen.getByText('Header Only')).toBeInTheDocument()
    expect(screen.getByText('Content Only')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('should render card footer only', () => {
    render(
      <Card>
        <CardFooter>
          <Button>Footer Button</Button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByRole('button', { name: /footer button/i })).toBeInTheDocument()
    expect(screen.queryByText(/header|content/i)).toBeNull()
  })
})
