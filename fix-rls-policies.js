const { supabase } = require('./config/supabase');

async function fixRLSPolicies() {
    console.log('🔧 Fixing RLS policies in Supabase...\n');
    
    try {
        // Test if we can insert a customer (this will fail if RLS is blocking)
        console.log('🧪 Testing current RLS policies...');
        
        const testCustomer = {
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '+1234567890'
        };
        
        const { data, error } = await supabase
            .from('customers')
            .insert(testCustomer);
        
        if (error) {
            console.log('❌ RLS policies are blocking insertions:', error.message);
            console.log('\n📋 To fix this, you need to run the SQL script in your Supabase dashboard:');
            console.log('1. Go to: https://app.supabase.com/project/swiwraumksfkkjxjftck');
            console.log('2. Click "SQL Editor" in the left sidebar');
            console.log('3. Copy and paste the contents of scripts/fix-rls-policies.sql');
            console.log('4. Click "Run" to execute the SQL');
            console.log('\n🔗 Or run this command to open the file:');
            console.log('cat scripts/fix-rls-policies.sql');
        } else {
            console.log('✅ RLS policies are working correctly!');
            
            // Clean up the test customer
            await supabase
                .from('customers')
                .delete()
                .eq('email', 'test@example.com');
        }
        
    } catch (error) {
        console.log('❌ Error testing RLS policies:', error.message);
    }
}

// Run the fix
fixRLSPolicies(); 