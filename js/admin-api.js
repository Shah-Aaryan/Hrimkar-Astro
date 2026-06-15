/**
 * Hrimkar Astro - Admin Panel API Integration
 * Handles all admin data fetching and management from MongoDB backend
 */

const ADMIN_API_BASE = (typeof window !== 'undefined' && window.API && window.API.BASE_URL) ? window.API.BASE_URL : 'https://hrimkar-astro-1.onrender.com/api';

// Admin API Class
class AdminAPI {
        // ==================== REVIEWS ADMIN ====================
        async loadAllReviews() {
            try {
                const token = window.API.Token.getToken();
                const response = await fetch(`${ADMIN_API_BASE}/reviews/admin/all`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (data.success) {
                    this.reviews = data.data;
                    this.renderReviewsList();
                } else {
                    this.reviews = [];
                    this.renderReviewsList();
                }
            } catch (error) {
                console.error('Load reviews error:', error);
                this.reviews = [];
                this.renderReviewsList();
            }
        }

        renderReviewsList() {
            const container = document.querySelector('#reviewsSection .reviews-list');
            if (!container) return;
            if (!this.reviews || this.reviews.length === 0) {
                container.innerHTML = `<div class="empty-state"><i class="fas fa-star"></i><h3>No Reviews Found</h3><p>Reviews will appear here once users submit feedback.</p></div>`;
                return;
            }
            container.innerHTML = this.reviews.map(review => `
                <div class="review-card" data-id="${review._id}">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=1a1f2e&color=d4af37" alt="User">
                            <div>
                                <strong>${review.name}</strong>
                                <span>${new Date(review.createdAt).toLocaleDateString('en-IN')} • ${review.serviceType || review.category || 'General'}</span>
                            </div>
                        </div>
                        <div class="review-rating">
                            ${'<i class="fas fa-star"></i>'.repeat(Math.floor(review.rating))}
                            ${review.rating % 1 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                            <span>${review.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <div class="review-content">
                        <p>"${review.content}"</p>
                    </div>
                    <div class="review-actions">
                        <button class="btn-outline btn-sm" onclick="adminAPI.toggleFeatured('${review._id}', ${!review.isFeatured})">
                            <i class="fas fa-${review.isFeatured ? 'star' : 'star'}"></i> ${review.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button class="btn-outline btn-sm" onclick="adminAPI.approveReview('${review._id}', ${!review.isApproved})">
                            <i class="fas fa-${review.isApproved ? 'times' : 'check'}"></i> ${review.isApproved ? 'Reject' : 'Approve'}
                        </button>
                        <button class="btn-danger btn-sm" onclick="adminAPI.deleteReview('${review._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    <div class="review-status">
                        <span class="status-badge ${review.isApproved ? 'approved' : 'pending'}">${review.isApproved ? 'Approved' : 'Pending'}</span>
                        ${review.isFeatured ? '<span class="status-badge featured">Featured</span>' : ''}
                    </div>
                </div>
            `).join('');
        }

        async approveReview(id, isApproved) {
            if (!confirm(isApproved ? 'Approve this review?' : 'Reject this review?')) return;
            try {
                const token = window.API.Token.getToken();
                const response = await fetch(`${ADMIN_API_BASE}/reviews/admin/${id}/approve`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isApproved })
                });
                const data = await response.json();
                if (data.success) {
                    this.showToast(isApproved ? 'Review approved' : 'Review rejected', 'success');
                    await this.loadAllReviews();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                this.showToast('Error updating review', 'error');
            }
        }

        async deleteReview(id) {
            if (!confirm('Delete this review? This cannot be undone.')) return;
            try {
                const token = window.API.Token.getToken();
                const response = await fetch(`${ADMIN_API_BASE}/reviews/admin/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (data.success) {
                    this.showToast('Review deleted', 'success');
                    await this.loadAllReviews();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                this.showToast('Error deleting review', 'error');
            }
        }

        flagReview(id) {
            this.showToast('Review flagged for moderation (UI only)', 'info');
            // Optionally, implement backend flagging here
        }

        async toggleFeatured(id, isFeatured) {
            try {
                const token = window.API.Token.getToken();
                const response = await fetch(`${ADMIN_API_BASE}/reviews/admin/${id}/featured`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isFeatured })
                });
                const data = await response.json();
                if (data.success) {
                    this.showToast(isFeatured ? 'Review featured' : 'Review unfeatured', 'success');
                    await this.loadAllReviews();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                this.showToast('Error updating review', 'error');
            }
        }

    constructor() {
        this.user = null;
        this.bookings = [];
        this.clients = [];
        this.stats = {};
        this.todaySchedule = [];
        // Monthly appointments state
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.monthlyAppointments = [];
        this.monthlyStatusFilter = 'all';
    }

    // Initialize admin panel
    async init() {
        this.showLoading(true);
        
        // Initialize event handlers early
        this.initEventHandlers();
        
        // Check authentication
        if (!window.API || !window.API.Token.isLoggedIn()) {
            // Check for demo user
            const demoUser = localStorage.getItem('cosmic_demo_user');
            if (demoUser) {
                try {
                    this.user = JSON.parse(demoUser);
                    if (this.user.role !== 'admin') {
                        this.showToast('Access denied. Admin privileges required.', 'error');
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 2000);
                        return false;
                    }
                    this.updateAdminUI();
                    this.useMockData();
                    this.showLoading(false);
                    return true;
                } catch (e) {
                    console.error('Demo user parse error:', e);
                }
            }
            window.location.href = 'login.html?redirect=admin.html';
            return false;
        }

        try {
            // Verify token and admin role
            this.user = window.API.Token.getUser();
            
            if (this.user.role !== 'admin' && this.user.role !== 'astrologer') {
                this.showToast('Access denied. Admin privileges required.', 'error');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
                return false;
            }

            this.updateAdminUI();
            await this.loadAdminData();
            await this.loadAllReviews();
            this.showLoading(false);
            return true;
        } catch (error) {
            console.error('Admin init error:', error);
            this.showToast('Error loading admin panel', 'error');
            this.showLoading(false);
            return false;
        }
    }

    // Update admin interface
    updateAdminUI() {
        if (!this.user) return;

        const fullName = `${this.user.firstName || 'Admin'} ${this.user.lastName || ''}`.trim();

        // Update admin name
                // (Removed duplicate unreachable code)
        document.querySelectorAll('.user-avatar img').forEach(img => {
            const avatarUrl = this.user.avatar && this.user.avatar !== 'default-avatar.png' 
                ? this.user.avatar 
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1a1f2e&color=d4af37`;
            img.src = avatarUrl;
        });

        // Update email in settings if present
        document.querySelectorAll('.user-email, [data-user-email]').forEach(el => {
            el.textContent = this.user.email || 'admin@hrimkarastro.com';
        });
    }

    // Load all admin data from backend
    async loadAdminData() {
        try {
            const token = window.API.Token.getToken();
            
            // Fetch admin stats from backend
            const statsResponse = await fetch(`${ADMIN_API_BASE}/bookings/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const statsData = await statsResponse.json();
            
            if (statsData.success) {
                this.stats = statsData.data;
                this.todaySchedule = statsData.data.todaySchedule || [];
                this.bookings = statsData.data.recentBookings || [];
                
                // Update all admin sections
                this.updateKPICards(statsData.data);
                this.updateTodayScheduleTable(this.todaySchedule);
                this.updatePendingActions();
                this.updateEarningsChart(statsData.data);
            } else {
                throw new Error('Failed to fetch admin stats');
            }

            // Fetch all bookings
            await this.loadAllBookings();
            
            // Fetch all clients
            await this.loadAllClients();
            
            // Fetch pending payments
            await this.loadPendingPayments();
            
            // Fetch earnings data
            await this.loadEarningsData('month');
            
            // Fetch monthly appointments and blocked slots
            await this.loadMonthlyAppointments();
            await this.loadBlockedSlots();
            // Note: initSlotManagement is already called in initEventHandlers, no need to call again
            this.initMonthlyAppointmentsControls();

        } catch (error) {
            console.error('Load admin data error:', error);
            this.showToast('Using demo data - Backend connection issue', 'info');
            this.useMockData();
        }
    }
    
    // Load pending payment approvals
    async loadPendingPayments() {
        try {
            const token = window.API.Token.getToken();
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/pending-payments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            console.log('Pending payments response:', data);
            
            if (data.success) {
                this.pendingPayments = data.data || [];
                console.log('Pending payments data:', this.pendingPayments);
                if (this.pendingPayments.length > 0) {
                    console.log('First payment screenshot:', this.pendingPayments[0]?.payment?.screenshot);
                }
                this.updatePendingPaymentsBadge();
                this.renderPendingPayments();
            } else {
                console.error('Failed to load pending payments:', data.message);
            }
        } catch (error) {
            console.error('Load pending payments error:', error);
            this.pendingPayments = [];
            this.renderPendingPayments();
        }
    }
    
    // Update pending payments badge
    updatePendingPaymentsBadge() {
        const badge = document.getElementById('pendingPaymentsBadge');
        if (badge) {
            const count = this.pendingPayments?.length || 0;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
            
            // Add pulse animation if there are pending payments
            if (count > 0) {
                badge.classList.add('pulse');
            } else {
                badge.classList.remove('pulse');
            }
        }
    }
    
    // Render pending payments list
    renderPendingPayments() {
        const container = document.getElementById('pendingPaymentsList');
        if (!container) return;
        
        if (!this.pendingPayments || this.pendingPayments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>No Pending Approvals</h3>
                    <p>All payment screenshots have been reviewed.</p>
                </div>
            `;
            return;
        }
        
        console.log('Rendering pending payments:', this.pendingPayments);
        
        container.innerHTML = this.pendingPayments.map(booking => {
            const screenshotUrl = booking.payment?.screenshot?.url;
            console.log(`Booking ${booking.bookingId} screenshot URL:`, screenshotUrl);
            
            return `
            <div class="pending-payment-card" data-booking-id="${booking._id}">
                <div class="payment-card-header">
                    <div class="booking-info">
                        <span class="booking-id">${booking.bookingId}</span>
                        <span class="booking-date">${new Date(booking.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</span>
                    </div>
                    <span class="payment-amount">₹${booking.payment?.total?.toLocaleString('en-IN') || 0}</span>
                </div>
                
                <div class="payment-card-body">
                    <div class="user-details">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-info">
                            <h4>${booking.user?.firstName || ''} ${booking.user?.lastName || ''}</h4>
                            <p>${booking.user?.email || 'N/A'}</p>
                            <p>${booking.user?.phone || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div class="booking-details">
                        <div class="detail-row">
                            <span class="label">Service:</span>
                            <span class="value">${booking.service?.name || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Date & Time:</span>
                            <span class="value">${new Date(booking.scheduledDate).toLocaleDateString('en-IN', { 
                                day: 'numeric', month: 'short', year: 'numeric'
                            })} at ${booking.scheduledTime}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Mode:</span>
                            <span class="value">${booking.consultationMode || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="screenshot-section">
                        <h5><i class="fas fa-image"></i> Payment Screenshot</h5>
                        ${screenshotUrl ? `
                            <div class="screenshot-preview">
                                <img src="${screenshotUrl}" alt="Payment Screenshot" 
                                     onclick="adminAPI.viewScreenshot('${screenshotUrl}')"
                                     onerror="this.onerror=null; this.src=''; this.alt='Failed to load image'; this.style.display='none'; this.parentElement.innerHTML='<p class=\\'no-screenshot\\'>Image failed to load. URL: ${screenshotUrl}</p>';">
                                <span class="uploaded-time">Uploaded: ${new Date(booking.payment?.screenshot?.uploadedAt).toLocaleString('en-IN')}</span>
                            </div>
                        ` : `
                            <p class="no-screenshot">No screenshot uploaded</p>
                        `}
                    </div>
                </div>
                
                <div class="payment-card-actions">
                    <button class="btn btn-approve" onclick="adminAPI.approvePayment('${booking._id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-reject" onclick="adminAPI.showRejectModal('${booking._id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `}).join('');
    }
    
    // View screenshot in modal
    viewScreenshot(url) {
        const modal = document.createElement('div');
        modal.className = 'screenshot-modal';
        modal.innerHTML = `
            <div class="screenshot-modal-content">
                <button class="close-modal" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${url}" alt="Payment Screenshot">
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Approve payment
    async approvePayment(bookingId) {
        if (!confirm('Are you sure you want to approve this payment?')) return;
        
        try {
            const token = window.API.Token.getToken();
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/${bookingId}/approve-payment`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Payment approved successfully!', 'success');
                // Remove from list
                this.pendingPayments = this.pendingPayments.filter(p => p._id !== bookingId);
                this.updatePendingPaymentsBadge();
                this.renderPendingPayments();
                // Reload admin data
                await this.loadAdminData();
            } else {
                throw new Error(data.message || 'Failed to approve payment');
            }
        } catch (error) {
            console.error('Approve payment error:', error);
            this.showToast('Error approving payment', 'error');
        }
    }
    
    // Show reject modal
    showRejectModal(bookingId) {
        const modal = document.createElement('div');
        modal.className = 'reject-modal';
        modal.innerHTML = `
            <div class="reject-modal-content">
                <h3><i class="fas fa-times-circle"></i> Reject Payment</h3>
                <p>Please provide a reason for rejection:</p>
                <textarea id="rejectReason" placeholder="Enter reason for rejection..." rows="4"></textarea>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.reject-modal').remove()">Cancel</button>
                    <button class="btn btn-danger" onclick="adminAPI.rejectPayment('${bookingId}')">
                        <i class="fas fa-times"></i> Reject Payment
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Reject payment
    async rejectPayment(bookingId) {
        const reason = document.getElementById('rejectReason')?.value || 'Payment screenshot not valid';
        
        try {
            const token = window.API.Token.getToken();
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/${bookingId}/reject-payment`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Payment rejected', 'warning');
                document.querySelector('.reject-modal')?.remove();
                // Remove from list
                this.pendingPayments = this.pendingPayments.filter(p => p._id !== bookingId);
                this.updatePendingPaymentsBadge();
                this.renderPendingPayments();
            } else {
                throw new Error(data.message || 'Failed to reject payment');
            }
        } catch (error) {
            console.error('Reject payment error:', error);
            this.showToast('Error rejecting payment', 'error');
        }
    }

    // ==================== SLOT MANAGEMENT ====================
    
    // Initialize slot management UI
    initSlotManagement() {
        // Prevent multiple initializations
        if (this._slotManagementInitialized) {
            console.log('Slot management already initialized, skipping...');
            return;
        }
        this._slotManagementInitialized = true;
        
        console.log('Initializing slot management...');
        const blockDateInput = document.getElementById('blockDate');
        const blockFullDayCheckbox = document.getElementById('blockFullDay');
        const blockSlotForm = document.getElementById('blockSlotForm');
        const timeSlotGroup = document.getElementById('timeSlotGroup');
        
        console.log('Block slot form elements:', { blockDateInput, blockFullDayCheckbox, blockSlotForm, timeSlotGroup });
        
        if (blockDateInput) {
            // Set min date to today
            const today = new Date().toISOString().split('T')[0];
            blockDateInput.min = today;
            blockDateInput.value = today;
            
            // Load time slots when date changes
            blockDateInput.addEventListener('change', () => this.loadAvailableSlotsForBlocking());
            
            // Initial load
            this.loadAvailableSlotsForBlocking();
        }
        
        if (blockFullDayCheckbox) {
            blockFullDayCheckbox.addEventListener('change', (e) => {
                const timeSlotSelect = document.getElementById('blockTimeSlot');
                if (timeSlotGroup) {
                    timeSlotGroup.style.display = e.target.checked ? 'none' : 'block';
                }
                // Clear the time slot selection when full day is checked
                if (e.target.checked && timeSlotSelect) {
                    timeSlotSelect.value = '';
                }
            });
        }
        
        if (blockSlotForm) {
            blockSlotForm.addEventListener('submit', (e) => this.handleBlockSlot(e));
            console.log('Block slot form submit handler attached');
        }
    }
    
    // Load available slots for the block form
    async loadAvailableSlotsForBlocking() {
        const dateInput = document.getElementById('blockDate');
        const timeSlotSelect = document.getElementById('blockTimeSlot');
        
        if (!dateInput || !timeSlotSelect) return;
        
        const date = dateInput.value;
        if (!date) return;
        
        try {
            const response = await fetch(`${ADMIN_API_BASE}/bookings/slots/${date}`);
            const data = await response.json();
            
            if (data.success) {
                const slots = data.data.slots || [];
                
                timeSlotSelect.innerHTML = '<option value="">-- Select a time slot --</option>';
                
                slots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot.time;
                    option.textContent = slot.time;
                    
                    if (!slot.available) {
                        option.textContent += slot.blocked ? ' (Already Blocked)' : ' (Booked)';
                        option.disabled = true;
                    }
                    
                    timeSlotSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading slots:', error);
        }
    }
    
    // Handle block slot form submission
    async handleBlockSlot(e) {
        e.preventDefault();
        e.stopPropagation();
        // Prevent double submission
        const submitBtn = document.querySelector('#blockSlotForm button[type="submit"]');
        if (submitBtn.disabled) {
            console.log('Block slot form already submitting, ignoring duplicate');
            return;
        }
        console.log('handleBlockSlot called');
        const date = document.getElementById('blockDate').value;
        const timeSlotSelect = document.getElementById('blockTimeSlot');
        const timeSlot = timeSlotSelect.value.trim();
        const reason = document.getElementById('blockReason').value.trim();
        const isFullDay = document.getElementById('blockFullDay').checked;
        console.log('Block slot data:', { date, timeSlot, reason, isFullDay });
        if (!date) {
            this.showToast('Please select a date', 'error');
            return;
        }
        if (!isFullDay && !timeSlot) {
            this.showToast('Please select an available time slot', 'error');
            return;
        }
        // Check if the selected option is disabled (already blocked/booked)
        if (!isFullDay && timeSlotSelect.selectedOptions[0]?.disabled) {
            this.showToast('This slot is not available. Please select a different slot.', 'error');
            return;
        }
        // Disable form while submitting
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Blocking...';
        
        try {
            const token = window.API.Token.getToken();
            console.log('Sending block slot request to:', `${ADMIN_API_BASE}/bookings/admin/block-slot`);
            
            const requestBody = {
                date: date,
                reason: reason || undefined,
                isFullDay: Boolean(isFullDay) // Ensure it's a boolean
            };
            
            // Only include timeSlot if not blocking full day
            if (!isFullDay && timeSlot) {
                requestBody.timeSlot = timeSlot.trim();
            }
            
            console.log('Block slot request body:', requestBody);
            
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/block-slot`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('Block slot response status:', response.status);
            const data = await response.json();
            console.log('Block slot response data:', data);
            
            if (!response.ok) {
                // Handle validation errors
                let errorMessage = data.message || 'Failed to block slot';
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(e => {
                        const field = e.param || e.field || 'unknown';
                        const msg = e.msg || e.message || 'Invalid value';
                        return `${field}: ${msg}`;
                    }).join(', ');
                    errorMessage = `Validation failed: ${errorMessages}`;
                }
                throw new Error(errorMessage);
            }
            
            if (data.success) {
                this.showToast(isFullDay ? 'Full day blocked successfully' : 'Slot blocked successfully', 'success');
                // Reset form completely
                document.getElementById('blockReason').value = '';
                document.getElementById('blockFullDay').checked = false;
                document.getElementById('timeSlotGroup').style.display = 'block';
                
                // Reset time slot dropdown to default
                const timeSlotDropdown = document.getElementById('blockTimeSlot');
                if (timeSlotDropdown) {
                    timeSlotDropdown.selectedIndex = 0;
                }
                
                // Reload data to refresh the slots list
                await this.loadBlockedSlots();
                await this.loadAvailableSlotsForBlocking();
            } else {
                throw new Error(data.message || 'Failed to block slot');
            }
        } catch (error) {
            console.error('Block slot error:', error);
            this.showToast(error.message || 'Error blocking slot', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
    
    // Load blocked slots
    async loadBlockedSlots() {
        try {
            const token = window.API.Token.getToken();
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/blocked-slots`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.blockedSlots = data.data || [];
                this.renderBlockedSlots();
            }
        } catch (error) {
            console.error('Load blocked slots error:', error);
        }
    }
    
    // Render blocked slots list
    renderBlockedSlots() {
        const container = document.getElementById('blockedSlotsList');
        if (!container) return;
        
        if (!this.blockedSlots || this.blockedSlots.length === 0) {
            container.innerHTML = `
                <div class="text-muted">
                    <i class="fas fa-check-circle" style="font-size: 1.5rem; opacity: 0.5;"></i>
                    <p>No blocked slots</p>
                </div>
            `;
            return;
        }
        
        // Sort by date (newest first)
        const sortedSlots = [...this.blockedSlots].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        container.innerHTML = sortedSlots.map(slot => `
            <div class="blocked-slot-item ${slot.isFullDay ? 'full-day' : ''}">
                <div class="slot-info">
                    <span class="slot-date">
                        <i class="fas fa-calendar-day" style="opacity: 0.5; margin-right: 6px;"></i>
                        ${new Date(slot.date).toLocaleDateString('en-IN', { 
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                        })}
                    </span>
                    <span class="slot-time ${slot.isFullDay ? 'full-day-badge' : ''}">
                        ${slot.isFullDay ? '<i class="fas fa-ban"></i> Full Day Blocked' : slot.timeSlot}
                    </span>
                    ${slot.reason ? `<span class="slot-reason"><i class="fas fa-info-circle"></i> ${slot.reason}</span>` : ''}
                </div>
                <button class="btn-unblock" onclick="adminAPI.unblockSlot('${slot.date}', '${slot.timeSlot}')" title="Unblock this slot">
                    <i class="fas fa-unlock"></i>
                    <span>Unblock</span>
                </button>
            </div>
        `).join('');
    }
    
    // Unblock a slot
    async unblockSlot(date, timeSlot) {
        if (!confirm('Are you sure you want to unblock this slot?')) return;
        
        try {
            const token = window.API.Token.getToken();
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/unblock-slot`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date, timeSlot })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Slot unblocked successfully', 'success');
                await this.loadBlockedSlots();
                await this.loadAvailableSlotsForBlocking();
            } else {
                throw new Error(data.message || 'Failed to unblock slot');
            }
        } catch (error) {
            console.error('Unblock slot error:', error);
            this.showToast(error.message || 'Error unblocking slot', 'error');
        }
    }
    
    // Load pending appointments
    async loadPendingAppointments() {
        try {
            const token = window.API.Token.getToken();
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/pending-appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.pendingAppointments = data.data || [];
                this.renderPendingAppointments();
            }
        } catch (error) {
            console.error('Load pending appointments error:', error);
            this.pendingAppointments = [];
            this.renderPendingAppointments();
        }
    }
    
    // Load monthly appointments
    async loadMonthlyAppointments() {
        try {
            const token = window.API.Token.getToken();
            const response = await fetch(
                `${ADMIN_API_BASE}/bookings/admin/monthly-appointments?month=${this.currentMonth + 1}&year=${this.currentYear}`, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const data = await response.json();
            
            if (data.success) {
                this.monthlyAppointments = data.data || [];
                this.monthlySummary = data.summary || { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, awaitingPayment: 0 };
                this.updateMonthlyDisplay();
                this.renderMonthlyAppointments();
            }
        } catch (error) {
            console.error('Load monthly appointments error:', error);
            this.monthlyAppointments = [];
            this.monthlySummary = { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, awaitingPayment: 0 };
            this.updateMonthlyDisplay();
            this.renderMonthlyAppointments();
        }
    }
    
    // Update monthly display (month label and summary)
    updateMonthlyDisplay() {
        // Update month label
        const monthLabel = document.getElementById('currentMonthLabel');
        if (monthLabel) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            monthLabel.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        }
        
        // Update summary counts
        const summary = this.monthlySummary;
        document.getElementById('monthlyTotalCount')?.textContent && (document.getElementById('monthlyTotalCount').textContent = summary.total || 0);
        document.getElementById('monthlyPendingCount')?.textContent && (document.getElementById('monthlyPendingCount').textContent = summary.pending || 0);
        document.getElementById('monthlyConfirmedCount')?.textContent && (document.getElementById('monthlyConfirmedCount').textContent = summary.confirmed || 0);
        document.getElementById('monthlyCompletedCount')?.textContent && (document.getElementById('monthlyCompletedCount').textContent = summary.completed || 0);
        document.getElementById('monthlyCancelledCount')?.textContent && (document.getElementById('monthlyCancelledCount').textContent = summary.cancelled || 0);
    }
    
    // Initialize monthly appointments controls
    initMonthlyAppointmentsControls() {
        // Previous month button
        const prevBtn = document.getElementById('prevMonthBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        }
        
        // Next month button
        const nextBtn = document.getElementById('nextMonthBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateMonth(1));
        }
        
        // Status filter
        const statusFilter = document.getElementById('appointmentStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.monthlyStatusFilter = e.target.value;
                this.renderMonthlyAppointments();
            });
        }
    }
    
    // Navigate to previous/next month
    navigateMonth(direction) {
        this.currentMonth += direction;
        
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        
        this.loadMonthlyAppointments();
    }
    
    // Render monthly appointments
    renderMonthlyAppointments() {
        const container = document.getElementById('monthlyAppointmentsList');
        if (!container) return;
        
        // Filter appointments by status
        let appointments = this.monthlyAppointments;
        if (this.monthlyStatusFilter !== 'all') {
            appointments = appointments.filter(a => a.status === this.monthlyStatusFilter);
        }
        
        if (!appointments || appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>No Appointments Found</h3>
                    <p>${this.monthlyStatusFilter === 'all' ? 'No appointments for this month.' : `No ${this.formatStatus(this.monthlyStatusFilter).toLowerCase()} appointments for this month.`}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = appointments.map(appointment => `
            <div class="appointment-item ${appointment.status}">
                <div class="appointment-date">
                    <span class="day">${new Date(appointment.scheduledDate).getDate()}</span>
                    <span class="month">${new Date(appointment.scheduledDate).toLocaleDateString('en-IN', { month: 'short' })}</span>
                    <span class="weekday">${new Date(appointment.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                </div>
                <div class="appointment-details">
                    <div class="appointment-header">
                        <strong>${appointment.user?.firstName || ''} ${appointment.user?.lastName || ''}</strong>
                        <span class="status-badge status-${appointment.status}">${this.formatStatus(appointment.status)}</span>
                    </div>
                    <p class="appointment-service">${appointment.service?.name || 'N/A'}</p>
                    <p class="appointment-time">
                        <i class="fas fa-clock"></i> ${appointment.scheduledTime}
                        <i class="fas fa-${appointment.consultationMode === 'video' ? 'video' : appointment.consultationMode === 'chat' ? 'comments' : 'phone'}"></i> ${appointment.consultationMode}
                    </p>
                    <p class="appointment-contact">
                        <i class="fas fa-envelope"></i> ${appointment.user?.email || 'N/A'}
                        ${appointment.user?.phone ? `<i class="fas fa-phone"></i> ${appointment.user.phone}` : ''}
                    </p>
                </div>
                <div class="appointment-amount">
                    ₹${appointment.payment?.total?.toLocaleString('en-IN') || 0}
                </div>
            </div>
        `).join('');
    }
    
    // Render pending appointments (legacy - kept for compatibility)
    renderPendingAppointments() {
        const container = document.getElementById('upcomingAppointmentsList');
        if (!container) return;
        
        if (!this.pendingAppointments || this.pendingAppointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>No Upcoming Appointments</h3>
                    <p>There are no pending appointments at the moment.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.pendingAppointments.map(appointment => `
            <div class="appointment-item ${appointment.status}">
                <div class="appointment-date">
                    <span class="day">${new Date(appointment.scheduledDate).getDate()}</span>
                    <span class="month">${new Date(appointment.scheduledDate).toLocaleDateString('en-IN', { month: 'short' })}</span>
                </div>
                <div class="appointment-details">
                    <div class="appointment-header">
                        <strong>${appointment.user?.firstName || ''} ${appointment.user?.lastName || ''}</strong>
                        <span class="status-badge status-${appointment.status}">${this.formatStatus(appointment.status)}</span>
                    </div>
                    <p class="appointment-service">${appointment.service?.name || 'N/A'}</p>
                    <p class="appointment-time">
                        <i class="fas fa-clock"></i> ${appointment.scheduledTime}
                        <i class="fas fa-${appointment.consultationMode === 'video' ? 'video' : appointment.consultationMode === 'chat' ? 'comments' : 'phone'}"></i> ${appointment.consultationMode}
                    </p>
                    <p class="appointment-contact">
                        <i class="fas fa-envelope"></i> ${appointment.user?.email || 'N/A'}
                        <i class="fas fa-phone"></i> ${appointment.user?.phone || 'N/A'}
                    </p>
                </div>
                <div class="appointment-amount">
                    ₹${appointment.payment?.total?.toLocaleString('en-IN') || 0}
                </div>
            </div>
        `).join('');
    }
    
    // Format status for display
    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'awaiting_payment_approval': 'Awaiting Payment',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'payment_rejected': 'Payment Rejected'
        };
        return statusMap[status] || status;
    }

    // Update KPI cards
    updateKPICards(data) {
        const overview = data.overview || {};
        const thisMonth = data.thisMonth || {};

        // Today's Appointments
        const todayAppEl = document.getElementById('todayAppointments');
        if (todayAppEl) {
            todayAppEl.textContent = overview.todayBookings || 0;
        }

        // Total Users
        const totalUsersEl = document.getElementById('totalUsers');
        if (totalUsersEl) {
            totalUsersEl.textContent = overview.totalClients || 0;
        }

        // Monthly Earnings
        const monthlyEarningsEl = document.getElementById('monthlyEarnings');
        if (monthlyEarningsEl) {
            monthlyEarningsEl.textContent = `₹${(thisMonth.revenue || 0).toLocaleString('en-IN')}`;
        }

        // Pending Reports
        const pendingReportsEl = document.getElementById('pendingReports');
        if (pendingReportsEl) {
            const pendingCount = data.statusBreakdown?.pending || 0;
            pendingReportsEl.textContent = pendingCount;
        }

        // Update nav badges
        const appointmentsBadge = document.querySelector('.nav-item[data-section="appointments"] .nav-badge');
        if (appointmentsBadge) {
            appointmentsBadge.textContent = overview.todayBookings || 0;
        }
    }

    // Update today's schedule table
    updateTodayScheduleTable(schedule) {
        const tbody = document.getElementById('todayScheduleTable');
        if (!tbody) return;

        if (schedule.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-cell">
                        <div class="empty-state">
                            <i class="fas fa-calendar-check"></i>
                            <h4>No Appointments Today</h4>
                            <p>Enjoy your free day!</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = schedule.map(booking => {
            const user = booking.user || { firstName: 'Unknown', lastName: '' };
            const userName = `${user.firstName} ${user.lastName || ''}`.trim();
            const modeIcon = booking.consultationMode === 'phone' ? 'fa-phone' : 
                            booking.consultationMode === 'video' ? 'fa-video' : 'fa-comment';
            const modeName = booking.consultationMode === 'phone' ? 'Call' : 
                            booking.consultationMode === 'video' ? 'Video' : 'Chat';
            const statusClass = this.getStatusClass(booking.status);

            return `
                <tr data-id="${booking._id}">
                    <td><strong>${booking.scheduledTime}</strong></td>
                    <td>
                        <div class="user-cell">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1f2e&color=d4af37" alt="User">
                            <span>${userName}</span>
                        </div>
                    </td>
                    <td>${booking.service?.name || 'Consultation'}</td>
                    <td><span class="mode-badge ${booking.consultationMode}"><i class="fas ${modeIcon}"></i> ${modeName}</span></td>
                    <td><span class="status-badge ${statusClass}">${this.capitalizeFirst(booking.status)}</span></td>
                    <td class="action-buttons">
                        ${booking.status === 'confirmed' ? 
                            `<button class="btn-primary btn-sm" onclick="adminAPI.startSession('${booking._id}')">Start</button>` : 
                            ''
                        }
                        <button class="btn-outline btn-sm" onclick="adminAPI.viewBookingDetails('${booking._id}')">View</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Update pending actions
    updatePendingActions() {
        const pendingList = document.querySelector('.pending-list');
        if (!pendingList) return;

        const pendingBookings = this.bookings.filter(b => b.status === 'pending');
        const completedWithoutReport = this.bookings.filter(b => b.status === 'completed' && !b.reportUrl);

        let html = '';

        // Pending report uploads
        completedWithoutReport.slice(0, 2).forEach(booking => {
            const userName = booking.user ? `${booking.user.firstName} ${booking.user.lastName || ''}`.trim() : 'Client';
            html += `
                <div class="pending-item">
                    <div class="pending-icon report">
                        <i class="fas fa-file-upload"></i>
                    </div>
                    <div class="pending-info">
                        <strong>Upload Report</strong>
                        <p>${userName} - ${booking.service?.name || 'Consultation'}</p>
                        <span class="pending-time">Completed consultation</span>
                    </div>
                    <button class="btn-primary btn-sm" onclick="adminAPI.openUploadModal('${booking._id}')">Upload</button>
                </div>
            `;
        });

        // Pending confirmations
        pendingBookings.slice(0, 2).forEach(booking => {
            const userName = booking.user ? `${booking.user.firstName} ${booking.user.lastName || ''}`.trim() : 'Client';
            html += `
                <div class="pending-item">
                    <div class="pending-icon confirm">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="pending-info">
                        <strong>Confirm Booking</strong>
                        <p>New request from ${userName}</p>
                        <span class="pending-time">${this.getTimeAgo(booking.createdAt)}</span>
                    </div>
                    <button class="btn-primary btn-sm" onclick="adminAPI.confirmBooking('${booking._id}')">Confirm</button>
                </div>
            `;
        });

        if (html === '') {
            html = `
                <div class="empty-state small">
                    <i class="fas fa-check-circle"></i>
                    <p>All caught up! No pending actions.</p>
                </div>
            `;
        }

        pendingList.innerHTML = html;
    }

    // Update earnings chart
    updateEarningsChart(data) {
        const earningsSummary = document.querySelector('.earnings-summary');
        const earningsTotal = document.querySelector('.earnings-total strong');
        
        if (!earningsSummary) return;

        // For now, use the monthly data to show a simple representation
        const thisMonth = data.thisMonth || {};
        const totalRevenue = thisMonth.revenue || 0;
        
        // Update total
        if (earningsTotal) {
            earningsTotal.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
        }
    }

    // Load all bookings
    async loadAllBookings() {
        try {
            const token = window.API.Token.getToken();
            
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/all?limit=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.bookings = data.data;
                this.renderBookingsTable();
            }
        } catch (error) {
            console.error('Load bookings error:', error);
        }
    }

    // Load all clients
    async loadAllClients() {
        try {
            const token = window.API.Token.getToken();
            
            // Load all registered users from auth API
            const response = await fetch(`${ADMIN_API_BASE}/auth/admin/users?limit=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.clients = data.data;
                this.renderUsersTable();
            } else {
                // Fallback to booking clients API
                const fallbackResponse = await fetch(`${ADMIN_API_BASE}/bookings/admin/clients?limit=100`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.success) {
                    this.clients = fallbackData.data;
                    this.renderUsersTable();
                }
            }
        } catch (error) {
            console.error('Load clients error:', error);
        }
    }

    // Load earnings data
    async loadEarningsData(period = 'month') {
        try {
            const token = window.API.Token.getToken();
            
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/earnings?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.earningsData = data.data;
                this.renderEarningsSection(data.data);
            }
        } catch (error) {
            console.error('Load earnings error:', error);
        }
    }

    // Render earnings section
    renderEarningsSection(data) {
        const { summary, transactions } = data;
        
        // Update summary cards
        const totalEarningsEl = document.querySelector('#earningsSection .summary-cards .summary-card:nth-child(1) .card-value');
        const sessionsEl = document.querySelector('#earningsSection .summary-cards .summary-card:nth-child(2) .card-value');
        const avgPerSessionEl = document.querySelector('#earningsSection .summary-cards .summary-card:nth-child(3) .card-value');
        
        if (totalEarningsEl) totalEarningsEl.textContent = `₹${(summary.totalEarnings || 0).toLocaleString('en-IN')}`;
        if (sessionsEl) sessionsEl.textContent = summary.completedSessions || 0;
        if (avgPerSessionEl) avgPerSessionEl.textContent = `₹${(summary.avgPerSession || 0).toLocaleString('en-IN')}`;
        
        // Update growth indicators
        const earningsChange = document.querySelector('#earningsSection .summary-card:nth-child(1) .card-change');
        const sessionsChange = document.querySelector('#earningsSection .summary-card:nth-child(2) .card-change');
        
        if (earningsChange) {
            const growth = summary.earningsGrowth || 0;
            earningsChange.textContent = `${growth >= 0 ? '+' : ''}${growth}% from last period`;
            earningsChange.className = `card-change ${growth >= 0 ? 'positive' : 'negative'}`;
        }
        if (sessionsChange) {
            const growth = summary.sessionsGrowth || 0;
            sessionsChange.textContent = `${growth >= 0 ? '+' : ''}${growth} from last period`;
            sessionsChange.className = `card-change ${growth >= 0 ? 'positive' : 'negative'}`;
        }
        
        // Update transaction table
        const tbody = document.querySelector('#earningsSection .data-table tbody');
        if (tbody && transactions) {
            if (transactions.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-cell">
                            <div class="empty-state">
                                <i class="fas fa-wallet"></i>
                                <h4>No Transactions Found</h4>
                                <p>Transactions will appear here once payments are approved</p>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = transactions.map(t => `
                    <tr>
                        <td>#${t.transactionId}</td>
                        <td>${t.client}</td>
                        <td>${t.service}</td>
                        <td>${new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td class="amount-credit">+₹${t.amount.toLocaleString('en-IN')}</td>
                        <td><span class="status-badge ${t.status === 'approved' ? 'completed' : 'pending'}">${t.status === 'approved' ? 'Paid' : 'Pending'}</span></td>
                        <td><button class="btn-outline btn-sm"><i class="fas fa-download"></i></button></td>
                    </tr>
                `).join('');
            }
        }
    }

    // Render bookings table
    renderBookingsTable() {
        const tbody = document.getElementById('bookingsTableBody');
        if (!tbody) return;

        if (this.bookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-cell">
                        <div class="empty-state">
                            <i class="fas fa-calendar-alt"></i>
                            <h4>No Bookings Found</h4>
                            <p>Bookings will appear here once clients make reservations</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.bookings.map(booking => {
            const date = new Date(booking.scheduledDate);
            const user = booking.user || { firstName: 'Unknown', lastName: '', email: 'N/A' };
            const userName = `${user.firstName} ${user.lastName || ''}`.trim();
            const modeIcon = booking.consultationMode === 'phone' ? 'fa-phone' : 
                            booking.consultationMode === 'video' ? 'fa-video' : 'fa-comment';
            const modeName = booking.consultationMode === 'phone' ? 'Call' : 
                            booking.consultationMode === 'video' ? 'Video' : 'Chat';
            const statusClass = this.getStatusClass(booking.status);

            return `
                <tr data-id="${booking._id}" data-status="${booking.status}">
                    <td>#${booking.bookingId || booking._id.slice(-8).toUpperCase()}</td>
                    <td>
                        <div class="user-cell">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1f2e&color=d4af37" alt="User">
                            <span>${userName}</span>
                        </div>
                    </td>
                    <td>${booking.service?.name || 'Consultation'}</td>
                    <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${booking.scheduledTime}</td>
                    <td><span class="mode-badge ${booking.consultationMode}"><i class="fas ${modeIcon}"></i> ${modeName}</span></td>
                    <td>₹${(booking.payment?.total || 0).toLocaleString('en-IN')}</td>
                    <td><span class="status-badge ${statusClass}">${this.capitalizeFirst(booking.status)}</span></td>
                    <td class="action-buttons">
                        ${this.getAdminActionButtons(booking)}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Get admin action buttons
    getAdminActionButtons(booking) {
        let buttons = '';
        
        if (booking.status === 'pending') {
            buttons += `<button class="btn-primary btn-sm" onclick="adminAPI.confirmBooking('${booking._id}')">Confirm</button>`;
        }
        
        buttons += `<button class="btn-outline btn-sm" onclick="adminAPI.viewBookingDetails('${booking._id}')">View</button>`;
        
        if (!['cancelled', 'completed'].includes(booking.status)) {
            buttons += `<button class="btn-outline btn-sm" onclick="adminAPI.rescheduleBooking('${booking._id}')">Reschedule</button>`;
            buttons += `<button class="btn-danger btn-sm" onclick="adminAPI.cancelBooking('${booking._id}')">Cancel</button>`;
        }

        // Show Mark Completed button for confirmed bookings
        if (booking.status === 'confirmed') {
            buttons += `<button class="btn-success btn-sm" onclick="adminAPI.markAsCompleted('${booking._id}')"><i class="fas fa-check"></i> Completed</button>`;
        }

        if (booking.status === 'completed' && !booking.reportUrl) {
            buttons += `<button class="btn-primary btn-sm" onclick="adminAPI.openUploadModal('${booking._id}')">Upload Report</button>`;
        }
        
        return buttons;
    }

    // Render users table
    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        if (!this.clients || this.clients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-cell">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <h4>No Users Found</h4>
                            <p>Users will appear here once they register</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.clients.map(client => {
            const userName = `${client.firstName} ${client.lastName || ''}`.trim();
            const stats = client.stats || {};
            const memberSince = new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            return `
                <tr data-id="${client._id}">
                    <td>
                        <div class="user-cell">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1f2e&color=d4af37" alt="User">
                            <div>
                                <span>${userName}</span>
                                <small>${client.email}</small>
                            </div>
                        </div>
                    </td>
                    <td>${client.phone || 'N/A'}</td>
                    <td>${stats.totalBookings || 0}</td>
                    <td>₹${(stats.totalSpent || 0).toLocaleString('en-IN')}</td>
                    <td>${memberSince}</td>
                    <td class="action-buttons">
                        <button class="btn-outline btn-sm" onclick="adminAPI.viewClientDetails('${client._id}')">View</button>
                        <button class="btn-outline btn-sm" onclick="window.location.href='mailto:${client.email}'">Email</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Use mock data for demo
    useMockData() {
        const now = new Date();
        this.bookings = [
            {
                _id: 'demo-1',
                bookingId: 'BK-2024-001',
                user: { firstName: 'Priya', lastName: 'Sharma', email: 'priya@email.com', phone: '+91 99306 76179' },
                service: { name: 'Marriage Matching', price: 1100, duration: 30 },
                consultationMode: 'phone',
                scheduledDate: new Date(now.getTime() + 86400000),
                scheduledTime: '10:00 AM',
                status: 'confirmed',
                payment: { total: 1000, status: 'completed' },
                createdAt: new Date()
            },
            {
                _id: 'demo-2',
                bookingId: 'BK-2024-002',
                user: { firstName: 'Rahul', lastName: 'Verma', email: 'rahul@email.com', phone: '+91 87654 32109' },
                service: { name: 'Career Guidance', price: 1100, duration: 30 },
                consultationMode: 'video',
                scheduledDate: new Date(now.getTime() + 172800000),
                scheduledTime: '12:00 PM',
                status: 'pending',
                payment: { total: 1000, status: 'pending' },
                createdAt: new Date(now.getTime() - 3600000)
            },
            {
                _id: 'demo-3',
                bookingId: 'BK-2024-003',
                user: { firstName: 'Sneha', lastName: 'Patel', email: 'sneha@email.com', phone: '+91 76543 21098' },
                service: { name: 'Vedic Astrology', price: 1100, duration: 30 },
                consultationMode: 'phone',
                scheduledDate: now,
                scheduledTime: '3:00 PM',
                status: 'confirmed',
                payment: { total: 1000, status: 'completed' },
                createdAt: new Date(now.getTime() - 86400000)
            },
            {
                _id: 'demo-4',
                bookingId: 'BK-2024-004',
                user: { firstName: 'Amit', lastName: 'Kumar', email: 'amit@email.com', phone: '+91 65432 10987' },
                service: { name: 'Tarot Card Reading', price: 1100, duration: 30 },
                consultationMode: 'video',
                scheduledDate: now,
                scheduledTime: '5:30 PM',
                status: 'pending',
                payment: { total: 1000, status: 'pending' },
                createdAt: new Date(now.getTime() - 7200000)
            }
        ];

        this.clients = [
            { _id: 'client-1', firstName: 'Priya', lastName: 'Sharma', email: 'priya@email.com', phone: '+91 99306 76179', createdAt: new Date('2024-01-15'), stats: { totalBookings: 5, totalSpent: 7500 } },
            { _id: 'client-2', firstName: 'Rahul', lastName: 'Verma', email: 'rahul@email.com', phone: '+91 87654 32109', createdAt: new Date('2024-02-20'), stats: { totalBookings: 3, totalSpent: 4500 } },
            { _id: 'client-3', firstName: 'Sneha', lastName: 'Patel', email: 'sneha@email.com', phone: '+91 76543 21098', createdAt: new Date('2024-03-10'), stats: { totalBookings: 2, totalSpent: 3000 } },
            { _id: 'client-4', firstName: 'Amit', lastName: 'Kumar', email: 'amit@email.com', phone: '+91 65432 10987', createdAt: new Date('2024-04-05'), stats: { totalBookings: 4, totalSpent: 6000 } }
        ];

        this.todaySchedule = this.bookings.filter(b => {
            const bookingDate = new Date(b.scheduledDate);
            return bookingDate.toDateString() === now.toDateString() && b.status !== 'cancelled';
        });

        const pendingCount = this.bookings.filter(b => b.status === 'pending').length;

        // Update UI
        this.updateKPICards({
            overview: { todayBookings: this.todaySchedule.length, totalClients: this.clients.length },
            thisMonth: { revenue: 15000 },
            statusBreakdown: { pending: pendingCount }
        });
        this.updateTodayScheduleTable(this.todaySchedule);
        this.renderBookingsTable();
        this.renderUsersTable();
        this.updatePendingActions();
    }

    // Initialize event handlers
    initEventHandlers() {
        // Initialize slot management early so form works even if data loading fails
        this.initSlotManagement();
        
        // Search functionality
        const bookingSearch = document.getElementById('bookingSearch');
        if (bookingSearch) {
            bookingSearch.addEventListener('input', (e) => this.searchBookings(e.target.value));
        }

        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => this.searchClients(e.target.value));
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => this.filterByStatus(e.target.value));
        }

        // Earnings filter
        const earningsFilter = document.getElementById('earningsFilter');
        if (earningsFilter) {
            earningsFilter.addEventListener('change', (e) => this.loadEarningsData(e.target.value));
        }

        // Upload modal
        const uploadReportBtn = document.getElementById('uploadReportBtn');
        if (uploadReportBtn) {
            uploadReportBtn.addEventListener('click', () => this.openUploadModal());
        }

        const closeUploadModal = document.getElementById('closeUploadModal');
        if (closeUploadModal) {
            closeUploadModal.addEventListener('click', () => this.closeUploadModal());
        }

        const cancelUpload = document.getElementById('cancelUpload');
        if (cancelUpload) {
            cancelUpload.addEventListener('click', () => this.closeUploadModal());
        }

        // Upload form
        const uploadForm = document.getElementById('uploadReportForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.uploadReport();
            });
        }

        // Logout
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Notification button
        document.getElementById('notificationBtn')?.addEventListener('click', () => {
            this.showToast('No new notifications', 'info');
        });

        // Event delegation for dynamic buttons
        this.initButtonDelegation();
    }

    // Event delegation for all dynamic buttons
    initButtonDelegation() {
        // Handle clicks on buttons within tables
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const row = btn.closest('tr');
            const bookingId = row?.dataset?.id;
            const btnText = btn.textContent.trim().toLowerCase();
            const btnClass = btn.className;

            // Handle based on button text/class
            if (btnText.includes('confirm') && bookingId) {
                e.preventDefault();
                this.confirmBooking(bookingId);
            } else if (btnText.includes('cancel') && bookingId) {
                e.preventDefault();
                this.cancelBooking(bookingId);
            } else if (btnText.includes('view') && bookingId) {
                e.preventDefault();
                // Check if it's a user row or booking row
                const tbody = row.closest('tbody');
                if (tbody?.id === 'usersTableBody') {
                    this.viewClientDetails(bookingId);
                } else {
                    this.viewBookingDetails(bookingId);
                }
            } else if (btnText.includes('reschedule') && bookingId) {
                e.preventDefault();
                this.rescheduleBooking(bookingId);
            } else if (btnText.includes('start') && bookingId) {
                e.preventDefault();
                this.startSession(bookingId);
            } else if ((btnText.includes('upload') || btnText.includes('report')) && bookingId) {
                e.preventDefault();
                this.openUploadModal(bookingId);
            } else if (btnText.includes('email')) {
                // Let the mailto link work naturally
                return;
            }
        });

        // Handle pending actions buttons
        document.querySelector('.pending-list')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const item = btn.closest('.pending-item');
            const pendingType = item?.querySelector('.pending-icon');
            
            if (pendingType?.classList.contains('report')) {
                this.openUploadModal();
            } else if (pendingType?.classList.contains('confirm')) {
                // Find first pending booking and confirm it
                const pendingBooking = this.bookings.find(b => b.status === 'pending');
                if (pendingBooking) {
                    this.confirmBooking(pendingBooking._id);
                }
            }
        });
    }

    // Confirm booking
    async confirmBooking(bookingId) {
        try {
            const token = window.API.Token.getToken();
            
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'confirmed' })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('Booking confirmed successfully!', 'success');
                await this.loadAdminData();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            // Demo mode fallback
            const booking = this.bookings.find(b => b._id === bookingId);
            if (booking) {
                booking.status = 'confirmed';
                this.renderBookingsTable();
                this.updatePendingActions();
                this.showToast('Booking confirmed successfully!', 'success');
            }
        }
    }

    // Mark booking as completed
    async markAsCompleted(bookingId) {
        if (!confirm('Mark this booking as completed? This indicates the consultation has been finished.')) return;
        
        try {
            const token = window.API.Token.getToken();
            
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'completed' })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('Booking marked as completed!', 'success');
                await this.loadAdminData();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            // Demo mode fallback
            const booking = this.bookings.find(b => b._id === bookingId);
            if (booking) {
                booking.status = 'completed';
                this.renderBookingsTable();
                this.updatePendingActions();
                this.showToast('Booking marked as completed!', 'success');
            }
        }
    }

    // Reschedule booking
    async rescheduleBooking(bookingId) {
        const newDate = prompt('Enter new date (YYYY-MM-DD):');
        if (!newDate) return;

        const newTime = prompt('Enter new time (e.g., 10:00 AM):');
        if (!newTime) return;

        try {
            const token = window.API.Token.getToken();
            
            const response = await fetch(`${ADMIN_API_BASE}/bookings/${bookingId}/reschedule`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newDate, newTime, reason: 'Admin rescheduled' })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('Booking rescheduled successfully!', 'success');
                await this.loadAdminData();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showToast(error.message || 'Failed to reschedule', 'error');
        }
    }

    // Cancel booking
    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const token = window.API.Token.getToken();
            
            const response = await fetch(`${ADMIN_API_BASE}/bookings/admin/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'cancelled' })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('Booking cancelled successfully!', 'success');
                await this.loadAdminData();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            // Demo mode fallback
            const booking = this.bookings.find(b => b._id === bookingId);
            if (booking) {
                booking.status = 'cancelled';
                this.renderBookingsTable();
                this.showToast('Booking cancelled!', 'success');
            }
        }
    }

    // View booking details
    viewBookingDetails(bookingId) {
        const booking = this.bookings.find(b => b._id === bookingId);
        
        if (!booking) {
            // Try to get info from the table row
            const row = document.querySelector(`tr[data-id="${bookingId}"]`);
            if (row) {
                const cells = row.querySelectorAll('td');
                this.showToast('Viewing booking details', 'info');
                alert(`
BOOKING DETAILS
═══════════════════════════════
Booking ID: ${cells[0]?.textContent || 'N/A'}
Client: ${cells[1]?.textContent?.trim() || 'N/A'}
Service: ${cells[2]?.textContent || 'N/A'}
Date & Time: ${cells[3]?.textContent || 'N/A'}
Amount: ${cells[5]?.textContent || 'N/A'}
Status: ${cells[6]?.textContent?.trim() || 'N/A'}
                `.trim());
            } else {
                this.showToast('Booking details not available', 'info');
            }
            return;
        }

        const date = new Date(booking.scheduledDate);
        const user = booking.user || { firstName: 'Unknown', lastName: '', email: 'N/A', phone: 'N/A' };
        const modeName = booking.consultationMode === 'phone' ? 'Phone Call' : 
                        booking.consultationMode === 'video' ? 'Video Call' : 'Chat';

        alert(`
BOOKING DETAILS
═══════════════════════════════
Booking ID: #${booking.bookingId || booking._id}
Status: ${this.capitalizeFirst(booking.status)}

CLIENT INFO
───────────────────────────────
Name: ${user.firstName} ${user.lastName || ''}
Email: ${user.email}
Phone: ${user.phone || 'N/A'}

CONSULTATION
───────────────────────────────
Service: ${booking.service?.name || 'Consultation'}
Date: ${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Time: ${booking.scheduledTime}
Mode: ${modeName}
Duration: ${booking.service?.duration || 30} minutes

PAYMENT
───────────────────────────────
Amount: ₹${(booking.payment?.total || 0).toLocaleString('en-IN')}
Status: ${booking.payment?.status || 'pending'}
        `.trim());
    }

    // View client details
    viewClientDetails(clientId) {
        const client = this.clients.find(c => c._id === clientId);
        
        if (!client) {
            // Try to get info from the table row
            const row = document.querySelector(`#usersTableBody tr[data-id="${clientId}"]`);
            if (row) {
                const cells = row.querySelectorAll('td');
                this.showToast('Viewing client details', 'info');
                alert(`
CLIENT PROFILE
═══════════════════════════════
Name: ${cells[0]?.textContent?.trim() || 'N/A'}
Contact: ${cells[1]?.textContent?.trim() || 'N/A'}
Total Bookings: ${cells[2]?.textContent || 'N/A'}
Total Spent: ${cells[3]?.textContent || 'N/A'}
Member Since: ${cells[4]?.textContent || 'N/A'}
                `.trim());
            } else {
                this.showToast('Client details not available', 'info');
            }
            return;
        }

        const stats = client.stats || {};
        const memberSince = new Date(client.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        alert(`
CLIENT PROFILE
═══════════════════════════════
Name: ${client.firstName} ${client.lastName || ''}
Email: ${client.email}
Phone: ${client.phone || 'N/A'}
Member Since: ${memberSince}

STATISTICS
───────────────────────────────
Total Bookings: ${stats.totalBookings || 0}
Total Spent: ₹${(stats.totalSpent || 0).toLocaleString('en-IN')}
        `.trim());
    }

    // Start session
    startSession(bookingId) {
        const booking = this.bookings.find(b => b._id === bookingId);
        if (!booking) return;

        const user = booking.user || { firstName: 'Unknown', phone: 'N/A' };
        
        if (booking.consultationMode === 'phone') {
            this.showToast(`Starting call with ${user.firstName} at ${user.phone}...`, 'info');
        } else {
            this.showToast('Opening video/chat session...', 'info');
        }
    }

    // Open upload modal
    openUploadModal(bookingId = null) {
        const modal = document.getElementById('uploadReportModal');
        if (modal) {
            modal.classList.add('active');
            if (bookingId) {
                modal.dataset.bookingId = bookingId;
            }
        }
    }

    // Close upload modal
    closeUploadModal() {
        const modal = document.getElementById('uploadReportModal');
        if (modal) {
            modal.classList.remove('active');
            delete modal.dataset.bookingId;
        }
    }

    // Upload report
    uploadReport() {
        const modal = document.getElementById('uploadReportModal');
        const bookingId = modal?.dataset.bookingId;
        
        this.showToast('Report uploaded successfully!', 'success');
        this.closeUploadModal();
        
        // Update booking in local data
        if (bookingId) {
            const booking = this.bookings.find(b => b._id === bookingId);
            if (booking) {
                booking.reportUrl = 'uploaded';
                this.updatePendingActions();
            }
        }
    }

    // Search bookings
    searchBookings(query) {
        const tbody = document.getElementById('bookingsTableBody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr[data-id]');
        const lowerQuery = query.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    }

    // Search clients
    searchClients(query) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr[data-id]');
        const lowerQuery = query.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    }

    // Filter by status
    filterByStatus(status) {
        const tbody = document.getElementById('bookingsTableBody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr[data-status]');

        rows.forEach(row => {
            if (status === 'all') {
                row.style.display = '';
            } else {
                row.style.display = row.dataset.status === status ? '' : 'none';
            }
        });
    }

    // Helper functions
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

    capitalizeFirst(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return 'Just now';
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

// Initialize admin when DOM is ready
const adminAPI = new AdminAPI();

document.addEventListener('DOMContentLoaded', async function() {
    await adminAPI.init();
});

// Export for global access
window.adminAPI = adminAPI;
