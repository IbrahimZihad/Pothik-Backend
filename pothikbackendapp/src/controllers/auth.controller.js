const authService = require('../services/auth.service');

// Register new user
exports.register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    } catch (err) {
        const statusCode = err.message.includes('already exists') ? 400 : 500;
        return res.status(statusCode).json({
            success: false,
            error: err.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const result = await authService.loginUser(email, password);

        return res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (err) {
        const statusCode = err.message.includes('Invalid') ? 401 : 500;
        return res.status(statusCode).json({
            success: false,
            error: err.message
        });
    }
};

// Verify token
exports.verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header missing'
            });
        }

        const token = authHeader.split(' ')[1];
        const result = await authService.verifyUserToken(token);

        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: err.message
        });
    }
};

// Google OAuth login
exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                error: 'Firebase ID token is required'
            });
        }

        const result = await authService.googleLoginUser(idToken);

        return res.json({
            success: true,
            message: 'Google login successful',
            data: result
        });
    } catch (err) {
        console.error('Google login error:', err.message);
        const statusCode = err.message.includes('Invalid') ? 401 : 500;
        return res.status(statusCode).json({
            success: false,
            error: err.message
        });
    }
};
