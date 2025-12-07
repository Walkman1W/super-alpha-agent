/**
 * Card 组件单元测试
 * 
 * Feature: agent-brand-showcase
 * 测试Card组件的渲染和样式变体
 * 
 * 需求: 3.4
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import fc from 'fast-check'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './card'

describe('Card Component', () => {
  describe('基础渲染测试', () => {
    it('应该正确渲染默认Card', () => {
      render(<Card data-testid="card">Card Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent('Card Content')
    })

    it('应该有默认样式类', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('bg-white')
      expect(card).toHaveClass('transition-all')
    })

    it('应该正确转发ref', () => {
      const ref = { current: null }
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('变体测试', () => {
    it('应该渲染default变体', () => {
      render(<Card variant="default" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('border-gray-200')
      expect(card).toHaveClass('shadow-sm')
      expect(card).toHaveClass('hover:shadow-md')
    })

    it('应该渲染elevated变体', () => {
      render(<Card variant="elevated" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('shadow-md')
      expect(card).toHaveClass('hover:shadow-lg')
    })

    it('应该渲染outlined变体', () => {
      render(<Card variant="outlined" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('border-gray-300')
      expect(card).toHaveClass('shadow-none')
    })

    it('应该渲染ghost变体', () => {
      render(<Card variant="ghost" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('border-transparent')
      expect(card).toHaveClass('hover:bg-gray-50')
    })
  })

  describe('内边距测试', () => {
    it('应该渲染none内边距', () => {
      render(<Card padding="none" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-0')
    })

    it('应该渲染sm内边距', () => {
      render(<Card padding="sm" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-4')
    })

    it('应该渲染default内边距', () => {
      render(<Card padding="default" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-6')
    })

    it('应该渲染lg内边距', () => {
      render(<Card padding="lg" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-8')
    })
  })

  describe('自定义类名测试', () => {
    it('应该接受自定义className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('应该合并自定义className与默认样式', () => {
      render(<Card className="my-custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('my-custom-class')
      expect(card).toHaveClass('rounded-lg')
    })
  })
})

describe('CardHeader Component', () => {
  it('应该正确渲染', () => {
    render(<CardHeader data-testid="header">Header Content</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveTextContent('Header Content')
  })

  it('应该有正确的样式类', () => {
    render(<CardHeader data-testid="header">Content</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('flex')
    expect(header).toHaveClass('flex-col')
    expect(header).toHaveClass('space-y-1.5')
  })

  it('应该接受自定义className', () => {
    render(<CardHeader className="custom-header" data-testid="header">Content</CardHeader>)
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('custom-header')
  })
})

describe('CardTitle Component', () => {
  it('应该渲染为h3元素', () => {
    render(<CardTitle>Title</CardTitle>)
    const title = screen.getByRole('heading', { level: 3 })
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Title')
  })

  it('应该有正确的样式类', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)
    const title = screen.getByTestId('title')
    expect(title).toHaveClass('text-xl')
    expect(title).toHaveClass('font-semibold')
    expect(title).toHaveClass('leading-none')
    expect(title).toHaveClass('tracking-tight')
  })
})

describe('CardDescription Component', () => {
  it('应该渲染为p元素', () => {
    render(<CardDescription>Description</CardDescription>)
    const desc = screen.getByText('Description')
    expect(desc.tagName).toBe('P')
  })

  it('应该有正确的样式类', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>)
    const desc = screen.getByTestId('desc')
    expect(desc).toHaveClass('text-sm')
    expect(desc).toHaveClass('text-gray-600')
  })
})

describe('CardContent Component', () => {
  it('应该正确渲染', () => {
    render(<CardContent data-testid="content">Content</CardContent>)
    const content = screen.getByTestId('content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveTextContent('Content')
  })

  it('应该有正确的样式类', () => {
    render(<CardContent data-testid="content">Content</CardContent>)
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('pt-0')
  })
})

describe('CardFooter Component', () => {
  it('应该正确渲染', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)
    const footer = screen.getByTestId('footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent('Footer')
  })

  it('应该有正确的样式类', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)
    const footer = screen.getByTestId('footer')
    expect(footer).toHaveClass('flex')
    expect(footer).toHaveClass('items-center')
    expect(footer).toHaveClass('pt-4')
  })
})

describe('Card 组合使用测试', () => {
  it('应该正确组合所有子组件', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Title')
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Main content here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})

/**
 * 属性测试：Card变体和内边距组合
 */
describe('Card 属性测试', () => {
  it('所有变体和内边距组合都应该正确渲染', () => {
    const variants = ['default', 'elevated', 'outlined', 'ghost'] as const
    const paddings = ['none', 'sm', 'default', 'lg'] as const

    fc.assert(
      fc.property(
        fc.constantFrom(...variants),
        fc.constantFrom(...paddings),
        (variant, padding) => {
          const { unmount, container } = render(
            <Card variant={variant} padding={padding} data-testid="card">
              Test Content
            </Card>
          )

          const card = container.querySelector('[data-testid="card"]')
          expect(card).toBeInTheDocument()
          expect(card).toHaveClass('rounded-lg')
          expect(card).toHaveClass('border')
          expect(card).toHaveClass('bg-white')

          unmount()
          return true
        }
      ),
      { numRuns: 16 } // 4 variants * 4 paddings
    )
  })
})
