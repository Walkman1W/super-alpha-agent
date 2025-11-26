# 测试文档

## 测试框架配置

本项目使用以下测试工具和库：

### 核心测试框架
- **Vitest**: 快速、轻量的测试运行器，与 Vite 集成
- **@testing-library/react**: React 组件测试工具
- **@testing-library/jest-dom**: DOM 匹配器扩展
- **jsdom**: DOM 环境模拟

### 属性测试
- **fast-check**: 基于属性的测试库，用于生成随机测试用例
- **@fast-check/vitest**: Vitest 的 fast-check 集成

## 测试脚本

```bash
# 运行测试（监听模式）
npm test

# 运行测试 UI 界面
npm run test:ui

# 运行测试覆盖率报告
npm run test:coverage

# 运行测试（单次模式）
npm run test:run
```

## 测试文件结构

```
test/
├── setup.ts          # 测试环境配置和模拟
├── example.test.ts   # 基础测试示例
└── utils.test.ts     # 工具函数测试示例
```

## 测试最佳实践

1. **测试文件命名**: 使用 `.test.ts` 或 `.spec.ts` 后缀
2. **测试组织**: 使用 `describe` 和 `it` 块组织测试
3. **属性测试**: 使用 fast-check 生成随机测试数据，验证通用属性
4. **模拟**: 在 `test/setup.ts` 中配置全局模拟
5. **覆盖率**: 目标覆盖率 > 80%

## 属性测试示例

```typescript
import fc from 'fast-check'

it('加法交换律应该成立', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) => {
      return a + b === b + a
    })
  )
})
```

## React 组件测试

```typescript
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

it('应该渲染组件', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```