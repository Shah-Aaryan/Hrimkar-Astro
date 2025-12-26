const Booking = require('../models/Booking');
const User = require('../models/User');
const BlockedSlot = require('../models/BlockedSlot');
const { validationResult } = require('express-validator');

// Service pricing data
const services = {
    'birth-chart': { name: 'Birth Chart Analysis', price: 1500, duration: 45 },
    'marriage-matching': { name: 'Marriage Matching', price: 2500, duration: 60 },
    'career-guidance': { name: 'Career Guidance', price: 1500, duration: 45 },
    'health-astrology': { name: 'Health Astrology', price: 1500, duration: 45 },
    'tarot-reading': { name: 'Tarot Reading', price: 1000, duration: 30 },
    'numerology': { name: 'Numerology Report', price: 1200, duration: 40 }
};

// Valid coupon codes
const coupons = {
    'FIRST10': { discount: 10, type: 'percent' },
    'COSMIC20': { discount: 20, type: 'percent' },
    'FLAT100': { discount: 100, type: 'flat' },
    'WELCOME': { discount: 15, type: 'percent' }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            serviceId,
            consultationMode,
            scheduledDate,
            scheduledTime,
            timezone,
            personalDetails,
            couponCode,
            paymentMethod
        } = req.body;

        // Validate service
        if (!services[serviceId]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service selected'
            });
        }

        const service = services[serviceId];

        // Calculate pricing
        let subtotal = service.price;
        let discount = 0;

        if (couponCode && coupons[couponCode.toUpperCase()]) {
            const coupon = coupons[couponCode.toUpperCase()];
            if (coupon.type === 'percent') {
                discount = Math.round(subtotal * coupon.discount / 100);
            } else {
                discount = coupon.discount;
            }
        }

        const total = subtotal - discount;

        // Create booking with pending payment status (awaiting screenshot upload)
        const booking = await Booking.create({
            user: req.user.id,
            service: {
                id: serviceId,
                name: service.name,
                price: service.price,
                duration: service.duration
            },
            consultationMode,
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            timezone: timezone || 'Asia/Kolkata',
            personalDetails,
            payment: {
                subtotal,
                discount,
                couponCode: couponCode ? couponCode.toUpperCase() : null,
                total,
                method: paymentMethod || 'gpay',
                status: 'pending',
                transactionId: `TXN${Date.now()}`,
                approval: {
                    status: 'pending'
                }
            },
            status: 'pending'
        });

        // Populate user details
        await booking.populate('user', 'firstName lastName email');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully. Please upload payment screenshot.',
            data: booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking'
        });
    }
};

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { user: req.user.id };
        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .sort({ scheduledDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings'
        });
    }
};

// @desc    Get user dashboard stats
// @route   GET /api/bookings/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all user's bookings
        const allBookings = await Booking.find({ user: userId });

        // Calculate stats
        const totalBookings = allBookings.length;
        const completedBookings = allBookings.filter(b => b.status === 'completed').length;
        const upcomingBookings = allBookings.filter(b => 
            b.status === 'confirmed' && new Date(b.scheduledDate) >= today
        ).length;
        const pendingBookings = allBookings.filter(b => b.status === 'pending').length;

        // Get next appointment
        const nextAppointment = await Booking.findOne({
            user: userId,
            status: { $in: ['confirmed', 'pending'] },
            scheduledDate: { $gte: today }
        }).sort({ scheduledDate: 1, scheduledTime: 1 });

        // Get upcoming appointments (next 7 days)
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        const upcomingAppointments = await Booking.find({
            user: userId,
            status: { $in: ['confirmed', 'pending'] },
            scheduledDate: { $gte: today, $lte: weekFromNow }
        }).sort({ scheduledDate: 1, scheduledTime: 1 }).limit(5);

        // Get recent activity
        const recentBookings = await Booking.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get total spent
        const totalSpent = allBookings
            .filter(b => b.payment.status === 'completed')
            .reduce((sum, b) => sum + (b.payment.total || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalBookings,
                    completedBookings,
                    upcomingBookings,
                    pendingBookings,
                    totalSpent
                },
                nextAppointment,
                upcomingAppointments,
                recentBookings
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('user', 'firstName lastName email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking'
        });
    }
};

// @desc    Get booking by booking ID (public reference)
// @route   GET /api/bookings/ref/:bookingId
// @access  Private
exports.getBookingByRef = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            bookingId: req.params.bookingId,
            user: req.user.id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get booking by ref error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking'
        });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be cancelled
        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'This booking cannot be cancelled'
            });
        }

        // Check cancellation policy (24 hours before)
        const scheduledDateTime = new Date(booking.scheduledDate);
        const hoursUntilBooking = (scheduledDateTime - new Date()) / (1000 * 60 * 60);

        let refundAmount = 0;
        if (hoursUntilBooking > 24) {
            refundAmount = booking.payment.total; // Full refund
        } else if (hoursUntilBooking > 12) {
            refundAmount = booking.payment.total * 0.5; // 50% refund
        }

        booking.status = 'cancelled';
        booking.cancellation = {
            reason,
            cancelledAt: new Date(),
            cancelledBy: req.user.id,
            refundAmount,
            refundStatus: refundAmount > 0 ? 'pending' : null
        };

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: {
                booking,
                refundAmount,
                refundMessage: refundAmount > 0 
                    ? `Refund of ₹${refundAmount} will be processed within 5-7 business days`
                    : 'No refund applicable as per cancellation policy'
            }
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking'
        });
    }
};

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = async (req, res) => {
    try {
        const { newDate, newTime, reason } = req.body;

        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be rescheduled
        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'This booking cannot be rescheduled'
            });
        }

        // Add to reschedule history
        booking.rescheduleHistory.push({
            previousDate: booking.scheduledDate,
            previousTime: booking.scheduledTime,
            newDate: new Date(newDate),
            newTime,
            reason
        });

        // Update booking
        booking.scheduledDate = new Date(newDate);
        booking.scheduledTime = newTime;
        booking.status = 'rescheduled';

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking rescheduled successfully',
            data: booking
        });
    } catch (error) {
        console.error('Reschedule booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rescheduling booking'
        });
    }
};

// @desc    Add feedback to booking
// @route   PUT /api/bookings/:id/feedback
// @access  Private
exports.addFeedback = async (req, res) => {
    try {
        const { rating, review } = req.body;

        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user.id,
            status: 'completed'
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Completed booking not found'
            });
        }

        booking.feedback = {
            rating,
            review,
            reviewedAt: new Date()
        };

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: booking
        });
    } catch (error) {
        console.error('Add feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting feedback'
        });
    }
};

// @desc    Validate coupon code
// @route   POST /api/bookings/validate-coupon
// @access  Private
exports.validateCoupon = async (req, res) => {
    try {
        const { couponCode, serviceId } = req.body;

        if (!couponCode) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            });
        }

        const coupon = coupons[couponCode.toUpperCase()];

        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        const service = services[serviceId];
        if (!service) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service'
            });
        }

        let discountAmount = 0;
        if (coupon.type === 'percent') {
            discountAmount = Math.round(service.price * coupon.discount / 100);
        } else {
            discountAmount = coupon.discount;
        }

        res.status(200).json({
            success: true,
            data: {
                valid: true,
                code: couponCode.toUpperCase(),
                discountType: coupon.type,
                discountValue: coupon.discount,
                discountAmount,
                finalPrice: service.price - discountAmount
            }
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating coupon'
        });
    }
};

// @desc    Get available time slots
// @route   GET /api/bookings/slots/:date
// @access  Public
exports.getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.params;
        const selectedDate = new Date(date);

        // Get all bookings for the date
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedSlots = await Booking.find({
            scheduledDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled'] }
        }).select('scheduledTime');

        const bookedTimes = bookedSlots.map(b => b.scheduledTime);

        // Get blocked slots for this date
        const blockedSlots = await BlockedSlot.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        });
        
        // Check if entire day is blocked
        const fullDayBlocked = blockedSlots.some(slot => slot.isFullDay);
        if (fullDayBlocked) {
            return res.status(200).json({
                success: true,
                data: {
                    date: req.params.date,
                    slots: [],
                    message: 'This day is not available for bookings'
                }
            });
        }
        
        const blockedTimes = blockedSlots.map(b => b.timeSlot);

        // Check if selected date is today
        const now = new Date();
        const isToday = selectedDate.toDateString() === now.toDateString();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        // Generate all possible slots (9 AM to 8 PM)
        const allSlots = [];
        for (let hour = 9; hour <= 20; hour++) {
            const time12hr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
            
            // Check if this slot is in the past (for today only)
            let isPastSlot = false;
            if (isToday) {
                // Skip slots that have passed (with 30 min buffer)
                if (hour < currentHour || (hour === currentHour && currentMinutes >= 30)) {
                    isPastSlot = true;
                }
            }
            
            if (!isPastSlot) {
                const isBooked = bookedTimes.includes(time12hr);
                const isBlocked = blockedTimes.includes(time12hr);
                allSlots.push({
                    time: time12hr,
                    available: !isBooked && !isBlocked,
                    blocked: isBlocked
                });
            }
            
            if (hour < 20) {
                const time12hrHalf = `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`;
                
                // Check if half-hour slot is in the past
                let isPastHalfSlot = false;
                if (isToday) {
                    if (hour < currentHour || (hour === currentHour)) {
                        isPastHalfSlot = true;
                    }
                }
                
                if (!isPastHalfSlot) {
                    const isBookedHalf = bookedTimes.includes(time12hrHalf);
                    const isBlockedHalf = blockedTimes.includes(time12hrHalf);
                    allSlots.push({
                        time: time12hrHalf,
                        available: !isBookedHalf && !isBlockedHalf,
                        blocked: isBlockedHalf
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                date: req.params.date,
                slots: allSlots
            }
        });
    } catch (error) {
        console.error('Get slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available slots'
        });
    }
};

// ==================== ADMIN ROUTES ====================

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.scheduledDate = {};
            if (startDate) query.scheduledDate.$gte = new Date(startDate);
            if (endDate) query.scheduledDate.$lte = new Date(endDate);
        }

        const bookings = await Booking.find(query)
            .populate('user', 'firstName lastName email phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        // Get statistics
        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$payment.total' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            stats,
            data: bookings
        });
    } catch (error) {
        console.error('Admin get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings'
        });
    }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/admin/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, adminNotes, meetingLink } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = status || booking.status;
        booking.adminNotes = adminNotes || booking.adminNotes;
        booking.meetingLink = meetingLink || booking.meetingLink;

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        console.error('Admin update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating booking'
        });
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/bookings/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        // Get total bookings and revenue
        const totalStats = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$payment.total' }
                }
            }
        ]);

        // Get today's bookings
        const todayBookings = await Booking.countDocuments({
            scheduledDate: { $gte: today, $lt: tomorrow }
        });

        // Get today's schedule with details
        const todaySchedule = await Booking.find({
            scheduledDate: { $gte: today, $lt: tomorrow },
            status: { $in: ['confirmed', 'pending'] }
        })
        .populate('user', 'firstName lastName email phone')
        .sort({ scheduledTime: 1 });

        // Get this month's stats
        const thisMonthStats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$payment.total' }
                }
            }
        ]);

        // Get last month's stats for comparison
        const lastMonthStats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$payment.total' }
                }
            }
        ]);

        // Get bookings by status
        const statusStats = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get bookings by service
        const serviceStats = await Booking.aggregate([
            {
                $group: {
                    _id: '$service.name',
                    count: { $sum: 1 },
                    revenue: { $sum: '$payment.total' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get total unique clients
        const totalClients = await Booking.distinct('user');

        // Get recent bookings
        const recentBookings = await Booking.find()
            .populate('user', 'firstName lastName email phone')
            .sort({ createdAt: -1 })
            .limit(10);

        // Calculate growth
        const thisMonth = thisMonthStats[0] || { bookings: 0, revenue: 0 };
        const lastMonth = lastMonthStats[0] || { bookings: 0, revenue: 0 };
        
        const bookingGrowth = lastMonth.bookings > 0 
            ? Math.round(((thisMonth.bookings - lastMonth.bookings) / lastMonth.bookings) * 100)
            : 100;
            
        const revenueGrowth = lastMonth.revenue > 0
            ? Math.round(((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100)
            : 100;

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalBookings: totalStats[0]?.totalBookings || 0,
                    totalRevenue: totalStats[0]?.totalRevenue || 0,
                    totalClients: totalClients.length,
                    todayBookings
                },
                todaySchedule,
                thisMonth: {
                    bookings: thisMonth.bookings,
                    revenue: thisMonth.revenue,
                    bookingGrowth,
                    revenueGrowth
                },
                statusBreakdown: statusStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                topServices: serviceStats.slice(0, 5),
                recentBookings
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin stats'
        });
    }
};

// @desc    Get all clients (Admin)
// @route   GET /api/bookings/admin/clients
// @access  Private/Admin
exports.getClients = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        // Get all users who have made bookings
        const clientBookings = await Booking.aggregate([
            {
                $group: {
                    _id: '$user',
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: '$payment.total' },
                    lastBooking: { $max: '$createdAt' },
                    firstBooking: { $min: '$createdAt' }
                }
            },
            { $sort: { lastBooking: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);

        // Get user details
        const userIds = clientBookings.map(c => c._id);
        const users = await User.find({ _id: { $in: userIds } })
            .select('firstName lastName email phone createdAt');

        // Combine data
        const clients = clientBookings.map(cb => {
            const user = users.find(u => u._id.toString() === cb._id.toString());
            return {
                ...user?.toObject(),
                stats: {
                    totalBookings: cb.totalBookings,
                    totalSpent: cb.totalSpent,
                    lastBooking: cb.lastBooking,
                    firstBooking: cb.firstBooking
                }
            };
        }).filter(c => c._id); // Filter out any null users

        const totalClients = await Booking.distinct('user').then(ids => ids.length);

        res.status(200).json({
            success: true,
            count: clients.length,
            total: totalClients,
            pages: Math.ceil(totalClients / limit),
            currentPage: parseInt(page),
            data: clients
        });
    } catch (error) {
        console.error('Admin get clients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching clients'
        });
    }
};

// ==================== PAYMENT SCREENSHOT & APPROVAL ====================

// @desc    Upload payment screenshot
// @route   POST /api/bookings/:id/upload-screenshot
// @access  Private
exports.uploadPaymentScreenshot = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking'
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a payment screenshot'
            });
        }

        console.log('Uploaded file info:', req.file);

        // Update booking with screenshot details
        // For Cloudinary, the URL is in req.file.path or req.file.secure_url
        const screenshotUrl = req.file.path || req.file.secure_url || req.file.url;
        
        booking.payment.screenshot = {
            url: screenshotUrl,
            publicId: req.file.filename || req.file.public_id,
            uploadedAt: new Date()
        };
        booking.payment.status = 'awaiting_approval';
        booking.payment.approval.status = 'pending';
        booking.status = 'awaiting_payment_approval';

        await booking.save();
        
        console.log('Saved screenshot URL:', booking.payment.screenshot.url);

        res.status(200).json({
            success: true,
            message: 'Payment screenshot uploaded successfully. Awaiting admin approval.',
            data: {
                bookingId: booking.bookingId,
                screenshotUrl: booking.payment.screenshot.url,
                status: booking.status
            }
        });
    } catch (error) {
        console.error('Upload screenshot error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading payment screenshot'
        });
    }
};

// @desc    Get all pending payment approvals (Admin)
// @route   GET /api/bookings/admin/pending-payments
// @access  Private/Admin
exports.getPendingPayments = async (req, res) => {
    try {
        const pendingBookings = await Booking.find({
            'payment.approval.status': 'pending',
            'payment.screenshot.url': { $exists: true, $ne: null }
        })
        .populate('user', 'firstName lastName email phone')
        .sort({ 'payment.screenshot.uploadedAt': -1 });

        res.status(200).json({
            success: true,
            count: pendingBookings.length,
            data: pendingBookings
        });
    } catch (error) {
        console.error('Get pending payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending payments'
        });
    }
};

// @desc    Approve payment (Admin)
// @route   PUT /api/bookings/admin/:id/approve-payment
// @access  Private/Admin
exports.approvePayment = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update payment and booking status
        booking.payment.status = 'completed';
        booking.payment.approval.status = 'approved';
        booking.payment.approval.approvedBy = req.user.id;
        booking.payment.approval.approvedAt = new Date();
        booking.payment.paidAt = new Date();
        booking.status = 'confirmed';

        await booking.save();

        // Populate user for response
        await booking.populate('user', 'firstName lastName email');

        res.status(200).json({
            success: true,
            message: 'Payment approved successfully. Booking is now confirmed.',
            data: booking
        });
    } catch (error) {
        console.error('Approve payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving payment'
        });
    }
};

// @desc    Reject payment (Admin)
// @route   PUT /api/bookings/admin/:id/reject-payment
// @access  Private/Admin
exports.rejectPayment = async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update payment and booking status
        booking.payment.status = 'rejected';
        booking.payment.approval.status = 'rejected';
        booking.payment.approval.approvedBy = req.user.id;
        booking.payment.approval.approvedAt = new Date();
        booking.payment.approval.rejectionReason = reason || 'Payment screenshot not valid';
        booking.status = 'payment_rejected';

        await booking.save();

        // Populate user for response
        await booking.populate('user', 'firstName lastName email');

        res.status(200).json({
            success: true,
            message: 'Payment rejected.',
            data: booking
        });
    } catch (error) {
        console.error('Reject payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting payment'
        });
    }
};

// @desc    Get all appointments for a month (Admin)
// @route   GET /api/bookings/admin/monthly-appointments
// @access  Private/Admin
exports.getMonthlyAppointments = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        // Default to current month if not provided
        const now = new Date();
        // month is 1-indexed from frontend, convert to 0-indexed for JS Date
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
        const targetYear = year ? parseInt(year) : now.getFullYear();
        
        // Get start and end of month
        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
        
        // Get all appointments for the month
        const appointments = await Booking.find({
            scheduledDate: { $gte: startOfMonth, $lte: endOfMonth }
        })
        .populate('user', 'firstName lastName email phone')
        .sort({ scheduledDate: 1, scheduledTime: 1 });

        // Calculate summary
        const summary = {
            total: appointments.length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            pending: appointments.filter(a => a.status === 'pending').length,
            awaitingPayment: appointments.filter(a => a.status === 'awaiting_payment_approval').length,
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length
        };

        res.status(200).json({
            success: true,
            count: appointments.length,
            month: targetMonth + 1, // Return 1-indexed for frontend
            year: targetYear,
            summary,
            data: appointments
        });
    } catch (error) {
        console.error('Get monthly appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly appointments'
        });
    }
};

// @desc    Get all pending/upcoming appointments (Admin)
// @route   GET /api/bookings/admin/pending-appointments
// @access  Private/Admin
exports.getPendingAppointments = async (req, res) => {
    try {
        const now = new Date();
        
        // Get all upcoming appointments (pending, confirmed, awaiting_payment_approval)
        const appointments = await Booking.find({
            scheduledDate: { $gte: new Date(now.toDateString()) },
            status: { $in: ['pending', 'confirmed', 'awaiting_payment_approval'] }
        })
        .populate('user', 'firstName lastName email phone')
        .sort({ scheduledDate: 1, scheduledTime: 1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get pending appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending appointments'
        });
    }
};

// @desc    Block a time slot (Admin)
// @route   POST /api/bookings/admin/block-slot
// @access  Private/Admin
exports.blockSlot = async (req, res) => {
    try {
        const { date, timeSlot, reason, isFullDay } = req.body;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        const slotDate = new Date(date);
        slotDate.setHours(0, 0, 0, 0);

        // If blocking full day, remove any existing slots for that day and create one full-day block
        if (isFullDay) {
            await BlockedSlot.deleteMany({
                date: {
                    $gte: slotDate,
                    $lt: new Date(slotDate.getTime() + 24 * 60 * 60 * 1000)
                }
            });

            const blockedSlot = await BlockedSlot.create({
                date: slotDate,
                timeSlot: 'FULL_DAY',
                reason: reason || 'Day blocked by admin',
                blockedBy: req.user.id,
                isFullDay: true
            });

            return res.status(201).json({
                success: true,
                message: 'Full day blocked successfully',
                data: blockedSlot
            });
        }

        if (!timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Time slot is required'
            });
        }

        // Check if slot already blocked
        const existingBlock = await BlockedSlot.findOne({
            date: {
                $gte: slotDate,
                $lt: new Date(slotDate.getTime() + 24 * 60 * 60 * 1000)
            },
            timeSlot: timeSlot
        });

        if (existingBlock) {
            return res.status(400).json({
                success: false,
                message: 'This slot is already blocked'
            });
        }

        // Check if there's an existing booking for this slot
        const existingBooking = await Booking.findOne({
            scheduledDate: {
                $gte: slotDate,
                $lt: new Date(slotDate.getTime() + 24 * 60 * 60 * 1000)
            },
            scheduledTime: timeSlot,
            status: { $nin: ['cancelled', 'payment_rejected'] }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Cannot block this slot - there is an existing booking'
            });
        }

        const blockedSlot = await BlockedSlot.create({
            date: slotDate,
            timeSlot,
            reason: reason || 'Blocked by admin',
            blockedBy: req.user.id,
            isFullDay: false
        });

        res.status(201).json({
            success: true,
            message: 'Slot blocked successfully',
            data: blockedSlot
        });
    } catch (error) {
        console.error('Block slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Error blocking slot'
        });
    }
};

// @desc    Unblock a time slot (Admin)
// @route   DELETE /api/bookings/admin/unblock-slot
// @access  Private/Admin
exports.unblockSlot = async (req, res) => {
    try {
        const { date, timeSlot } = req.body;

        if (!date || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Date and time slot are required'
            });
        }

        const slotDate = new Date(date);
        slotDate.setHours(0, 0, 0, 0);

        const result = await BlockedSlot.findOneAndDelete({
            date: {
                $gte: slotDate,
                $lt: new Date(slotDate.getTime() + 24 * 60 * 60 * 1000)
            },
            timeSlot: timeSlot
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Blocked slot not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Slot unblocked successfully'
        });
    } catch (error) {
        console.error('Unblock slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unblocking slot'
        });
    }
};

// @desc    Get blocked slots for a date range (Admin)
// @route   GET /api/bookings/admin/blocked-slots
// @access  Private/Admin
exports.getBlockedSlots = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            // Default to next 30 days
            const now = new Date();
            query.date = {
                $gte: now,
                $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            };
        }

        const blockedSlots = await BlockedSlot.find(query)
            .populate('blockedBy', 'firstName lastName')
            .sort({ date: 1, timeSlot: 1 });

        res.status(200).json({
            success: true,
            count: blockedSlots.length,
            data: blockedSlots
        });
    } catch (error) {
        console.error('Get blocked slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blocked slots'
        });
    }
};
