#!/usr/bin/env node

/**
 * Apply GitHub fields migration to database
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function applyMigration() {
  console.log('🔧 Applying GitHub fields migration...\n')
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/add_github_fields.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
  
  console.log('📄 Migration file:', migrationPath)
  console.log('📝 Executing SQL...\n')
  
  try {
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      // If exec_sql doesn't exist, try direct execution (this won't work for all SQL)
      console.log('⚠️  exec_sql function not available, trying alternative method...')
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
      
      for (const statement of statements) {
        if (statement.toLowerCase().includes('alter table') || 
            statement.toLowerCase().includes('create index') ||
            statement.toLowerCase().includes('comment on')) {
          console.log(`Executing: ${statement.substring(0, 60)}...`)
          
          // Use raw SQL execution through Supabase
          const { error: execError } = await supabase.rpc('exec', { 
            sql: statement + ';' 
          })
          
          if (execError) {
            console.error(`❌ Error executing statement:`, execError)
          }
        }
      }
    }
    
    // Verify the migration
    console.log('\n✅ Verifying migration...')
    
    const { data: columns, error: verifyError } = await supabase
      .from('agents')
      .select('github_stars, github_url, github_owner, github_topics')
      .limit(1)
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor:')
      console.log('   1. Go to Supabase Dashboard > SQL Editor')
      console.log('   2. Copy the contents of supabase/migrations/add_github_fields.sql')
      console.log('   3. Execute the SQL')
      process.exit(1)
    }
    
    console.log('✅ Migration applied successfully!')
    console.log('   - github_stars column added')
    console.log('   - github_url column added')
    console.log('   - github_owner column added')
    console.log('   - github_topics column added')
    console.log('   - Indexes created')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor:')
    console.log('   1. Go to Supabase Dashboard > SQL Editor')
    console.log('   2. Copy the contents of supabase/migrations/add_github_fields.sql')
    console.log('   3. Execute the SQL')
    process.exit(1)
  }
}

applyMigration()
