import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { load } from 'cheerio'
import { v4 as uuidv4 } from 'uuid'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const { url, description, category } = await request.json()

    // Validate URL
    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Fetch and parse the webpage
    const response = await fetch(url)
    const html = await response.text()
    const $ = load(html)

    // Extract metadata
    const title = $('title').text() || 'Untitled Agent'
    const metaDescription = $('meta[name="description"]').attr('content') || description || ''
    const keywords = $('meta[name="keywords"]').attr('content') || ''

    // Generate slug
    const slug = generateSlug(title)

    // Create agent data
    const agent = {
      id: uuidv4(),
      name: title,
      short_description: metaDescription,
      detailed_description: $('main').text() || $('body').text() || '',
      platform: getPlatformFromUrl(url),
      official_url: url,
      category_id: getCategoryId(category),
      ai_search_count: Math.floor(Math.random() * 100), // Random initial value
      view_count: 0,
      keywords,
      key_features: ['Web-based', 'AI-powered', 'Automated'], // Placeholder
      use_cases: ['Content creation', 'Automation', 'Productivity'], // Placeholder
      pros: ['Easy to use', 'Fast processing', 'AI integration'], // Placeholder
      cons: ['Limited customization', 'Requires internet'], // Placeholder
      how_to_use: '1. Visit the website\n2. Follow the instructions\n3. Start using the agent', // Placeholder
      pricing: 'Free', // Placeholder
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Insert into database
    const { error } = await supabaseAdmin
      .from('agents')
      .insert(agent)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, agent }, { status: 201 })

  } catch (error) {
    console.error('Error submitting agent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getPlatformFromUrl(url: string): string {
  if (url.includes('chrome.google.com')) return 'Chrome'
  if (url.includes('appstore.com') || url.includes('apple.com')) return 'iOS'
  if (url.includes('play.google.com')) return 'Android'
  if (url.includes('microsoft.com') || url.includes('store.microsoft.com')) return 'Windows'
  if (url.includes('macos') || url.includes('apple.com')) return 'macOS'
  if (url.includes('web')) return 'Web'
  return 'Web'
}

function getCategoryId(category: string): string {
  // This should map to actual category IDs in your database
  const categoryMap = {
    'productivity': '1',
    'writing': '2',
    'coding': '3',
    'design': '4',
    'research': '5',
    'education': '6',
    'business': '7',
  }
  return categoryMap[category] || '1'
}