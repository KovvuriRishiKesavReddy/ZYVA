const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Test server is running!', 
        timestamp: new Date().toISOString(),
        message: 'This is a test server to verify the login functionality'
    });
});

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Simple mock authentication
    if (email === 'test@example.com' && password === 'password123') {
        res.json({
            success: true,
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: {
                id: '1',
                email: email,
                firstName: 'Test',
                lastName: 'User',
                isGoogleConnected: false
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid email or password'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET  /api/health');
    console.log('- POST /api/auth/login');
    console.log('');
    console.log('Test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down test server...');
    process.exit(0);
});


