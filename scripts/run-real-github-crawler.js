#!/usr/bin/env node

/**
 * 运行真实的GitHub爬虫（TypeScript版本）
 * 使用tsx来直接运行TypeScript文件
 */

import { spawn } from 'child_process'
import { config } from 'dotenv'

config()

console.log('🚀 启动真实GitHub爬虫\n')
console.log('配置:')
console.log(`  CRAWLER_SOURCE: ${process.env.CRAWLER_SOURCE || 'github'}`)
console.log(`  GITHUB_TOPIC: ${process.env.GITHUB_TOPIC || 'ai-agent'}`)
console.log(`  GITHUB_MIN_STARS: ${process.env.GITHUB_MIN_STARS || '100'}`)
console.log(`  MAX_AGENTS: ${process.env.CRAWLER_MAX_AGENTS_PER_RUN || '50'}`)
console.log('')

// 使用tsx运行TypeScript文件
const child = spawn('npx', ['tsx', 'crawler/run.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    CRAWLER_SOURCE: 'github',
    CRAWLER_MAX_AGENTS_PER_RUN: '10'
  }
})

child.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ 爬虫运行成功！')
  } else {
    console.log(`\n❌ 爬虫运行失败，退出码: ${code}`)
    process.exit(code)
  }
})
