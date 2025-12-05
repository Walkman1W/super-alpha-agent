# IndexNow 设置指南

IndexNow 是一个协议，允许网站主动通知搜索引擎内容更新，加速索引速度。

## 支持的搜索引擎

- Bing
- Yandex
- 其他支持 IndexNow 协议的搜索引擎

## 设置步骤

### 1. 生成 IndexNow Key

使用以下命令生成一个随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

这将生成一个 64 字符的十六进制字符串，例如：
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 2. 配置环境变量

将生成的密钥添加到 `.env` 文件：

```env
INDEXNOW_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 3. 创建密钥验证文件

在 `public/` 目录下创建一个以密钥命名的文本文件，内容为该密钥：

```bash
# 假设你的密钥是 a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
echo "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2" > public/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2.txt
```

这个文件必须可以通过以下 URL 访问：
```
https://www.superalphaagent.com/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2.txt
```

### 4. 验证配置

部署后，访问密钥文件 URL，确保返回正确的密钥内容。

## 工作原理

### 自动触发

IndexNow 服务已集成到以下流程中：

1. **Agent 提交** (`/api/submit-agent`)
   - 当新 Agent 成功创建后，自动通知 IndexNow

2. **邮箱验证发布** (`/api/verify-and-publish`)
   - 当用户验证邮箱并成功发布 Agent 后，自动通知 IndexNow

### 错误处理

- IndexNow 调用是异步的，不会阻塞主流程
- 如果 IndexNow 调用失败，只会记录错误日志，不影响 Agent 发布
- 如果未配置 `INDEXNOW_KEY`，服务会跳过通知并记录警告

### 批量通知

对于批量更新场景，可以使用 `batchNotify` 函数：

```typescript
import { batchNotify } from '@/lib/indexnow'

// 批量通知多个 URL
const urls = [
  'https://www.superalphaagent.com/agents/agent-1',
  'https://www.superalphaagent.com/agents/agent-2',
  // ... 最多 10,000 个
]

await batchNotify(urls)
```

## API 参考

### `notifyIndexNow(urls: string[])`

通知一个或多个 URL 更新。

```typescript
import { notifyIndexNow } from '@/lib/indexnow'

const results = await notifyIndexNow([
  'https://www.superalphaagent.com/agents/my-agent'
])

// results: [{ success: true, url: '...' }]
```

### `notifyAgentPublished(agentSlug: string)`

通知特定 Agent 发布。

```typescript
import { notifyAgentPublished } from '@/lib/indexnow'

await notifyAgentPublished('my-agent-slug')
```

### `notifyAgentUpdated(agentSlug: string)`

通知特定 Agent 更新（与发布相同）。

```typescript
import { notifyAgentUpdated } from '@/lib/indexnow'

await notifyAgentUpdated('my-agent-slug')
```

### `batchNotify(urls: string[], batchSize?: number)`

批量通知多个 URL（默认批次大小：10,000）。

```typescript
import { batchNotify } from '@/lib/indexnow'

await batchNotify(urls, 5000) // 每批 5000 个
```

## 监控和日志

所有 IndexNow 操作都会记录到日志系统：

- 成功通知：`IndexNow: Successfully notified for {url}`
- 失败通知：`IndexNow: Failed to notify {url}, status: {status}`
- 配置缺失：`IndexNow: Skipping notification (not configured)`

查看日志以监控 IndexNow 服务状态。

## 常见问题

### Q: IndexNow 是否必需？

A: 不是必需的。如果未配置，系统会正常运行，只是搜索引擎索引速度可能较慢。

### Q: 如何验证 IndexNow 是否工作？

A: 检查应用日志，查找 `IndexNow: Successfully notified` 消息。也可以使用 Bing Webmaster Tools 查看提交历史。

### Q: 支持哪些搜索引擎？

A: 所有支持 IndexNow 协议的搜索引擎，包括 Bing、Yandex 等。提交到 IndexNow API 后，会自动分发到所有支持的搜索引擎。

### Q: 有速率限制吗？

A: IndexNow 协议本身没有明确的速率限制，但建议合理使用。我们的实现在批量请求之间添加了 1 秒延迟。

## 相关资源

- [IndexNow 官方文档](https://www.indexnow.org/)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Yandex Webmaster](https://webmaster.yandex.com/)
