const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { google } = require('googleapis'); // For Google Calendar
const { GridFSBucket } = require('mongodb');
const jwt = require('jsonwebtoken'); 
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Your MongoDB connection string - KEEP THIS SECRET!
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'zyva_healthcare';
const USERS_COLLECTION = process.env.COLLECTION_NAME || 'users';
const ORDERS_COLLECTION = 'orders';
const APPOINTMENTS_COLLECTION = 'appointments';
const INSURANCES_COLLECTION = 'insurances';
const REMINDERS_COLLECTION = 'reminders';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://zyva-healthcare-utus.onrender.com';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
const GOOGLE_REGISTER_REDIRECT_URI = process.env.GOOGLE_REGISTER_REDIRECT_URI || 'http://localhost:3000/api/auth/google/register/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
// Middleware - Fixed CORS for Render
const allowedOrigins = [
    'https://zyva-healthcare-utus.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const compression = require('compression');
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6, // Balanced compression
    threshold: 1024 // Only compress responses > 1KB
}));

const jwtCache = new Map();
const JWT_CACHE_LIMIT = 1000;
global.loginAttempts = new Map();
global.userCache = new Map();
global.jwtCache = new Map();

function getCachedJWT(userId, email) {
    const cacheKey = `${userId}:${email}`;
    const cached = global.jwtCache?.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
        return cached.token;
    }
    
    // Clean expired tokens
    if (cached && global.jwtCache) {
        global.jwtCache.delete(cacheKey);
    }
    
    return null;
}

function setCachedJWT(userId, email, token) {
    if (!global.jwtCache) {
        global.jwtCache = new Map();
    }
    
    const cacheKey = `${userId}:${email}`;
    
    // Prevent cache from growing too large
    if (global.jwtCache.size >= JWT_CACHE_LIMIT) {
        const firstKey = global.jwtCache.keys().next().value;
        global.jwtCache.delete(firstKey);
    }
    
    global.jwtCache.set(cacheKey, {
        token,
        expires: Date.now() + (6 * 24 * 60 * 60 * 1000) // 6 days (less than JWT expiry)
    });
}
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    req.setTimeout(30000, () => {
        res.status(408).json({ error: 'Request timeout' });
    });
    next();
});

// --- Google OAuth2 Client Setup ---
const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);
// Create a separate OAuth2 client for the registration flow
const oauth2ClientRegister = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REGISTER_REDIRECT_URI
);

let db;
let server;
// Add this at the top of your server.js file, after imports but before other code:

// Enhanced error handling
process.on('uncaughtException', (error) => {
    console.error('=== UNCAUGHT EXCEPTION ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Time:', new Date().toISOString());
    console.error('========================');
    
    // Don't exit - just log and continue
    // The server should stay running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('=== UNHANDLED REJECTION ===');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    console.error('Time:', new Date().toISOString());
    console.error('==========================');
    
    // Don't exit - just log and continue
});

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Access token required' 
            });
        }

        // Handle dummy token for testing
        if (token === 'dummy-token-for-testing') {
            req.user = { 
                id: 'dummy-user-id', 
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User'
            };
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Use lean query for better performance
        const user = await db.collection(USERS_COLLECTION).findOne(
            { _id: new ObjectId(decoded.id) },
            { 
                projection: { 
                    passwordHash: 0, 
                    passwordSalt: 0
                } 
            }
        );
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        req.user = user;
        req.user.id = decoded.id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                error: 'Token expired' 
            });
        }
        return res.status(403).json({ 
            success: false, 
            error: 'Invalid token' 
        });
    }
};
async function createOptimizedIndexes() {
    try {
        console.log('Checking and creating optimized indexes...');
        
        // Check existing indexes first
        const existingIndexes = await db.collection(USERS_COLLECTION).listIndexes().toArray();
        const indexNames = existingIndexes.map(idx => idx.name);
        
        console.log('Existing indexes:', indexNames);
        
        // Only create indexes that don't exist
        const indexesToCreate = [];
        
        // Check for email index
        const hasEmailIndex = indexNames.some(name => 
            name.includes('email') || name === 'email_1' || name === 'email_unique_idx'
        );
        
        if (!hasEmailIndex) {
            indexesToCreate.push({
                key: { email: 1 },
                options: { 
                    unique: true,
                    background: true,
                    name: 'email_unique_idx'
                }
            });
        }
        
        // Check for compound email-status index
        const hasEmailStatusIndex = indexNames.some(name => 
            name.includes('email_status') || name === 'email_status_idx'
        );
        
        if (!hasEmailStatusIndex) {
            indexesToCreate.push({
                key: { email: 1, status: 1 },
                options: {
                    background: true,
                    name: 'email_status_idx'
                }
            });
        }
        
        // Create only the missing indexes
        for (const index of indexesToCreate) {
            try {
                await db.collection(USERS_COLLECTION).createIndex(index.key, index.options);
                console.log(`Created index: ${index.options.name}`);
            } catch (createError) {
                console.log(`Index ${index.options.name} might already exist:`, createError.message);
            }
        }
        
        if (indexesToCreate.length === 0) {
            console.log('All required indexes already exist');
        }
        
        console.log('Index optimization completed successfully');
        
    } catch (error) {
        console.error('Index optimization error (non-critical):', error.message);
        // Don't throw error - this shouldn't stop server startup
    }
}

// ALTERNATIVE: If you want to see all indexes and clean up duplicates:
async function createOptimizedIndexesWithCleanup() {
    try {
        console.log('Analyzing existing indexes...');
        
        // List all existing indexes
        const existingIndexes = await db.collection(USERS_COLLECTION).listIndexes().toArray();
        
        console.log('Current indexes:');
        existingIndexes.forEach(idx => {
            console.log(`- ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''}`);
        });
        
        // Check if we have the basic email index (either email_1 or email_unique_idx)
        const emailIndexes = existingIndexes.filter(idx => 
            Object.keys(idx.key).includes('email') && Object.keys(idx.key).length === 1
        );
        
        if (emailIndexes.length === 0) {
            // No email index exists, create one
            await db.collection(USERS_COLLECTION).createIndex(
                { email: 1 }, 
                { unique: true, background: true, name: 'email_unique_idx' }
            );
            console.log('Created email unique index');
        } else {
            console.log('Email index already exists:', emailIndexes[0].name);
        }
        
        // Check for compound email-status index
        const compoundIndex = existingIndexes.find(idx => 
            Object.keys(idx.key).includes('email') && 
            Object.keys(idx.key).includes('status') &&
            Object.keys(idx.key).length === 2
        );
        
        if (!compoundIndex) {
            await db.collection(USERS_COLLECTION).createIndex(
                { email: 1, status: 1 },
                { background: true, name: 'email_status_idx' }
            );
            console.log('Created email-status compound index');
        } else {
            console.log('Email-status compound index already exists:', compoundIndex.name);
        }
        
        console.log('Login optimization indexes verified/created successfully');
        
    } catch (error) {
        console.error('Index creation error (non-critical):', error.message);
        // Continue server startup even if index creation fails
    }
}


// MongoDB connection options
const mongoOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 20, // Increase connection pool
    minPoolSize: 5,  // Maintain minimum connections
    maxIdleTimeMS: 30000,
    // Connection compression for faster data transfer
    compressors: ['snappy', 'zlib'],
    // Read preference for faster reads
    readPreference: 'primaryPreferred'
};
// Nodemailer (Gmail) setup
let emailTransporter = null;

if (process.env.COMPANY_EMAIL && process.env.COMPANY_EMAIL_PASSWORD) {
    emailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.COMPANY_EMAIL,
            pass: process.env.COMPANY_EMAIL_PASSWORD
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000
    });

    // Test the connection with timeout
    const testConnection = () => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection test timeout'));
            }, 15000); // 15 second timeout

            emailTransporter.verify((error, success) => {
                clearTimeout(timeout);
                if (error) {
                    reject(error);
                } else {
                    resolve(success);
                }
            });
        });
    };

    // Test connection with retry logic
    testConnection()
        .then(() => {
            console.log('✅ Gmail service ready for:', process.env.COMPANY_EMAIL);
        })
        .catch(error => {
            console.error('❌ Gmail configuration error:', error.message);
            
            if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
                console.error('🔧 Network timeout - this is common on Render. Email service will retry connections automatically.');
                // Don't disable emailTransporter - just log the issue
            } else if (error.message.includes('Invalid login')) {
                console.error('🔧 Solution: Make sure you are using an App Password, not your regular Gmail password');
                console.error('🔗 Generate App Password at: https://myaccount.google.com/apppasswords');
                emailTransporter = null; // Disable if auth issue
            } else {
                console.error('🔧 Other email error:', error.message);
            }
        });
} else {
    console.warn('⚠️  Company email credentials missing in .env file');
}

// IMPROVED: Replace your sendConfirmationEmail function with this version:
async function sendConfirmationEmail(userId, subject, htmlBody) {
    console.log('=== SENDING EMAIL ===');
    console.log('User ID:', userId);
    console.log('Subject:', subject);
    console.log('Email service available:', !!emailTransporter);
    
    if (!db) {
        console.error('❌ DB not connected, cannot send email.');
        return { success: false, error: 'Database not connected' };
    }

    if (!emailTransporter) {
        console.warn('⚠️  Gmail service not configured, skipping email send.');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const user = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(userId) });

        if (!user || !user.email) {
            console.info(`ℹ️  User ${userId} not found or missing email`);
            return { success: false, error: 'User not found or missing email' };
        }

        const mailOptions = {
            from: {
                name: 'ZYVA Healthcare',
                address: process.env.COMPANY_EMAIL
            },
            to: user.email,
            subject: subject,
            html: htmlBody,
            replyTo: process.env.COMPANY_EMAIL
        };

        // Add retry logic for email sending
        let attempt = 0;
        const maxAttempts = 3;
        
        while (attempt < maxAttempts) {
            try {
                console.log(`📧 Sending email attempt ${attempt + 1}/${maxAttempts} to ${user.email}`);
                
                const result = await emailTransporter.sendMail(mailOptions);
                
                console.log(`✅ Email sent successfully to ${user.email}`);
                console.log('📨 Subject:', subject);
                console.log('🆔 Message ID:', result.messageId);
                
                return { success: true, messageId: result.messageId };
                
            } catch (sendError) {
                attempt++;
                console.error(`❌ Email send attempt ${attempt} failed:`, sendError.message);
                
                // If it's a timeout and we have more attempts, wait and retry
                if ((sendError.code === 'ETIMEDOUT' || sendError.message.includes('timeout')) && attempt < maxAttempts) {
                    console.log(`⏳ Waiting 2 seconds before retry...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                
                // If it's the last attempt or a non-timeout error, throw
                throw sendError;
            }
        }
        
    } catch (error) {
        console.error(`❌ Failed to send email for user ${userId}:`, error.message);
        
        // Log specific error types
        if (error.message.includes('Invalid login')) {
            console.error('🔧 Solution: Make sure you are using an App Password, not your regular Gmail password');
            console.error('🔗 Generate App Password at: https://myaccount.google.com/apppasswords');
        } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
            console.error('🔧 Network timeout - common on cloud platforms like Render');
            console.error('💡 Consider using a service like SendGrid or AWS SES for production');
        }
        
        return { success: false, error: error.message };
    }
}
app.get('/api/email/health', authenticateToken, async (req, res) => {
    try {
        if (!emailTransporter) {
            return res.json({
                success: false,
                emailConfigured: false,
                error: 'Email service not configured'
            });
        }

        // Quick connection test
        const testResult = await new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve({ success: false, error: 'Connection timeout' });
            }, 5000);

            emailTransporter.verify((error, success) => {
                clearTimeout(timeout);
                if (error) {
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true });
                }
            });
        });

        res.json({
            emailConfigured: true,
            connectionTest: testResult,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.json({
            success: false,
            emailConfigured: !!emailTransporter,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
// Common email footer
const getEmailFooter = () => {
    return `
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; margin: 10px 0;">
            <em>This is a system-generated email. Please do not reply to this message.</em><br>
            For any issues or questions, please contact us at: 
            <a href="mailto:${process.env.COMPANY_EMAIL || 'zyvahealthcare@gmail.com'}" style="color: #007bff;">
                ${process.env.COMPANY_EMAIL || 'zyvahealthcare@gmail.com'}
            </a>
        </p>
        <p style="font-size: 12px; color: #666; margin: 5px 0;">
            ZYVA Healthcare - Your Health, Our Priority
        </p>
    `;
};

function formatOrderEmail(order) {
    const itemsHtml = order.items.map(item => 
        `<tr>
            <td style="padding: 5px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 5px; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 5px; border: 1px solid #ddd;">₹${(parseFloat(item.totalPrice) || 0).toFixed(2)}</td>
        </tr>`
    ).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">Your ZYVA Order #${order.orderId} is Confirmed!</h2>
            <p>Hi ${order.customerInfo.name},</p>
            <p>Thank you for your order. Here are the details:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;" border="1">
                <thead>
                    <tr>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Quantity</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Price</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            
            <h3 style="margin-top: 15px; color: #28a745;">
                Total: ₹${(parseFloat(order.orderSummary.totalAmount) || 0).toFixed(2)}
            </h3>
            
            <p>Your order will be delivered by ${new Date(order.timestamps.estimatedDelivery).toDateString()}.</p>
            <p>Thank you for choosing ZYVA Healthcare.</p>
            
            ${getEmailFooter()}
        </div>
    `;
}

function formatAppointmentEmail(appointment) {
    const item = appointment.items[0] || {};
    const appointmentType = appointment.type === 'doctor' ? 'Doctor Consultation' : 'Scan Appointment';
    const itemName = appointment.type === 'doctor' ? item.name : (item.scanName || 'N/A');
    const itemDetail = appointment.type === 'doctor' ? item.spec : (item.category || 'N/A');
    
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">Your ZYVA Appointment #${appointment.appointmentId} is Confirmed!</h2>
            <p>Hi,</p>
            <p>Your appointment has been successfully booked. Here are the details:</p>
            
            <ul style="list-style-type: none; padding: 0; background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                <li style="margin: 8px 0;"><strong>Type:</strong> ${appointmentType}</li>
                <li style="margin: 8px 0;"><strong>Details:</strong> ${itemName} (${itemDetail})</li>
                <li style="margin: 8px 0;"><strong>Date:</strong> ${new Date(appointment.schedule.date).toDateString()}</li>
                <li style="margin: 8px 0;"><strong>Time:</strong> ${appointment.schedule.time}</li>
                <li style="margin: 8px 0;"><strong>Location:</strong> ${appointment.schedule.location}</li>
            </ul>
            
            <p>Please arrive 15 minutes early for your appointment.</p>
            <p>Thank you for choosing ZYVA Healthcare.</p>
            
            ${getEmailFooter()}
        </div>
    `;
}

function formatInsuranceEmail(policy) {
    const policiesHtml = policy.policies.map(p => 
        `<tr>
            <td style="padding: 5px; border: 1px solid #ddd;">${p.name}</td>
            <td style="padding: 5px; border: 1px solid #ddd;">${p.provider}</td>
            <td style="padding: 5px; border: 1px solid #ddd;">₹${(p.premium || 0).toLocaleString('en-IN')}</td>
        </tr>`
    ).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">Your ZYVA Insurance Policy #${policy.policyId} is Active!</h2>
            <p>Hi ${policy.customerInfo.name},</p>
            <p>Thank you for purchasing your insurance policy with us. Here are the details:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;" border="1">
                <thead>
                    <tr>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Plan Name</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Provider</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Premium</th>
                    </tr>
                </thead>
                <tbody>${policiesHtml}</tbody>
            </table>
            
            <h3 style="margin-top: 15px; color: #28a745;">
                Total Paid: ₹${(policy.policySummary.totalAmount || 0).toFixed(2)}
            </h3>
            
            <p>Your policy is active from ${new Date(policy.policyStartDate).toDateString()} to ${new Date(policy.policyEndDate).toDateString()}.</p>
            <p>Thank you for choosing ZYVA Healthcare.</p>
            
            ${getEmailFooter()}
        </div>
    `;
}

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log('Connection URI:', MONGODB_URI.replace(/:[^:@]*@/, ':***@'));

MongoClient.connect(MONGODB_URI, mongoOptions)
.then(client => {
    console.log('Connected to MongoDB Atlas');
    db = client.db(DB_NAME);
    
    // Set the database reference in the app context for routes to access
    app.set('db', db);
    createOptimizedIndexes();
    
    // Initialize prescription GridFS service after DB connection
    
// FIXED: Replace your initializePrescriptionService function with this version to remove warnings

const initializePrescriptionService = () => {
    try {
        console.log('Initializing prescription service...');
        
        // Create GridFS bucket for file operations
        global.prescriptionBucket = new GridFSBucket(db, { bucketName: 'prescriptions' });
        
        // Use memory storage instead of GridFS storage for multer
        global.prescriptionUpload = multer({
            storage: multer.memoryStorage(),
            limits: { 
                fileSize: 10 * 1024 * 1024, // 10MB
                files: 1
            },
            fileFilter: (req, file, cb) => {
                const allowedMimes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/jpg', 
                    'image/png'
                ];
                
                console.log('File filter check:', {
                    originalname: file.originalname,
                    mimetype: file.mimetype
                });
                
                if (allowedMimes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, JPG, and PNG files are allowed.`), false);
                }
            }
        });
        
        console.log('Prescription service initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize prescription service:', error);
        return false;
    }
};

    // Call the initialization
    initializePrescriptionService();
    
    // Create indexes for better performance
    db.collection(ORDERS_COLLECTION).createIndex({ orderId: 1 }, { unique: true });
    db.collection(ORDERS_COLLECTION).createIndex({ userId: 1 });
    db.collection(ORDERS_COLLECTION).createIndex({ "customerInfo.email": 1 });
    db.collection(ORDERS_COLLECTION).createIndex({ createdAt: -1 });
    // Appointments indexes
    db.collection(APPOINTMENTS_COLLECTION).createIndex({ appointmentId: 1 }, { unique: true });
    db.collection(APPOINTMENTS_COLLECTION).createIndex({ userId: 1 });
    db.collection(APPOINTMENTS_COLLECTION).createIndex({ createdAt: -1 });
    // Insurance indexes
    db.collection(INSURANCES_COLLECTION).createIndex({ policyId: 1 }, { unique: true });
    db.collection(INSURANCES_COLLECTION).createIndex({ userId: 1 });
    db.collection(INSURANCES_COLLECTION).createIndex({ createdAt: -1 });
    
    // Mount prescriptions routes (GridFS)
    try {
        const createPrescriptionRoutes = require('./routes/prescriptionRoutes');
        const prescriptionRoutes = createPrescriptionRoutes(db, JWT_SECRET, USERS_COLLECTION);
        app.use('/api/prescriptions', prescriptionRoutes); 
        console.log('Prescription routes mounted at /api/prescriptions');
    } catch (e) {
        console.error('Failed to mount prescription routes:', e?.message || e);
    }

    return db.admin().ping();
})
.then(() => {
    console.log('MongoDB connection verified');
})
.catch(error => {
    console.error('MongoDB connection error:', error.message || error);
    console.error('Full error details:', error);
    process.exit(1);
});

// --- Mongoose Connection for Reminder feature ---
mongoose.connect(MONGODB_URI, {
    dbName: DB_NAME,
}).then(() => {
    console.log('Mongoose connected successfully for Reminders feature.');
}).catch(err => {
        console.error('Mongoose connection error:', err.message || err);
});
// IMPROVED: Replace your Google Calendar functions with these enhanced versions

async function createAppointmentCalendarEvents(userId, appointment, appointmentId) {
    try {
        console.log(`[Calendar] Starting calendar event creation for appointment ${appointmentId}`);
        
        const user = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(userId) });
        
        if (!user) {
            console.warn(`[Calendar] User ${userId} not found`);
            return;
        }
        
        if (!user.isGoogleConnected || !user.googleRefreshToken) {
            console.info(`[Calendar] Skipping calendar events for user ${user.email}: Google not connected`);
            return;
        }

        console.log(`[Calendar] Creating events for appointment ${appointmentId} for user ${user.email}`);

        // Get appointment details
        const itemSummary = appointment.items && appointment.items.length > 0 
            ? appointment.items.map(it => it.name || it.scanName || 'Medical Service').join(', ')
            : 'ZYVA Healthcare Appointment';
            
        const { date, time, location } = appointment.schedule;
        
        if (!date || !time) {
            console.error('[Calendar] Missing date or time information');
            return;
        }

        // Create main appointment event
        const appointmentDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        
        appointmentDate.setHours(hours, minutes, 0, 0);
        const appointmentEndDate = new Date(appointmentDate);
        appointmentEndDate.setHours(appointmentEndDate.getHours() + 1); // 1 hour duration

        const eventTitle = `ZYVA Healthcare: ${itemSummary}`;
        const eventDescription = `
Your ${appointment.type === 'doctor' ? 'doctor consultation' : 'medical scan'} appointment is confirmed.

Service: ${itemSummary}
Location: ${location}
Appointment ID: ${appointmentId}
Type: ${appointment.type}
${appointment.notes ? `Notes: ${appointment.notes}` : ''}

Please arrive 15 minutes early.

Thank you for choosing ZYVA Healthcare!
        `.trim();

        console.log(`[Calendar] Creating main appointment event: ${eventTitle}`);
        console.log(`[Calendar] Event time: ${appointmentDate.toISOString()} to ${appointmentEndDate.toISOString()}`);
        
        await createCalendarEvent(userId, {
            summary: eventTitle,
            description: eventDescription,
            startTime: appointmentDate.toISOString(),
            endTime: appointmentEndDate.toISOString(),
            location: location
        });

        // Create reminder events
        await createReminderEvents(userId, appointmentId, itemSummary, appointmentDate, time, location);

        console.log(`[Calendar] All events created successfully for appointment ${appointmentId}`);
    } catch (error) {
        console.error(`[Calendar] Failed to create events for appointment ${appointmentId}:`, error.message);
    }
}

async function createReminderEvents(userId, appointmentId, itemSummary, appointmentDate, time, location) {
    try {
        const now = new Date();
        
        // Day-before reminder (6 AM day before appointment)
        const dayBefore = new Date(appointmentDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        dayBefore.setHours(6, 0, 0, 0);
        
        if (dayBefore > now) {
            const dayBeforeEnd = new Date(dayBefore);
            dayBeforeEnd.setMinutes(dayBefore.getMinutes() + 15);
            
            console.log(`[Calendar] Creating day-before reminder for ${dayBefore.toISOString()}`);
            await createCalendarEvent(userId, {
                summary: `Reminder: ZYVA appointment tomorrow - ${itemSummary}`,
                description: `This is a reminder for your appointment tomorrow at ${time}.\n\nLocation: ${location}\nAppointment ID: ${appointmentId}\n\nPlease arrive 15 minutes early.`,
                startTime: dayBefore.toISOString(),
                endTime: dayBeforeEnd.toISOString(),
                location: location
            });
        }

        // Day-of reminder (6 AM on appointment day)
        const dayOf = new Date(appointmentDate);
        dayOf.setHours(6, 0, 0, 0);
        
        if (dayOf > now && dayOf < appointmentDate) {
            const dayOfEnd = new Date(dayOf);
            dayOfEnd.setMinutes(dayOf.getMinutes() + 15);
            
            console.log(`[Calendar] Creating day-of reminder for ${dayOf.toISOString()}`);
            await createCalendarEvent(userId, {
                summary: `Today: ZYVA appointment - ${itemSummary}`,
                description: `This is a reminder for your appointment today at ${time}.\n\nLocation: ${location}\nAppointment ID: ${appointmentId}\n\nPlease arrive 15 minutes early.`,
                startTime: dayOf.toISOString(),
                endTime: dayOfEnd.toISOString(),
                location: location
            });
        }
    } catch (error) {
        console.error('[Calendar] Failed to create reminder events:', error.message);
    }
}

// IMPROVED: Create Google Calendar event helper
async function createCalendarEvent(userId, eventDetails) {
    try {
        if (!db) {
            console.error('[Calendar] DB not connected, cannot create event');
            return;
        }

        const user = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(userId) });

        if (!user || !user.isGoogleConnected || !user.googleRefreshToken) {
            console.info(`[Calendar] User ${userId} Google account not connected`);
            return;
        }

        console.log(`[Calendar] Creating event: "${eventDetails.summary}" for ${user.email}`);

        // Create OAuth2 client for this user
        const userOauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID, 
            GOOGLE_CLIENT_SECRET
        );
        
        userOauth2Client.setCredentials({ 
            refresh_token: user.googleRefreshToken 
        });

        const calendar = google.calendar({ version: 'v3', auth: userOauth2Client });

        const event = {
            summary: eventDetails.summary,
            description: eventDetails.description,
            start: {
                dateTime: eventDetails.startTime,
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: eventDetails.endTime,
                timeZone: 'Asia/Kolkata',
            },
            location: eventDetails.location,
            attendees: [{ email: user.email }],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 30 },
                    { method: 'email', minutes: 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
            colorId: '2' // Green color for medical appointments
        };

        const result = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        console.log(`[Calendar] ✅ Event created successfully: ${result.data.id}`);
        console.log(`[Calendar] Event link: ${result.data.htmlLink}`);

    } catch (error) {
        const errorMessage = error.message || String(error);
        console.error(`[Calendar] Failed to create event:`, errorMessage);

        // Handle token expiration/invalidation
        if (errorMessage.includes('invalid_grant') || 
            errorMessage.includes('insufficient authentication scopes') ||
            errorMessage.includes('invalid_token')) {
            
            console.log(`[Calendar] Invalidating Google token for user ${userId} due to error: ${errorMessage}`);
            
            try {
                await db.collection(USERS_COLLECTION).updateOne(
                    { _id: new ObjectId(userId) },
                    { 
                        $set: { isGoogleConnected: false }, 
                        $unset: { 
                            googleRefreshToken: "", 
                            googleAccessToken: "", 
                            googleTokenExpiry: "" 
                        } 
                    }
                );
                console.log(`[Calendar] Google token invalidated for user ${userId}`);
            } catch (dbError) {
                console.error(`[Calendar] Failed to invalidate token in DB:`, dbError);
            }
        }
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running!', 
        timestamp: new Date().toISOString(),
        dbConnected: !!db 
    });
});

// --- Import Routes ---
const reminderRoutes = require('./routes/reminders');
const createAuthRoutes = require('./routes/authRoutes');

// Mount auth routes
const authRoutes = createAuthRoutes(db, oauth2ClientRegister, JWT_SECRET, USERS_COLLECTION);
app.use('/api/auth', authRoutes);
console.log('Auth routes mounted immediately');

// ===== PRESCRIPTION MANAGEMENT ENDPOINTS =====

// Prescription health check
app.get('/api/prescriptions/health', (req, res) => {
    res.json({ 
        status: 'Prescription service is running',
        gridFS: !!global.prescriptionBucket,
        storage: !!global.prescriptionStorage,
        upload: !!global.prescriptionUpload,
        timestamp: new Date().toISOString()
    });
});

// Upload prescription file
app.post('/api/prescriptions/upload', authenticateToken, (req, res) => {
    console.log('Upload request received from user:', req.user?.id || 'unknown');
    console.log('User details:', {
        id: req.user?.id,
        email: req.user?.email,
        name: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim()
    });
    
    if (!global.prescriptionUpload) {
        console.error('Upload service not initialized');
        return res.status(503).json({ 
            success: false, 
            error: 'Upload service not initialized' 
        });
    }

    global.prescriptionUpload.single('prescriptionFile')(req, res, async (err) => {
        if (err) {
            console.error('Multer upload error:', err.message);
            
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ 
                    success: false, 
                    error: 'File too large. Maximum size is 10MB.' 
                });
            }
            
            if (err.message && err.message.includes('Invalid file type')) {
                return res.status(400).json({ 
                    success: false, 
                    error: err.message 
                });
            }
            
            return res.status(500).json({ 
                success: false, 
                error: err.message || 'Upload failed' 
            });
        }

        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ 
                success: false, 
                error: 'No file uploaded' 
            });
        }

        try {
            console.log('Processing file upload...');
            console.log('Request body:', req.body);
            
            const userId = req.user.id;
            const timestamp = Date.now();
            const originalName = req.file.originalname;
            
            // NEW: Check if user provided a custom filename
            const customName = req.body?.customFileName?.trim();
            
            let finalFileName;
            if (customName) {
                // User provided custom name - sanitize it and add extension
                const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
                const sanitizedCustomName = customName.replace(/[^a-zA-Z0-9\s-_]/g, '_');
                finalFileName = `${req.user?.firstName || 'user'}_${timestamp}_${sanitizedCustomName}${fileExtension}`;
                console.log('Using custom filename:', finalFileName);
            } else {
                // Use original filename with timestamp
                const sanitizedOriginalName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
                finalFileName = `${req.user?.firstName || 'user'}_${timestamp}_${sanitizedOriginalName}`;
                console.log('Using original filename:', finalFileName);
            }
            
            // Create GridFS upload stream manually
            const uploadStream = global.prescriptionBucket.openUploadStream(finalFileName, {
                metadata: {
                    userId: new ObjectId(userId),
                    description: req.body?.description || '',
                    originalName: originalName,
                    customFileName: customName || null, // Store custom name if provided
                    uploadDate: new Date(),
                    contentType: req.file.mimetype,
                    userEmail: req.user?.email || 'unknown'
                }
            });

            // Handle upload completion
            uploadStream.on('finish', () => {
                console.log(`File uploaded successfully: ${finalFileName} (ID: ${uploadStream.id})`);
                
                res.status(201).json({ 
                    success: true, 
                    message: 'Prescription uploaded successfully',
                    file: {
                        id: String(uploadStream.id),
                        filename: finalFileName,
                        originalName: originalName,
                        customFileName: customName || null,
                        size: req.file.size,
                        uploadDate: new Date().toISOString(),
                        description: req.body?.description || '',
                        contentType: req.file.mimetype
                    }
                });
            });

            // Handle upload errors
            uploadStream.on('error', (uploadError) => {
                console.error('GridFS upload error:', uploadError);
                if (!res.headersSent) {
                    res.status(500).json({ 
                        success: false, 
                        error: 'Failed to save file' 
                    });
                }
            });

            // Pipe the file buffer to GridFS
            const bufferStream = require('stream').Readable.from(req.file.buffer);
            bufferStream.pipe(uploadStream);

        } catch (error) {
            console.error('Upload processing error:', error);
            if (!res.headersSent) {
                res.status(500).json({ 
                    success: false, 
                    error: 'Failed to process upload' 
                });
            }
        }
    });
});

// Updated GET endpoint to show custom names
app.get('/api/prescriptions/user', authenticateToken, async (req, res) => {
    try {
        console.log(`Fetching prescriptions for user: ${req.user.id}`);
        
        // Handle dummy token with mock data
        if (req.user.id === 'dummy-user-id' || 
            req.headers.authorization === 'Bearer dummy-token-for-testing' ||
            req.user.email === 'test@example.com') {
            
            console.log('Returning mock prescription data for testing');
            const mockFiles = [
                {
                    id: '1',
                    filename: 'prescription_dr_smith.pdf',
                    originalName: 'prescription_dr_smith.pdf',
                    customFileName: null,
                    description: 'Follow-up consultation with Dr. Smith',
                    size: 245760,
                    uploadDate: new Date().toISOString(),
                    contentType: 'application/pdf'
                }
            ];
            return res.json({ success: true, files: mockFiles });
        }

        if (!global.prescriptionBucket) {
            return res.status(503).json({ 
                success: false, 
                error: 'File storage service unavailable' 
            });
        }

        let query = {};
        if (ObjectId.isValid(req.user.id)) {
            query = { 'metadata.userId': new ObjectId(req.user.id) };
        } else {
            query = { 'metadata.userId': req.user.id };
        }
        
        console.log('Query for prescriptions:', query);
        
        const cursor = global.prescriptionBucket.find(query);
        const files = await cursor.toArray();
        
        console.log(`Found ${files.length} prescription files for user`);
        
        const mapped = files.map((f) => ({
            id: String(f._id),
            filename: f.filename,
            originalName: f.metadata?.originalName || f.filename,
            customFileName: f.metadata?.customFileName || null, // Include custom name
            description: f.metadata?.description || '',
            size: f.length,
            uploadDate: f.uploadDate || f.metadata?.uploadDate,
            contentType: f.contentType || f.metadata?.contentType || 'application/octet-stream',
        }));
        
        // Sort by upload date (newest first)
        mapped.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        return res.json({ success: true, files: mapped });
    } catch (error) {
        console.error('Fetch prescriptions error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch prescriptions' 
        });
    }
});

// View prescription file
app.get('/api/prescriptions/view/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Handle dummy token
        if (req.user.id === 'dummy-user-id' || 
            req.headers.authorization === 'Bearer dummy-token-for-testing' ||
            req.user.email === 'test@example.com') {
            return res.status(200).send('Mock file content - actual file viewing not available in demo mode');
        }
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid file id' 
            });
        }

        if (!global.prescriptionBucket) {
            return res.status(503).json({ 
                success: false, 
                error: 'File storage service unavailable' 
            });
        }

        const fileDoc = await global.prescriptionBucket.find({ _id: new ObjectId(id) }).next();
        if (!fileDoc) {
            return res.status(404).json({ 
                success: false, 
                error: 'File not found' 
            });
        }

        // Ownership check
        const ownerId = fileDoc.metadata?.userId;
        const isOwner = ownerId && String(ownerId) === String(req.user.id);
        if (!isOwner) {
            return res.status(403).json({ 
                success: false, 
                error: 'Access denied' 
            });
        }

        res.set('Content-Type', fileDoc.contentType || fileDoc.metadata?.contentType || 'application/octet-stream');
        res.set('Content-Disposition', `inline; filename="${fileDoc.metadata?.originalName || fileDoc.filename}"`);

        const downloadStream = global.prescriptionBucket.openDownloadStream(new ObjectId(id));
        downloadStream.on('error', (error) => {
            console.error('Download stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ 
                    success: false, 
                    error: 'Failed to stream file' 
                });
            }
        });
        downloadStream.pipe(res);
    } catch (error) {
        console.error('View file error:', error);
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to stream file' 
            });
        }
    }
});

// Delete prescription file
app.delete('/api/prescriptions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Handle dummy token
        if (req.user.id === 'dummy-user-id' || 
            req.headers.authorization === 'Bearer dummy-token-for-testing' ||
            req.user.email === 'test@example.com') {
            return res.json({ 
                success: true, 
                message: 'Mock deletion successful' 
            });
        }
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid file id' 
            });
        }

        if (!global.prescriptionBucket) {
            return res.status(503).json({ 
                success: false, 
                error: 'File storage service unavailable' 
            });
        }

        const fileDoc = await global.prescriptionBucket.find({ _id: new ObjectId(id) }).next();
        if (!fileDoc) {
            return res.status(404).json({ 
                success: false, 
                error: 'File not found' 
            });
        }
        
        const ownerId = fileDoc.metadata?.userId;
        if (!ownerId || String(ownerId) !== String(req.user.id)) {
            return res.status(403).json({ 
                success: false, 
                error: 'Access denied' 
            });
        }

        await global.prescriptionBucket.delete(new ObjectId(id));
        console.log(`Prescription deleted: ${fileDoc.filename} for user: ${req.user.email || req.user.id}`);
        return res.json({ 
            success: true, 
            message: 'Prescription deleted successfully' 
        });
    } catch (error) {
        console.error('Delete file error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to delete file' 
        });
    }
});

// ===== GOOGLE CALENDAR AUTH ROUTES =====

// Get the Google OAuth2 URL for the registration flow
app.get('/api/auth/google/url-for-register', (req, res) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return res.status(500).json({ success: false, error: 'Google API credentials are not configured on the server.' });
    }
    const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    const url = oauth2ClientRegister.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
    });
    res.json({ success: true, url });
});

// Handle Google OAuth2 callback for registration flow
app.get('/api/auth/google/register/callback', (req, res) => {
    const { code, error: googleError, state } = req.query;

    if (code) {
        // Instead of redirecting immediately, create a landing page that handles the code
        // and preserves form data using JavaScript
        const htmlPage = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Google Connection Success</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; 
                          border-radius: 50%; width: 40px; height: 40px; 
                          animation: spin 2s linear infinite; margin: 20px auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <h2>✅ Google Account Connected Successfully!</h2>
            <div class="spinner"></div>
            <p>Returning to registration form...</p>
            
            <script>
                // This script runs in the callback page and preserves the OAuth code
                const googleCode = '${code}';
                
                // Use postMessage to communicate with parent window (if opened in popup)
                // Or redirect back with code in fragment (client-side accessible)
                if (window.opener) {
                    // If opened in popup
                    window.opener.postMessage({
                        type: 'GOOGLE_OAUTH_SUCCESS',
                        code: googleCode
                    }, window.location.origin);
                    window.close();
                } else {
                    // If opened in same window, redirect back with code in URL fragment
                    setTimeout(() => {
                        window.location.href = '/registration.html#google_code=' + googleCode + '&google_connected=true';
                    }, 1500);
                }
            </script>
        </body>
        </html>
        `;
        
        res.send(htmlPage);
    } else {
        const error = googleError || 'An unknown error occurred during Google authentication.';
        const errorPage = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Google Connection Failed</title>
            <style>body { font-family: Arial, sans-serif; text-align: center; padding: 50px; color: #d32f2f; }</style>
        </head>
        <body>
            <h2>❌ Google Connection Failed</h2>
            <p>Error: ${error}</p>
            <p>Returning to registration form...</p>
            
            <script>
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'GOOGLE_OAUTH_ERROR',
                        error: '${error}'
                    }, window.location.origin);
                    window.close();
                } else {
                    setTimeout(() => {
                        window.location.href = '/registration.html#google_error=' + encodeURIComponent('${error}');
                    }, 2000);
                }
            </script>
        </body>
        </html>
        `;
        
        res.send(errorPage);
    }
});

// ALSO ADD this new endpoint to support popup-based OAuth (optional but recommended)
app.get('/api/auth/google/connect-popup', (req, res) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return res.status(500).json({ success: false, error: 'Google API credentials not configured.' });
    }
    
    const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    const url = oauth2ClientRegister.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
    });
    
    res.json({ success: true, url });
});

// Get the Google OAuth2 URL to initiate the flow
app.get('/api/auth/google/connect', authenticateToken, (req, res) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return res.status(500).json({ success: false, error: 'Google API credentials are not configured on the server.' });
    }
    const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
        state: req.user.id
    });
    res.json({ success: true, url });
});

// Handle Google OAuth2 callback
app.get('/api/auth/google/callback', async (req, res) => {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
        return res.status(400).send('Invalid callback request.');
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);

        const requiredScopes = ['https://www.googleapis.com/auth/calendar.events'];
        const grantedScopes = (tokens.scope || '').split(' ');
        const hasAllRequiredScopes = requiredScopes.every(scope => grantedScopes.includes(scope));

        if (!hasAllRequiredScopes) {
            console.warn(`User ${userId} did not grant all required permissions during connection. Token will not be stored.`);
            return res.redirect('/reminder.html?google_connected=false&error=permission_denied');
        }

        const updateData = {
            googleAccessToken: tokens.access_token,
            googleTokenExpiry: new Date(tokens.expiry_date),
            updatedAt: new Date(),
            isGoogleConnected: true
        };

        if (tokens.refresh_token) {
            updateData.googleRefreshToken = tokens.refresh_token;
        }

        await db.collection(USERS_COLLECTION).updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        console.log(`Google account re-connected for user: ${userId}`);
        res.redirect('/reminder.html?google_connected=true');
    } catch (error) {
        console.error('Error during Google OAuth callback:', error);
        res.status(500).send('Failed to authenticate with Google.');
    }
});

// Get user profile
app.get('/api/user', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        const email = (req.query.email || '').toLowerCase().trim();
        if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email query param required' });
        const user = await db.collection(USERS_COLLECTION).findOne({ email }, {
            projection: { passwordHash: 0 }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        console.error('Fetch user error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Get user profile by id
app.get('/api/user/by-id/:id', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        const id = String(req.params.id || '').trim();

        if (req.user.id !== id) {
            return res.status(403).json({ error: 'Forbidden: You can only access your own profile.' });
        }

        if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Valid user id required' });
        const user = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(id) }, { projection: { passwordHash: 0 } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.isGoogleConnected = !!user.googleRefreshToken;

        res.json({ success: true, user });
    } catch (error) {
        console.error('Fetch user by id error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// ===== ORDER MANAGEMENT ENDPOINTS =====

// Create a new order
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const {
            customerInfo,
            items,
            paymentMethod,
            paymentDetails,
            orderSummary
        } = req.body;

        if (!customerInfo || !items || !paymentMethod || !orderSummary) {
            return res.status(400).json({ error: 'Missing required order data' });
        }

        const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
        
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 3) + 3);

        const orderDoc = {
            orderId,
            userId: new ObjectId(req.user.id),
            customerInfo: customerInfo,
            items: items || [],
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            paymentDetails: {
                method: paymentMethod,
                transactionId,
                status: 'completed',
                ...paymentDetails
            },
            orderSummary: {
                cartTotal: parseFloat(orderSummary.cartTotal) || 0,
                platformFee: parseFloat(orderSummary.platformFee) || 25,
                gstAmount: parseFloat(orderSummary.gstAmount) || 0,
                totalAmount: parseFloat(orderSummary.totalAmount) || 0,
                itemCount: parseInt(orderSummary.itemCount) || 0
            },
            status: 'completed',
            timestamps: {
                orderDate: new Date(),
                paymentDate: new Date(),
                estimatedDelivery
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection(ORDERS_COLLECTION).insertOne(orderDoc);
        console.log('New order created:', orderId, 'for user:', req.user.email);        

        try {
            sendConfirmationEmail(req.user.id, `Your ZYVA Order #${orderId} is Confirmed`, formatOrderEmail(orderDoc));
        } catch (emailError) {
            console.error(`Failed to queue confirmation email for order ${orderId}:`, emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            orderId,
            transactionId,
            insertedId: result.insertedId
        });
    } catch (error) {
        console.error('Order creation error:', error.message || error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create order. Please try again.' 
        });
    }
});

// Get user's orders
app.get('/api/orders/user', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const { 
            status,
            limit = 50,
            page = 1,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        let query = { userId: new ObjectId(req.user.id) };
        if (status) query.status = String(status);
        
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const orders = await db.collection(ORDERS_COLLECTION)
            .find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .toArray();
            
        const total = await db.collection(ORDERS_COLLECTION).countDocuments(query);
        
        const formattedOrders = orders.map(order => ({
            ...order,
            paymentMethod: order.paymentDetails?.method || order.paymentMethod,
            transactionId: order.paymentDetails?.transactionId || order.transactionId,
            totalAmount: order.orderSummary?.totalAmount || order.totalAmount,
            timestamp: order.createdAt || order.timestamps?.orderDate
        }));
        
        res.json({
            success: true,
            orders: formattedOrders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Fetch user orders error:', error.message || error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch orders' 
        });
    }
});

// Get all orders (admin)
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const { 
            email, 
            phone, 
            status,
            limit = 50,
            page = 1,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        let query = {};
        if (email) query['customerInfo.email'] = String(email).toLowerCase().trim();
        if (phone) query['customerInfo.phone'] = String(phone).trim();
        if (status) query.status = String(status);
        
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const orders = await db.collection(ORDERS_COLLECTION)
            .find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .toArray();
            
        const total = await db.collection(ORDERS_COLLECTION).countDocuments(query);
        
        const formattedOrders = orders.map(order => ({
            ...order,
            paymentMethod: order.paymentDetails?.method || order.paymentMethod,
            transactionId: order.paymentDetails?.transactionId || order.transactionId,
            totalAmount: order.orderSummary?.totalAmount || order.totalAmount,
            timestamp: order.createdAt || order.timestamps?.orderDate
        }));
        
        res.json({
            success: true,
            orders: formattedOrders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Fetch orders error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get orders by customer email
app.get('/api/orders/customer/:email', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const email = String(req.params.email || '').toLowerCase().trim();
        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Valid email required' });
        }
        
        if (email !== String(req.user.email).toLowerCase()) {
            return res.status(403).json({ error: 'Forbidden: cannot access other user orders' });
        }
        
        const orders = await db.collection(ORDERS_COLLECTION)
            .find({ 'customerInfo.email': email })
            .sort({ createdAt: -1 })
            .toArray();
            
        const formattedOrders = orders.map(order => ({
            ...order,
            paymentMethod: order.paymentDetails?.method || order.paymentMethod,
            transactionId: order.paymentDetails?.transactionId || order.transactionId,
            totalAmount: order.orderSummary?.totalAmount || order.totalAmount,
            timestamp: order.createdAt || order.timestamps?.orderDate
        }));
        
        res.json({
            success: true,
            orders: formattedOrders
        });
    } catch (error) {
        console.error('Fetch customer orders error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get a specific order by order ID
app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const orderId = String(req.params.orderId || '').trim();
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }
        
        const order = await db.collection(ORDERS_COLLECTION).findOne({ 
            orderId,
            userId: new ObjectId(req.user.id) 
        });
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const formattedOrder = {
            ...order,
            paymentMethod: order.paymentDetails?.method || order.paymentMethod,
            transactionId: order.paymentDetails?.transactionId || order.transactionId,
            totalAmount: order.orderSummary?.totalAmount || order.totalAmount,
            timestamp: order.createdAt || order.timestamps?.orderDate
        };
        
        res.json({
            success: true,
            order: formattedOrder
        });
    } catch (error) {
        console.error('Fetch order error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Update order status
app.patch('/api/orders/:orderId/status', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const orderId = String(req.params.orderId || '').trim();
        const { status } = req.body;
        
        if (!orderId || !status) {
            return res.status(400).json({ error: 'Order ID and status are required' });
        }
        
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const result = await db.collection(ORDERS_COLLECTION).updateOne(
            { 
                orderId,
                userId: new ObjectId(req.user.id)
            },
            { 
                $set: { 
                    status,
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Update order status error:', error.message || error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Get order statistics
app.get('/api/orders/stats/summary', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const stats = await db.collection(ORDERS_COLLECTION).aggregate([
            { $match: { userId: new ObjectId(req.user.id) } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$orderSummary.totalAmount' },
                    averageOrderValue: { $avg: '$orderSummary.totalAmount' }
                }
            }
        ]).toArray();
        
        const statusStats = await db.collection(ORDERS_COLLECTION).aggregate([
            { $match: { userId: new ObjectId(req.user.id) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        res.json({
            success: true,
            stats: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
            statusBreakdown: statusStats
        });
    } catch (error) {
        console.error('Fetch order stats error:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch order statistics' });
    }
});

// ===== APPOINTMENT MANAGEMENT ENDPOINTS =====

// Create a new appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });

        const {
            type = 'scan',
            items,
            date,
            time,
            location,
            notes,
            paymentMethod,
            paymentStatus = 'pending'
        } = req.body || {};

        if (!date || !time || !location) {
            return res.status(400).json({ 
                success: false, 
                error: 'date, time, and location are required' 
            });
        }

        const normalizedItems = Array.isArray(items) ? items : (items ? [items] : []);
        const appointmentId = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const transactionId = paymentMethod ? `ATXN${Date.now()}${Math.floor(Math.random() * 10000)}` : null;

        // Check if appointment already exists (prevent duplicates)
        const existingAppointment = await db.collection(APPOINTMENTS_COLLECTION).findOne({
            userId: new ObjectId(req.user.id),
            'schedule.date': new Date(date),
            'schedule.time': String(time),
            'schedule.location': String(location),
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            console.log('Duplicate appointment detected:', existingAppointment.appointmentId);
            return res.status(400).json({
                success: false,
                error: 'An appointment already exists for this date, time, and location',
                existingAppointmentId: existingAppointment.appointmentId
            });
        }

        const doc = {
            appointmentId,
            userId: new ObjectId(req.user.id),
            type: String(type),
            items: normalizedItems,
            schedule: {
                date: new Date(date),
                time: String(time),
                location: String(location)
            },
            notes: notes ? String(notes) : undefined,
            status: 'pending', // Always start as pending
            payment: { 
                method: paymentMethod || null, 
                transactionId: transactionId || null,
                status: paymentStatus || 'pending'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection(APPOINTMENTS_COLLECTION).insertOne(doc);
        console.log('New appointment created (PENDING):', appointmentId, 'for user:', req.user.email);

        // CRITICAL: Do NOT send emails or create calendar events here
        // Only return appointment details
        return res.status(201).json({ 
            success: true, 
            appointmentId, 
            transactionId, 
            insertedId: result.insertedId,
            status: 'pending',
            paymentStatus: paymentStatus || 'pending',
            message: 'Appointment created. Please complete payment to confirm.'
        });

    } catch (error) {
        console.error('Appointment creation error:', error.message || error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to create appointment' 
        });
    }
});
// Get current user's appointments
app.get('/api/appointments/user', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });

        const {
            limit = 50,
            page = 1,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            type,
            status
        } = req.query || {};

        const query = { userId: new ObjectId(req.user.id) };
        if (type) query.type = String(type);
        if (status) query.status = String(status);

        const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const col = db.collection(APPOINTMENTS_COLLECTION);
        const items = await col.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .toArray();
        const total = await col.countDocuments(query);

        return res.json({ success: true, appointments: items, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        console.error('Fetch user appointments error:', error.message || error);
        return res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
    }
});

// Update appointment status
app.patch('/api/appointments/:appointmentId/status', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        const appointmentId = String(req.params.appointmentId || '').trim();
        const { status } = req.body || {};
        if (!appointmentId || !status) return res.status(400).json({ error: 'appointmentId and status are required' });
        const valid = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const result = await db.collection(APPOINTMENTS_COLLECTION).updateOne(
            { appointmentId, userId: new ObjectId(req.user.id) },
            { $set: { status, updatedAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Appointment not found' });
        return res.json({ success: true, message: 'Appointment status updated' });
    } catch (error) {
        console.error('Update appointment status error:', error.message || error);
        return res.status(500).json({ error: 'Failed to update appointment status' });
    }
});

// ===== INSURANCE MANAGEMENT ENDPOINTS =====

// Create a new insurance policy record
app.post('/api/insurances', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });

        const {
            customerInfo,
            policies,
            paymentMethod,
            paymentDetails,
            policySummary
        } = req.body;

        if (!customerInfo || !policies || !paymentMethod || !policySummary) {
            return res.status(400).json({ success: false, error: 'Missing required policy data' });
        }

        const policyId = `POL${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const transactionId = `ITXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
        
        const policyStartDate = new Date();
        const policyEndDate = new Date();
        policyEndDate.setFullYear(policyEndDate.getFullYear() + 1);

        const policyDoc = {
            policyId,
            userId: new ObjectId(req.user.id),
            customerInfo: {
                name: customerInfo.name || `${req.user.firstName} ${req.user.lastName}`,
                email: customerInfo.email || req.user.email,
                phone: customerInfo.phone
            },
            policies: policies || [],
            paymentMethod,
            transactionId,
            paymentDetails: {
                method: paymentMethod,
                transactionId,
                status: 'completed',
                ...paymentDetails
            },
            policySummary: {
                premiumTotal: parseFloat(policySummary.premiumTotal) || 0,
                platformFee: parseFloat(policySummary.platformFee) || 25,
                gstAmount: parseFloat(policySummary.gstAmount) || 0,
                totalAmount: parseFloat(policySummary.totalAmount) || 0,
                itemCount: parseInt(policySummary.itemCount) || 0
            },
            policyStartDate,
            policyEndDate,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection(INSURANCES_COLLECTION).insertOne(policyDoc);
        console.log('New insurance policy created:', policyId, 'for user:', req.user.email);
        
        try {
            sendConfirmationEmail(req.user.id, `Your ZYVA Insurance Policy #${policyId} is Active`, formatInsuranceEmail(policyDoc));
        } catch (emailError) {
            console.error(`Failed to queue confirmation email for insurance policy ${policyId}:`, emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Insurance policy created successfully',
            policyId,
            transactionId,
            insertedId: result.insertedId
        });
    } catch (error) {
        console.error('Insurance creation error:', error.message || error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create insurance policy. Please try again.' 
        });
    }
});


// Get current user's insurance policies (protected)
app.get('/api/insurances/user', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });

        const query = { userId: new ObjectId(req.user.id) };
        const policies = await db.collection(INSURANCES_COLLECTION).find(query).sort({ createdAt: -1 }).toArray();
        
        return res.json({ success: true, policies });
    } catch (error) {
        console.error('Fetch user insurances error:', error.message || error);
        return res.status(500).json({ success: false, error: 'Failed to fetch insurance policies' });
    }
});
app.get('/api/admin/password-stats', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        // Aggregate password formats in database
        const stats = await db.collection(USERS_COLLECTION).aggregate([
            {
                $project: {
                    email: 1,
                    passwordFormat: {
                        $cond: {
                            if: { $regexMatch: { input: "$passwordHash", regex: /^\$2[ayb]\$/ } },
                            then: "bcrypt",
                            else: {
                                $cond: {
                                    if: { $and: [
                                        { $ne: ["$passwordSalt", null] },
                                        { $ne: ["$passwordSalt", ""] }
                                    ]},
                                    then: "sha256_with_salt",
                                    else: "sha256_legacy"
                                }
                            }
                        }
                    },
                    migratedFrom: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            {
                $group: {
                    _id: "$passwordFormat",
                    count: { $sum: 1 },
                    users: { $push: { email: "$email", migratedFrom: "$migratedFrom" } }
                }
            }
        ]).toArray();
        
        const totalUsers = await db.collection(USERS_COLLECTION).countDocuments();
        
        res.json({
            success: true,
            totalUsers,
            passwordFormats: stats,
            summary: stats.reduce((acc, format) => {
                acc[format._id] = format.count;
                return acc;
            }, {})
        });
        
    } catch (error) {
        console.error('Password stats error:', error);
        res.status(500).json({ error: 'Failed to get password statistics' });
    }
});

// Get users that still need migration
app.get('/api/admin/pending-migrations', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const bcryptUsers = await db.collection(USERS_COLLECTION).find(
            { 
                passwordHash: { $regex: /^\$2[ayb]\$/ },
                status: { $ne: 'deleted' }
            },
            { 
                projection: { 
                    email: 1, 
                    firstName: 1, 
                    lastName: 1,
                    createdAt: 1,
                    updatedAt: 1
                } 
            }
        ).toArray();
        
        res.json({
            success: true,
            pendingMigrations: bcryptUsers.length,
            users: bcryptUsers
        });
        
    } catch (error) {
        console.error('Pending migrations error:', error);
        res.status(500).json({ error: 'Failed to get pending migrations' });
    }
});

// Manual migration endpoint (for bulk migration if needed)
app.post('/api/admin/migrate-user', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const { email, tempPassword } = req.body;
        
        if (!email || !tempPassword) {
            return res.status(400).json({ 
                error: 'Email and temporary password required for manual migration' 
            });
        }
        
        const user = await db.collection(USERS_COLLECTION).findOne({ 
            email: email.toLowerCase().trim() 
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if user has bcrypt password
        if (!user.passwordHash.startsWith('$2')) {
            return res.status(400).json({ 
                error: 'User does not have bcrypt password' 
            });
        }
        
        // Verify temporary password against bcrypt
        const bcrypt = require('bcrypt');
        const isValid = await bcrypt.compare(tempPassword, user.passwordHash);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid temporary password' });
        }
        
        // Migrate to SHA-256 with salt
        const crypto = require('crypto');
        const salt = crypto.randomBytes(32).toString('hex');
        const newHash = crypto.createHash('sha256').update(tempPassword + salt).digest('hex');
        
        await db.collection(USERS_COLLECTION).updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordHash: newHash,
                    passwordSalt: salt,
                    passwordFormat: 'sha256_with_salt',
                    migratedFrom: 'bcrypt',
                    migrationDate: new Date(),
                    updatedAt: new Date()
                }
            }
        );
        
        // Clear cache
        if (global.userCache) {
            global.userCache.delete(email.toLowerCase().trim());
        }
        
        res.json({
            success: true,
            message: `User ${email} migrated from bcrypt to SHA-256+salt`
        });
        
    } catch (error) {
        console.error('Manual migration error:', error);
        res.status(500).json({ error: 'Manual migration failed' });
    }
});
// FIXED: Replace your payment confirmation endpoint with this corrected version

// REPLACE your payment confirmation endpoint in server.js with this improved version:

app.post('/api/appointments/:appointmentId/confirm-payment', authenticateToken, async (req, res) => {
    console.log('=== PAYMENT CONFIRMATION ENDPOINT HIT ===');
    console.log('Appointment ID:', req.params.appointmentId);
    console.log('Request body:', req.body);
    console.log('User:', req.user?.email);
    
    try {
        if (!db) {
            return res.status(503).json({ 
                success: false, 
                error: 'Database not connected' 
            });
        }

        const appointmentId = String(req.params.appointmentId || '').trim();
        const { transactionId, paymentMethod } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Appointment ID required' 
            });
        }

        console.log(`Processing payment confirmation for appointment: ${appointmentId}`);

        // Find the appointment
        const appointment = await db.collection(APPOINTMENTS_COLLECTION).findOne({
            appointmentId,
            userId: new ObjectId(req.user.id)
        });

        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                error: 'Appointment not found' 
            });
        }

        // Check if already confirmed to prevent duplicate processing
        if (appointment.payment?.status === 'completed') {
            console.log(`Payment already confirmed for appointment ${appointmentId}`);
            return res.json({ 
                success: true, 
                message: 'Payment already confirmed for this appointment',
                appointment: appointment,
                alreadyProcessed: true
            });
        }

        // Update payment status - SINGLE UPDATE OPERATION
        const updateResult = await db.collection(APPOINTMENTS_COLLECTION).updateOne(
            { appointmentId, userId: new ObjectId(req.user.id) },
            {
                $set: {
                    'payment.status': 'completed',
                    'payment.transactionId': transactionId,
                    'payment.method': paymentMethod,
                    'payment.confirmedAt': new Date(),
                    status: 'confirmed',
                    updatedAt: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Failed to update appointment' 
            });
        }

        console.log(`✅ Payment confirmed for appointment ${appointmentId}`);

        // Get updated appointment for email/calendar
        const updatedAppointment = await db.collection(APPOINTMENTS_COLLECTION).findOne({
            appointmentId,
            userId: new ObjectId(req.user.id)
        });

        // IMPORTANT: Send the response FIRST, then do email/calendar in background
        const responseData = {
            success: true,
            message: 'Payment confirmed and appointment updated',
            appointment: updatedAppointment,
            transactionId: transactionId,
            paymentMethod: paymentMethod
        };

        // Send response immediately
        res.json(responseData);

        // Now do email and calendar operations in background (don't await these)
        setImmediate(async () => {
            // Send confirmation email
            try {
                const emailSubject = `Your ZYVA Appointment #${appointmentId} is Confirmed`;
                await sendConfirmationEmail(req.user.id, emailSubject, formatAppointmentEmail(updatedAppointment));
                console.log(`✅ Confirmation email queued for appointment ${appointmentId}`);
            } catch (emailError) {
                console.error(`❌ Failed to send confirmation email for appointment ${appointmentId}:`, emailError.message);
            }

            // Create Google Calendar events
            try {
                await createAppointmentCalendarEvents(req.user.id, updatedAppointment, appointmentId);
                console.log(`✅ Calendar events created for appointment ${appointmentId}`);
            } catch (calendarError) {
                console.error(`❌ Failed to create calendar events for appointment ${appointmentId}:`, calendarError.message);
            }
        });

    } catch (error) {
        console.error('❌ Payment confirmation error:', error.message || error);
        
        // Make sure we always return valid JSON
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false,
                error: 'Failed to confirm payment',
                details: error.message
            });
        }
    }
});
// ===== REMINDER MANAGEMENT ENDPOINTS =====
app.use('/api/reminders', authenticateToken, reminderRoutes);

// --- Frontend Serving ---
// This must be after all API routes to avoid conflicts.
const staticPath = path.join(__dirname, '..');
app.use(express.static(staticPath));
if (process.env.NODE_ENV !== 'production') {
    const staticPath = path.join(__dirname, '..');
    app.use(express.static(staticPath));
    
    // Serve main page
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../login_page.html'));
    });
}

// Error handling middleware
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error); // Don't send response if headers already sent
    }
    console.error('Server error:', error.message || error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for any request that doesn't match an API route or a static file.
app.use((req, res) => {
    if (res.headersSent) {
        return; // Don't send response if headers already sent
    }
    res.status(404).send('<h1>404: Page Not Found</h1><p>The requested URL was not found on this server.</p>');
});

server = app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`ZYVA Healthcare Backend API ready`);
    console.log(`Available endpoints:`);
    console.log(`- GET  /api/health`);
    console.log(`- POST /api/auth/login`);
    console.log(`- POST /api/auth/register`);
    console.log(`- POST /api/orders (protected)`);
    console.log(`- GET  /api/orders (protected)`);
    console.log(`- GET  /api/orders/user (protected)`);
    console.log(`- GET  /api/orders/:orderId (protected)`);
    console.log(`- POST /api/reminders (protected)`);
    console.log(`- GET  /api/reminders/today (protected)`);
    console.log(`- DELETE /api/reminders/:id (protected)`);
    console.log(`- GET  /api/orders/customer/:email`);
    console.log(`- POST /api/insurances (protected)`);
    console.log(`- GET  /api/insurances/user (protected)`);
    console.log(`- PATCH /api/orders/:orderId/status (protected)`);
    console.log(`- GET  /api/orders/stats/summary (protected)`);
    console.log(`\nServer is ready to accept requests!`);
});

// PM2 configuration
if (process.env.RUN_UNDER_PM2 === 'true') {
    try {
        const pm2 = require('pm2');

        if (process.env.pm_id !== undefined) {
            console.log('Running under PM2 already; no self-spawn needed.');
        } else {
            pm2.connect((err) => {
                if (err) {
                    console.error('PM2 connect error:', err);
                    return;
                }
                pm2.start(
                    {
                        script: __filename,
                        name: 'zyva-backend',
                        env: {
                            ...process.env,
                            PORT: String(PORT),
                        },
                    },
                    (startErr) => {
                        pm2.disconnect();
                        if (startErr) {
                            console.error('PM2 start error:', startErr);
                        } else {
                            console.log('Spawned PM2-managed process "zyva-backend". You can close the terminal.');
                            console.log('Next time, enable PM2 auto-boot with: pm2 save && pm2 startup');
                        }
                    }
                );
            });
        }
    } catch (e) {
        console.warn('PM2 not installed. Install with: npm i pm2 --save or npm i -g pm2', e?.message || e);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process, just log the error
});

// Keep the process alive
setInterval(() => {
    // This keeps the event loop active
}, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});


// Removed duplicate Gmail transporter initialization (handled above)

// REPLACE your existing sendConfirmationEmail function with this:
async function sendConfirmationEmail(userId, subject, htmlBody) {
    console.log('=== SENDING EMAIL ===');
    console.log('User ID:', userId);
    console.log('Subject:', subject);
    console.log('Email service available:', !!emailTransporter);
    try {
        if (!db) {
            console.error('DB not connected, cannot send email.');
            return;
        }

        if (!emailTransporter) {
            console.warn('Gmail service not configured, skipping email send.');
            return;
        }

        const user = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(userId) });

        if (!user || !user.email) {
            console.info(`[Email] User ${userId} not found or missing email`);
            return;
        }

        const mailOptions = {
            from: {
                name: 'ZYVA Healthcare',
                address: process.env.COMPANY_EMAIL // zyvahealthcare@gmail.com
            },
            to: user.email,
            subject: subject,
            html: htmlBody,
            replyTo: process.env.COMPANY_EMAIL
        };

        const result = await emailTransporter.sendMail(mailOptions);
        console.log(`Email sent from ${process.env.COMPANY_EMAIL} to ${user.email}`);
        console.log('Subject:', subject);
        console.log('Message ID:', result.messageId);
        
    } catch (error) {
        console.error(`Failed to send email for user ${userId}:`, error.message);
        
        // Common error messages and solutions
        if (error.message.includes('Invalid login')) {
            console.error('Solution: Make sure you are using an App Password, not your regular Gmail password');
            console.error('Generate App Password at: https://myaccount.google.com/apppasswords');
        }
        
        // Don't throw error to avoid breaking the main flow
    }
}
setInterval(() => {
    const now = Date.now();
    let cleanedJWT = 0, cleanedUser = 0, cleanedAttempts = 0;
    
    // Clean expired JWT tokens
    if (global.jwtCache) {
        for (const [key, value] of global.jwtCache.entries()) {
            if (value.expires <= now) {
                global.jwtCache.delete(key);
                cleanedJWT++;
            }
        }
    }
    
    // Clean old user cache (10+ minutes)
    if (global.userCache) {
        for (const [key, value] of global.userCache.entries()) {
            if (now - value.timestamp > 10 * 60 * 1000) {
                global.userCache.delete(key);
                cleanedUser++;
            }
        }
    }
    
    // Clean old login attempts (15+ minutes)  
    if (global.loginAttempts) {
        const LOCKOUT_TIME = 15 * 60 * 1000;
        for (const [email, attempts] of global.loginAttempts.entries()) {
            if (now - attempts.firstAttempt > LOCKOUT_TIME) {
                global.loginAttempts.delete(email);
                cleanedAttempts++;
            }
        }
    }
    
    if (cleanedJWT || cleanedUser || cleanedAttempts) {
        console.log(`Cache cleanup: Removed ${cleanedJWT} JWT, ${cleanedUser} users, ${cleanedAttempts} login attempts`);
    }
    
    // Log current cache sizes
    console.log(`Cache sizes: JWT=${global.jwtCache?.size || 0}, User=${global.userCache?.size || 0}, Login=${global.loginAttempts?.size || 0}`);
}, 10 * 60 * 1000); // Every 10 minutes
app.post('/api/admin/cleanup-duplicate-appointments', authenticateToken, async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });

        const duplicates = await db.collection(APPOINTMENTS_COLLECTION).aggregate([
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        date: "$schedule.date",
                        time: "$schedule.time",
                        location: "$schedule.location"
                    },
                    appointmentIds: { $push: "$appointmentId" },
                    count: { $sum: 1 }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        let cleanedCount = 0;
        for (const duplicate of duplicates) {
            const appointmentIds = duplicate.appointmentIds;
            // Keep the first (oldest) appointment, remove others
            const toRemove = appointmentIds.slice(1);
            
            for (const appointmentId of toRemove) {
                await db.collection(APPOINTMENTS_COLLECTION).deleteOne({ appointmentId });
                console.log(`Removed duplicate appointment: ${appointmentId}`);
                cleanedCount++;
            }
        }

        res.json({
            success: true,
            message: `Cleaned up ${cleanedCount} duplicate appointments`,
            duplicatesFound: duplicates.length
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ error: 'Failed to cleanup duplicates' });
    }
});