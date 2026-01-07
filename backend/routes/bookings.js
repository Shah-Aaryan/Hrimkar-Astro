/**
 * Booking Routes
 * OWASP Best Practice: Rate limiting, input validation, authorization
 */
const express = require('express');
const router = express.Router();

// Rate limiters
const { 
  bookingLimiter,
  uploadLimiter,
  adminLimiter
} = require('../middleware/rateLimiter');

// Validators
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

// Controllers
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


// ======================================================
// PUBLIC ROUTES
// ======================================================

// Available slots (public)
router.get(
  '/slots/:date',
  dateParamValidation,
  getAvailableSlots
);


// ======================================================
// AUTHENTICATED USER ROUTES
// ======================================================

router.use(protect);

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// Create booking (rate-limited)
router.post(
  '/',
  bookingLimiter,
  createBookingValidation,
  createBooking
);

// Get my bookings
router.get(
  '/',
  paginationValidation,
  getMyBookings
);

// Validate coupon
router.post(
  '/validate-coupon',
  couponValidation,
  validateCoupon
);


// ======================================================
// ADMIN ROUTES  (IMPORTANT: must come BEFORE :id routes)
// ======================================================

router.get(
  '/admin/stats',
  authorize('admin', 'astrologer'),
  adminLimiter,
  getAdminStats
);

router.get(
  '/admin/clients',
  authorize('admin', 'astrologer'),
  adminLimiter,
  paginationValidation,
  getClients
);

router.get(
  '/admin/all',
  authorize('admin', 'astrologer'),
  adminLimiter,
  paginationValidation,
  getAllBookings
);

router.get(
  '/admin/earnings',
  authorize('admin', 'astrologer'),
  adminLimiter,
  getEarnings
);

router.get(
  '/admin/pending-payments',
  authorize('admin', 'astrologer'),
  adminLimiter,
  getPendingPayments
);

router.get(
  '/admin/pending-appointments',
  authorize('admin', 'astrologer'),
  adminLimiter,
  getPendingAppointments
);

router.get(
  '/admin/monthly-appointments',
  authorize('admin', 'astrologer'),
  adminLimiter,
  getMonthlyAppointments
);

router.get(
  '/admin/blocked-slots',
  authorize('admin', 'astrologer'),
  adminLimiter,
  getBlockedSlots
);

router.post(
  '/admin/block-slot',
  authorize('admin', 'astrologer'),
  adminLimiter,
  blockSlotValidation,
  blockSlot
);

router.delete(
  '/admin/unblock-slot',
  authorize('admin', 'astrologer'),
  adminLimiter,
  unblockSlot
);

router.put(
  '/admin/:id/status',
  authorize('admin', 'astrologer'),
  adminLimiter,
  idParamValidation,
  updateBookingStatus
);

router.put(
  '/admin/:id/approve-payment',
  authorize('admin', 'astrologer'),
  adminLimiter,
  idParamValidation,
  approvePayment
);

router.put(
  '/admin/:id/reject-payment',
  authorize('admin', 'astrologer'),
  adminLimiter,
  idParamValidation,
  rejectPayment
);

// Banned users
router.get(
  '/admin/banned-users',
  authorize('admin', 'astrologer'),
  adminLimiter,
  getBannedUsers
);

router.put(
  '/admin/unban-user/:userId',
  authorize('admin', 'astrologer'),
  adminLimiter,
  userIdParamValidation,
  unbanUser
);


// ======================================================
// USER BOOKING DETAIL ROUTES
// ======================================================

// Get booking by reference ID
router.get('/ref/:bookingId', getBookingByRef);

// Upload payment screenshot
router.post(
  '/:id/upload-screenshot',
  uploadLimiter,
  idParamValidation,
  uploadMiddleware.single('screenshot'),
  uploadPaymentScreenshot
);

// Cancel booking
router.put(
  '/:id/cancel',
  idParamValidation,
  cancelBooking
);

// Reschedule booking
router.put(
  '/:id/reschedule',
  idParamValidation,
  rescheduleValidation,
  rescheduleBooking
);

// Add feedback
router.put(
  '/:id/feedback',
  idParamValidation,
  feedbackValidation,
  addFeedback
);

// Get single booking (PLACE LAST to avoid route shadowing)
router.get(
  '/:id',
  idParamValidation,
  getBooking
);


module.exports = router;
