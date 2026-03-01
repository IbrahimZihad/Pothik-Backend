const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Profile image upload config
const profileUploadPath = path.join(__dirname, '../../uploads/profiles/');
if (!fs.existsSync(profileUploadPath)) {
    fs.mkdirSync(profileUploadPath, { recursive: true });
}
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, profileUploadPath),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const profileUpload = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Protected routes - require authentication
router.get('/profile', authMiddleware, userController.getProfile);

// Profile image upload with error handling wrapper
router.put('/profile/image', authMiddleware, (req, res, next) => {
    profileUpload.single('profile_image')(req, res, (err) => {
        if (err) {
            console.error('Multer upload error:', err.message);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
            }
            return res.status(400).json({ error: err.message || 'File upload failed' });
        }
        next();
    });
}, userController.uploadProfileImage);

router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/password', authMiddleware, userController.updatePassword);

module.exports = router;