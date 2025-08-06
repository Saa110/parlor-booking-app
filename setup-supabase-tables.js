#!/usr/bin/env node

/**
 * Supabase Tables Setup Script
 * Creates the necessary tables in Supabase if they don't exist
 */

const { supabase } = require('./config/supabase');
const fs = require('fs');
const path = require('path');

async function setupSupabaseTables() {
  console.log('🚀 Setting up Supabase tables...\n');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'scripts', 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 Executing SQL schema...');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        // Execute each statement using Supabase's rpc function
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`⚠️  Statement skipped (likely already exists): ${statement.substring(0, 50)}...`);
        } else {
          console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Error executing statement: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} errors`);

    // Test the tables by checking if they exist
    console.log('\n🔍 Verifying tables...');
    
    const tables = ['customers', 'services', 'appointments'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}' not accessible: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' is accessible`);
      }
    }

    console.log('\n📋 Manual Setup Instructions:');
    console.log('If tables are not accessible, please run the SQL schema manually:');
    console.log('1. Go to https://app.supabase.com/project/swiwraumksfkkjxjftck');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of scripts/supabase-schema.sql');
    console.log('4. Execute the SQL');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📋 Manual Setup Required:');
    console.log('Please run the SQL schema manually in Supabase dashboard.');
  }
}

// Run the setup
setupSupabaseTables(); 