/**
 * Hrimkar Astro - Dashboard API Integration
 * Handles all dashboard data fetching and updates from MongoDB backend
 */

const DASHBOARD_API_BASE = 'http://localhost:5000/api';

// Dashboard API Class
class DashboardAPI {
    constructor() {
        this.user = null;
        this.bookings = [];
        this.stats = null;
        this.payments = [];
    }

    // Initialize dashboard
    async init() {
        this.showLoading(true);
        
        // Check authentication
        if (!window.API || !window.API.Token.isLoggedIn()) {
            // Preserve any service parameter when redirecting to login
            const urlParams = new URLSearchParams(window.location.search);
            const serviceParam = urlParams.get('service');
            const redirectUrl = serviceParam ? `dashboard.html?service=${serviceParam}` : 'dashboard.html';
            window.location.href = `login.html?redirect=${encodeURIComponent(redirectUrl)}`;
            return false;
        }

        try {
            // Verify token is still valid
            const isValid = await window.API.Auth.verifyToken();
            if (!isValid) {
                // Preserve any service parameter when redirecting to login
                const urlParams = new URLSearchParams(window.location.search);
                const serviceParam = urlParams.get('service');
                const redirectUrl = serviceParam ? `dashboard.html?service=${serviceParam}` : 'dashboard.html';
                window.location.href = `login.html?redirect=${encodeURIComponent(redirectUrl)}`;
                return false;
            }

            // Load user data
            this.user = window.API.Token.getUser();
            this.updateUserUI();

            // Load dashboard data
            await this.loadDashboardData();
            
            // Initialize form handlers
            this.initFormHandlers();
            
            this.showLoading(false);
            return true;
        } catch (error) {
            console.error('Dashboard init error:', error);
            this.showToast('Error loading dashboard', 'error');
            this.showLoading(false);
            return false;
        }
    }

    // Update user interface with user data
    updateUserUI() {
        if (!this.user) return;

        const fullName = `${this.user.firstName} ${this.user.lastName || ''}`.trim();

        // Update user name displays
        document.querySelectorAll('.user-name, #userName').forEach(el => {
            el.textContent = fullName;
        });

        // Update welcome name
        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName) {
            welcomeName.textContent = this.user.firstName;
        }

        // Update email displays
        document.querySelectorAll('.user-email').forEach(el => {
            el.textContent = this.user.email;
        });

        // Update avatar
        document.querySelectorAll('.user-avatar img').forEach(img => {
            const avatarUrl = this.user.avatar && this.user.avatar !== 'default-avatar.png' 
                ? this.user.avatar 
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1a1f2e&color=d4af37`;
            img.src = avatarUrl;
        });

        // Update profile form fields
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        const profileDob = document.getElementById('profileDob');
        const profileTob = document.getElementById('profileTob');
        const profilePob = document.getElementById('profilePob');
        
        if (profileName) profileName.value = fullName;
        if (profileEmail) profileEmail.value = this.user.email || '';
        if (profilePhone) profilePhone.value = this.user.phone || '';
        if (profileDob) profileDob.value = this.user.dateOfBirth ? this.user.dateOfBirth.split('T')[0] : '';
        if (profileTob) profileTob.value = this.user.timeOfBirth || '';
        if (profilePob) profilePob.value = this.user.placeOfBirth || '';
    }

    // Load all dashboard data from backend
    async loadDashboardData() {
        try {
            const token = window.API.Token.getToken();
            
            // Fetch dashboard stats from backend
            const statsResponse = await fetch(`${DASHBOARD_API_BASE}/bookings/dashboard-stats`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const statsData = await statsResponse.json();
            
            if (statsData.success) {
                this.stats = statsData.data.stats;
                this.bookings = statsData.data.recentBookings || [];
                
                // Update all dashboard sections
                this.updateSummaryCards(statsData.data);
                this.updateUpcomingAppointmentsTable(statsData.data.upcomingAppointments || []);
                this.updateRecentReportsTable();
                this.updateAllAppointmentsTable();
                this.updatePaymentsTable();
                return;
            }

            // Fallback: Fetch bookings directly
            await this.loadBookingsFallback();
            
        } catch (error) {
            console.error('Load dashboard data error:', error);
            // Try fallback
            await this.loadBookingsFallback();
        }
    }

    // Fallback method to load bookings
    async loadBookingsFallback() {
        try {
            const bookingsResponse = await window.API.Booking.getMyBookings({ limit: 50 });
            if (bookingsResponse.success) {
                this.bookings = bookingsResponse.data;
                this.calculateStatsFromBookings();
                this.updateSummaryCardsFromBookings();
                this.updateUpcomingAppointmentsTable(this.getUpcomingBookings());
                this.updateAllAppointmentsTable();
                this.updatePaymentsTable();
            }
        } catch (error) {
            console.error('Fallback bookings error:', error);
            this.showEmptyState();
        }
    }

    // Calculate stats from bookings
    calculateStatsFromBookings() {
        const now = new Date();
        this.stats = {
            upcomingBookings: this.bookings.filter(b => 
                ['confirmed', 'pending', 'rescheduled'].includes(b.status) && new Date(b.scheduledDate) >= now
            ).length,
            completedBookings: this.bookings.filter(b => b.status === 'completed').length,
            pendingReports: this.bookings.filter(b => b.status === 'completed' && !b.reportUrl).length,
            totalSpent: this.bookings
                .filter(b => b.payment?.status === 'completed')
                .reduce((sum, b) => sum + (b.payment?.total || 0), 0)
        };
    }

    // Update summary cards
    updateSummaryCards(data) {
        const stats = data.stats;
        const nextAppointment = data.nextAppointment;
        
        // Next Appointment
        const nextAppEl = document.getElementById('nextAppointment');
        if (nextAppEl) {
            if (nextAppointment) {
                const date = new Date(nextAppointment.scheduledDate);
                nextAppEl.textContent = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${nextAppointment.scheduledTime}`;
            } else {
                nextAppEl.textContent = 'No upcoming';
            }
        }

        // Total Consultations
        const totalConsultationsEl = document.getElementById('totalConsultations');
        if (totalConsultationsEl) {
            totalConsultationsEl.textContent = stats.completedBookings || 0;
        }

        // Pending Reports
        const pendingReportsEl = document.getElementById('pendingReports');
        if (pendingReportsEl) {
            pendingReportsEl.textContent = stats.pendingBookings || 0;
        }

        // Last Payment - find most recent completed payment
        const paymentValueEl = document.getElementById('lastPaymentValue');
        if (paymentValueEl) {
            if (this.bookings.length > 0) {
                // Sort bookings by date and find the most recent completed payment
                const paidBookings = this.bookings
                    .filter(b => b.payment?.status === 'completed' && b.payment?.paidAt)
                    .sort((a, b) => new Date(b.payment.paidAt) - new Date(a.payment.paidAt));
                
                if (paidBookings.length > 0) {
                    const lastPaidBooking = paidBookings[0];
                    const paidDate = new Date(lastPaidBooking.payment.paidAt);
                    const formattedDate = paidDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    paymentValueEl.textContent = `₹${lastPaidBooking.payment.total.toLocaleString('en-IN')}`;
                    paymentValueEl.classList.add('status-success');
                    
                    // Update date if element exists
                    const paymentDateEl = document.getElementById('lastPaymentDate');
                    if (paymentDateEl) {
                        paymentDateEl.textContent = formattedDate;
                    }
                } else {
                    paymentValueEl.textContent = 'No payments';
                    paymentValueEl.classList.remove('status-success');
                }
            } else {
                paymentValueEl.textContent = 'No payments';
                paymentValueEl.classList.remove('status-success');
            }
        }
    }

    // Update summary cards from bookings (fallback)
    updateSummaryCardsFromBookings() {
        const upcoming = this.getUpcomingBookings();
        
        // Next Appointment
        const nextAppEl = document.getElementById('nextAppointment');
        if (nextAppEl && upcoming.length > 0) {
            const next = upcoming[0];
            const date = new Date(next.scheduledDate);
            nextAppEl.textContent = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${next.scheduledTime}`;
        } else if (nextAppEl) {
            nextAppEl.textContent = 'No upcoming';
        }

        // Total Consultations
        const totalConsultationsEl = document.getElementById('totalConsultations');
        if (totalConsultationsEl) {
            totalConsultationsEl.textContent = this.stats.completedBookings;
        }

        // Pending Reports
        const pendingReportsEl = document.getElementById('pendingReports');
        if (pendingReportsEl) {
            pendingReportsEl.textContent = this.stats.pendingReports;
        }
    }

    // Get upcoming bookings
    getUpcomingBookings() {
        const now = new Date();
        return this.bookings
            .filter(b => ['confirmed', 'pending', 'rescheduled'].includes(b.status) && new Date(b.scheduledDate) >= now)
            .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    }

    // Update upcoming appointments table on overview
    updateUpcomingAppointmentsTable(appointments) {
        const tbody = document.getElementById('upcomingAppointmentsTable');
        const emptyState = document.getElementById('noUpcomingAppointments');
        
        if (!tbody) return;

        if (appointments.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        tbody.innerHTML = appointments.slice(0, 5).map(booking => {
            const date = new Date(booking.scheduledDate);
            const modeIcon = booking.consultationMode === 'phone' ? 'fa-phone' : 
                            booking.consultationMode === 'video' ? 'fa-video' : 'fa-comment';
            const modeName = booking.consultationMode === 'phone' ? 'Call' : 
                            booking.consultationMode === 'video' ? 'Video' : 'Chat';
            const statusClass = this.getStatusClass(booking.status);

            return `
                <tr data-id="${booking._id}">
                    <td>${booking.service?.name || 'Consultation'}</td>
                    <td>Pandit Ravi Shankar</td>
                    <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${booking.scheduledTime}</td>
                    <td><span class="mode-badge ${booking.consultationMode}"><i class="fas ${modeIcon}"></i> ${modeName}</span></td>
                    <td><span class="status-badge ${statusClass}">${this.capitalizeFirst(booking.status)}</span></td>
                    <td>
                        <button class="btn-outline btn-sm" onclick="dashboardAPI.viewBookingDetails('${booking._id}')">View Details</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Update all appointments table
    updateAllAppointmentsTable() {
        const tbody = document.querySelector('#appointmentsTable tbody');
        if (!tbody) return;

        if (this.bookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-cell">
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <p>No appointments found</p>
                            <a href="booking.html" class="btn-primary">Book Now</a>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.bookings.map(booking => {
            const date = new Date(booking.scheduledDate);
            const isPast = date < new Date();
            const modeIcon = booking.consultationMode === 'phone' ? 'fa-phone' : 
                            booking.consultationMode === 'video' ? 'fa-video' : 'fa-comment';
            const modeName = booking.consultationMode === 'phone' ? 'Call' : 
                            booking.consultationMode === 'video' ? 'Video' : 'Chat';
            const statusClass = this.getStatusClass(booking.status);

            return `
                <tr data-status="${booking.status}" data-id="${booking._id}">
                    <td>
                        <div class="service-info">
                            <strong>${booking.service?.name || 'Consultation'}</strong>
                            <span>${booking.service?.duration || 30} minutes</span>
                        </div>
                    </td>
                    <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${booking.scheduledTime}</td>
                    <td><span class="mode-badge ${booking.consultationMode}"><i class="fas ${modeIcon}"></i> ${modeName}</span></td>
                    <td>₹${(booking.payment?.total || 0).toLocaleString('en-IN')}</td>
                    <td><span class="status-badge ${statusClass}">${this.capitalizeFirst(booking.status)}</span></td>
                    <td class="action-buttons">
                        ${this.getActionButtons(booking, isPast)}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Get action buttons based on booking status
    getActionButtons(booking, isPast) {
        if (booking.status === 'cancelled') {
            return `<span class="text-muted">Cancelled</span>`;
        }
        
        if (booking.status === 'completed') {
            return `
                <button class="btn-outline btn-sm" onclick="dashboardAPI.downloadReport('${booking._id}')"><i class="fas fa-download"></i> Report</button>
                <button class="btn-primary btn-sm" onclick="window.location.href='booking.html'">Book Again</button>
            `;
        }

        if (isPast) {
            return `<span class="text-muted">Expired</span>`;
        }

        if (booking.status === 'pending' && booking.payment?.status !== 'completed') {
            return `
                <button class="btn-primary btn-sm" onclick="dashboardAPI.makePayment('${booking._id}')">Pay Now</button>
                <button class="btn-danger btn-sm" onclick="dashboardAPI.cancelBooking('${booking._id}')">Cancel</button>
            `;
        }

        return `
            <button class="btn-danger btn-sm" onclick="dashboardAPI.cancelBooking('${booking._id}')">Cancel</button>
        `;
    }

    // Update recent reports table
    updateRecentReportsTable() {
        const tbody = document.getElementById('recentReportsTable');
        if (!tbody) return;

        const completedBookings = this.bookings.filter(b => b.status === 'completed');
        
        if (completedBookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-cell">
                        <p>No reports available yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = completedBookings.slice(0, 5).map(booking => {
            const date = new Date(booking.updatedAt || booking.scheduledDate);
            return `
                <tr>
                    <td>${booking.service?.name || 'Consultation'} Report</td>
                    <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>
                        <button class="btn-outline btn-sm" onclick="dashboardAPI.downloadReport('${booking._id}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Update payments table
    updatePaymentsTable() {
        const tbody = document.getElementById('paymentsTableBody');
        if (!tbody) return;

        const paidBookings = this.bookings.filter(b => b.payment?.status === 'completed');
        
        if (paidBookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-cell">
                        <p>No payment history</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = paidBookings.map(booking => {
            const date = new Date(booking.payment.paidAt || booking.createdAt);
            return `
                <tr>
                    <td>${booking.payment.transactionId || booking.bookingId}</td>
                    <td>${booking.service?.name || 'Consultation'}</td>
                    <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>₹${booking.payment.total.toLocaleString('en-IN')}</td>
                    <td><span class="status-badge completed">Paid</span></td>
                </tr>
            `;
        }).join('');
    }

    // Get status class
    getStatusClass(status) {
        const classes = {
            'confirmed': 'upcoming',
            'pending': 'pending',
            'completed': 'completed',
            'cancelled': 'cancelled',
            'rescheduled': 'pending'
        };
        return classes[status] || 'pending';
    }

    // Capitalize first letter
    capitalizeFirst(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    // Show empty state
    showEmptyState() {
        const upcomingTable = document.getElementById('upcomingAppointmentsTable');
        const emptyState = document.getElementById('noUpcomingAppointments');
        if (upcomingTable) upcomingTable.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
    }

    // Update bookings display
    updateBookingsUI() {
        const upcomingBookings = this.bookings.filter(b => 
            ['confirmed', 'rescheduled', 'pending'].includes(b.status) &&
            new Date(b.scheduledDate) >= new Date()
        );
        const pastBookings = this.bookings.filter(b => 
            b.status === 'completed' || new Date(b.scheduledDate) < new Date()
        );
        const cancelledBookings = this.bookings.filter(b => b.status === 'cancelled');

        // Update upcoming appointments count
        const upcomingCountEl = document.querySelector('.stat-card:nth-child(1) h3');
        if (upcomingCountEl) {
            upcomingCountEl.textContent = upcomingBookings.length;
        }

        // Update past consultations count
        const pastCountEl = document.querySelector('.stat-card:nth-child(2) h3');
        if (pastCountEl) {
            pastCountEl.textContent = pastBookings.filter(b => b.status === 'completed').length;
        }

        // Update total spent
        const totalSpent = this.bookings
            .filter(b => b.status === 'completed' || b.status === 'confirmed')
            .reduce((sum, b) => sum + (b.payment?.total || 0), 0);
        const totalSpentEl = document.querySelector('.stat-card:nth-child(4) h3');
        if (totalSpentEl) {
            totalSpentEl.textContent = `₹${totalSpent.toLocaleString('en-IN')}`;
        }

        // Update next appointment card
        this.updateNextAppointment(upcomingBookings[0]);

        // Update appointments list
        this.renderAppointmentsList(upcomingBookings, 'upcoming');
    }

    // Update next appointment display
    updateNextAppointment(booking) {
        const container = document.querySelector('.appointment-card.upcoming');
        if (!container) return;

        if (!booking) {
            container.innerHTML = `
                <div class="empty-appointment">
                    <i class="fas fa-calendar-plus"></i>
                    <p>No upcoming appointments</p>
                    <a href="booking.html" class="btn btn-primary btn-sm">Book Now</a>
                </div>
            `;
            return;
        }

        const date = new Date(booking.scheduledDate);
        const modeIcon = booking.consultationMode === 'phone' ? 'fa-phone' : 'fa-comments';
        const modeName = booking.consultationMode === 'phone' ? 'Phone Call' : 'Chat';

        container.innerHTML = `
            <div class="appointment-date">
                <span class="day">${date.getDate()}</span>
                <span class="month">${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
            </div>
            <div class="appointment-details">
                <h4>${booking.service.name}</h4>
                <p><i class="fas fa-clock"></i> ${booking.scheduledTime} (IST)</p>
                <p><i class="fas ${modeIcon}"></i> ${modeName}</p>
                <div class="appointment-actions">
                    <button class="btn btn-sm btn-primary" onclick="dashboardAPI.joinConsultation('${booking._id}')">
                        ${booking.consultationMode === 'phone' ? 'Call Now' : 'Start Chat'}
                    </button>
                </div>
            </div>
        `;
    }

    // Render appointments list
    renderAppointmentsList(bookings, type = 'upcoming') {
        const container = document.querySelector('.appointments-list');
        if (!container) return;

        if (bookings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>No ${type} appointments</h3>
                    <p>${type === 'upcoming' ? 'Book a consultation to get started' : 'Your appointment history will appear here'}</p>
                    ${type === 'upcoming' ? '<a href="booking.html" class="btn btn-primary">Book Consultation</a>' : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = bookings.map(booking => this.renderAppointmentItem(booking)).join('');
    }

    // Render single appointment item
    renderAppointmentItem(booking) {
        const date = new Date(booking.scheduledDate);
        const isPast = date < new Date();
        const modeIcon = booking.consultationMode === 'phone' ? 'fa-phone' : 'fa-comments';
        const modeName = booking.consultationMode === 'phone' ? 'Phone Call' : 'Chat';

        const statusClasses = {
            'confirmed': 'confirmed',
            'pending': 'pending',
            'completed': 'completed',
            'cancelled': 'cancelled',
            'rescheduled': 'rescheduled'
        };

        return `
            <div class="appointment-item ${isPast ? 'past' : ''}" data-id="${booking._id}">
                <div class="appointment-date-box">
                    <span class="date">${date.getDate()}</span>
                    <span class="month">${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                    <span class="year">${date.getFullYear()}</span>
                </div>
                <div class="appointment-info">
                    <h4>${booking.service.name}</h4>
                    <div class="appointment-meta">
                        <span><i class="fas fa-clock"></i> ${booking.scheduledTime} (IST)</span>
                        <span><i class="fas ${modeIcon}"></i> ${modeName}</span>
                        <span><i class="fas fa-rupee-sign"></i> ${booking.payment?.total?.toLocaleString('en-IN') || 'N/A'}</span>
                    </div>
                    <span class="appointment-status ${statusClasses[booking.status]}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                </div>
                <div class="appointment-actions">
                    ${!isPast && booking.status !== 'cancelled' ? `
                        <button class="btn btn-primary btn-sm" onclick="dashboardAPI.joinConsultation('${booking._id}')">Join</button>
                        <button class="btn btn-ghost btn-sm danger" onclick="dashboardAPI.cancelBooking('${booking._id}')">Cancel</button>
                    ` : `
                        ${booking.status === 'completed' ? `
                            <button class="btn btn-ghost btn-sm"><i class="fas fa-file-download"></i> Report</button>
                            <button class="btn btn-primary btn-sm" onclick="window.location.href='booking.html'"><i class="fas fa-redo"></i> Book Again</button>
                        ` : ''}
                    `}
                </div>
            </div>
        `;
    }

    // Update stats UI
    updateStatsUI() {
        // Reports count (mock for now)
        const reportsCountEl = document.querySelector('.stat-card:nth-child(3) h3');
        if (reportsCountEl) {
            const completedCount = this.bookings.filter(b => b.status === 'completed').length;
            reportsCountEl.textContent = completedCount;
        }
    }

    // Join consultation
    async joinConsultation(bookingId) {
        const booking = this.bookings.find(b => b._id === bookingId);
        if (!booking) {
            this.showToast('Booking not found', 'error');
            return;
        }

        if (booking.consultationMode === 'phone') {
            this.showToast('You will receive a call at your registered number shortly', 'info');
        } else if (booking.consultationMode === 'video') {
            this.showToast('Video call feature coming soon!', 'info');
        } else {
            this.showToast('Chat feature coming soon!', 'info');
        }
    }

    // View booking details
    viewBookingDetails(bookingId) {
        const booking = this.bookings.find(b => b._id === bookingId);
        if (!booking) return;

        const date = new Date(booking.scheduledDate);
        const modeName = booking.consultationMode === 'phone' ? 'Phone Call' : 
                        booking.consultationMode === 'video' ? 'Video Call' : 'Chat';

        alert(`
Booking Details
---------------
Booking ID: ${booking.bookingId || booking._id}
Service: ${booking.service?.name || 'Consultation'}
Date: ${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Time: ${booking.scheduledTime}
Mode: ${modeName}
Duration: ${booking.service?.duration || 30} minutes
Amount: ₹${booking.payment?.total?.toLocaleString('en-IN') || 'N/A'}
Status: ${this.capitalizeFirst(booking.status)}
        `.trim());
    }

    // Reschedule booking
    async rescheduleBooking(bookingId) {
        const booking = this.bookings.find(b => b._id === bookingId);
        if (!booking) return;

        const newDate = prompt('Enter new date (YYYY-MM-DD):');
        if (!newDate) return;

        const newTime = prompt('Enter new time (e.g., 10:00 AM):');
        if (!newTime) return;

        try {
            const token = window.API.Token.getToken();
            const response = await fetch(`${DASHBOARD_API_BASE}/bookings/${bookingId}/reschedule`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newDate,
                    newTime,
                    reason: 'User requested reschedule'
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showToast('Appointment rescheduled successfully!', 'success');
                await this.loadDashboardData();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to reschedule', 'error');
        }
    }

    // Cancel booking
    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        const reason = prompt('Please provide a reason for cancellation:') || 'User cancelled';

        try {
            const token = window.API.Token.getToken();
            const response = await fetch(`${DASHBOARD_API_BASE}/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();
            
            if (data.success) {
                const refundMsg = data.data?.refundMessage || 'Booking cancelled successfully';
                this.showToast(refundMsg, 'success');
                await this.loadDashboardData();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to cancel booking', 'error');
        }
    }

    // Make payment
    makePayment(bookingId) {
        this.showToast('Payment gateway integration coming soon!', 'info');
    }

    // Download report
    downloadReport(bookingId) {
        this.showToast('Report download feature coming soon!', 'info');
    }

    // Initialize form handlers
    initFormHandlers() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateProfile();
            });
        }

        // Birth details form
        const birthDetailsForm = document.getElementById('birthDetailsForm');
        if (birthDetailsForm) {
            birthDetailsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateBirthDetails();
            });
        }

        // Password form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updatePassword();
            });
        }

        // Logout buttons
        document.querySelectorAll('.logout-btn, #logoutBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterAppointments(tab.dataset.filter);
            });
        });
    }

    // Update profile
    async updateProfile() {
        try {
            const name = document.getElementById('profileName')?.value.split(' ');
            const phone = document.getElementById('profilePhone')?.value;

            const response = await window.API.Auth.updateDetails({
                firstName: name[0] || '',
                lastName: name.slice(1).join(' ') || '',
                phone
            });

            if (response.success) {
                this.user = response.data;
                window.API.Token.setUser(this.user);
                this.updateUserUI();
                this.showToast('Profile updated successfully!', 'success');
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to update profile', 'error');
        }
    }

    // Update birth details
    async updateBirthDetails() {
        try {
            const dateOfBirth = document.getElementById('profileDob')?.value;
            const timeOfBirth = document.getElementById('profileTob')?.value;
            const placeOfBirth = document.getElementById('profilePob')?.value;

            const response = await window.API.Auth.updateDetails({
                dateOfBirth,
                timeOfBirth,
                placeOfBirth
            });

            if (response.success) {
                this.user = response.data;
                window.API.Token.setUser(this.user);
                this.showToast('Birth details updated successfully!', 'success');
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to update birth details', 'error');
        }
    }

    // Update password
    async updatePassword() {
        try {
            const currentPassword = document.getElementById('currentPassword')?.value;
            const newPassword = document.getElementById('newPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            if (newPassword !== confirmPassword) {
                this.showToast('New passwords do not match', 'error');
                return;
            }

            const response = await window.API.Auth.updatePassword(currentPassword, newPassword);

            if (response.success) {
                document.getElementById('passwordForm').reset();
                this.showToast('Password changed successfully!', 'success');
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to change password', 'error');
        }
    }

    // Filter appointments
    filterAppointments(filter) {
        const rows = document.querySelectorAll('#appointmentsTable tbody tr[data-status]');
        
        rows.forEach(row => {
            const status = row.dataset.status;
            if (filter === 'all') {
                row.style.display = '';
            } else if (filter === 'upcoming') {
                row.style.display = ['confirmed', 'pending', 'rescheduled'].includes(status) ? '' : 'none';
            } else {
                row.style.display = status === filter ? '' : 'none';
            }
        });
    }

    // Logout
    async logout() {
        try {
            await window.API.Auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = 'login.html';
    }

    // Show/hide loading state
    showLoading(show) {
        const loader = document.getElementById('loadingOverlay');
        if (loader) {
            loader.classList.toggle('active', show);
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        if (window.API && window.API.UI && window.API.UI.showToast) {
            window.API.UI.showToast(message, type);
        } else {
            // Fallback toast - Light theme
            const toast = document.createElement('div');
            toast.className = `toast-notification toast-${type}`;
            toast.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            `;
            
            if (!document.getElementById('toast-styles')) {
                const style = document.createElement('style');
                style.id = 'toast-styles';
                style.textContent = `
                    .toast-notification {
                        position: fixed; bottom: 24px; right: 24px;
                        padding: 14px 20px; background: #ffffff;
                        border: 1px solid #E5E7EB; border-radius: 8px;
                        display: flex; align-items: center; gap: 10px;
                        font-size: 0.9rem; color: #111827; 
                        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                        z-index: 9999; animation: slideIn 0.3s ease;
                    }
                    .toast-success { border-left: 3px solid #10b981; }
                    .toast-success i { color: #10b981; }
                    .toast-error { border-left: 3px solid #ef4444; }
                    .toast-error i { color: #ef4444; }
                    .toast-info { border-left: 3px solid #3b82f6; }
                    .toast-info i { color: #3b82f6; }
                    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// Initialize dashboard when DOM is ready
const dashboardAPI = new DashboardAPI();

document.addEventListener('DOMContentLoaded', async function() {
    await dashboardAPI.init();
});

// Export for global access
window.dashboardAPI = dashboardAPI;
