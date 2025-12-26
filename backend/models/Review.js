const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    occupation: {
        type: String,
        trim: true,
        maxlength: [100, 'Occupation cannot exceed 100 characters']
    },
    location: {
        type: String,
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    title: {
        type: String,
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Please provide review content'],
        trim: true,
        maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    category: {
        type: String,
        enum: ['vedic', 'marriage', 'career', 'tarot', 'general'],
        default: 'general'
    },
    serviceType: {
        type: String,
        trim: true,
        maxlength: [100, 'Service type cannot exceed 100 characters']
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
ReviewSchema.index({ isApproved: 1, isVisible: 1, createdAt: -1 });
ReviewSchema.index({ category: 1 });
ReviewSchema.index({ isFeatured: 1 });

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function() {
    const result = await this.aggregate([
        { $match: { isApproved: true, isVisible: true } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
    
    return result.length > 0 
        ? { averageRating: Math.round(result[0].averageRating * 10) / 10, totalReviews: result[0].totalReviews }
        : { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', ReviewSchema);
