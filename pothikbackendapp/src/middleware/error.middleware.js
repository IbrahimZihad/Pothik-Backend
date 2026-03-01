const multer = require('multer');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Handle Multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                details: 'Maximum file size is 5MB'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Unexpected field',
                details: err.message
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            details: err.message
        });
    }

    // Handle custom file filter errors (non-MulterError)
    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({
            error: 'Invalid file type',
            details: 'Only JPEG, JPG, PNG, GIF, and WEBP images are allowed'
        });
    }

    // Handle other errors
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = { errorHandler };
