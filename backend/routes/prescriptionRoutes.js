const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { ObjectId, GridFSBucket } = require('mongodb');
const jwt = require('jsonwebtoken');

/**
 * Factory to create prescription routes backed by MongoDB GridFS.
 * @param {import('mongodb').Db} db
 * @param {string} jwtSecret
 * @param {string} usersCollectionName
 */
module.exports = function createPrescriptionRoutes(db, jwtSecret, usersCollectionName) {
    const router = express.Router();

    // Create a GridFS bucket specifically for prescriptions
    const bucket = new GridFSBucket(db, { bucketName: 'prescriptions' });

    // Storage engine using the existing connected db
    const storage = new GridFsStorage({
        db,
        file: (req, file) => {
            const userId = req.user?.id || req.user?._id || req.authenticatedUserId || 'unknown';
            const timestamp = Date.now();
            const originalName = file.originalname || 'file';
            return {
                bucketName: 'prescriptions',
                filename: `${userId}_${timestamp}_${originalName}`,
                metadata: {
                    userId: ObjectId.isValid(userId) ? new ObjectId(userId) : String(userId),
                    description: req.body?.description || '',
                    originalName,
                    uploadDate: new Date(), // Add explicit upload date
                },
            };
        },
    });

    const upload = multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: (req, file, cb) => {
            // Allow only specific file types
            const allowedMimes = [
                'application/pdf',
                'image/jpeg',
                'image/jpg', 
                'image/png'
            ];
            
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
            }
        }
    });

    // Middleware: authenticate via Authorization header or token query (for inline view links)
    const authenticate = async (req, res, next) => {
        try {
            let token = null;
            const authHeader = req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            } else if (req.query && req.query.token) {
                token = String(req.query.token);
            }

            if (!token) {
                return res.status(401).json({ success: false, error: 'Access token required' });
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

            const decoded = jwt.verify(token, jwtSecret);
            const users = db.collection(usersCollectionName);
            const user = await users.findOne({ _id: new ObjectId(decoded.id) });
            if (!user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }
            req.user = user;
            req.user.id = decoded.id;
            next();
        } catch (err) {
            console.error('Authentication error:', err.message);
            return res.status(403).json({ success: false, error: 'Invalid or expired token' });
        }
    };

    // Health check endpoint
    router.get('/health', (req, res) => {
        res.json({ 
            status: 'Prescription service is running',
            gridFS: !!bucket,
            timestamp: new Date().toISOString()
        });
    });

    // POST /api/prescriptions/upload - upload a file to GridFS
    router.post('/upload', authenticate, upload.single('prescriptionFile'), (req, res) => {
        try {
            if (!req.file || !req.file.id) {
                return res.status(400).json({ success: false, error: 'No file uploaded' });
            }
            console.log(`Prescription uploaded: ${req.file.filename} for user: ${req.user.email || req.user.id}`);
            return res.status(201).json({ 
                success: true, 
                message: 'Prescription uploaded successfully',
                fileId: String(req.file.id),
                filename: req.file.filename 
            });
        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ success: false, error: 'Failed to upload file' });
        }
    });

    // GET /api/prescriptions/user - list current user's files
    router.get('/user', authenticate, async (req, res) => {
        try {
            // Handle dummy token with mock data
            if (req.user.id === 'dummy-user-id') {
                const mockFiles = [
                    {
                        id: '1',
                        filename: 'prescription_dr_smith.pdf',
                        originalName: 'prescription_dr_smith.pdf',
                        description: 'Follow-up consultation with Dr. Smith',
                        size: 245760,
                        uploadDate: new Date(),
                        contentType: 'application/pdf'
                    },
                    {
                        id: '2',
                        filename: 'blood_test_results.jpg',
                        originalName: 'blood_test_results.jpg', 
                        description: 'Blood test results from lab',
                        size: 512000,
                        uploadDate: new Date(Date.now() - 86400000), // Yesterday
                        contentType: 'image/jpeg'
                    }
                ];
                return res.json({ success: true, files: mockFiles });
            }

            const cursor = bucket.find({ 'metadata.userId': new ObjectId(req.user.id) });
            const files = await cursor.toArray();
            const mapped = files.map((f) => ({
                id: String(f._id),
                filename: f.filename,
                originalName: f.metadata?.originalName || f.filename,
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
            return res.status(500).json({ success: false, error: 'Failed to fetch prescriptions' });
        }
    });

    // GET /api/prescriptions/view/:id - stream file (accepts header or ?token=)
    router.get('/view/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            
            // Handle dummy token
            if (req.user.id === 'dummy-user-id') {
                return res.status(200).send('Mock file content - actual file viewing not available in demo mode');
            }
            
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, error: 'Invalid file id' });
            }

            const fileDoc = await bucket.find({ _id: new ObjectId(id) }).next();
            if (!fileDoc) {
                return res.status(404).json({ success: false, error: 'File not found' });
            }

            // Ownership check
            const ownerId = fileDoc.metadata?.userId;
            const isOwner = ownerId && String(ownerId) === String(req.user.id);
            if (!isOwner) {
                return res.status(403).json({ success: false, error: 'Forbidden' });
            }

            res.set('Content-Type', fileDoc.contentType || fileDoc.metadata?.contentType || 'application/octet-stream');
            res.set('Content-Disposition', `inline; filename="${fileDoc.metadata?.originalName || fileDoc.filename}"`);

            const downloadStream = bucket.openDownloadStream(new ObjectId(id));
            downloadStream.on('error', (error) => {
                console.error('Download stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, error: 'Failed to stream file' });
                }
            });
            downloadStream.pipe(res);
        } catch (error) {
            console.error('View file error:', error);
            return res.status(500).json({ success: false, error: 'Failed to stream file' });
        }
    });

    // DELETE /api/prescriptions/:id - delete a file (owner only)
    router.delete('/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            
            // Handle dummy token
            if (req.user.id === 'dummy-user-id') {
                return res.json({ success: true, message: 'Mock deletion successful' });
            }
            
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, error: 'Invalid file id' });
            }

            const fileDoc = await bucket.find({ _id: new ObjectId(id) }).next();
            if (!fileDoc) {
                return res.status(404).json({ success: false, error: 'File not found' });
            }
            const ownerId = fileDoc.metadata?.userId;
            if (!ownerId || String(ownerId) !== String(req.user.id)) {
                return res.status(403).json({ success: false, error: 'Forbidden' });
            }

            await bucket.delete(new ObjectId(id));
            console.log(`Prescription deleted: ${fileDoc.filename} for user: ${req.user.email || req.user.id}`);
            return res.json({ success: true, message: 'Prescription deleted successfully' });
        } catch (error) {
            console.error('Delete file error:', error);
            return res.status(500).json({ success: false, error: 'Failed to delete file' });
        }
    });

    // Error handling middleware
    router.use((error, req, res, next) => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File too large. Maximum size is 10MB.'
                });
            }
            return res.status(400).json({
                success: false,
                error: `Upload error: ${error.message}`
            });
        }
        
        if (error.message && error.message.includes('Invalid file type')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        console.error('Prescription route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    });

    return router;
};