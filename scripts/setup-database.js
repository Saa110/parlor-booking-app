#!/usr/bin/env node

/**
 * Database Setup Script for Parlor Booking App
 * This script helps set up the PostgreSQL database and initial data
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up PostgreSQL database for Parlor Booking App...\n');

// Check if PostgreSQL is installed
function checkPostgreSQL() {
    try {
        execSync('psql --version', { stdio: 'pipe' });
        console.log('✅ PostgreSQL is installed');
        return true;
    } catch (error) {
        console.log('❌ PostgreSQL is not installed or not in PATH');
        console.log('\n📋 To install PostgreSQL:');
        console.log('   macOS: brew install postgresql');
        console.log('   Ubuntu: sudo apt-get install postgresql postgresql-contrib');
        console.log('   Windows: Download from https://www.postgresql.org/download/windows/');
        return false;
    }
}

// Create database if it doesn't exist
function createDatabase() {
    const dbName = process.env.DB_NAME || 'parlor_app';
    const dbUser = process.env.DB_USER || 'postgres';
    
    try {
        // Check if database exists
        execSync(`psql -U ${dbUser} -lqt | cut -d \| -f 1 | grep -qw ${dbName}`, { stdio: 'pipe' });
        console.log(`✅ Database '${dbName}' already exists`);
    } catch (error) {
        try {
            console.log(`📝 Creating database '${dbName}'...`);
            execSync(`createdb -U ${dbUser} ${dbName}`, { stdio: 'inherit' });
            console.log(`✅ Database '${dbName}' created successfully`);
        } catch (createError) {
            console.log('❌ Failed to create database. You may need to:');
            console.log(`   1. Create a PostgreSQL user: createuser -s ${dbUser}`);
            console.log(`   2. Or use existing user credentials`);
            console.log(`   3. Update your .env file with correct database credentials`);
        }
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
            console.log('⚠️  Please update .env file with your database credentials');
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
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully');
    } catch (error) {
        console.log('❌ Failed to install dependencies');
        console.log('   Run: npm install');
    }
}

// Main setup function
async function setup() {
    console.log('🔧 Starting database setup...\n');
    
    // Check PostgreSQL installation
    if (!checkPostgreSQL()) {
        console.log('\n❌ Please install PostgreSQL first');
        process.exit(1);
    }
    
    // Create .env file
    createEnvFile();
    
    // Install dependencies
    installDependencies();
    
    // Create database
    createDatabase();
    
    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update your .env file with database credentials');
    console.log('   2. Run: npm run dev');
    console.log('   3. Check health endpoint: http://localhost:3000/health');
    console.log('\n📚 API Documentation:');
    console.log('   - GET    /api/services');
    console.log('   - GET    /api/customers');
    console.log('   - GET    /api/appointments');
    console.log('   - POST   /api/appointments');
    console.log('   - GET    /api/appointments/availability/:date?serviceId=1');
}

// Run setup
setup().catch(console.error); 