/**
 * Review Routes
 * OWASP Best Practice: Rate limiting, input validation
 */
const express = require('express');
const router = express.Router();

// Import rate limiters
const { reviewLimiter, adminLimiter } = require('../middleware/rateLimiter');

// Import validators
const { 
    reviewValidation,
    idParamValidation,
    paginationValidation
} = require('../middleware/inputValidator');

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

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', paginationValidation, getReviews);
router.get('/featured', getFeaturedReviews);
router.get('/stats', getReviewStats);

// ============================================
// PROTECTED ROUTES (logged in users)
// ============================================
router.post('/', 
    protect, 
    reviewLimiter,       // 5 review actions per hour
    reviewValidation, 
    createReview
);

router.get('/my-review', protect, getMyReview);

router.put('/my-review', 
    protect, 
    reviewLimiter,
    reviewValidation,
    updateMyReview
);

router.delete('/my-review', 
    protect, 
    reviewLimiter,
    deleteMyReview
);

// ============================================
// ADMIN ROUTES
// ============================================
router.get('/admin/all', 
    protect, 
    authorize('admin'), 
    adminLimiter,
    paginationValidation,
    getAllReviewsAdmin
);

router.put('/admin/:id/approve', 
    protect, 
    authorize('admin'), 
    adminLimiter,
    idParamValidation,
    approveReview
);

router.put('/admin/:id/featured', 
    protect, 
    authorize('admin'), 
    adminLimiter,
    idParamValidation,
    toggleFeatured
);

router.delete('/admin/:id', 
    protect, 
    authorize('admin'), 
    adminLimiter,
    idParamValidation,
    deleteReviewAdmin
);

module.exports = router;
