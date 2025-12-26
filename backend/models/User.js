const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide first name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Please provide last name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        match: [/^\+?[\d\s-]{10,}$/, 'Please provide valid phone number']
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'astrologer', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    dateOfBirth: {
        type: Date
    },
    timeOfBirth: {
        type: String
    },
    placeOfBirth: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Get full name
UserSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);
