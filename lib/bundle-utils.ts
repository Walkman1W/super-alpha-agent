/**
 * Bundle 优化工具
 * 提供代码分割和 bundle 大小优化的辅助函数
 * 需求: 9.1
 */

/**
 * 动态导入配置
 * 用于统一管理动态导入的加载状态和 SSR 配置
 */
export interface DynamicImportConfig {
  /** 是否启用 SSR */
  ssr?: boolean
  /** 加载组件 */
  loading?: () => React.ReactNode
  /** 是否预加载 */
  preload?: boolean
}

/**
 * 预设的动态导入配置
 * 注意：loading 函数返回类型为 React.ReactNode，在实际使用时需要返回 JSX
 */
export const DYNAMIC_IMPORT_CONFIGS = {
  /** 客户端组件（不需要 SSR） */
  clientOnly: {
    ssr: false,
    loading: undefined,
  },
  /** 重型客户端组件（带加载状态） */
  heavyClient: {
    ssr: false,
    // loading 函数应返回加载骨架屏
    hasLoading: true,
  },
  /** 服务端组件（保留 SSR） */
  serverComponent: {
    ssr: true,
    hasLoading: true,
  },
  /** 表单组件 */
  form: {
    ssr: false,
    hasLoading: true,
  },
  /** 图表组件 */
  chart: {
    ssr: false,
    hasLoading: true,
  },
  /** 模态框组件 */
  modal: {
    ssr: false,
    loading: undefined,
  },
} as const

/**
 * 路由级代码分割配置
 * 定义哪些路由应该被分割成独立的 chunk
 */
export const ROUTE_CHUNKS = {
  /** 主页 */
  home: {
    priority: 'high',
    preload: true,
  },
  /** Agent 列表 */
  agentList: {
    priority: 'high',
    preload: true,
  },
  /** Agent 详情 */
  agentDetail: {
    priority: 'high',
    preload: true,
  },
  /** 发布页面 */
  publish: {
    priority: 'medium',
    preload: false,
  },
  /** 管理后台 */
  admin: {
    priority: 'low',
    preload: false,
  },
} as const

/**
 * 组件懒加载优先级
 */
export type LoadPriority = 'high' | 'medium' | 'low'

/**
 * 根据优先级决定是否预加载
 * @param priority 优先级
 * @returns 是否预加载
 */
export function shouldPreload(priority: LoadPriority): boolean {
  return priority === 'high'
}

/**
 * 计算组件大小阈值
 * 超过此阈值的组件应该被动态导入
 */
export const COMPONENT_SIZE_THRESHOLD = {
  /** 小组件（< 10KB）- 可以直接导入 */
  small: 10 * 1024,
  /** 中等组件（10-50KB）- 考虑动态导入 */
  medium: 50 * 1024,
  /** 大组件（> 50KB）- 应该动态导入 */
  large: 50 * 1024,
} as const

/**
 * 需要动态导入的组件列表
 * 这些组件通常较大或不是首屏必需的
 */
export const COMPONENTS_TO_SPLIT = [
  // 表单组件
  'PublishAgentForm',
  'PublishAgentSection',
  
  // 图表和可视化
  'AISearchStats',
  'AISearchChart',
  
  // 客户端交互组件
  'ModeSwitcher',
  'AIVisitTracker',
  
  // 编辑器和富文本
  'RichTextEditor',
  'MarkdownEditor',
  
  // 模态框和弹窗
  'Modal',
  'Dialog',
  'Drawer',
  
  // 第三方库集成
  'ChartComponent',
  'MapComponent',
] as const

/**
 * 检查组件是否应该被动态导入
 * @param componentName 组件名称
 * @returns 是否应该动态导入
 */
export function shouldDynamicImport(componentName: string): boolean {
  return COMPONENTS_TO_SPLIT.includes(componentName as any)
}

/**
 * Bundle 优化建议
 */
export const OPTIMIZATION_TIPS = {
  /** 使用动态导入 */
  dynamicImport: '使用 next/dynamic 动态导入重型组件',
  
  /** 代码分割 */
  codeSplitting: '将大型组件拆分成更小的模块',
  
  /** 树摇优化 */
  treeShaking: '确保只导入需要的模块，避免导入整个库',
  
  /** 懒加载 */
  lazyLoading: '对非首屏组件使用懒加载',
  
  /** 预加载 */
  preloading: '对关键路由使用预加载',
  
  /** 压缩 */
  compression: '启用 gzip 或 brotli 压缩',
  
  /** 缓存 */
  caching: '使用长期缓存策略',
} as const

/**
 * 性能预算
 * 定义各个页面的性能目标
 */
export const PERFORMANCE_BUDGET = {
  /** 主页 */
  home: {
    /** 首次内容绘制（FCP）目标：< 1.5s */
    fcp: 1500,
    /** 最大内容绘制（LCP）目标：< 2.5s */
    lcp: 2500,
    /** 首次输入延迟（FID）目标：< 100ms */
    fid: 100,
    /** 累积布局偏移（CLS）目标：< 0.1 */
    cls: 0.1,
    /** JavaScript bundle 大小目标：< 200KB */
    jsSize: 200 * 1024,
  },
  /** Agent 详情页 */
  agentDetail: {
    fcp: 1500,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    jsSize: 250 * 1024,
  },
  /** 发布页面 */
  publish: {
    fcp: 2000,
    lcp: 3000,
    fid: 100,
    cls: 0.1,
    jsSize: 300 * 1024,
  },
} as const

/**
 * 获取性能预算
 * @param route 路由名称
 * @returns 性能预算配置
 */
export function getPerformanceBudget(route: keyof typeof PERFORMANCE_BUDGET) {
  return PERFORMANCE_BUDGET[route]
}
