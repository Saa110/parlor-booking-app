-- Fix RLS Policies for Parlor Booking App
-- Run this in your Supabase SQL Editor to allow insertions

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;

-- Create new policies that allow public access for our app
-- Allow all operations on customers table
CREATE POLICY "Allow all operations on customers" ON customers
    FOR ALL USING (true);

-- Allow all operations on services table (already exists, but ensure it's there)
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Allow all operations on services" ON services
    FOR ALL USING (true);

-- Allow all operations on appointments table
CREATE POLICY "Allow all operations on appointments" ON appointments
    FOR ALL USING (true);

-- Alternative: If you want more restrictive policies, use these instead:
-- (Uncomment the lines below and comment out the "Allow all operations" policies above)

-- CREATE POLICY "Allow insert on customers" ON customers
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow select on customers" ON customers
--     FOR SELECT USING (true);

-- CREATE POLICY "Allow update on customers" ON customers
--     FOR UPDATE USING (true);

-- CREATE POLICY "Allow insert on appointments" ON appointments
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow select on appointments" ON appointments
--     FOR SELECT USING (true);

-- CREATE POLICY "Allow update on appointments" ON appointments
--     FOR UPDATE USING (true);

-- CREATE POLICY "Allow delete on appointments" ON appointments
--     FOR DELETE USING (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('customers', 'services', 'appointments')
ORDER BY tablename, policyname; 