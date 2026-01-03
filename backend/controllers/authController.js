const Otp = require('../models/Otp');
const sendOtpEmail = require('../utils/sendOtpEmail');
const crypto = require('crypto');
const User = require('../models/User');

// @desc    Send OTP to email for signup
// @route   POST /api/auth/request-otp
// @access  Public
exports.requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email required' });
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'An account with this email already exists. Please login instead.' 
            });
        }
        
        const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
        await Otp.deleteMany({ email }); // Remove old OTPs
        await Otp.create({ email, otp });
        
        await sendOtpEmail(email, otp);
        res.json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message === 'Email service not configured' 
                ? 'Email service is not configured. Please contact support.' 
                : 'Failed to send OTP. Please try again.' 
        });
    }
};

// @desc    Register user with OTP verification
// @route   POST /api/auth/register-with-otp
// @access  Public
exports.registerWithOtp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { firstName, lastName, email, phone, password, otp } = req.body;
        if (!otp) return res.status(400).json({ success: false, message: 'OTP required' });
        const otpDoc = await Otp.findOne({ email, otp });
        if (!otpDoc) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const user = await User.create({ firstName, lastName, email, phone, password });
        await Otp.deleteMany({ email });
        sendTokenResponse(user, 201, res, 'Registration successful');
    } catch (error) {
        console.error('Register with OTP error:', error);
        res.status(500).json({ success: false, message: 'Error registering user' });
    }
};
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, phone, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password
        });

        // Generate token and send response
        sendTokenResponse(user, 201, res, 'Registration successful');
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token and send response
        sendTokenResponse(user, 200, res, 'Login successful');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            dateOfBirth: req.body.dateOfBirth,
            timeOfBirth: req.body.timeOfBirth,
            placeOfBirth: req.body.placeOfBirth
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key => 
            fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password updated successfully');
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password'
        });
    }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user,
        message: 'Token is valid'
    });
};

// Helper: Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    // Remove password from output
    user.password = undefined;

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            message,
            token,
            data: user
        });
};
