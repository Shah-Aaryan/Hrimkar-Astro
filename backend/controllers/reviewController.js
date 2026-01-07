const Review = require('../models/Review');
const { validationResult } = require('express-validator');

// @desc    Get all approved reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
    try {
        const { category, featured, limit = 20, page = 1 } = req.query;
        
        // Build query
        const query = { isApproved: true, isVisible: true };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (featured === 'true') {
            query.isFeatured = true;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const reviews = await Review.find(query)
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-user');
        
        const total = await Review.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: reviews.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
};

// @desc    Get featured reviews
// @route   GET /api/reviews/featured
// @access  Public
exports.getFeaturedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ 
            isApproved: true, 
            isVisible: true, 
            isFeatured: true 
        })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('-user');
        
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Get featured reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured reviews'
        });
    }
};

// @desc    Get review stats
// @route   GET /api/reviews/stats
// @access  Public
exports.getReviewStats = async (req, res) => {
    try {
        const stats = await Review.getAverageRating();
        
        // Get rating distribution
        const distribution = await Review.aggregate([
            { $match: { isApproved: true, isVisible: true } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                ...stats,
                distribution
            }
        });
    } catch (error) {
        console.error('Get review stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching review stats'
        });
    }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (logged in users)
exports.createReview = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { name, occupation, location, rating, title, content, category, serviceType } = req.body;
        
        // Check if user already submitted a review
        const existingReview = await Review.findOne({ user: req.user.id });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a review. You can update your existing review.'
            });
        }
        
        const review = await Review.create({
            user: req.user.id,
            name: name || `${req.user.firstName} ${req.user.lastName}`,
            occupation,
            location,
            rating,
            title,
            content,
            category: category || 'general',
            serviceType,
            avatar: req.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.firstName + '+' + req.user.lastName)}&background=6b21a8&color=ffffff`
        });
        
        res.status(201).json({
            success: true,
            message: 'Review submitted successfully! It will be visible after approval.',
            data: review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting review'
        });
    }
};

// @desc    Update user's own review
// @route   PUT /api/reviews/my-review
// @access  Private
exports.updateMyReview = async (req, res) => {
    try {
        const review = await Review.findOne({ user: req.user.id });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        const { name, occupation, location, rating, title, content, category, serviceType } = req.body;
        
        review.name = name || review.name;
        review.occupation = occupation || review.occupation;
        review.location = location || review.location;
        review.rating = rating || review.rating;
        review.title = title || review.title;
        review.content = content || review.content;
        review.category = category || review.category;
        review.serviceType = serviceType || review.serviceType;
        review.isApproved = false; // Re-require approval after edit
        
        await review.save();
        
        res.status(200).json({
            success: true,
            message: 'Review updated successfully! It will be visible after re-approval.',
            data: review
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review'
        });
    }
};

// @desc    Get user's own review
// @route   GET /api/reviews/my-review
// @access  Private
exports.getMyReview = async (req, res) => {
    try {
        const review = await Review.findOne({ user: req.user.id });
        
        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Get my review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your review'
        });
    }
};

// @desc    Delete user's own review
// @route   DELETE /api/reviews/my-review
// @access  Private
exports.deleteMyReview = async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({ user: req.user.id });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting review'
        });
    }
};

// ==================== ADMIN ROUTES ====================

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
exports.getAllReviewsAdmin = async (req, res) => {
    try {
        const { status, category, limit = 20, page = 1 } = req.query;
        
        const query = {};
        
        if (status === 'pending') {
            query.isApproved = false;
        } else if (status === 'approved') {
            query.isApproved = true;
        }
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const reviews = await Review.find(query)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Review.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: reviews.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: reviews
        });
    } catch (error) {
        console.error('Get all reviews admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
};

// @desc    Approve/Reject review (admin)
// @route   PUT /api/reviews/admin/:id/approve
// @access  Private/Admin
exports.approveReview = async (req, res) => {
    try {
        const { isApproved } = req.body;
        
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved },
            { new: true }
        );
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: isApproved ? 'Review approved' : 'Review rejected',
            data: review
        });
    } catch (error) {
        console.error('Approve review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating review status'
        });
    }
};

// @desc    Toggle featured status (admin)
// @route   PUT /api/reviews/admin/:id/featured
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        review.isFeatured = !review.isFeatured;
        await review.save();
        
        res.status(200).json({
            success: true,
            message: review.isFeatured ? 'Review marked as featured' : 'Review removed from featured',
            data: review
        });
    } catch (error) {
        console.error('Toggle featured error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating featured status'
        });
    }
};

// @desc    Delete review (admin)
// @route   DELETE /api/reviews/admin/:id
// @access  Private/Admin
exports.deleteReviewAdmin = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting review'
        });
    }
};
