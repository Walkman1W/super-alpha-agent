#!/usr/bin/env node

/**
 * Apply bot_stats_7d view migration to database
 * This script creates the bot_stats_7d view for AI bot visit statistics
 */

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function applyMigration() {
  console.log('🔧 Applying bot_stats_7d view migration...\n')
  
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Missing Supabase credentials')
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env')
    process.exit(1)
  }
  
  // Create Supabase admin client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/create_bot_stats_view.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded:', migrationPath)
    console.log('📝 Executing SQL...\n')
    
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      // If exec_sql doesn't exist, try direct execution (Supabase may not support this)
      console.log('⚠️  Direct RPC execution not available')
      console.log('📋 Please apply this migration manually in Supabase SQL Editor:\n')
      console.log('1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new')
      console.log('2. Copy and paste the following SQL:\n')
      console.log('─'.repeat(80))
      console.log(migrationSQL)
      console.log('─'.repeat(80))
      console.log('\n3. Click "Run" to execute the migration')
      console.log('\n💡 Alternatively, you can copy from: supabase/migrations/create_bot_stats_view.sql')
      process.exit(1)
    }
    
    console.log('✅ Migration applied successfully!')
    console.log('\n📊 Verifying view creation...')
    
    // Verify the view exists
    const { data: viewData, error: viewError } = await supabase
      .from('bot_stats_7d')
      .select('*')
      .limit(1)
    
    if (viewError) {
      console.error('❌ View verification failed:', viewError.message)
      console.log('\n📋 Please apply the migration manually (see instructions above)')
      process.exit(1)
    }
    
    console.log('✅ View verified successfully!')
    console.log('\n🎉 Migration complete! The bot_stats_7d view is now available.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.log('\n📋 Manual migration required:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Run the SQL from: supabase/migrations/create_bot_stats_view.sql')
    process.exit(1)
  }
}

applyMigration()
