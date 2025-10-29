import { chromium } from 'playwright'

export interface RawAgentData {
  name: string
  description?: string
  url?: string
  platform: string
  author?: string
  category?: string
}

export async function crawlGPTStore(maxAgents: number = 50): Promise<RawAgentData[]> {
  console.log('🕷️  Starting GPT Store crawler...')
  
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  const agents: RawAgentData[] = []
  
  try {
    // 访问 GPT Store（需要根据实际页面结构调整）
    await page.goto('https://chatgpt.com/gpts', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })
    
    // 等待内容加载
    await page.waitForTimeout(3000)
    
    // 提取 GPT 信息（选择器需要根据实际页面调整）
    const gpts = await page.$$eval('.gpt-card', (elements) => {
      return elements.slice(0, 50).map(el => {
        const nameEl = el.querySelector('.gpt-name')
        const descEl = el.querySelector('.gpt-description')
        const linkEl = el.querySelector('a')
        const authorEl = el.querySelector('.gpt-author')
        
        return {
          name: nameEl?.textContent?.trim() || '',
          description: descEl?.textContent?.trim() || '',
          url: linkEl?.href || '',
          author: authorEl?.textContent?.trim() || ''
        }
      })
    })
    
    for (const gpt of gpts) {
      if (gpt.name && agents.length < maxAgents) {
        agents.push({
          name: gpt.name,
          description: gpt.description,
          url: gpt.url,
          platform: 'GPT Store',
          author: gpt.author
        })
      }
    }
    
    console.log(`✅ Crawled ${agents.length} agents from GPT Store`)
    
  } catch (error) {
    console.error('❌ GPT Store crawler error:', error)
  } finally {
    await browser.close()
  }
  
  return agents
}

// 备用方案：手动种子数据（如果爬虫失败）
export function getGPTStoreSeedData(): RawAgentData[] {
  return [
    {
      name: 'Code Reviewer',
      description: 'Expert code review assistant that analyzes your code for bugs, performance issues, and best practices',
      url: 'https://chatgpt.com/g/code-reviewer',
      platform: 'GPT Store',
      category: 'Development'
    },
    {
      name: 'Content Writer Pro',
      description: 'Professional content writing assistant for blogs, articles, and marketing copy',
      url: 'https://chatgpt.com/g/content-writer-pro',
      platform: 'GPT Store',
      category: 'Content'
    },
    {
      name: 'Data Analyst',
      description: 'Analyze data, create visualizations, and generate insights from your datasets',
      url: 'https://chatgpt.com/g/data-analyst',
      platform: 'GPT Store',
      category: 'Data Analysis'
    },
    // 添加更多种子数据...
  ]
}
