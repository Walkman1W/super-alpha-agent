# IndexNow 配置说明

本文档说明如何为 Agent Signals 配置 IndexNow 快速索引服务。

## 什么是 IndexNow？

IndexNow 是一个协议，允许网站在内容添加、更新或删除时立即通知搜索引擎。这有助于搜索引擎更快地发现你的内容。

## 支持的搜索引擎

- Bing（必应）
- Yandex（俄罗斯）
- 其他支持 IndexNow 协议的搜索引擎

## 配置步骤

### 步骤 1: 生成密钥

生成一个随机的 64 字符十六进制密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

示例输出：
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 步骤 2: 添加到环境变量

将密钥添加到 `.env` 文件：

```env
INDEXNOW_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 步骤 3: 创建密钥验证文件

在 `public/` 目录下创建一个以密钥命名的文本文件：

```bash
# 替换为你的实际密钥
echo "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456" > public/a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456.txt
```

该文件必须可以通过以下地址访问：
```
https://agentsignals.ai/a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456.txt
```

### 步骤 4: 部署

部署你的更改到生产环境。密钥文件将自动由 Next.js 从 `public/` 目录提供服务。

### 步骤 5: 验证

1. 访问你的密钥文件 URL，确保可以访问
2. 提交一个测试 Agent，检查日志中的 IndexNow 通知
3. （可选）在 [Bing 网站管理员工具](https://www.bing.com/webmasters) 注册你的网站以查看提交历史

## 工作原理

配置完成后，IndexNow 会在以下情况自动通知搜索引擎：

1. **用户提交新 Agent**：通过 `/api/submit-agent` 提交后
2. **邮箱验证后发布**：通过 `/api/verify-and-publish` 验证并上架后
3. **爬虫添加新 Agent**：运行 `npm run crawler` 后，新增或更新的 Agent 会自动通知

### 当前集成点

系统已在以下位置集成 IndexNow：

- ✅ **用户提交流程** (`/api/submit-agent`)
- ✅ **邮箱验证发布** (`/api/verify-and-publish`)
- ⚠️ **爬虫批量添加** (`crawler/enricher.ts`) - 待补充

通知是异步执行的，即使失败也不会阻塞主流程。

## IndexNow 的工作机制

### 主动通知 vs 被动爬取

**重要说明**：IndexNow 是**主动推送**协议，不是被动等待：

1. **你的网站主动通知搜索引擎**：当有新内容时，你的服务器向 IndexNow API 发送通知
2. **搜索引擎收到通知后才来爬取**：搜索引擎收到通知后，会安排爬虫来访问你提供的 URL
3. **不是自动爬取**：仅配置密钥文件不会让搜索引擎自动来爬，必须主动发送通知

### 配置后的效果

完成上述配置后：

- ✅ 密钥文件可访问（搜索引擎用于验证你的身份）
- ✅ 系统会在 Agent 发布时自动调用 IndexNow API
- ✅ 搜索引擎收到通知后会来爬取对应页面
- ❌ 不会自动爬取所有页面（需要你主动通知）

### 首次配置建议

1. **完成上述 5 个步骤**
2. **提交现有 Agent**：可以编写脚本批量通知已有的 Agent
3. **注册网站管理员工具**：在 Bing Webmaster Tools 注册，可以看到提交历史和索引状态
4. **监控日志**：查看 Vercel 日志确认通知是否成功发送

## 故障排查

### 密钥文件无法访问

确保文件在 `public/` 目录中，且文件名与 `INDEXNOW_KEY` 环境变量完全匹配。

### 日志中没有通知记录

检查：
- `INDEXNOW_KEY` 是否在环境变量中设置
- `NEXT_PUBLIC_SITE_URL` 是否正确设置
- 密钥文件是否可以通过 HTTPS 访问

### 搜索引擎索引速度没有变快

- 搜索引擎可能需要时间开始使用 IndexNow 数据
- 在搜索引擎网站管理员工具中注册你的网站
- 确保内容质量高且遵循 SEO 最佳实践
- IndexNow 只是通知，不保证立即索引

## 补充：批量通知现有 Agent

如果你已经有很多 Agent，可以运行以下脚本批量通知：

```bash
# 创建批量通知脚本
node scripts/notify-all-agents.js
```

## 更多信息

- [IndexNow 官方文档](https://www.indexnow.org/)
- [Bing 网站管理员工具](https://www.bing.com/webmasters)
- [Yandex 网站管理员](https://webmaster.yandex.com/)
