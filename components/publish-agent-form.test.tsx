/**
 * PublishAgentForm 组件测试
 * 
 * 测试内容:
 * - 11.4 属性测试：移动端输入类型 (需求 10.3)
 * - 11.5 属性测试：触摸目标尺寸 (需求 10.2)
 * - 表单验证逻辑
 * - 表单提交流程
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as fc from 'fast-check'
import { 
  PublishAgentForm, 
  validateURLFormat, 
  validateEmailFormat,
  validateForm,
  type PublishAgentFormData 
} from './publish-agent-form'

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('PublishAgentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('渲染测试', () => {
    it('应该正确渲染所有表单字段', () => {
      render(<PublishAgentForm />)
      
      // URL 输入
      expect(screen.getByLabelText(/Agent URL/i)).toBeInTheDocument()
      
      // Email 输入
      expect(screen.getByLabelText(/联系邮箱/i)).toBeInTheDocument()
      
      // Notes 输入
      expect(screen.getByLabelText(/补充说明/i)).toBeInTheDocument()
      
      // 提交按钮
      expect(screen.getByRole('button', { name: /提交 Agent/i })).toBeInTheDocument()
    })

    it('应该有正确的表单aria标签', () => {
      render(<PublishAgentForm />)
      
      const form = screen.getByRole('form', { name: /发布Agent表单/i })
      expect(form).toBeInTheDocument()
    })
  })


  /**
   * 属性测试 36: 移动端输入类型
   * 验证: 需求 10.3
   * 测试表单输入类型设置正确，以便移动端显示正确的键盘
   */
  describe('属性测试: 移动端输入类型 (需求 10.3)', () => {
    it('URL输入应该有type="url"和inputMode="url"', () => {
      render(<PublishAgentForm />)
      
      const urlInput = screen.getByLabelText(/Agent URL/i)
      expect(urlInput).toHaveAttribute('type', 'url')
      expect(urlInput).toHaveAttribute('inputMode', 'url')
    })

    it('Email输入应该有type="email"和inputMode="email"', () => {
      render(<PublishAgentForm />)
      
      const emailInput = screen.getByLabelText(/联系邮箱/i)
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('inputMode', 'email')
    })

    it('URL输入应该有autocomplete="url"', () => {
      render(<PublishAgentForm />)
      
      const urlInput = screen.getByLabelText(/Agent URL/i)
      expect(urlInput).toHaveAttribute('autoComplete', 'url')
    })

    it('Email输入应该有autocomplete="email"', () => {
      render(<PublishAgentForm />)
      
      const emailInput = screen.getByLabelText(/联系邮箱/i)
      expect(emailInput).toHaveAttribute('autoComplete', 'email')
    })

    it('属性测试: 所有输入字段都应该有正确的移动端属性', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const { unmount } = render(<PublishAgentForm />)
          
          const urlInput = screen.getByLabelText(/Agent URL/i)
          const emailInput = screen.getByLabelText(/联系邮箱/i)
          
          // URL 输入验证
          const urlHasCorrectType = urlInput.getAttribute('type') === 'url'
          const urlHasCorrectInputMode = urlInput.getAttribute('inputMode') === 'url'
          
          // Email 输入验证
          const emailHasCorrectType = emailInput.getAttribute('type') === 'email'
          const emailHasCorrectInputMode = emailInput.getAttribute('inputMode') === 'email'
          
          unmount()
          
          return urlHasCorrectType && urlHasCorrectInputMode && 
                 emailHasCorrectType && emailHasCorrectInputMode
        }),
        { numRuns: 10 }
      )
    })
  })

  /**
   * 属性测试 35: 触摸目标尺寸
   * 验证: 需求 10.2
   * 测试交互元素至少44x44像素
   */
  describe('属性测试: 触摸目标尺寸 (需求 10.2)', () => {
    it('提交按钮应该有min-h-[48px]类（大于44px）', () => {
      render(<PublishAgentForm />)
      
      const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
      expect(submitButton.className).toMatch(/min-h-\[48px\]/)
    })

    it('输入框应该有min-h-[44px]类', () => {
      render(<PublishAgentForm />)
      
      const urlInput = screen.getByLabelText(/Agent URL/i)
      const emailInput = screen.getByLabelText(/联系邮箱/i)
      
      // Input组件默认有min-h-[44px]
      expect(urlInput.className).toMatch(/min-h-\[44px\]/)
      expect(emailInput.className).toMatch(/min-h-\[44px\]/)
    })

    it('属性测试: 所有交互元素都应该满足最小触摸目标尺寸', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const { unmount } = render(<PublishAgentForm />)
          
          const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
          const urlInput = screen.getByLabelText(/Agent URL/i)
          const emailInput = screen.getByLabelText(/联系邮箱/i)
          
          // 检查是否有最小高度类
          const buttonHasMinHeight = /min-h-\[(4[4-9]|[5-9]\d|\d{3,})px\]/.test(submitButton.className)
          const urlHasMinHeight = /min-h-\[(4[4-9]|[5-9]\d|\d{3,})px\]/.test(urlInput.className)
          const emailHasMinHeight = /min-h-\[(4[4-9]|[5-9]\d|\d{3,})px\]/.test(emailInput.className)
          
          unmount()
          
          return buttonHasMinHeight && urlHasMinHeight && emailHasMinHeight
        }),
        { numRuns: 10 }
      )
    })
  })


  describe('URL验证测试', () => {
    it('应该接受有效的http URL', () => {
      expect(validateURLFormat('http://example.com')).toBeUndefined()
    })

    it('应该接受有效的https URL', () => {
      expect(validateURLFormat('https://example.com')).toBeUndefined()
    })

    it('应该拒绝空URL', () => {
      expect(validateURLFormat('')).toBe('URL不能为空')
      expect(validateURLFormat('   ')).toBe('URL不能为空')
    })

    it('应该拒绝无效的URL格式', () => {
      expect(validateURLFormat('not-a-url')).toBe('请输入有效的URL格式')
      expect(validateURLFormat('ftp://example.com')).toBe('只支持http或https协议')
    })

    it('属性测试: 有效URL应该被接受', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['http', 'https'] }),
          (url) => {
            const result = validateURLFormat(url)
            return result === undefined
          }
        ),
        { numRuns: 50 }
      )
    })

    it('属性测试: 随机字符串通常应该被拒绝', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !s.startsWith('http://') && !s.startsWith('https://')),
          (str) => {
            const result = validateURLFormat(str)
            // 空字符串或无效格式都应该返回错误
            return result !== undefined || str.trim() === ''
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Email验证测试', () => {
    it('应该接受有效的email', () => {
      expect(validateEmailFormat('test@example.com')).toBeUndefined()
      expect(validateEmailFormat('user.name@domain.co.uk')).toBeUndefined()
    })

    it('应该接受空email（可选字段）', () => {
      expect(validateEmailFormat('')).toBeUndefined()
      expect(validateEmailFormat('   ')).toBeUndefined()
    })

    it('应该拒绝无效的email格式', () => {
      expect(validateEmailFormat('not-an-email')).toBe('请输入有效的邮箱地址')
      expect(validateEmailFormat('missing@domain')).toBe('请输入有效的邮箱地址')
    })

    it('属性测试: 有效email格式应该被接受', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          (email) => {
            const result = validateEmailFormat(email)
            return result === undefined
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('表单验证测试', () => {
    it('应该验证完整的表单数据', () => {
      const validData: PublishAgentFormData = {
        url: 'https://example.com/agent',
        email: 'test@example.com',
        notes: 'Some notes'
      }
      
      const errors = validateForm(validData)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('应该返回URL错误', () => {
      const invalidData: PublishAgentFormData = {
        url: '',
        email: '',
        notes: ''
      }
      
      const errors = validateForm(invalidData)
      expect(errors.url).toBe('URL不能为空')
    })

    it('应该限制notes长度', () => {
      const longNotes: PublishAgentFormData = {
        url: 'https://example.com',
        email: '',
        notes: 'a'.repeat(1001)
      }
      
      const errors = validateForm(longNotes)
      expect(errors.notes).toBe('备注不能超过1000个字符')
    })

    it('属性测试: 有效数据应该通过验证', () => {
      fc.assert(
        fc.property(
          fc.record({
            url: fc.webUrl({ validSchemes: ['https'] }),
            email: fc.option(fc.emailAddress(), { nil: '' }),
            notes: fc.string({ maxLength: 1000 })
          }),
          (data) => {
            const formData: PublishAgentFormData = {
              url: data.url,
              email: data.email || '',
              notes: data.notes
            }
            const errors = validateForm(formData)
            return Object.keys(errors).length === 0
          }
        ),
        { numRuns: 30 }
      )
    })
  })


  describe('表单交互测试', () => {
    it('应该在输入时更新表单值', async () => {
      const user = userEvent.setup()
      render(<PublishAgentForm />)
      
      const urlInput = screen.getByLabelText(/Agent URL/i)
      await user.type(urlInput, 'https://example.com')
      
      expect(urlInput).toHaveValue('https://example.com')
    })

    it('应该在提交无效表单时显示错误', async () => {
      const user = userEvent.setup()
      render(<PublishAgentForm />)
      
      const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
      await user.click(submitButton)
      
      // 应该显示URL错误
      expect(await screen.findByText('URL不能为空')).toBeInTheDocument()
    })

    it('应该在输入后清除错误', async () => {
      const user = userEvent.setup()
      render(<PublishAgentForm />)
      
      // 先触发错误
      const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
      await user.click(submitButton)
      
      expect(await screen.findByText('URL不能为空')).toBeInTheDocument()
      
      // 输入有效URL
      const urlInput = screen.getByLabelText(/Agent URL/i)
      await user.type(urlInput, 'https://example.com')
      
      // 错误应该消失
      expect(screen.queryByText('URL不能为空')).not.toBeInTheDocument()
    })

    it('应该在提交时显示加载状态', async () => {
      const user = userEvent.setup()
      
      // Mock一个延迟的提交
      const mockSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<PublishAgentForm onSubmit={mockSubmit} />)
      
      // 填写有效数据
      const urlInput = screen.getByLabelText(/Agent URL/i)
      await user.type(urlInput, 'https://example.com')
      
      const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
      await user.click(submitButton)
      
      // 应该显示加载状态
      expect(await screen.findByText('正在分析...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('应该在提交成功后显示成功消息', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)
      
      render(<PublishAgentForm onSubmit={mockSubmit} />)
      
      const urlInput = screen.getByLabelText(/Agent URL/i)
      await user.type(urlInput, 'https://example.com')
      
      const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/提交成功/i)).toBeInTheDocument()
      })
    })

    it('应该在提交失败后显示错误消息', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockRejectedValue(new Error('网络错误'))
      
      render(<PublishAgentForm onSubmit={mockSubmit} />)
      
      const urlInput = screen.getByLabelText(/Agent URL/i)
      await user.type(urlInput, 'https://example.com')
      
      const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('网络错误')).toBeInTheDocument()
      })
    })
  })

  describe('可访问性测试', () => {
    it('URL输入应该标记为必填', () => {
      render(<PublishAgentForm />)
      
      const urlInput = screen.getByLabelText(/Agent URL/i)
      expect(urlInput).toHaveAttribute('aria-required', 'true')
      expect(urlInput).toBeRequired()
    })

    it('错误消息应该有role="alert"', async () => {
      const user = userEvent.setup()
      render(<PublishAgentForm />)
      
      const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
      await user.click(submitButton)
      
      const errorMessage = await screen.findByText('URL不能为空')
      expect(errorMessage).toHaveAttribute('role', 'alert')
    })

    it('提交按钮在加载时应该有aria-busy', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<PublishAgentForm onSubmit={mockSubmit} />)
      
      const urlInput = screen.getByLabelText(/Agent URL/i)
      await user.type(urlInput, 'https://example.com')
      
      const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(submitButton).toHaveAttribute('aria-busy', 'true')
      })
    })

    it('状态消息应该有aria-live="polite"', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn().mockResolvedValue(undefined)
      
      render(<PublishAgentForm onSubmit={mockSubmit} />)
      
      const urlInput = screen.getByLabelText(/Agent URL/i)
      await user.type(urlInput, 'https://example.com')
      
      const submitButton = screen.getByRole('button', { name: /提交 Agent/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const statusMessage = screen.getByRole('alert')
        expect(statusMessage).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
})
