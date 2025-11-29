# 性能优化文档

本文档记录了 Super Alpha Agent 平台的性能优化策略和实现。

## 优化概览

### 1. 图片优化 (需求 9.2)

#### 实现的优化
- ✅ 使用 Next.js Image 组件进行自动优化
- ✅ 支持 AVIF 和 WebP 格式
- ✅ 实现懒加载（loading="lazy"）
- ✅ 添加 blur placeholder
- ✅ 响应式图片尺寸
- ✅ 长期缓存（30天）

#### 使用方法

```tsx
import { OptimizedImage, AgentLogo } from '@/components/optimized-image'

// 基础用法
<OptimizedImage
  src={imageUrl}
  alt="描述"
  sizePreset="medium"
  priority={false}
/>

// Agent Logo
<AgentLogo
  src={agent.logo_url}
  name={agent.name}
  size="medium"
/>
```

#### 配置文件
- `lib/image-utils.ts` - 图片工具函数
- `components/optimized-image.tsx` - 优化的图片组件
- `next.config.js` - Next.js 图片配置

### 2. 数据缓存 (需求 9.3, 9.4)

#### 实现的缓存策略

**ISR (Incremental Static Regeneration)**
- 主页：1小时重新验证
- Agent 列表：1小时重新验证
- Agent 详情：1小时重新验证
- 分类页：6小时重新验证

**内存缓存**
- Agent 列表查询：1小时
- Agent 详情查询：1小时
- 分类列表：6小时
- AI 访问统计：15分钟

**HTTP 缓存头**
- 短期缓存：5分钟（动态数据）
- 中期缓存：1小时（半静态数据）
- 长期缓存：1天（静态内容）
- 静态资源：1个月

#### 使用方法

```tsx
// 页面级 ISR
export const revalidate = 3600 // 1小时

// 使用缓存的 Supabase 查询
import { getCachedAgents, getCachedAgentDetail } from '@/lib/supabase-cached'

const agents = await getCachedAgents('ai_search_count', 100)
const agent = await getCachedAgentDetail(slug)

// API 路由添加缓存头
import { addCacheHeaders, CACHE_STRATEGIES } from '@/lib/cache-utils'

const response = NextResponse.json(data)
addCacheHeaders(response.headers, CACHE_STRATEGIES.medium)
```

#### 配置文件
- `lib/cache-utils.ts` - 缓存工具和策略
- `lib/supabase-cached.ts` - 带缓存的 Supabase 客户端
- `middleware.ts` - 全局缓存头中间件

### 3. 代码分割 (需求 9.1)

#### 实现的优化
- ✅ 动态导入重型组件
- ✅ 路由级代码分割
- ✅ 第三方库分离
- ✅ 共享组件分离
- ✅ 优化包导入

#### 动态导入的组件

**客户端组件（ssr: false）**
- ModeSwitcher - 模式切换器
- AIVisitTracker - AI 访问追踪
- AISearchStats - AI 搜索统计
- PublishAgentSection - 发布表单

**服务端组件（ssr: true）**
- AgentMarketGrid - Agent 网格（保留 SSR 以优化 SEO）

#### 使用方法

```tsx
import dynamic from 'next/dynamic'

// 客户端组件
const MyComponent = dynamic(() => import('@/components/my-component'), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
})

// 服务端组件
const MyServerComponent = dynamic(() => import('@/components/my-server-component'), {
  loading: () => <LoadingSkeleton />,
  ssr: true,
})
```

#### 配置文件
- `lib/bundle-utils.ts` - Bundle 优化工具
- `next.config.js` - Webpack 配置

## 性能指标

### 目标性能预算

**主页**
- FCP (首次内容绘制): < 1.5s
- LCP (最大内容绘制): < 2.5s
- FID (首次输入延迟): < 100ms
- CLS (累积布局偏移): < 0.1
- JavaScript Bundle: < 200KB

**Agent 详情页**
- FCP: < 1.5s
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- JavaScript Bundle: < 250KB

### 测量工具

1. **Lighthouse**
   ```bash
   npm run lighthouse
   ```

2. **Next.js Bundle Analyzer**
   ```bash
   ANALYZE=true npm run build
   ```

3. **Chrome DevTools**
   - Performance 面板
   - Network 面板
   - Coverage 面板

## 优化检查清单

### 部署前检查

- [ ] 所有图片使用 OptimizedImage 组件
- [ ] 重型组件使用动态导入
- [ ] API 路由添加适当的缓存头
- [ ] 页面配置 ISR revalidate
- [ ] Lighthouse 性能分数 ≥ 90
- [ ] JavaScript bundle 大小在预算内
- [ ] 移动端性能测试通过

### 持续优化

- [ ] 定期运行 bundle analyzer
- [ ] 监控 Core Web Vitals
- [ ] 审查和优化第三方库
- [ ] 更新缓存策略
- [ ] 优化数据库查询

## 最佳实践

### 1. 图片优化
- 始终使用 OptimizedImage 组件
- 为首屏图片设置 priority={true}
- 使用适当的 sizePreset
- 提供有意义的 alt 文本

### 2. 数据缓存
- 为静态或半静态数据使用 ISR
- 为频繁访问的数据使用内存缓存
- 为 API 响应添加适当的缓存头
- 定期清理过期缓存

### 3. 代码分割
- 动态导入非首屏组件
- 为动态组件提供加载状态
- 避免过度分割（增加请求数）
- 使用 React.lazy 和 Suspense

### 4. 性能监控
- 使用 Web Vitals 监控
- 设置性能预算
- 定期运行 Lighthouse 审计
- 监控真实用户指标（RUM）

## 故障排除

### 问题：图片加载慢
- 检查图片尺寸是否过大
- 确认使用了 Next.js Image 组件
- 验证图片域名在 next.config.js 中配置
- 检查 CDN 缓存是否生效

### 问题：页面加载慢
- 运行 Lighthouse 审计
- 检查 bundle 大小
- 验证代码分割是否生效
- 检查数据库查询性能

### 问题：缓存未生效
- 检查 Cache-Control 头
- 验证 ISR revalidate 配置
- 检查中间件配置
- 清除浏览器缓存测试

## 参考资源

- [Next.js 性能优化](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Code Splitting](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Caching](https://nextjs.org/docs/app/building-your-application/caching)

## 更新日志

### 2024-01-XX
- ✅ 实现图片优化（OptimizedImage 组件）
- ✅ 实现数据缓存（ISR + 内存缓存 + HTTP 缓存头）
- ✅ 实现代码分割（动态导入 + Webpack 优化）
- ✅ 添加性能监控工具
- ✅ 创建性能优化文档
