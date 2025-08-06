#!/usr/bin/env node

/**
 * Database Test Script
 * Tests the connection to Supabase and verifies table structure
 */

const { sequelize } = require('./config/database');
const { supabase } = require('./config/supabase');
const { Customer, Service, Appointment } = require('./models');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connections...\n');

  try {
    // Test Sequelize connection
    console.log('1. Testing Sequelize connection...');
    await sequelize.authenticate();
    console.log('✅ Sequelize connection successful');

    // Test Supabase connection
    console.log('\n2. Testing Supabase connection...');
    const { data: supabaseTest, error: supabaseError } = await supabase
      .from('services')
      .select('count')
      .limit(1);
    
    if (supabaseError) {
      console.log('❌ Supabase connection failed:', supabaseError.message);
    } else {
      console.log('✅ Supabase connection successful');
    }

    // Test table synchronization
    console.log('\n3. Testing table synchronization...');
    await sequelize.sync({ force: false });
    console.log('✅ Tables synchronized successfully');

    // Check if tables exist and have data
    console.log('\n4. Checking table data...');
    
    const customerCount = await Customer.count();
    console.log(`   Customers: ${customerCount} records`);
    
    const serviceCount = await Service.count();
    console.log(`   Services: ${serviceCount} records`);
    
    const appointmentCount = await Appointment.count();
    console.log(`   Appointments: ${appointmentCount} records`);

    // Test creating a sample appointment
    console.log('\n5. Testing appointment creation...');
    
    // First, ensure we have a customer and service
    let customer = await Customer.findOne();
    if (!customer) {
      customer = await Customer.create({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '123-456-7890'
      });
      console.log('   Created test customer');
    }

    let service = await Service.findOne();
    if (!service) {
      service = await Service.create({
        name: 'Test Service',
        slug: 'test-service',
        description: 'Test service for verification',
        duration: 60,
        price: 50.00,
        category: 'test'
      });
      console.log('   Created test service');
    }

    // Create a test appointment
    const testAppointment = await Appointment.create({
      customerId: customer.id,
      serviceId: service.id,
      appointmentDate: '2024-01-15',
      startTime: '10:00:00',
      endTime: '11:00:00',
      totalPrice: service.price,
      status: 'confirmed'
    });

    console.log('✅ Test appointment created successfully');
    console.log(`   Appointment ID: ${testAppointment.id}`);

    // Verify the appointment was saved
    const savedAppointment = await Appointment.findByPk(testAppointment.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Service, as: 'service' }
      ]
    });

    if (savedAppointment) {
      console.log('✅ Appointment data verified in database');
      console.log(`   Customer: ${savedAppointment.customer.name}`);
      console.log(`   Service: ${savedAppointment.service.name}`);
      console.log(`   Date: ${savedAppointment.appointmentDate}`);
      console.log(`   Time: ${savedAppointment.startTime}`);
    }

    // Clean up test data
    await testAppointment.destroy();
    console.log('   Test appointment cleaned up');

    console.log('\n🎉 All database tests passed!');
    console.log('\n📋 Database is ready for use.');
    console.log('   You can now create appointments through the API.');

  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.error('\n📋 Troubleshooting tips:');
    console.error('   1. Check your .env file has correct database credentials');
    console.error('   2. Ensure Supabase tables are created');
    console.error('   3. Verify network connectivity to Supabase');
    console.error('   4. Check if database password is correct');
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Run the test
testDatabaseConnection(); 