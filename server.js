const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Database imports
const { testConnection, sequelize } = require('./config/database');
const { testSupabaseConnection } = require('./config/supabase');
const { initializeDatabase } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Test database connections
testConnection();
testSupabaseConnection();

// Initialize database and models
initializeDatabase().catch(console.error);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API routes
app.use('/api/calendar', require('./api/calendar-integration'));
app.use('/api/appointments', require('./api/appointments'));
app.use('/api/services', require('./api/services'));
app.use('/api/customers', require('./api/customers'));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        await sequelize.authenticate();
        
        // Test Supabase connection
        const supabaseConnected = await testSupabaseConnection();
        
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            database: 'connected',
            supabase: supabaseConnected ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            database: 'disconnected',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Parlor Booking App server running on port ${PORT}`);
    console.log(`📱 Frontend available at: http://localhost:${PORT}`);
    console.log(`🔧 API available at: http://localhost:${PORT}/api`);
    console.log(`💚 Health check at: http://localhost:${PORT}/health`);
    console.log(`☁️  Supabase Dashboard: https://app.supabase.com/project/swiwraumksfkkjxjftck`);
});

module.exports = app; 