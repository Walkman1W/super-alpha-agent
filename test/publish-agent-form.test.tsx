import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PublishAgentForm } from '@/components/publish-agent-form'

describe('PublishAgentForm', () => {
  it('renders form with all fields', () => {
    render(<PublishAgentForm />
    )
    
    // 检查表单元素是否存在
    expect(screen.getByLabelText(/Agent URL/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/联系邮箱/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/备注/i)).toBeInTheDocument()
    expect(screen.getByText(/提交Agent/i)).toBeInTheDocument()
  })
  
  it('shows validation error when URL is invalid', async () => {
    render(<PublishAgentForm />
    )
    
    // 输入无效URL
    fireEvent.change(screen.getByLabelText(/Agent URL/i), {
      target: { value: 'invalid-url' }
    })
    
    // 提交表单
    fireEvent.click(screen.getByText(/提交Agent/i))
    
    // 检查错误消息
    await waitFor(() => {
      expect(screen.getByText('请输入有效的URL（以http://或https://开头）')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
  
  it('shows validation error when email is invalid', async () => {
    render(<PublishAgentForm />
    )
    
    // 输入有效URL和无效邮箱
    fireEvent.change(screen.getByLabelText(/Agent URL/i), {
      target: { value: 'https://example.com' }
    })
    fireEvent.change(screen.getByLabelText(/联系邮箱（可选）/i), {
      target: { value: 'invalid-email' }
    })
    
    // 提交表单
    fireEvent.click(screen.getByText(/提交Agent/i))
    
    // 检查错误消息
    await waitFor(() => {
      expect(screen.getByText('请输入有效的电子邮件地址')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
  
  it('submits form successfully with valid data', async () => {
    render(<PublishAgentForm />
    )
    
    // 输入有效数据
    fireEvent.change(screen.getByLabelText(/Agent URL/i), {
      target: { value: 'https://example.com/agent' }
    })
    fireEvent.change(screen.getByLabelText(/联系邮箱（可选）/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/备注/i), {
      target: { value: 'This is a test agent' }
    })
    
    // 提交表单
    fireEvent.click(screen.getByText(/提交Agent/i))
    
    // 检查加载状态
    await waitFor(() => {
      expect(screen.getByText(/提交中.../i)).toBeInTheDocument()
    })
    
    // 检查成功消息
    await waitFor(() => {
      expect(screen.getByText(/Agent提交成功！/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})