const { supabase } = require('./config/supabase');

async function insertDummyData() {
    console.log('🎭 Inserting dummy records into Supabase database...\n');
    
    try {
        // Insert dummy customers
        console.log('👥 Inserting dummy customers...');
        const dummyCustomers = [
            {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@example.com',
                phone: '+1234567890',
                address: '123 Main St, New York, NY 10001',
                preferences: { preferred_time: 'morning', notes: 'Allergic to certain hair products' }
            },
            {
                name: 'Michael Chen',
                email: 'michael.chen@example.com',
                phone: '+1987654321',
                address: '456 Oak Ave, Los Angeles, CA 90210',
                preferences: { preferred_time: 'afternoon', notes: 'Prefers natural products' }
            },
            {
                name: 'Emily Rodriguez',
                email: 'emily.rodriguez@example.com',
                phone: '+1555123456',
                address: '789 Pine Rd, Miami, FL 33101',
                preferences: { preferred_time: 'evening', notes: 'Bridal package customer' }
            }
        ];

        for (const customer of dummyCustomers) {
            const { data, error } = await supabase
                .from('customers')
                .insert(customer);
            
            if (error) {
                console.log(`❌ Error inserting customer ${customer.name}:`, error.message);
            } else {
                console.log(`✅ Inserted customer: ${customer.name}`);
            }
        }

        // Insert dummy appointments
        console.log('\n📅 Inserting dummy appointments...');
        const dummyAppointments = [
            {
                customer_id: 1, // Will be updated with actual customer ID
                service_id: 1,  // Hair Styling
                appointment_date: '2024-02-15',
                start_time: '10:00',
                end_time: '11:30',
                status: 'confirmed',
                total_price: 75.00,
                special_requests: 'Hair coloring and styling for wedding',
                payment_status: 'paid'
            },
            {
                customer_id: 2, // Will be updated with actual customer ID
                service_id: 2,  // Makeup
                appointment_date: '2024-02-16',
                start_time: '14:00',
                end_time: '16:00',
                status: 'confirmed',
                total_price: 95.00,
                special_requests: 'Natural makeup look',
                payment_status: 'paid'
            },
            {
                customer_id: 3, // Will be updated with actual customer ID
                service_id: 6,  // Bridal Package
                appointment_date: '2024-02-20',
                start_time: '09:00',
                end_time: '13:00',
                status: 'pending',
                total_price: 250.00,
                special_requests: 'Complete bridal package with hair, makeup, and styling',
                payment_status: 'pending'
            }
        ];

        // Get actual customer IDs first
        const { data: customers } = await supabase
            .from('customers')
            .select('id, name')
            .order('created_at', { ascending: false })
            .limit(3);

        if (customers && customers.length > 0) {
            for (let i = 0; i < Math.min(dummyAppointments.length, customers.length); i++) {
                const appointment = dummyAppointments[i];
                appointment.customer_id = customers[i].id;
                
                const { data, error } = await supabase
                    .from('appointments')
                    .insert(appointment);
                
                if (error) {
                    console.log(`❌ Error inserting appointment for ${customers[i].name}:`, error.message);
                } else {
                    console.log(`✅ Inserted appointment for: ${customers[i].name} on ${appointment.appointment_date}`);
                }
            }
        }

        // Show summary
        console.log('\n📊 Database Summary:');
        
        const { data: finalCustomers } = await supabase
            .from('customers')
            .select('*');
        
        const { data: finalAppointments } = await supabase
            .from('appointments')
            .select('*');
        
        const { data: finalServices } = await supabase
            .from('services')
            .select('*');
        
        console.log(`👥 Total Customers: ${finalCustomers?.length || 0}`);
        console.log(`📅 Total Appointments: ${finalAppointments?.length || 0}`);
        console.log(`💇‍♀️ Total Services: ${finalServices?.length || 0}`);
        
        console.log('\n🎉 Dummy data insertion complete!');
        console.log('📱 Check your Supabase dashboard to see the new records.');
        
    } catch (error) {
        console.log('❌ Error inserting dummy data:', error.message);
    }
}

// Run the insertion
insertDummyData(); 