#!/usr/bin/env node

/**
 * Database Structure Check Script
 * Checks the current structure of tables in Supabase
 */

const { supabase } = require('./config/supabase');

async function checkDatabaseStructure() {
  console.log('🔍 Checking database structure...\n');

  try {
    // Check what tables exist
    console.log('📋 Checking existing tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['customers', 'services', 'appointments']);

    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message);
    } else {
      console.log('✅ Found tables:', tables.map(t => t.table_name));
    }

    // Check customers table structure
    console.log('\n📊 Checking customers table structure...');
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    if (customersError) {
      console.log('❌ Customers table error:', customersError.message);
    } else {
      console.log('✅ Customers table is accessible');
      if (customersData && customersData.length > 0) {
        console.log('   Sample data:', Object.keys(customersData[0]));
      }
    }

    // Check services table structure
    console.log('\n📊 Checking services table structure...');
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(1);

    if (servicesError) {
      console.log('❌ Services table error:', servicesError.message);
    } else {
      console.log('✅ Services table is accessible');
      if (servicesData && servicesData.length > 0) {
        console.log('   Sample data:', Object.keys(servicesData[0]));
      }
    }

    // Check appointments table structure
    console.log('\n📊 Checking appointments table structure...');
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (appointmentsError) {
      console.log('❌ Appointments table error:', appointmentsError.message);
    } else {
      console.log('✅ Appointments table is accessible');
      if (appointmentsData && appointmentsData.length > 0) {
        console.log('   Sample data:', Object.keys(appointmentsData[0]));
      }
    }

    // Try to create a test appointment directly with Supabase
    console.log('\n🧪 Testing appointment creation with Supabase...');
    
    // First, get or create a customer
    let customer = null;
    const { data: existingCustomers } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    if (existingCustomers && existingCustomers.length > 0) {
      customer = existingCustomers[0];
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '123-456-7890'
        })
        .select()
        .single();

      if (customerError) {
        console.log('❌ Error creating customer:', customerError.message);
      } else {
        customer = newCustomer;
        console.log('✅ Created test customer');
      }
    }

    // Get or create a service
    let service = null;
    const { data: existingServices } = await supabase
      .from('services')
      .select('*')
      .limit(1);

    if (existingServices && existingServices.length > 0) {
      service = existingServices[0];
    } else {
      const { data: newService, error: serviceError } = await supabase
        .from('services')
        .insert({
          name: 'Test Service',
          slug: 'test-service',
          description: 'Test service',
          duration: 60,
          price: 50.00,
          category: 'test'
        })
        .select()
        .single();

      if (serviceError) {
        console.log('❌ Error creating service:', serviceError.message);
      } else {
        service = newService;
        console.log('✅ Created test service');
      }
    }

    if (customer && service) {
      // Create a test appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          customer_id: customer.id,
          service_id: service.id,
          appointment_date: '2024-01-15',
          start_time: '10:00:00',
          end_time: '11:00:00',
          total_price: service.price,
          status: 'confirmed'
        })
        .select()
        .single();

      if (appointmentError) {
        console.log('❌ Error creating appointment:', appointmentError.message);
      } else {
        console.log('✅ Test appointment created successfully');
        console.log('   Appointment ID:', appointment.id);
        console.log('   Customer:', customer.name);
        console.log('   Service:', service.name);
        console.log('   Date:', appointment.appointment_date);
        console.log('   Time:', appointment.start_time);

        // Clean up
        await supabase
          .from('appointments')
          .delete()
          .eq('id', appointment.id);
        console.log('   Test appointment cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Structure check failed:', error.message);
  }
}

// Run the check
checkDatabaseStructure(); 