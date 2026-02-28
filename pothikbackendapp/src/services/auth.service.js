const { User, LoyaltyHistory } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const admin = require('../config/firebase-admin.config');

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
        auth_provider: 'local',
        loyalty_points: 50,
    });

    // 🎁 Welcome bonus: 50 loyalty points
    await LoyaltyHistory.create({
        user_id: user.user_id,
        points_added: 50,
        description: 'Welcome bonus — new account',
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
            loyalty_points: user.loyalty_points,
            country: user.country,
            street_address: user.street_address,
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

    // Check if user is OAuth user (no password)
    if (user.auth_provider !== 'local' || !user.password_hash) {
        throw new Error('Please sign in with Google');
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
            country: user.country,
            street_address: user.street_address,
        },
        token
    };
};

// Google OAuth login
exports.googleLoginUser = async (idToken) => {
    try {
        // Check if Firebase Admin is initialized
        if (!admin.apps || !admin.apps.length) {
            throw new Error('Firebase Admin SDK is not initialized. Please add serviceAccountKey.json to the project root.');
        }

        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            throw new Error('Email not provided by Google');
        }

        // Check if user exists by firebase_uid or email
        let user = await User.findOne({
            where: { firebase_uid: uid }
        });

        if (!user) {
            // Check if user exists by email (might have registered with email/password)
            user = await User.findOne({ where: { email } });

            if (user) {
                // Link existing account with Google
                user.firebase_uid = uid;
                user.auth_provider = 'google';
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    full_name: name || email.split('@')[0],
                    email,
                    firebase_uid: uid,
                    auth_provider: 'google',
                    role: 'customer',
                    loyalty_points: 50,
                });

                // 🎁 Welcome bonus: 50 loyalty points
                await LoyaltyHistory.create({
                    user_id: user.user_id,
                    points_added: 50,
                    description: 'Welcome bonus — new Google account',
                });
            }
        }

        // Generate JWT token
        const token = this.generateToken(user);

        return {
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                loyalty_points: user.loyalty_points || 0,
                country: user.country,
                street_address: user.street_address,
            },
            token
        };
    } catch (error) {
        console.error('Firebase token verification error:', error);
        throw new Error('Invalid Google authentication token');
    }
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
        phone: user.phone,
        loyalty_points: user.loyalty_points,
        country: user.country,
        street_address: user.street_address,
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

// Request password reset - sends OTP to email
exports.requestPasswordReset = async (email) => {
    const emailService = require('./email.service');

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new Error('No account found with this email address');
    }

    // Check if user uses Google OAuth
    if (user.auth_provider === 'google' && !user.password_hash) {
        throw new Error('This account uses Google login. Please sign in with Google instead.');
    }

    // Send OTP to email
    await emailService.sendPasswordResetOTP(email);

    return { message: 'OTP sent to your email address' };
};

// Reset password with OTP verification
exports.resetPassword = async (email, otp, newPassword) => {
    const emailService = require('./email.service');

    // Verify OTP first
    emailService.verifyOTP(email, otp);

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const [updatedRows] = await User.update(
        { password_hash },
        { where: { email } }
    );

    if (updatedRows === 0) {
        throw new Error('Failed to update password. User not found.');
    }

    return { message: 'Password reset successful. You can now login with your new password.' };
};
