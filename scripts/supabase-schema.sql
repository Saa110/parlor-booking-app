-- Supabase Database Schema for Parlor Booking App
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 60, -- Duration in minutes
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    calendar_event_id VARCHAR(255),
    special_requests TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    notes TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to services
CREATE POLICY "Services are viewable by everyone" ON services
    FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (auth.uid()::text = customer_id::text);

CREATE POLICY "Users can create their own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

CREATE POLICY "Users can update their own appointments" ON appointments
    FOR UPDATE USING (auth.uid()::text = customer_id::text);

-- Insert initial services data
INSERT INTO services (name, slug, description, duration, price, category, is_active) VALUES
('Hair Styling', 'hair-styling', 'Professional hair styling and cutting services', 90, 75.00, 'hair', true),
('Makeup Application', 'makeup', 'Professional makeup application for all occasions', 120, 95.00, 'makeup', true),
('Facial Treatment', 'facial', 'Rejuvenating facial treatments for healthy skin', 60, 65.00, 'skincare', true),
('Manicure & Pedicure', 'manicure-pedicure', 'Complete nail care and grooming services', 90, 55.00, 'nails', true),
('Waxing Services', 'waxing', 'Professional waxing for smooth skin', 45, 35.00, 'hair-removal', true),
('Bridal Package', 'bridal-package', 'Complete bridal package including hair, makeup, and styling', 240, 250.00, 'bridal', true)
ON CONFLICT (slug) DO NOTHING;

-- Create a view for appointment details
CREATE OR REPLACE VIEW appointment_details AS
SELECT 
    a.id,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.status,
    a.total_price,
    a.special_requests,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    s.name as service_name,
    s.duration as service_duration,
    s.category as service_category
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN services s ON a.service_id = s.id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 