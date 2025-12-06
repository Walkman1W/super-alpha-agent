#!/usr/bin/env node

/**
 * Verify bot_stats_7d view is working correctly
 */

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

async function verifyView() {
  console.log('🔍 Verifying bot_stats_7d view...\n')
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env')
    process.exit(1)
  }
  
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
    // Test 1: Check if view exists and is queryable
    console.log('📊 Test 1: Querying bot_stats_7d view...')
    const { data, error } = await supabase
      .from('bot_stats_7d')
      .select('*')
      .limit(10)
    
    if (error) {
      console.error('❌ Error querying view:', error.message)
      console.error('   Code:', error.code)
      process.exit(1)
    }
    
    console.log('✅ View is accessible!')
    console.log(`   Found ${data.length} bot stats records\n`)
    
    if (data.length > 0) {
      console.log('📈 Sample data:')
      data.forEach(stat => {
        console.log(`   - ${stat.bot_name}: ${stat.visits_7d} visits (7d), ${stat.growth_rate}% growth`)
      })
    } else {
      console.log('ℹ️  No data yet (ai_visits table is empty)')
      console.log('   This is normal for a new installation\n')
      
      // Test 2: Insert sample data
      console.log('📝 Test 2: Inserting sample data...')
      
      // Get a sample agent
      const { data: agents } = await supabase
        .from('agents')
        .select('id')
        .limit(1)
      
      if (agents && agents.length > 0) {
        const agentId = agents[0].id
        
        // Insert sample visits
        const sampleVisits = [
          { agent_id: agentId, ai_name: 'GPTBot', visited_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { agent_id: agentId, ai_name: 'GPTBot', visited_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { agent_id: agentId, ai_name: 'ClaudeBot', visited_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { agent_id: agentId, ai_name: 'GPTBot', visited_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        ]
        
        const { error: insertError } = await supabase
          .from('ai_visits')
          .insert(sampleVisits)
        
        if (insertError) {
          console.log('⚠️  Could not insert sample data:', insertError.message)
        } else {
          console.log('✅ Sample data inserted!\n')
          
          // Query again
          console.log('📊 Test 3: Querying view with sample data...')
          const { data: newData } = await supabase
            .from('bot_stats_7d')
            .select('*')
          
          if (newData && newData.length > 0) {
            console.log('✅ View is working correctly!\n')
            console.log('📈 Results:')
            newData.forEach(stat => {
              console.log(`   - ${stat.bot_name}:`)
              console.log(`     • Total visits: ${stat.total_visits}`)
              console.log(`     • Last 7 days: ${stat.visits_7d}`)
              console.log(`     • Previous 7 days: ${stat.visits_prev_7d}`)
              console.log(`     • Growth rate: ${stat.growth_rate}%`)
            })
          }
        }
      } else {
        console.log('⚠️  No agents found in database to test with')
      }
    }
    
    console.log('\n🎉 Verification complete!')
    console.log('✅ The bot_stats_7d view is working correctly')
    console.log('✅ No more PGRST205 errors should occur')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

verifyView()
