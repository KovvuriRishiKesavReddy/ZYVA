// UPDATED authRoutes.js to handle both bcrypt and SHA-256 passwords

const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Add this import

// Helper function to detect password format
function detectPasswordFormat(hash, salt) {
    if (hash.startsWith('$2b$') || hash.startsWith('$2a$') || hash.startsWith('$2y$')) {
        return 'bcrypt';
    } else if (salt && String(salt).length > 0) {
        return 'sha256_with_salt';
    } else if (hash.length === 64) {
        return 'sha256';
    } else {
        return 'unknown';
    }
}
// Dummy brute-force protection (always allows login)
function checkLoginAttempts(email) {
    return { allowed: true, resetTime: null };
}

// Dummy login attempt recorder (does nothing)
function recordLoginAttempt(email, success) {
    // No-op
}

// Dummy JWT cache (no caching)
function getCachedJWT(userId, email) {
    return null;
}
function setCachedJWT(userId, email, token) {
    // No-op
}
// Enhanced password verification function
async function verifyPasswordUniversal(inputPassword, storedHash, salt = null) {
    const format = detectPasswordFormat(storedHash,salt);
    
    console.log(`Password format detected: ${format}`);
    
    switch (format) {
        case 'bcrypt':
            try {
                return await bcrypt.compare(inputPassword, storedHash);
            } catch (error) {
                console.error('bcrypt verification error:', error);
                return false;
            }
            
        case 'sha256_with_salt':
            if (!salt) {
                console.error('Salt required for SHA-256 verification but not provided');
                return false;
            }
            const saltedHash = crypto.createHash('sha256').update(inputPassword + salt).digest('hex');
            return saltedHash === storedHash;
            
        case 'sha256':
            // Legacy SHA-256 without salt
            const legacyHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
            return legacyHash === storedHash;
            
        default:
            console.error(`Unknown password format: ${format}`);
            return false;
    }
}

function createAuthRoutes(db, oauth2ClientRegister, JWT_SECRET, USERS_COLLECTION) {
    const router = express.Router();

    // Helper function to generate a random salt
    const generateSalt = () => {
        return crypto.randomBytes(32).toString('hex');
    };

    // Helper function to hash password with salt using SHA-256
    const hashPasswordWithSalt = (password, salt) => {
        return crypto.createHash('sha256').update(password + salt).digest('hex');
    };

    // Helper function to check if database is connected
    const checkDbConnection = (req, res, next) => {
        const currentDb = req.app.get('db');
        if (!currentDb) {
            return res.status(503).json({ error: 'Database not connected yet' });
        }
        req.db = currentDb;
        next();
    };
    function getCachedUser(email) {
    if (global.userCache) {
        const cached = global.userCache.get(email);
        return cached ? cached.user : null;
    }
    return null;
}

function setCachedUser(email, user) {
    if (!global.userCache) global.userCache = new Map();
    global.userCache.set(email, { user, timestamp: Date.now() });
}

    // POST /api/auth/check-email
    router.post('/check-email', checkDbConnection, async (req, res) => {
        try {
            const { email } = req.body;
            
            if (!email || !email.includes('@')) {
                return res.status(400).json({ 
                    error: 'Valid email required',
                    exists: false 
                });
            }
            
            const normalizedEmail = String(email).toLowerCase().trim();
            
            // Try cache first for performance
            let user = getCachedUser(normalizedEmail);
            
            if (!user) {
                user = await req.db.collection(USERS_COLLECTION).findOne({ 
                    email: normalizedEmail 
                }, {
                    projection: { email: 1 } // Minimal projection for check
                });
                
                if (user) {
                    setCachedUser(normalizedEmail, user);
                }
            }
            
            console.log(`Email check: ${normalizedEmail} - exists: ${!!user}`);
            
            const exists = !!user;
            res.json({ 
                exists,
                message: exists ? 'Email already registered' : 'Email available'
            });
            
        } catch (error) {
            console.error('Email check error:', error.message || error);
            res.status(500).json({ 
                error: 'Server error checking email',
                exists: false
            });
        }
    });

    // POST /api/auth/register - ENFORCES SHA-256+salt for ALL new users
    router.post('/register', checkDbConnection, async (req, res) => {
        try {
            const {
                firstName, lastName, email, phoneNumber, password,
                dateOfBirth, gender, bloodGroup, emergencyContact, address,
                marketingOptIn, dataProcessingConsent,
                googleAuthCode
            } = req.body;

            // Validation
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({ error: 'Required fields missing' });
            }
            if (!String(email).includes('@')) {
                return res.status(400).json({ error: 'Invalid email' });
            }
            if (password.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters long' });
            }

            const normalizedEmail = String(email).toLowerCase().trim();
            
            const existingUser = await req.db.collection(USERS_COLLECTION).findOne({ 
                email: normalizedEmail 
            });
            
            if (existingUser) {
                console.log(`Registration blocked: ${normalizedEmail} already exists`);
                return res.status(400).json({ error: 'Email already registered' });
            }

            // MANDATORY: All new users get SHA-256 with salt
            const salt = generateSalt();
            const passwordHash = hashPasswordWithSalt(password, salt);
            
            console.log(`Creating new user with SHA-256+salt: ${normalizedEmail}`);
            
            // Prepare user document with SHA-256+salt password
            const userDoc = {
                firstName: String(firstName).trim(),
                lastName: String(lastName).trim(),
                email: normalizedEmail,
                phoneNumber: phoneNumber ? String(phoneNumber).trim() : undefined,
                passwordHash, // SHA-256+salt hash
                passwordSalt: salt, // Store salt separately
                passwordFormat: 'sha256_with_salt', // Track format for future reference
                dateOfBirth: dateOfBirth || null,
                gender: gender || null,
                bloodGroup: bloodGroup || null,
                emergencyContact: emergencyContact ? String(emergencyContact).trim() : undefined,
                address: address ? String(address).trim() : undefined,
                marketingOptIn: !!marketingOptIn,
                dataProcessingConsent: !!dataProcessingConsent,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active',
                isGoogleConnected: false
            };

            // Google OAuth processing
            if (!googleAuthCode) {
                return res.status(400).json({ 
                    error: 'Google account connection is required for registration.' 
                });
            }

            try {
                const { tokens } = await oauth2ClientRegister.getToken(googleAuthCode);
                const requiredScopes = [
                    'https://www.googleapis.com/auth/calendar.events'
                ];
                const grantedScopes = (tokens.scope || '').split(' ');
                
                if (!requiredScopes.every(scope => grantedScopes.includes(scope))) {
                    return res.status(400).json({ 
                        error: 'Google connection failed: You must grant all requested permissions.' 
                    });
                }
                
                if (!tokens.refresh_token) {
                    return res.status(400).json({ 
                        error: 'Google connection failed: A refresh token was not provided. Please remove app from Google account and try again.' 
                    });
                }

                userDoc.googleRefreshToken = tokens.refresh_token;
                userDoc.isGoogleConnected = true;
                console.log(`Google account connected for new user: ${normalizedEmail}`);
                
            } catch (googleError) {
                console.error('Google OAuth error during registration:', googleError);
                return res.status(500).json({ 
                    error: 'Failed to process Google authentication. Please try again.' 
                });
            }

            // Insert user
            const result = await req.db.collection(USERS_COLLECTION).insertOne(userDoc);
            console.log(`✅ New user registered with SHA-256+salt: ${normalizedEmail}`);
            
            // Cache the new user for future operations
            setCachedUser(normalizedEmail, userDoc);
            
            res.status(201).json({ 
                success: true, 
                message: 'User registered successfully with secure password storage', 
                userId: result.insertedId 
            });
            
        } catch (error) {
            console.error('Registration error:', error.message || error);
            res.status(500).json({ 
                error: 'Registration failed. Please try again.' 
            });
        }
    });
    
    // UPDATED LOGIN ROUTE with mixed password support
    router.post('/login', checkDbConnection, async (req, res) => {
        const startTime = Date.now();
        
        try {
            const { email, password } = req.body || {};
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const normalizedEmail = String(email).toLowerCase().trim();
            
            // Check rate limiting first (fastest check)
            const rateLimitCheck = checkLoginAttempts(normalizedEmail);
            if (!rateLimitCheck.allowed) {
                return res.status(429).json({ 
                    error: 'Too many failed attempts. Please try again later.',
                    resetTime: rateLimitCheck.resetTime
                });
            }

            // Try cache first for frequent users
            let user = getCachedUser(normalizedEmail);
            let cacheHit = !!user;
            
            if (!user) {
                // Fetch user with all password-related fields
                user = await req.db.collection(USERS_COLLECTION).findOne(
                    { 
                        email: normalizedEmail,
                        status: { $ne: 'deleted' }
                    },
                    { 
                        projection: { 
                            email: 1, 
                            passwordHash: 1,
                            passwordSalt: 1,  // For SHA-256 with salt
                            firstName: 1, 
                            lastName: 1, 
                            status: 1,
                            googleRefreshToken: 1 
                        } 
                    }
                );
                
                if (user) {
                    setCachedUser(normalizedEmail, user);
                }
            }
            
            console.log(`User lookup (cache ${cacheHit ? 'HIT' : 'MISS'}): ${Date.now() - startTime}ms`);
            
            if (!user || user.status === 'inactive') {
                recordLoginAttempt(normalizedEmail, false);
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const passwordStart = Date.now();
            
            // Use universal password verification
            const isPasswordValid = await verifyPasswordUniversal(
                password, 
                user.passwordHash, 
                user.passwordSalt,
                user.passwordHash
            );
            
            console.log(`Password verification: ${Date.now() - passwordStart}ms`);
            
            if (!isPasswordValid) {
                console.error('[DEBUG] Password mismatch for:', normalizedEmail);
                console.error('[DEBUG] Input password:', password);
                console.error('[DEBUG] Salt:', user.passwordSalt);
                console.error('[DEBUG] Stored hash:', user.passwordHash);
                const testHash = crypto.createHash('sha256').update(password + user.passwordSalt).digest('hex');
                console.error('[DEBUG] Computed hash:', testHash);
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // SUCCESS - Handle password migration if needed
            const passwordFormat = detectPasswordFormat(user.passwordHash);
            
            // MANDATORY: Migrate bcrypt users to SHA-256 with salt
            if (passwordFormat === 'bcrypt' && isPasswordValid) {
                console.log(`Migrating bcrypt user ${normalizedEmail} to SHA-256+salt`);
                
                process.nextTick(async () => {
                    try {
                        const salt = generateSalt();
                        const newHash = hashPasswordWithSalt(password, salt);
                        await req.db.collection(USERS_COLLECTION).updateOne(
                            { _id: user._id },
                            { 
                                $set: { 
                                    passwordHash: newHash, 
                                    passwordSalt: salt,
                                    updatedAt: new Date(),
                                    migratedFrom: 'bcrypt',
                                    migrationDate: new Date()
                                } 
                            }
                        );
                        
                        // Clear cache to force reload with new password format
                        if (global.userCache) {
                            global.userCache.delete(normalizedEmail);
                        }
                        console.log(`✅ Successfully migrated ${normalizedEmail} from bcrypt to SHA-256+salt`);
                    } catch (upgradeError) {
                        console.error('❌ Password migration error for', normalizedEmail, ':', upgradeError);
                    }
                });
            }
            
            // Upgrade legacy SHA-256 users to salted version
            if (passwordFormat === 'sha256' && isPasswordValid) {
                process.nextTick(async () => {
                    try {
                        const salt = generateSalt();
                        const newHash = hashPasswordWithSalt(password, salt);
                        await req.db.collection(USERS_COLLECTION).updateOne(
                            { _id: user._id },
                            { 
                                $set: { 
                                    passwordHash: newHash, 
                                    passwordSalt: salt,
                                    updatedAt: new Date()
                                } 
                            }
                        );
                        
                        if (global.userCache) {
                            global.userCache.delete(normalizedEmail);
                        }
                        console.log(`Upgraded legacy SHA-256 password for user: ${normalizedEmail}`);
                    } catch (upgradeError) {
                        console.error('Password upgrade error:', upgradeError);
                    }
                });
            }

            // Success - clear failed attempts
            recordLoginAttempt(normalizedEmail, true);

            const tokenStart = Date.now();
            const userId = String(user._id);
            
            // Try to get cached JWT first
            let token = getCachedJWT(userId, user.email);
            
            if (!token) {
                token = jwt.sign(
                    { id: userId, email: user.email }, 
                    JWT_SECRET, 
                    { expiresIn: '7d', algorithm: 'HS256' }
                );
                setCachedJWT(userId, user.email, token);
            }
            
            console.log(`JWT generation/retrieval: ${Date.now() - tokenStart}ms`);

            // Minimal response for fastest transfer
            const response = { 
                success: true, 
                token, 
                user: { 
                    id: userId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isGoogleConnected: !!user.googleRefreshToken
                },
                passwordMigrated: passwordFormat === 'bcrypt'
            };

            res.json(response);
            
            const totalTime = Date.now() - startTime;
            console.log(`LOGIN SUCCESS: ${normalizedEmail} in ${totalTime}ms (cache: ${cacheHit}, format: ${passwordFormat})`);
            
        } catch (error) {
            console.error('Login error:', error.message || error);
            res.status(500).json({ error: 'Login failed. Please try again.' });
        }
    });

    // UPDATED PASSWORD CHANGE ROUTE
    router.post('/change-password', checkDbConnection, async (req, res) => {
        try {
            const { email, currentPassword, newPassword } = req.body;
            
            if (!email || !currentPassword || !newPassword) {
                return res.status(400).json({ error: 'All fields are required' });
            }
            
            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'New password must be at least 8 characters long' });
            }

            const normalizedEmail = String(email).toLowerCase().trim();
            const user = await req.db.collection(USERS_COLLECTION).findOne({ 
                email: normalizedEmail 
            });
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password using universal verification
            const isCurrentPasswordValid = await verifyPasswordUniversal(
                currentPassword, 
                user.passwordHash, 
                user.passwordSalt
            );

            if (!isCurrentPasswordValid) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Generate new salt and hash for new password (always use SHA-256+salt for new passwords)
            const newSalt = generateSalt();
            const newPasswordHash = hashPasswordWithSalt(newPassword, newSalt);

            await req.db.collection(USERS_COLLECTION).updateOne(
                { email: normalizedEmail },
                { 
                    $set: { 
                        passwordHash: newPasswordHash,
                        passwordSalt: newSalt,
                        updatedAt: new Date()
                    } 
                }
            );

            // Clear user from cache since password changed
            if (global.userCache) {
                global.userCache.delete(normalizedEmail);
            }

            res.json({ 
                success: true, 
                message: 'Password changed successfully' 
            });

        } catch (error) {
            console.error('Change password error:', error.message || error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    });

    return router;
}

module.exports = createAuthRoutes;