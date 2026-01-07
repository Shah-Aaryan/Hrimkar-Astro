/**
 * Booking Routes
 * OWASP Best Practice: Rate limiting, input validation, authorization
 */
const express = require('express');
const router = express.Router();

// Import rate limiters
const { 
    bookingLimiter, 
    uploadLimiter,
    adminLimiter 
} = require('../middleware/rateLimiter');

// Import validators
const {
    createBookingValidation,
    rescheduleValidation,
    feedbackValidation,
    couponValidation,
    blockSlotValidation,
    paginationValidation,
    idParamValidation,
    userIdParamValidation,
    dateParamValidation
} = require('../middleware/inputValidator');

// Import controllers
const {
    createBooking,
    getMyBookings,
    getBooking,
    getBookingByRef,
    cancelBooking,
    rescheduleBooking,
    addFeedback,
    validateCoupon,
    getAvailableSlots,
    getAllBookings,
    updateBookingStatus,
    getAdminStats,
    getClients,
    getDashboardStats,
    uploadPaymentScreenshot,
    getPendingPayments,
    approvePayment,
    rejectPayment,
    getPendingAppointments,
    getMonthlyAppointments,
    blockSlot,
    unblockSlot,
    getBlockedSlots,
    getEarnings,
    getBannedUsers,
    unbanUser
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPaymentScreenshot: uploadMiddleware } = require('../middleware/upload');

// ============================================
// PUBLIC ROUTES
// ============================================

// Get available slots - public but rate limited
router.get('/slots/:date', 
    dateParamValidation,
    getAvailableSlots
);

// ============================================
// PROTECTED ROUTES (require login)
// ============================================
router.use(protect);

// User dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// Create booking - rate limited to prevent abuse
router.post('/', 
    bookingLimiter,            // 10 bookings per hour
    createBookingValidation,   // Full input validation
    createBooking
);

// Get user's bookings
router.get('/', 
    paginationValidation,
    getMyBookings
);

// Validate coupon
router.post('/validate-coupon', 
    couponValidation,
    validateCoupon
);

// Get booking by reference ID
router.get('/ref/:bookingId', getBookingByRef);

// Get single booking
router.get('/:id', 
    idParamValidation,
    getBooking
);

// Upload payment screenshot - rate limited
router.post('/:id/upload-screenshot', 
    uploadLimiter,             // 10 uploads per hour
    idParamValidation,
    uploadMiddleware.single('screenshot'), 
    uploadPaymentScreenshot
);

// Cancel booking
router.put('/:id/cancel', 
    idParamValidation,
    cancelBooking
);

// Reschedule booking
router.put('/:id/reschedule', 
    idParamValidation,
    rescheduleValidation,
    rescheduleBooking
);

// Add feedback
router.put('/:id/feedback', 
    idParamValidation,
    feedbackValidation,
    addFeedback
);

// ============================================
// ADMIN ROUTES
// ============================================

// Admin stats
router.get('/admin/stats', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    getAdminStats
);

// Get all clients
router.get('/admin/clients', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    paginationValidation,
    getClients
);

// Get all bookings
router.get('/admin/all', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    paginationValidation,
    getAllBookings
);

// Get earnings
router.get('/admin/earnings', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    getEarnings
);

// Get pending payments
router.get('/admin/pending-payments', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    getPendingPayments
);

// Get pending appointments
router.get('/admin/pending-appointments', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    getPendingAppointments
);

// Get monthly appointments
router.get('/admin/monthly-appointments', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    getMonthlyAppointments
);

// Blocked slots management
router.get('/admin/blocked-slots', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    getBlockedSlots
);

router.post('/admin/block-slot', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    blockSlotValidation,
    blockSlot
);

router.delete('/admin/unblock-slot', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    unblockSlot
);

// Update booking status
router.put('/admin/:id/status', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    idParamValidation,
    updateBookingStatus
);

// Approve/reject payment
router.put('/admin/:id/approve-payment', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    idParamValidation,
    approvePayment
);

router.put('/admin/:id/reject-payment', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    idParamValidation,
    rejectPayment
);

// Banned users management
router.get('/admin/banned-users', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    getBannedUsers
);

router.put('/admin/unban-user/:userId', 
    authorize('admin', 'astrologer'), 
    adminLimiter,
    userIdParamValidation,
    unbanUser
);

module.exports = router;
