#!/usr/bin/env node

/**
 * Supabase Setup Script for Parlor Booking App
 * This script helps set up the Supabase database and initial data
 */

const { supabase } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Supabase database for Parlor Booking App...\n');

// Test Supabase connection
async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('services')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

// Create database tables
async function createTables() {
  console.log('📝 Creating database tables...');
  
  try {
    // Note: In Supabase, you typically create tables through the dashboard
    // This script will check if tables exist and provide guidance
    
    const tables = ['customers', 'services', 'appointments'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log(`⚠️  Table '${table}' doesn't exist. Please create it in Supabase dashboard.`);
      } else if (error) {
        console.log(`❌ Error checking table '${table}':`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }
  } catch (error) {
    console.log('❌ Error creating tables:', error.message);
  }
}

// Seed initial data
async function seedData() {
  console.log('🌱 Seeding initial data...');
  
  try {
    // Check if services table has data
    const { data: existingServices, error: checkError } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('❌ Error checking services:', checkError.message);
      return;
    }
    
    if (existingServices && existingServices.length > 0) {
      console.log('✅ Services already seeded');
      return;
    }
    
    // Initial services data
    const services = [
      {
        name: 'Hair Styling',
        slug: 'hair-styling',
        description: 'Professional hair styling and cutting services',
        duration: 90,
        price: 75.00,
        category: 'hair',
        is_active: true
      },
      {
        name: 'Makeup Application',
        slug: 'makeup',
        description: 'Professional makeup application for all occasions',
        duration: 120,
        price: 95.00,
        category: 'makeup',
        is_active: true
      },
      {
        name: 'Facial Treatment',
        slug: 'facial',
        description: 'Rejuvenating facial treatments for healthy skin',
        duration: 60,
        price: 65.00,
        category: 'skincare',
        is_active: true
      },
      {
        name: 'Manicure & Pedicure',
        slug: 'manicure-pedicure',
        description: 'Complete nail care and grooming services',
        duration: 90,
        price: 55.00,
        category: 'nails',
        is_active: true
      },
      {
        name: 'Waxing Services',
        slug: 'waxing',
        description: 'Professional waxing for smooth skin',
        duration: 45,
        price: 35.00,
        category: 'hair-removal',
        is_active: true
      },
      {
        name: 'Bridal Package',
        slug: 'bridal-package',
        description: 'Complete bridal package including hair, makeup, and styling',
        duration: 240,
        price: 250.00,
        category: 'bridal',
        is_active: true
      }
    ];
    
    const { data, error } = await supabase
      .from('services')
      .insert(services);
    
    if (error) {
      console.log('❌ Error seeding services:', error.message);
    } else {
      console.log('✅ Services seeded successfully');
    }
  } catch (error) {
    console.log('❌ Error seeding data:', error.message);
  }
}

// Create .env file if it doesn't exist
function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', 'env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created from template');
      console.log('⚠️  Please update .env file with your Supabase credentials');
    } else {
      console.log('❌ env.example file not found');
    }
  } else {
    console.log('✅ .env file already exists');
  }
}

// Install dependencies
function installDependencies() {
  try {
    console.log('📦 Installing dependencies...');
    const { execSync } = require('child_process');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.log('❌ Failed to install dependencies');
    console.log('   Run: npm install');
  }
}

// Main setup function
async function setup() {
  console.log('🔧 Starting Supabase setup...\n');
  
  // Create .env file
  createEnvFile();
  
  // Install dependencies
  installDependencies();
  
  // Test connection
  const isConnected = await testConnection();
  
  if (isConnected) {
    // Create tables (check if they exist)
    await createTables();
    
    // Seed data
    await seedData();
    
    console.log('\n🎉 Supabase setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Create tables in Supabase dashboard if they don\'t exist');
    console.log('   2. Update your .env file with Supabase credentials');
    console.log('   3. Run: npm run dev');
    console.log('   4. Check health endpoint: http://localhost:3000/health');
    console.log('\n📚 Supabase Dashboard:');
    console.log('   https://app.supabase.com/project/swiwraumksfkkjxjftck');
    console.log('\n📚 API Documentation:');
    console.log('   - GET    /api/services');
    console.log('   - GET    /api/customers');
    console.log('   - GET    /api/appointments');
    console.log('   - POST   /api/appointments');
  } else {
    console.log('\n❌ Setup failed. Please check your Supabase configuration.');
  }
}

// Run setup
setup().catch(console.error); 