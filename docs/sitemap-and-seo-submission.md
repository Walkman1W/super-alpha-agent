# Sitemap 和搜索引擎提交指南

## 概述

本文档提供了 Super Alpha Agent 平台的 sitemap 生成和搜索引擎提交的完整指南。

## Sitemap 配置

### 当前状态

- **Sitemap URL**: https://www.superalphaagent.com/sitemap.xml
- **总页面数**: 29 页
- **更新频率**: 自动生成，包含最新的 Agent 和分类数据

### Sitemap 结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 首页 (priority: 1.0, changefreq: daily) -->
  <!-- Agent 页面 (priority: 0.8, changefreq: weekly) -->
  <!-- 分类页面 (priority: 0.7, changefreq: weekly) -->
</urlset>
```

### 优先级说明

- **1.0**: 首页 - 最高优先级，每日更新
- **0.8**: Agent 详情页 - 高优先级，每周更新
- **0.7**: 分类页面 - 中等优先级，每周更新

## Robots.txt 配置

### 当前配置

文件位置: `public/robots.txt`

```txt
User-agent: *
Allow: /

# AI Crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: anthropic-ai
Allow: /

# Sitemap
Sitemap: https://www.superalphaagent.com/sitemap.xml

# Disallow admin paths
Disallow: /api/
Disallow: /_next/
```

### 配置说明

1. **允许所有爬虫**: 默认允许所有搜索引擎爬虫访问
2. **AI 爬虫优化**: 明确允许主要 AI 搜索引擎（ChatGPT、Claude、Perplexity）
3. **保护路径**: 禁止访问 API 端点和 Next.js 内部文件
4. **Sitemap 声明**: 明确指向 sitemap 位置

## 生成 Sitemap

### 手动生成

```bash
# 运行 sitemap 生成脚本
npm run sitemap

# 或直接运行
node scripts/generate-sitemap.js
```

### 自动生成

Sitemap 会在以下情况自动更新：
- 部署到 Vercel 时（通过 `npm run deploy` 命令）
- 可以设置 GitHub Actions 定期运行

### 生成脚本说明

脚本位置: `scripts/generate-sitemap.js`

功能：
1. 从 Supabase 获取所有 Agent 和分类数据
2. 生成符合 XML sitemap 标准的文件
3. 包含最后修改时间、更新频率和优先级
4. 保存到 `public/sitemap.xml`

## 搜索引擎提交

### 1. Google Search Console

**提交步骤**:

1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 添加网站属性: `https://www.superalphaagent.com`
3. 验证网站所有权（推荐使用 DNS 验证或 HTML 标签验证）
4. 在左侧菜单选择 "Sitemaps"
5. 输入 sitemap URL: `https://www.superalphaagent.com/sitemap.xml`
6. 点击 "Submit"

**验证方法**:
- DNS TXT 记录（推荐）
- HTML 文件上传
- HTML meta 标签
- Google Analytics
- Google Tag Manager

**监控指标**:
- 已提交的 URL 数量
- 已索引的 URL 数量
- 覆盖率问题
- 移动设备可用性

### 2. Bing Webmaster Tools

**提交步骤**:

1. 访问 [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. 添加网站: `https://www.superalphaagent.com`
3. 验证网站所有权
4. 在 "Sitemaps" 部分提交: `https://www.superalphaagent.com/sitemap.xml`

**快捷方式**:
- 如果已在 Google Search Console 验证，可以直接导入

### 3. Yandex Webmaster

**提交步骤**:

1. 访问 [Yandex Webmaster](https://webmaster.yandex.com)
2. 添加网站
3. 验证所有权
4. 在 "Indexing" → "Sitemap files" 提交 sitemap

### 4. Baidu 搜索资源平台

**提交步骤**:

1. 访问 [百度搜索资源平台](https://ziyuan.baidu.com)
2. 添加网站并验证
3. 在 "数据引入" → "链接提交" 中提交 sitemap
4. URL: `https://www.superalphaagent.com/sitemap.xml`

**注意事项**:
- 百度对国际网站的收录可能较慢
- 建议同时使用主动推送 API

### 5. AI 搜索引擎优化

虽然 AI 搜索引擎（ChatGPT、Claude、Perplexity）不需要传统的 sitemap 提交，但我们已经通过以下方式优化：

**已实施的优化**:
1. ✅ robots.txt 中明确允许 AI 爬虫
2. ✅ 结构化数据（JSON-LD Schema.org）
3. ✅ 语义化 HTML5 标签
4. ✅ 完整的 meta 标签和 Open Graph
5. ✅ 服务端渲染（SSR）确保内容可爬取

**AI 爬虫 User-Agents**:
- `GPTBot` - OpenAI/ChatGPT
- `ChatGPT-User` - ChatGPT 浏览器
- `Claude-Web` - Anthropic Claude
- `PerplexityBot` - Perplexity AI
- `anthropic-ai` - Anthropic 通用爬虫

## 验证和监控

### 验证 Sitemap 可访问性

```bash
# 使用 curl 测试
curl -I https://www.superalphaagent.com/sitemap.xml

# 应该返回 200 OK
HTTP/2 200
content-type: application/xml
```

### 验证 Robots.txt

```bash
# 测试 robots.txt
curl https://www.superalphaagent.com/robots.txt
```

### 在线验证工具

1. **XML Sitemap Validator**
   - https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - 验证 sitemap 格式是否正确

2. **Google Sitemap Validator**
   - 在 Google Search Console 中自动验证

3. **Robots.txt Tester**
   - Google Search Console → Settings → robots.txt Tester

### 监控指标

**Google Search Console**:
- 索引覆盖率
- 页面体验
- 核心网页指标
- 移动设备可用性
- 结构化数据

**Bing Webmaster Tools**:
- 爬取统计
- 索引页面数
- SEO 报告

## 定期维护

### 每周任务

- [ ] 检查 Google Search Console 中的覆盖率问题
- [ ] 查看新增的索引错误
- [ ] 监控爬取频率

### 每月任务

- [ ] 重新生成 sitemap（如果有大量新 Agent）
- [ ] 审查 robots.txt 配置
- [ ] 检查所有搜索引擎的索引状态
- [ ] 分析搜索性能数据

### 内容更新时

每当添加新 Agent 或更新现有 Agent 时：

```bash
# 1. 重新生成 sitemap
npm run sitemap

# 2. 部署更新
git add public/sitemap.xml
git commit -m "Update sitemap with new agents"
git push

# 3. 通知搜索引擎（可选）
# Google Search Console 会自动检测更新
# 也可以手动请求重新抓取
```

## 自动化建议

### GitHub Actions 自动更新

创建 `.github/workflows/update-sitemap.yml`:

```yaml
name: Update Sitemap

on:
  schedule:
    # 每天 UTC 00:00 运行
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  update-sitemap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate sitemap
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
        run: npm run sitemap
      
      - name: Commit and push if changed
        run: |
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add public/sitemap.xml
          git diff --quiet && git diff --staged --quiet || (git commit -m "Auto-update sitemap" && git push)
```

### Vercel 部署钩子

在 `package.json` 中已配置：

```json
{
  "scripts": {
    "deploy": "npm run sitemap && vercel --prod"
  }
}
```

## 故障排除

### Sitemap 未被索引

**可能原因**:
1. robots.txt 阻止了爬虫
2. Sitemap URL 不正确
3. XML 格式错误
4. 服务器返回错误状态码

**解决方案**:
1. 验证 robots.txt 配置
2. 使用在线工具验证 XML 格式
3. 检查服务器日志
4. 在 Search Console 中请求重新抓取

### 页面未被索引

**可能原因**:
1. 页面是新添加的（需要时间）
2. 内容质量问题
3. 技术 SEO 问题
4. 爬取预算限制

**解决方案**:
1. 使用 "Request Indexing" 功能
2. 改进页面内容和结构化数据
3. 检查页面加载速度
4. 确保内部链接结构良好

### AI 爬虫未访问

**检查清单**:
- [ ] robots.txt 允许 AI 爬虫
- [ ] 页面包含结构化数据
- [ ] 内容质量高且相关
- [ ] 页面可以被服务端渲染
- [ ] 没有 JavaScript 阻止内容显示

## 相关资源

### 官方文档

- [Google Search Console Help](https://support.google.com/webmasters)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmasters-guidelines-30fba23a)
- [Sitemaps.org Protocol](https://www.sitemaps.org/protocol.html)
- [Schema.org Documentation](https://schema.org/)

### 工具

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [Robots.txt Tester](https://support.google.com/webmasters/answer/6062598)

## 总结

✅ **已完成**:
- Sitemap 生成脚本已配置并运行
- Sitemap.xml 已生成（29 页）
- Robots.txt 已优化配置
- AI 爬虫已明确允许

📋 **待提交**:
- Google Search Console
- Bing Webmaster Tools
- Yandex Webmaster
- 百度搜索资源平台

🔄 **持续维护**:
- 定期重新生成 sitemap
- 监控索引状态
- 优化内容质量
- 跟踪搜索性能

---

**最后更新**: 2025-11-29
**维护者**: 开发团队
