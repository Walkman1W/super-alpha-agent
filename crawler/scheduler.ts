/**
 * 爬虫定时任务调度器
 * 
 * 支持:
 * 1. 每日定时抓取
 * 2. 多Topic轮换策略
 * 3. 增量更新
 * 4. 错误重试
 */

import { config } from 'dotenv'
config()

import { runCrawlerV2 } from './crawler-v2'

// 定时任务配置
interface ScheduleConfig {
  name: string
  topics: string[]
  minStars: number
  maxAgentsPerTopic: number
  concurrency: number
  cron?: string  // Cron表达式（用于生产环境）
}

// 预定义的调度策略
const SCHEDULES: Record<string, ScheduleConfig> = {
  // 每日高质量项目
  daily_premium: {
    name: '每日高质量项目',
    topics: ['ai-agent', 'llm'],
    minStars: 500,
    maxAgentsPerTopic: 20,
    concurrency: 3,
    cron: '0 2 * * *'  // 每天凌晨2点
  },
  
  // 每周全量抓取
  weekly_full: {
    name: '每周全量抓取',
    topics: ['ai-agent', 'llm', 'chatgpt', 'langchain', 'autonomous-agent'],
    minStars: 100,
    maxAgentsPerTopic: 50,
    concurrency: 5,
    cron: '0 3 * * 0'  // 每周日凌晨3点
  },
  
  // 每小时新兴项目
  hourly_emerging: {
    name: '每小时新兴项目',
    topics: ['ai-agent'],
    minStars: 50,
    maxAgentsPerTopic: 10,
    concurrency: 2,
    cron: '0 * * * *'  // 每小时
  },
  
  // 测试任务
  test: {
    name: '测试任务',
    topics: ['ai-agent'],
    minStars: 100,
    maxAgentsPerTopic: 5,
    concurrency: 2
  }
}

/**
 * 运行指定的调度任务
 */
async function runSchedule(scheduleName: string) {
  const schedule = SCHEDULES[scheduleName]
  
  if (!schedule) {
    console.error(`❌ 未找到调度任务: ${scheduleName}`)
    console.log(`可用的任务: ${Object.keys(SCHEDULES).join(', ')}`)
    process.exit(1)
  }
  
  console.log(`\n🕐 运行调度任务: ${schedule.name}`)
  console.log(`   Topics: ${schedule.topics.join(', ')}`)
  console.log(`   最小Stars: ${schedule.minStars}`)
  console.log(`   Cron: ${schedule.cron || '手动触发'}`)
  console.log('')
  
  // 设置环境变量
  process.env.CRAWLER_TOPICS = schedule.topics.join(',')
  process.env.GITHUB_MIN_STARS = schedule.minStars.toString()
  process.env.CRAWLER_MAX_AGENTS_PER_RUN = schedule.maxAgentsPerTopic.toString()
  process.env.CRAWLER_CONCURRENCY = schedule.concurrency.toString()
  
  // 运行爬虫
  await runCrawlerV2()
}

/**
 * 主函数
 */
async function main() {
  const scheduleName = process.argv[2] || process.env.CRAWLER_SCHEDULE || 'test'
  
  console.log('📅 爬虫调度器')
  console.log('='.repeat(60))
  
  await runSchedule(scheduleName)
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error('💥 调度器失败:', error)
    process.exit(1)
  })
}

export { runSchedule, SCHEDULES }
