const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        default: () => `CW-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Service Details
    service: {
        id: {
            type: String,
            required: [true, 'Service ID is required'],
            enum: ['birth-chart', 'marriage-matching', 'career-guidance', 'health-astrology', 'tarot-reading', 'numerology']
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        duration: {
            type: Number,
            required: true
        }
    },
    // Consultation Mode
    consultationMode: {
        type: String,
        required: [true, 'Consultation mode is required'],
        enum: ['phone', 'chat']
    },
    // Scheduling
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },
    scheduledTime: {
        type: String,
        required: [true, 'Scheduled time is required']
    },
    timezone: {
        type: String,
        default: 'Asia/Kolkata'
    },
    // Personal Details for Consultation
    personalDetails: {
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        dateOfBirth: Date,
        timeOfBirth: String,
        placeOfBirth: String,
        consultationPurpose: String
    },
    // Payment Information
    payment: {
        subtotal: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        },
        couponCode: String,
        total: {
            type: Number,
            required: true
        },
        method: {
            type: String,
            enum: ['upi', 'gpay'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'awaiting_approval', 'completed', 'failed', 'refunded', 'rejected'],
            default: 'pending'
        },
        transactionId: String,
        paidAt: Date,
        // Payment Screenshot for GPay/UPI payments
        screenshot: {
            url: String,
            publicId: String,
            uploadedAt: Date
        },
        // Admin approval for payment
        approval: {
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            approvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            approvedAt: Date,
            rejectionReason: String
        }
    },
    // Booking Status
    status: {
        type: String,
        enum: ['pending', 'awaiting_payment_approval', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'no-show', 'payment_rejected'],
        default: 'pending'
    },
    // Assigned Astrologer
    astrologer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Meeting Details
    meetingLink: String,
    meetingId: String,
    // Notes & Feedback
    notes: String,
    adminNotes: String,
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: String,
        reviewedAt: Date
    },
    // Cancellation
    cancellation: {
        reason: String,
        cancelledAt: Date,
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        refundAmount: Number,
        refundStatus: {
            type: String,
            enum: ['pending', 'processed', 'completed']
        }
    },
    // Rescheduling History
    rescheduleHistory: [{
        previousDate: Date,
        previousTime: String,
        newDate: Date,
        newTime: String,
        rescheduledAt: {
            type: Date,
            default: Date.now
        },
        reason: String
    }],
    // Reminders
    remindersSent: {
        email24hr: { type: Boolean, default: false },
        email1hr: { type: Boolean, default: false },
        sms24hr: { type: Boolean, default: false },
        sms1hr: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Indexes for faster queries
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ scheduledDate: 1 });
BookingSchema.index({ 'payment.status': 1 });

// Generate booking ID before save
BookingSchema.pre('save', function(next) {
    if (!this.bookingId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        this.bookingId = `CW-${year}${month}${day}${random}`;
    }
    next();
});

module.exports = mongoose.model('Booking', BookingSchema);
