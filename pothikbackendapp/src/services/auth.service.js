const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Register new user
exports.registerUser = async (userData) => {
    const { full_name, email, password, phone, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
        full_name,
        email,
        password_hash,
        phone,
        role: role || 'customer',
    });

    // Generate token
    const token = this.generateToken(user);

    return {
        user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        },
        token
    };
};

// Login user
exports.loginUser = async (email, password) => {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
        user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            loyalty_points: user.loyalty_points,
        },
        token
    };
};

// Verify token and get user
exports.verifyUserToken = async (token) => {
    if (!token) {
        throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.user_id);

    if (!user) {
        throw new Error('User not found');
    }

    return {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
    };
};

// Generate JWT token
exports.generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Hash password
exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Verify password
exports.verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
