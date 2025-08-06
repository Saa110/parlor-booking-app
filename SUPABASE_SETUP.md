# Supabase Setup Guide for Parlor Booking App

This guide will help you set up your Parlor Booking App with Supabase as the database backend.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp env.example .env
```

Edit your `.env` file with your Supabase credentials:
```env
# Supabase Configuration
SUPABASE_URL=https://swiwraumksfkkjxjftck.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aXdyYXVta3Nma2tqeGpmdGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTYzOTgsImV4cCI6MjA2OTQzMjM5OH0.2dsonabaAR2SSJfQmkhm9TRdJLDkRxpfHL2ueJ6fxMI

# Database Configuration (Supabase PostgreSQL)
DB_HOST=swiwraumksfkkjxjftck.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_SSL=true
```

### 3. Set Up Database Tables

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com/project/swiwraumksfkkjxjftck)
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/supabase-schema.sql`
4. Click **Run** to execute the SQL

#### Option B: Using Setup Script
```bash
npm run setup:supabase
```

### 4. Start the Development Server
```bash
npm run dev
```

### 5. Test the Setup
Visit: http://localhost:3000/health

You should see:
```json
{
  "status": "OK",
  "database": "connected",
  "supabase": "connected"
}
```

## 📊 Database Schema

### Tables Created

1. **customers** - Customer information
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR)
   - `email` (VARCHAR, UNIQUE)
   - `phone` (VARCHAR)
   - `address` (TEXT)
   - `preferences` (JSONB)
   - `is_active` (BOOLEAN)
   - `created_at`, `updated_at` (TIMESTAMP)

2. **services** - Available beauty services
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR)
   - `slug` (VARCHAR, UNIQUE)
   - `description` (TEXT)
   - `duration` (INTEGER) - minutes
   - `price` (DECIMAL)
   - `category` (VARCHAR)
   - `is_active` (BOOLEAN)
   - `image_url` (VARCHAR)
   - `created_at`, `updated_at` (TIMESTAMP)

3. **appointments** - Booking appointments
   - `id` (SERIAL PRIMARY KEY)
   - `customer_id` (INTEGER, FOREIGN KEY)
   - `service_id` (INTEGER, FOREIGN KEY)
   - `appointment_date` (DATE)
   - `start_time`, `end_time` (TIME)
   - `status` (VARCHAR) - pending, confirmed, cancelled, completed
   - `calendar_event_id` (VARCHAR)
   - `special_requests` (TEXT)
   - `total_price` (DECIMAL)
   - `payment_status` (VARCHAR) - pending, paid, refunded
   - `notes` (TEXT)
   - `cancelled_at`, `cancelled_by` (TIMESTAMP, VARCHAR)
   - `created_at`, `updated_at` (TIMESTAMP)

### Initial Data

The schema includes 6 pre-configured services:
- Hair Styling ($75, 90 min)
- Makeup Application ($95, 120 min)
- Facial Treatment ($65, 60 min)
- Manicure & Pedicure ($55, 90 min)
- Waxing Services ($35, 45 min)
- Bridal Package ($250, 240 min)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://swiwraumksfkkjxjftck.supabase.co` |
| `SUPABASE_KEY` | Your Supabase anon key | Your provided key |
| `DB_HOST` | Database host | `swiwraumksfkkjxjftck.supabase.co` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `postgres` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | Your password |
| `DB_SSL` | SSL connection | `true` |

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Public read access** to services
- **Authenticated user policies** for appointments
- **Automatic timestamps** for created_at/updated_at
- **Data validation** with check constraints

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Services
```bash
GET /api/services                    # Get all services
GET /api/services/:id               # Get service by ID
POST /api/services                  # Create new service
PUT /api/services/:id              # Update service
DELETE /api/services/:id           # Delete service
GET /api/services/categories/list  # Get service categories
```

### Customers
```bash
GET /api/customers                 # Get all customers
GET /api/customers/:id            # Get customer by ID
POST /api/customers               # Create new customer
PUT /api/customers/:id           # Update customer
DELETE /api/customers/:id        # Deactivate customer
GET /api/customers/:id/appointments # Get customer appointments
GET /api/customers/search/:query  # Search customers
```

### Appointments
```bash
GET /api/appointments              # Get all appointments
GET /api/appointments/:id         # Get appointment by ID
POST /api/appointments            # Create new appointment
PUT /api/appointments/:id        # Update appointment
DELETE /api/appointments/:id     # Cancel appointment
GET /api/appointments/availability/:date?serviceId=1 # Check availability
```

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check your Supabase URL and key
   - Verify your database password
   - Ensure SSL is enabled

2. **Tables Don't Exist**
   - Run the SQL schema in Supabase dashboard
   - Check the SQL Editor for any errors

3. **Permission Denied**
   - Verify RLS policies are set correctly
   - Check if you're using the correct API key

4. **Data Not Seeding**
   - Check if services table exists
   - Verify the insert statements in the schema

### Debug Commands

```bash
# Test Supabase connection
npm run setup:supabase

# Check health endpoint
curl http://localhost:3000/health

# View logs
npm run dev
```

## 🔗 Useful Links

- **Supabase Dashboard**: https://app.supabase.com/project/swiwraumksfkkjxjftck
- **Supabase Documentation**: https://supabase.com/docs
- **API Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 📞 Support

If you encounter any issues:

1. Check the Supabase dashboard for database errors
2. Review the server logs for connection issues
3. Verify your environment variables
4. Test the health endpoint for connection status

---

**Happy coding! 🎉** 