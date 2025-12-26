const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
    getReviews,
    getFeaturedReviews,
    getReviewStats,
    createReview,
    updateMyReview,
    getMyReview,
    deleteMyReview,
    getAllReviewsAdmin,
    approveReview,
    toggleFeatured,
    deleteReviewAdmin
} = require('../controllers/reviewController');

// Validation rules
const reviewValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('content')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Review content must be between 10 and 1000 characters'),
    body('category')
        .optional()
        .isIn(['vedic', 'marriage', 'career', 'tarot', 'general'])
        .withMessage('Invalid category')
];

// Public routes
router.get('/', getReviews);
router.get('/featured', getFeaturedReviews);
router.get('/stats', getReviewStats);

// Protected routes (logged in users)
router.post('/', protect, reviewValidation, createReview);
router.get('/my-review', protect, getMyReview);
router.put('/my-review', protect, updateMyReview);
router.delete('/my-review', protect, deleteMyReview);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllReviewsAdmin);
router.put('/admin/:id/approve', protect, authorize('admin'), approveReview);
router.put('/admin/:id/featured', protect, authorize('admin'), toggleFeatured);
router.delete('/admin/:id', protect, authorize('admin'), deleteReviewAdmin);

module.exports = router;
