const authService = require('../services/auth.service');

// Register new user
exports.register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    } catch (err) {
        res.status(err.message.includes('already exists') ? 400 : 500).json({
            success: false,
            error: err.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);

        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (err) {
        res.status(err.message.includes('Invalid') ? 401 : 500).json({
            success: false,
            error: err.message
        });
    }
};

// Verify token
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const result = await authService.verifyUserToken(token);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        res.status(401).json({
            success: false,
            error: err.message
        });
    }
};
