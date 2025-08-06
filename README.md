# Signature Salon - Luxury Beauty & Wellness

A modern, elegant web application for Signature Salon, offering comprehensive beauty and wellness services with online booking capabilities.

## 🌟 Features

- **Elegant Design**: Modern, artistic landing page with gradient effects and smooth animations
- **Comprehensive Services**: 10+ service categories including hair styling, makeup, spa treatments, and more
- **Online Booking**: Easy appointment booking system with real-time availability
- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Secure Backend**: Supabase-powered database with authentication and security
- **Business Integration**: Google Calendar, email notifications, and payment processing ready

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- Google Calendar API (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/signature-salon.git
   cd signature-salon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your actual credentials:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   
   # Database Configuration
   DB_HOST=your_supabase_db_host
   DB_USER=your_supabase_db_user
   DB_PASSWORD=your_supabase_db_password
   
   # Security
   SESSION_SECRET=your_session_secret_key_here
   JWT_SECRET=your_jwt_secret_key_here
   
   # Business Configuration
   BUSINESS_NAME=Signature Salon
   BUSINESS_PHONE=+971501234567
   BUSINESS_EMAIL=info@signaturesalon.ae
   ```

4. **Set up Supabase Database**
   ```bash
   npm run setup-database
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `DB_HOST` | Database host | `aws-0-ap-southeast-1.pooler.supabase.com` |
| `DB_USER` | Database username | `postgres.your-project` |
| `DB_PASSWORD` | Database password | `your-secure-password` |
| `SESSION_SECRET` | Session encryption key | `your-random-secret-key` |
| `JWT_SECRET` | JWT signing secret | `your-jwt-secret-key` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `BUSINESS_NAME` | Salon name | `Signature Salon` |
| `BUSINESS_PHONE` | Contact phone | `+971501234567` |
| `BUSINESS_EMAIL` | Contact email | `info@signaturesalon.ae` |

## 🛡️ Security Checklist

Before pushing to GitHub, ensure you have:

- ✅ **Removed all hardcoded credentials** from code files
- ✅ **Created `.env` file** with actual credentials (not committed)
- ✅ **Updated `env.example`** with placeholder values
- ✅ **Verified `.gitignore`** includes `.env` files
- ✅ **Removed any API keys** from configuration files
- ✅ **Updated business information** to use placeholder data
- ✅ **Secured database connections** to use environment variables only

### Files to Check for Sensitive Data:
- `config/supabase.js` ✅ (Updated)
- `config/database.js` ✅ (Updated)
- `env.example` ✅ (Updated)
- Any `.env` files (should not be committed)

## 📁 Project Structure

```
signature-salon/
├── index.html              # Main landing page
├── styles.css              # Custom styles
├── script.js               # Frontend JavaScript
├── server.js               # Express server
├── package.json            # Dependencies
├── env.example             # Environment template
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── config/                 # Configuration files
│   ├── database.js         # Database configuration
│   └── supabase.js         # Supabase client
├── api/                    # API routes
├── models/                 # Database models
└── scripts/                # Setup scripts
```

## 🎨 Services Offered

### Hair Services
- **Hairstyling** - AED 150 - AED 400
- **Hair Color & Extensions** - AED 200 - AED 800
- **Blow dry, Shampoo & Conditioning**

### Beauty Services
- **Makeup Services** - AED 200 - AED 500
- **Eyelash Extensions** - AED 300 - AED 600
- **Nail Services** - AED 80 - AED 200

### Wellness Services
- **Spa & Massage** - AED 150 - AED 400
- **Skin Treatments** - AED 120 - AED 350
- **Hair Removal** - AED 50 - AED 150

### Special Services
- **Bridal Services** - AED 800 - AED 1500
- **Beauty Products** - AED 50 - AED 500

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Deployment
1. Set up your production environment variables
2. Configure your domain and SSL certificates
3. Set up your database and Supabase project
4. Deploy to your preferred hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email info@signaturesalon.ae or create an issue in this repository.

---

**Note**: This is a production-ready application. Ensure all security measures are in place before deploying to production. 