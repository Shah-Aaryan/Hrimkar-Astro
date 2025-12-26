const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
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
    getBlockedSlots
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPaymentScreenshot: uploadMiddleware } = require('../middleware/upload');

// Validation rules
const bookingValidation = [
    body('serviceId')
        .notEmpty().withMessage('Service is required')
        .isIn(['birth-chart', 'marriage-matching', 'career-guidance', 'health-astrology', 'tarot-reading', 'numerology'])
        .withMessage('Invalid service'),
    body('consultationMode')
        .notEmpty().withMessage('Consultation mode is required')
        .isIn(['phone', 'video', 'chat'])
        .withMessage('Invalid consultation mode'),
    body('scheduledDate')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format'),
    body('scheduledTime')
        .notEmpty().withMessage('Time is required'),
    body('personalDetails.fullName')
        .notEmpty().withMessage('Full name is required'),
    body('personalDetails.email')
        .isEmail().withMessage('Valid email is required'),
    body('personalDetails.phone')
        .notEmpty().withMessage('Phone is required'),
    body('paymentMethod')
        .notEmpty().withMessage('Payment method is required')
        .isIn(['upi', 'gpay'])
        .withMessage('Invalid payment method')
];

// Public routes
router.get('/slots/:date', getAvailableSlots);

// Protected routes (require login)
router.use(protect);

// User dashboard stats
router.get('/dashboard-stats', getDashboardStats);

router.route('/')
    .post(bookingValidation, createBooking)
    .get(getMyBookings);

router.post('/validate-coupon', validateCoupon);

router.get('/ref/:bookingId', getBookingByRef);

router.route('/:id')
    .get(getBooking);

// Upload payment screenshot
router.post('/:id/upload-screenshot', uploadMiddleware.single('screenshot'), uploadPaymentScreenshot);

router.put('/:id/cancel', cancelBooking);
router.put('/:id/reschedule', rescheduleBooking);
router.put('/:id/feedback', addFeedback);

// Admin routes
router.get('/admin/stats', authorize('admin', 'astrologer'), getAdminStats);
router.get('/admin/clients', authorize('admin', 'astrologer'), getClients);
router.get('/admin/all', authorize('admin', 'astrologer'), getAllBookings);
router.get('/admin/pending-payments', authorize('admin', 'astrologer'), getPendingPayments);
router.get('/admin/pending-appointments', authorize('admin', 'astrologer'), getPendingAppointments);
router.get('/admin/monthly-appointments', authorize('admin', 'astrologer'), getMonthlyAppointments);
router.get('/admin/blocked-slots', authorize('admin', 'astrologer'), getBlockedSlots);
router.post('/admin/block-slot', authorize('admin', 'astrologer'), blockSlot);
router.delete('/admin/unblock-slot', authorize('admin', 'astrologer'), unblockSlot);
router.put('/admin/:id/status', authorize('admin', 'astrologer'), updateBookingStatus);
router.put('/admin/:id/approve-payment', authorize('admin', 'astrologer'), approvePayment);
router.put('/admin/:id/reject-payment', authorize('admin', 'astrologer'), rejectPayment);

module.exports = router;
