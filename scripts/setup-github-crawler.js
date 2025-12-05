#!/usr/bin/env node

/**
 * GitHub Crawler Setup Checker
 * Verifies all prerequisites are met before running the crawler
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function checkSetup() {
  console.log('🔍 GitHub Crawler Setup Checker\n')
  console.log('='.repeat(60))
  
  let allGood = true
  
  // Check 1: Environment Variables
  console.log('\n1️⃣  Environment Variables:')
  
  const checks = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL, required: true },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY, required: true },
    { name: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY, required: true },
    { name: 'GITHUB_TOKEN', value: process.env.GITHUB_TOKEN, required: false },
    { name: 'INDEXNOW_KEY', value: process.env.INDEXNOW_KEY, required: false }
  ]
  
  checks.forEach(check => {
    const status = check.value ? '✅' : (check.required ? '❌' : '⚠️ ')
    const label = check.required ? 'Required' : 'Optional'
    console.log(`   ${status} ${check.name} (${label})`)
    if (!check.value && check.required) {
      allGood = false
    }
  })
  
  if (!process.env.GITHUB_TOKEN) {
    console.log('\n   💡 Tip: Add GITHUB_TOKEN for higher rate limits (5000/hour vs 60/hour)')
    console.log('      See: https://github.com/settings/tokens')
  }
  
  // Check 2: Database Schema
  console.log('\n2️⃣  Database Schema:')
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('   ⏭️  Skipped (missing Supabase credentials)')
  } else {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('github_stars, github_url, github_owner, github_topics')
        .limit(1)
      
      if (error) {
        console.log('   ❌ GitHub fields not found in agents table')
        console.log('\n   📋 Action Required:')
        console.log('      1. Go to Supabase Dashboard > SQL Editor')
        console.log('      2. Run: supabase/migrations/add_github_fields.sql')
        console.log('      3. Re-run this setup checker')
        allGood = false
      } else {
        console.log('   ✅ GitHub fields exist in agents table')
      }
    } catch (err) {
      console.log('   ❌ Failed to check database schema:', err.message)
      allGood = false
    }
  }
  
  // Check 3: Migration Files
  console.log('\n3️⃣  Migration Files:')
  
  const migrationFiles = [
    'supabase/migrations/add_github_fields.sql',
    'supabase/migrations/create_bot_stats_view.sql'
  ]
  
  migrationFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, '..', file))
    console.log(`   ${exists ? '✅' : '❌'} ${file}`)
  })
  
  // Check 4: Crawler Files
  console.log('\n4️⃣  Crawler Implementation:')
  
  const crawlerFiles = [
    'lib/github.ts',
    'crawler/sources/github.ts',
    'crawler/enricher.ts',
    'crawler/run.ts'
  ]
  
  crawlerFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, '..', file))
    console.log(`   ${exists ? '✅' : '❌'} ${file}`)
  })
  
  // Check 5: Package Scripts
  console.log('\n5️⃣  NPM Scripts:')
  
  const packageJson = require('../package.json')
  const scripts = ['crawler', 'crawler:github', 'crawler:all', 'test:crawler']
  
  scripts.forEach(script => {
    const exists = packageJson.scripts[script]
    console.log(`   ${exists ? '✅' : '❌'} npm run ${script}`)
  })
  
  // Summary
  console.log('\n' + '='.repeat(60))
  
  if (allGood) {
    console.log('✅ All checks passed! You can now run the crawler:')
    console.log('\n   Test (10 projects):')
    console.log('   $ npm run test:crawler')
    console.log('\n   Production (50 projects):')
    console.log('   $ npm run crawler:github')
    console.log('\n   All sources:')
    console.log('   $ npm run crawler:all')
  } else {
    console.log('❌ Setup incomplete. Please fix the issues above.')
    console.log('\n📖 For detailed instructions, see:')
    console.log('   docs/github-crawler-test-guide.md')
  }
  
  console.log('='.repeat(60) + '\n')
  
  process.exit(allGood ? 0 : 1)
}

checkSetup()
