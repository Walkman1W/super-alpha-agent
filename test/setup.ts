import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 清理每个测试后的 DOM
afterEach(() => {
  cleanup()
})

// 模拟 Next.js 路由
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// 模拟 Supabase 客户端
vi.mock('@/lib/supabase', () => ({
  createSupabaseClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ data: null, error: null }),
      insert: vi.fn().mockReturnValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({ data: null, error: null }),
    }),
  }),
  supabaseAdmin: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ data: null, error: null }),
      insert: vi.fn().mockReturnValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({ data: null, error: null }),
    }),
  },
}))

// 模拟环境变量
vi.mock('process.env', () => ({
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  OPENAI_API_KEY: 'test-openai-key',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
}))

// 全局测试配置
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 控制台错误处理
const originalError = console.error
console.error = (...args: any[]) => {
  // 忽略特定的 React/Next.js 警告
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalError.call(console, ...args)
}