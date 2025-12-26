const mongoose = require('mongoose');

const blockedSlotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required']
    },
    reason: {
        type: String,
        default: ''
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isFullDay: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique blocked slots
blockedSlotSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('BlockedSlot', blockedSlotSchema);
