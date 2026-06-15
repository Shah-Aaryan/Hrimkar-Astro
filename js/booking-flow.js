/* ============================================
   Hrimkar Astro - Booking Flow JavaScript
   Complete 7-Step Booking System
   ============================================ */

// Booking State
const bookingState = {
    currentStep: 1,
    service: null,
    mode: null,
    date: null,
    time: null,
    timezone: 'Asia/Kolkata',
    personalDetails: {},
    coupon: null,
    discount: 0,
    total: 0
};

// Service Data
const services = {
    'birth-chart': {
        name: 'Vedic Astrology',
        description: 'Complete Kundli analysis with detailed predictions',
        icon: 'fa-scroll',
        price: 1000,
        duration: 30
    },
    'marriage-matching': {
        name: 'Marriage Astrology',
        description: 'Kundli Milan & compatibility analysis',
        icon: 'fa-heart',
        price: 1000,
        duration: 30
    },
    'career-guidance': {
        name: 'Career Astrology',
        description: 'Professional & business advice',
        icon: 'fa-briefcase',
        price: 1000,
        duration: 30
    },
    'health-astrology': {
        name: 'Medical/Health Astrology',
        description: 'Medical astrology analysis',
        icon: 'fa-heartbeat',
        price: 1000,
        duration: 30
    },
    'tarot-reading': {
        name: 'Tarot Card Reading',
        description: 'Intuitive card guidance',
        icon: 'fa-th-large',
        price: 1000,
        duration: 30
    },
    'numerology': {
        name: 'Numerology',
        description: 'Power of numbers analysis',
        icon: 'fa-calculator',
        price: 1000,
        duration: 30
    },
    'love-compatibility': {
        name: 'Love & Compatibility Guidance',
        description: 'Comprehensive relationship and compatibility guidance',
        icon: 'fa-heart',
        price: 1000,
        duration: 30
    }
};

// Mode Data
const modes = {
    'phone': { name: 'Phone Call', icon: 'fa-phone-alt' },
    'video': { name: 'Video Call', icon: 'fa-video' },
    'chat': { name: 'Chat Consultation', icon: 'fa-comments' }
};

// Available Coupons
const coupons = {
    'FIRST10': { discount: 10, type: 'percent', description: '10% off for first booking' },
    'COSMIC20': { discount: 20, type: 'percent', description: '20% off' },
    'FLAT100': { discount: 100, type: 'flat', description: '₹100 off' },
    'WELCOME': { discount: 15, type: 'percent', description: '15% welcome discount' }
};

// Calendar State
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in - LOGIN IS REQUIRED FOR BOOKING
    checkLoginRequired();
    
    initServiceSelection();
    initModeSelection();
    initCalendar();
    initTimeSlots();
    initPersonalDetails();
    initCoupon();
    initPayment();
    initNavigation();
    updateSidebar();
});

/* ==================== Login Check ==================== */
function checkLoginRequired() {
    // Check if API is loaded and user is logged in
    if (window.API && window.API.Token && window.API.Token.isLoggedIn()) {
        // User is logged in - update nav and pre-fill details
        updateNavForLoggedInUser();
        prefillUserDetails();
    } else {
        // User is NOT logged in - show login prompt
        showLoginRequiredModal();
    }
}

function updateNavForLoggedInUser() {
    const user = window.API.Token.getUser();
    if (!user) return;
    
    const navUser = document.querySelector('.nav-user');
    if (navUser) {
        navUser.innerHTML = `
            <a href="dashboard.html" class="btn-login">
                <i class="fas fa-user"></i> ${user.firstName}
            </a>
        `;
    }
}

function prefillUserDetails() {
    const user = window.API.Token.getUser();
    if (!user) return;
    
    // Pre-fill personal details form
    setTimeout(() => {
        const fullNameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const dobInput = document.getElementById('dob');
        const tobInput = document.getElementById('tob');
        const pobInput = document.getElementById('pob');
        
        if (fullNameInput) fullNameInput.value = `${user.firstName} ${user.lastName || ''}`.trim();
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        if (dobInput && user.dateOfBirth) dobInput.value = user.dateOfBirth.split('T')[0];
        if (tobInput && user.timeOfBirth) tobInput.value = user.timeOfBirth;
        if (pobInput && user.placeOfBirth) pobInput.value = user.placeOfBirth;
    }, 100);
}

function showLoginRequiredModal() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'login-required-modal';
    modal.innerHTML = `
        <div class="login-modal-content">
            <div class="login-modal-icon">
                <i class="fas fa-lock"></i>
            </div>
            <h2>Login Required</h2>
            <p>Please login or create an account to book a consultation. This helps us:</p>
            <ul>
                <li><i class="fas fa-check"></i> Save your booking history</li>
                <li><i class="fas fa-check"></i> Send appointment reminders</li>
                <li><i class="fas fa-check"></i> Provide personalized consultations</li>
                <li><i class="fas fa-check"></i> Access your reports anytime</li>
            </ul>
            <div class="login-modal-buttons">
                <a href="login.html?redirect=booking.html" class="btn-primary">
                    <i class="fas fa-sign-in-alt"></i> Login to Continue
                </a>
                <a href="login.html?redirect=booking.html&mode=register" class="btn-secondary">
                    <i class="fas fa-user-plus"></i> Create Account
                </a>
            </div>
            <a href="index.html" class="back-link"><i class="fas fa-arrow-left"></i> Back to Home</a>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles if not already present
    if (!document.getElementById('login-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'login-modal-styles';
        style.textContent = `
            .login-required-modal {
                position: fixed;
                inset: 0;
                background: rgba(10, 10, 20, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }
            .login-modal-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 20px;
                padding: 40px;
                max-width: 450px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .login-modal-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #d4af37 0%, #b8962d 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
            }
            .login-modal-icon i {
                font-size: 36px;
                color: #1a1a2e;
            }
            .login-modal-content h2 {
                color: #fff;
                font-family: 'Cormorant Garamond', serif;
                font-size: 2rem;
                margin-bottom: 16px;
            }
            .login-modal-content p {
                color: #a0a0a0;
                margin-bottom: 20px;
                font-size: 1rem;
            }
            .login-modal-content ul {
                list-style: none;
                padding: 0;
                margin: 0 0 30px;
                text-align: left;
            }
            .login-modal-content li {
                color: #c0c0c0;
                padding: 8px 0;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 0.95rem;
            }
            .login-modal-content li i {
                color: #d4af37;
                font-size: 0.85rem;
            }
            .login-modal-buttons {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 20px;
            }
            .login-modal-buttons a {
                padding: 14px 24px;
                border-radius: 10px;
                font-weight: 600;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: all 0.3s ease;
            }
            .login-modal-buttons .btn-primary {
                background: linear-gradient(135deg, #d4af37 0%, #b8962d 100%);
                color: #1a1a2e;
            }
            .login-modal-buttons .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
            }
            .login-modal-buttons .btn-secondary {
                background: transparent;
                border: 2px solid #d4af37;
                color: #d4af37;
            }
            .login-modal-buttons .btn-secondary:hover {
                background: rgba(212, 175, 55, 0.1);
            }
            .back-link {
                color: #888;
                text-decoration: none;
                font-size: 0.9rem;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: color 0.3s ease;
            }
            .back-link:hover {
                color: #d4af37;
            }
            @media (max-width: 480px) {
                .login-modal-content {
                    padding: 30px 20px;
                }
                .login-modal-content h2 {
                    font-size: 1.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
}

/* ==================== Step 1: Service Selection ==================== */
function initServiceSelection() {
    const serviceCards = document.querySelectorAll('.service-select-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected from all
            serviceCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected to clicked
            this.classList.add('selected');
            
            // Update state
            const serviceId = this.dataset.service;
            // Ensure serviceId is valid and normalize it
            if (!serviceId || !services[serviceId]) {
                console.error('Invalid service selected:', serviceId);
                showToast('Invalid service selected. Please try again.', 'error');
                return;
            }
            // Set service with id first, then spread other properties (id will be preserved)
            bookingState.service = {
                ...services[serviceId],
                id: serviceId  // Ensure id is always set correctly, even if services object changes
            };
            
            // Calculate total
            calculateTotal();
            
            // Update sidebar
            updateSidebar();
            
            // Auto-advance to step 2 after a short delay
            setTimeout(() => goToStep(2), 300);
        });
        
        // Also handle button click
        const btn = card.querySelector('.btn-select-service');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                card.click();
            });
        }
    });
}

/* ==================== Step 2: Mode Selection ==================== */
function initModeSelection() {
    const modeCards = document.querySelectorAll('.mode-select-card');
    
    modeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected from all
            modeCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected to clicked
            this.classList.add('selected');
            
            // Update state
            const modeId = this.dataset.mode;
            bookingState.mode = {
                id: modeId,
                ...modes[modeId]
            };
            
            // Update sidebar
            updateSidebar();
            
            // Auto-advance to step 3
            setTimeout(() => goToStep(3), 300);
        });
        
        // Handle button click
        const btn = card.querySelector('.btn-select-mode');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                card.click();
            });
        }
    });
}

/* ==================== Step 3: Calendar & Time ==================== */
function initCalendar() {
    renderCalendar();
    
    document.getElementById('calPrev').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    document.getElementById('calNext').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Timezone is now fixed to IST
    bookingState.timezone = 'Asia/Kolkata';
}

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for proper comparison
    
    // Empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day disabled';
        grid.appendChild(emptyCell);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.textContent = day;
        cell.dataset.day = day; // Store day in dataset
        
        const cellDate = new Date(currentYear, currentMonth, day);
        cellDate.setHours(0, 0, 0, 0); // Normalize to midnight for comparison
        
        // Check if past date
        if (cellDate.getTime() < today.getTime()) {
            cell.classList.add('disabled');
        } else {
            // Check if today
            if (cellDate.getTime() === today.getTime()) {
                cell.classList.add('today');
            }
            
            // Add click handler
            cell.addEventListener('click', function() {
                if (!this.classList.contains('disabled')) {
                    // Remove selected from all
                    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                    
                    // Add selected
                    this.classList.add('selected');
                    
                    // Get the day from dataset to avoid closure issues
                    const selectedDay = parseInt(this.dataset.day);
                    
                    // Update state with proper date
                    bookingState.date = new Date(currentYear, currentMonth, selectedDay);
                    bookingState.date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
                    
                    console.log('Selected date:', bookingState.date); // Debug log
                    
                    // Show time slots
                    showTimeSlots();
                    
                    // Update sidebar
                    updateSidebar();
                }
            });
        }
        
        grid.appendChild(cell);
    }
}

function initTimeSlots() {
    // Time slots are generated when date is selected
}

async function showTimeSlots() {
    const slotsSection = document.getElementById('timeSlotsSection');
    const slotsGrid = document.getElementById('timeSlotsGrid');
    const dateDisplay = document.getElementById('selectedDateDisplay');
    
    if (!bookingState.date) return;
    
    // Format date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = bookingState.date.toLocaleDateString('en-US', options);
    
    // Show loading state
    slotsGrid.innerHTML = '<div class="loading-slots"><i class="fas fa-spinner fa-spin"></i> Loading available slots...</div>';
    slotsSection.style.display = 'block';
    
    // Format date for API call (YYYY-MM-DD)
    const dateStr = bookingState.date.toISOString().split('T')[0];
    
    let slots = [];
    
    // Try to fetch from API first
    if (window.API && window.API.Booking && window.API.Booking.getAvailableSlots) {
        try {
            const response = await window.API.Booking.getAvailableSlots(dateStr);
            if (response.success && response.data && response.data.slots) {
                slots = response.data.slots;
                
                // Check if day is blocked (empty slots with message)
                if (slots.length === 0 && response.data.message) {
                    slotsGrid.innerHTML = `<div class="no-slots-message"><i class="fas fa-calendar-times"></i> ${response.data.message}</div>`;
                    return;
                }
            }
        } catch (error) {
            console.error('Error fetching slots from API:', error);
            // Fall back to generating slots locally
            slots = generateLocalSlots();
        }
    } else {
        // API not available, generate slots locally
        slots = generateLocalSlots();
    }
    
    // Filter out blocked slots completely - users should not see them at all
    slots = slots.filter(slot => !slot.blocked);
    
    // Filter out past time slots if the selected date is today
    const now = new Date();
    const isToday = bookingState.date.toDateString() === now.toDateString();
    
    if (isToday) {
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        
        slots = slots.filter(slot => {
            const slotHour = parseTimeToHour(slot.time);
            // Add 30 minutes buffer - don't allow booking slots less than 30 mins from now
            if (slotHour < currentHour) return false;
            if (slotHour === currentHour && currentMinutes >= 30) return false;
            // If it's a :30 slot and we're past that time
            if (slot.time.includes(':30') && slotHour === currentHour) return false;
            return true;
        });
    }
    
    // Only show available slots to users
    const availableSlots = slots.filter(slot => slot.available !== false);
    
    slotsGrid.innerHTML = '';
    
    if (availableSlots.length === 0) {
        slotsGrid.innerHTML = '<div class="no-slots-message"><i class="fas fa-calendar-times"></i> No available slots for this date. Please select another date.</div>';
        return;
    }
    
    availableSlots.forEach(slot => {
        const slotEl = document.createElement('div');
        slotEl.className = 'time-slot';
        slotEl.innerHTML = slot.time;
        slotEl.dataset.time = slot.time;
        
        slotEl.addEventListener('click', function() {
            // Remove selected from all
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            
            // Add selected
            this.classList.add('selected');
            
            // Update state
            bookingState.time = slot.time;
            
            // Enable continue button
            document.getElementById('toStep4').disabled = false;
            
            // Update sidebar
            updateSidebar();
        });
        
        slotsGrid.appendChild(slotEl);
    });
    
    slotsSection.style.display = 'block';
}

// Helper function to generate slots locally (fallback when API unavailable)
function generateLocalSlots() {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
        const time = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
        slots.push({ time, available: true });
        
        if (hour < 20) {
            const timeHalf = `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`;
            slots.push({ time: timeHalf, available: true });
        }
    }
    return slots;
}

// Helper function to parse time string to 24-hour format
function parseTimeToHour(timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    
    let hour = parseInt(match[1]);
    const isPM = match[3].toUpperCase() === 'PM';
    
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    return hour;
}

// Convert 'H:MM AM/PM' to 'HH:MM' 24-hour format to satisfy stricter server validators
function convertTo24Hour(timeStr) {
    const match = timeStr && timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return timeStr; // if already HH:MM or invalid, pass through
    let hour = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = match[3].toUpperCase();
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    const hh = hour.toString().padStart(2, '0');
    return `${hh}:${minutes}`;
}

/* ==================== Step 4: Personal Details ==================== */
function initPersonalDetails() {
    const toStep5Btn = document.getElementById('toStep5');
    
    toStep5Btn.addEventListener('click', function() {
        // Validate form
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('emailAddress').value.trim();
        const phone = document.getElementById('phoneNumber').value.trim();
        const countryCode = document.getElementById('countryCode').value;
        
        let isValid = true;
        
        if (!fullName) {
            showFieldError('fullName');
            isValid = false;
        } else if (!/^[a-zA-Z\s'-]+$/.test(fullName)) {
            showNotification('Name can only contain letters, spaces, hyphens, and apostrophes', 'error');
            showFieldError('fullName');
            isValid = false;
        }
        
        if (!email || !isValidEmail(email)) {
            showFieldError('emailAddress');
            isValid = false;
        }
        
        if (!phone || phone.length < 10) {
            showFieldError('phoneNumber');
            isValid = false;
        } else if (!/^[\d\s-]{10,15}$/.test(phone)) {
            showNotification('Phone number must be 10-15 characters and contain only digits, spaces, or hyphens', 'error');
            showFieldError('phoneNumber');
            isValid = false;
        }
        
        // Validate birth details
        const dob = document.getElementById('dobInput').value.trim();
        const tob = document.getElementById('tobInput').value.trim();
        const pob = document.getElementById('pobInput').value.trim();
        if (!dob) {
            showFieldError('dobInput');
            isValid = false;
        }
        if (!tob) {
            showFieldError('tobInput');
            isValid = false;
        }
        if (!pob) {
            showFieldError('pobInput');
            isValid = false;
        }
        if (isValid) {
            // Save to state
            bookingState.personalDetails = {
                fullName,
                email,
                phone: countryCode + phone,
                dob,
                tob,
                pob,
                purpose: document.getElementById('consultationPurpose').value
            };
            // Calculate total before review
            calculateTotal();
            // Update review page
            updateReviewPage();
            // Go to step 5
            goToStep(5);
        }
    });
}

function showFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const error = field.parentElement.querySelector('.field-error');
    if (error) {
        error.style.display = 'block';
        field.style.borderColor = '#dc2626';
        
        setTimeout(() => {
            error.style.display = 'none';
            field.style.borderColor = '';
        }, 3000);
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ==================== Step 5: Review & Coupon ==================== */
function updateReviewPage() {
    if (bookingState.service) {
        document.getElementById('reviewServiceIcon').innerHTML = `<i class="fas ${bookingState.service.icon}"></i>`;
        document.getElementById('reviewServiceName').textContent = bookingState.service.name;
        document.getElementById('reviewServiceDesc').textContent = bookingState.service.description;
        document.getElementById('reviewDuration').textContent = `${bookingState.service.duration} minutes`;
        document.getElementById('reviewServiceFee').textContent = `₹${bookingState.service.price.toLocaleString()}`;
    }
    
    if (bookingState.mode) {
        document.getElementById('reviewMode').innerHTML = `<i class="fas ${bookingState.mode.icon}"></i> ${bookingState.mode.name}`;
    }
    
    if (bookingState.date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('reviewDate').textContent = bookingState.date.toLocaleDateString('en-US', options);
    }
    
    if (bookingState.time) {
        document.getElementById('reviewTime').textContent = `${bookingState.time} IST`;
    }
    
    if (bookingState.personalDetails.fullName) {
        document.getElementById('reviewName').textContent = bookingState.personalDetails.fullName;
        document.getElementById('reviewEmail').textContent = bookingState.personalDetails.email;
        document.getElementById('reviewPhone').textContent = bookingState.personalDetails.phone;
    }
    
    document.getElementById('reviewTotal').textContent = `₹${bookingState.total.toLocaleString()}`;
}

function initCoupon() {
    const applyBtn = document.getElementById('applyCouponBtn');
    const removeBtn = document.getElementById('removeCouponBtn');
    const couponInput = document.getElementById('couponInput');
    
    applyBtn.addEventListener('click', function() {
        const code = couponInput.value.trim().toUpperCase();
        
        if (coupons[code]) {
            bookingState.coupon = code;
            calculateTotal();
            
            // Show applied
            document.getElementById('couponInputGroup').style.display = 'none';
            document.getElementById('couponAppliedBox').style.display = 'flex';
            document.getElementById('appliedCouponText').textContent = `${code} applied - ${coupons[code].description}`;
            
            // Show discount row
            document.getElementById('reviewDiscountRow').style.display = 'flex';
            document.getElementById('reviewCouponCode').textContent = code;
            document.getElementById('reviewDiscount').textContent = `-₹${bookingState.discount.toLocaleString()}`;
            document.getElementById('reviewTotal').textContent = `₹${bookingState.total.toLocaleString()}`;
            
            // Update sidebar
            updateSidebar();
            
            showToast('Coupon applied successfully!', 'success');
        } else {
            showToast('Invalid coupon code', 'error');
        }
    });
    
    removeBtn.addEventListener('click', function() {
        bookingState.coupon = null;
        bookingState.discount = 0;
        calculateTotal();
        
        // Reset UI
        document.getElementById('couponInputGroup').style.display = 'flex';
        document.getElementById('couponAppliedBox').style.display = 'none';
        document.getElementById('reviewDiscountRow').style.display = 'none';
        couponInput.value = '';
        
        document.getElementById('reviewTotal').textContent = `₹${bookingState.total.toLocaleString()}`;
        
        updateSidebar();
    });
}

function calculateTotal() {
    if (!bookingState.service) {
        bookingState.total = 0;
        bookingState.discount = 0;
        return;
    }
    
    let price = bookingState.service.price;
    let discount = 0;
    
    if (bookingState.coupon && coupons[bookingState.coupon]) {
        const coupon = coupons[bookingState.coupon];
        if (coupon.type === 'percent') {
            discount = Math.round(price * coupon.discount / 100);
        } else {
            discount = coupon.discount;
        }
    }
    
    bookingState.discount = discount;
    bookingState.total = price - discount;
}

/* ==================== Step 6: Payment with Screenshot Upload ==================== */
let selectedScreenshot = null;
let currentBookingId = null;

function initPayment() {
    // Initialize screenshot upload
    initScreenshotUpload();
    
    // Terms checkbox to enable submit button
    const termsCheckbox = document.getElementById('termsAgree');
    termsCheckbox.addEventListener('change', updateSubmitButtonState);
    
    // Always hide error when checkbox is checked
    termsCheckbox.addEventListener('change', function() {
        const termsError = document.getElementById('termsError');
        if (this.checked && termsError) termsError.style.display = 'none';
    });
    
    // Pay/Submit button
    document.getElementById('payNowBtn').addEventListener('click', async function() {
        const termsChecked = document.getElementById('termsAgree').checked;
        const termsError = document.getElementById('termsError');
        if (!termsChecked) {
            showToast('Please accept the terms and conditions', 'error');
            if (termsError) {
                termsError.style.display = 'block';
                setTimeout(() => { termsError.style.display = 'none'; }, 3000);
            }
            return;
        }
        if (termsError) termsError.style.display = 'none';
        if (!selectedScreenshot) {
            showToast('Please upload your payment screenshot', 'error');
            return;
        }
        // Start processing
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        this.disabled = true;
        try {
            await completeBooking();
        } catch (error) {
            console.error('Booking error:', error);
            showToast('Error processing booking. Please try again.', 'error');
            this.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Booking';
            this.disabled = false;
        }
    });
    
    // Update payment amount display when entering step 6
    const toStep6Btn = document.getElementById('toStep6');
    toStep6Btn.addEventListener('click', function() {
        // Check if terms consent checkbox is checked
        const termsConsent = document.getElementById('termsConsent');
        const consentError = document.getElementById('consentError');
        
        if (termsConsent && !termsConsent.checked) {
            if (consentError) {
                consentError.style.display = 'block';
            }
            termsConsent.focus();
            // Scroll to consent box
            termsConsent.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        
        // Hide error if checkbox is checked
        if (consentError) {
            consentError.style.display = 'none';
        }
        
        console.log('Going to step 6, bookingState.total:', bookingState.total);
        console.log('bookingState.service:', bookingState.service);
        
        // Recalculate total to ensure it's correct
        calculateTotal();
        
        const paymentAmountEl = document.getElementById('paymentAmount');
        const instructionAmountEl = document.getElementById('instructionAmount');
        
        if (paymentAmountEl) {
            paymentAmountEl.textContent = `₹${bookingState.total.toLocaleString()}`;
            console.log('Set paymentAmount to:', paymentAmountEl.textContent);
        }
        if (instructionAmountEl) {
            instructionAmountEl.textContent = bookingState.total.toLocaleString();
            console.log('Set instructionAmount to:', instructionAmountEl.textContent);
        }
        
        goToStep(6);
    });
}

function initScreenshotUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const screenshotInput = document.getElementById('screenshotInput');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const screenshotPreviewImg = document.getElementById('screenshotPreview');
    
    if (!uploadArea || !screenshotInput) {
        console.error('Screenshot upload elements not found');
        return;
    }
    
    // Click to upload
    uploadArea.addEventListener('click', function(e) {
        if (!e.target.closest('.remove-screenshot')) {
            console.log('Upload area clicked, opening file dialog');
            screenshotInput.click();
        }
    });
    
    // Handle file selection
    screenshotInput.addEventListener('change', function(e) {
        console.log('File selected:', e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
            handleScreenshotFile(file);
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleScreenshotFile(file);
        }
    });
}

function handleScreenshotFile(file) {
    console.log('handleScreenshotFile called with:', file.name, file.type, file.size);
    
    const uploadError = document.getElementById('uploadError');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const screenshotPreviewImg = document.getElementById('screenshotPreview');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        uploadError.textContent = 'Please upload an image file (JPG, PNG, WEBP)';
        uploadError.style.display = 'block';
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        console.log('File too large:', file.size);
        uploadError.textContent = 'File size must be less than 5MB';
        uploadError.style.display = 'block';
        return;
    }
    
    uploadError.style.display = 'none';
    selectedScreenshot = file;
    console.log('Screenshot saved to selectedScreenshot:', selectedScreenshot);
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        screenshotPreviewImg.src = e.target.result;
        uploadPlaceholder.style.display = 'none';
        uploadPreview.style.display = 'block';
        console.log('Preview displayed');
    };
    reader.readAsDataURL(file);
    
    // Update submit button state
    updateSubmitButtonState();
}

function removeScreenshot() {
    selectedScreenshot = null;
    document.getElementById('screenshotInput').value = '';
    document.getElementById('uploadPlaceholder').style.display = 'flex';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('screenshotPreview').src = '';
    updateSubmitButtonState();
}

function updateSubmitButtonState() {
    const termsCheckbox = document.getElementById('termsAgree');
    const termsChecked = termsCheckbox ? termsCheckbox.checked : false;
    const hasScreenshot = selectedScreenshot !== null;
    const submitBtn = document.getElementById('payNowBtn');
    
    console.log('updateSubmitButtonState - termsChecked:', termsChecked, 'hasScreenshot:', hasScreenshot);
    
    if (submitBtn) {
        submitBtn.disabled = !(termsChecked && hasScreenshot);
        console.log('Submit button disabled:', submitBtn.disabled);
    }
}

function copyUPIId() {
    const upiId = document.getElementById('upiIdDisplay').textContent;
    navigator.clipboard.writeText(upiId).then(() => {
        showToast('UPI ID copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy UPI ID', 'error');
    });
}

// Helper function to normalize serviceId - ensures we always send the correct ID format
function normalizeServiceId(service) {
    if (!service) {
        throw new Error('Service is required');
    }
    
    // Valid service IDs that backend expects
    const validServiceIds = ['birth-chart', 'marriage-matching', 'career-guidance', 'health-astrology', 'tarot-reading', 'numerology', 'love-compatibility'];
    
    // If service has an id property, use it (but validate it)
    if (service.id) {
        const normalizedId = String(service.id).trim().toLowerCase();
        if (validServiceIds.includes(normalizedId)) {
            return normalizedId;
        }
    }
    
    // If service is a string (service name), try to map it to an ID
    if (typeof service === 'string') {
        const normalized = service.trim().toLowerCase();
        // Direct match
        if (validServiceIds.includes(normalized)) {
            return normalized;
        }
        // Map service names to IDs
        const nameToIdMap = {
            'vedic astrology': 'birth-chart',
            'birth chart': 'birth-chart',
            'marriage matching': 'marriage-matching',
            'marriage astrology': 'marriage-matching',
            'career guidance': 'career-guidance',
            'career astrology': 'career-guidance',
            'health astrology': 'health-astrology',
            'medical/health astrology': 'health-astrology',
            'tarot card reading': 'tarot-reading',
            'tarot reading': 'tarot-reading',
            'numerology': 'numerology',
            'love & compatibility guidance': 'love-compatibility',
            'love compatibility': 'love-compatibility',
            'love & compatibility': 'love-compatibility'
        };
        if (nameToIdMap[normalized]) {
            return nameToIdMap[normalized];
        }
    }
    
    // If service is an object with a name, try to map the name
    if (service.name) {
        const normalizedName = String(service.name).trim().toLowerCase();
        const nameToIdMap = {
            'vedic astrology': 'birth-chart',
            'birth chart': 'birth-chart',
            'marriage matching': 'marriage-matching',
            'marriage astrology': 'marriage-matching',
            'career guidance': 'career-guidance',
            'career astrology': 'career-guidance',
            'health astrology': 'health-astrology',
            'medical/health astrology': 'health-astrology',
            'tarot card reading': 'tarot-reading',
            'tarot reading': 'tarot-reading',
            'numerology': 'numerology',
            'love & compatibility guidance': 'love-compatibility',
            'love compatibility': 'love-compatibility',
            'love & compatibility': 'love-compatibility'
        };
        if (nameToIdMap[normalizedName]) {
            return nameToIdMap[normalizedName];
        }
    }
    
    // Try to find by matching against services object keys
    for (const [id, serviceData] of Object.entries(services)) {
        if (serviceData.name === service || serviceData.name === service?.name) {
            return id;
        }
    }
    
    throw new Error(`Invalid service: ${JSON.stringify(service)}. Could not determine serviceId.`);
}

async function completeBooking() {
    console.log('completeBooking called');
    console.log('selectedScreenshot:', selectedScreenshot);
    console.log('bookingState:', bookingState);
    
    // First create the booking
    // Construct personalDetails with only provided optional fields to satisfy strict validators
    const pd = {
        fullName: bookingState.personalDetails.fullName,
        email: bookingState.personalDetails.email,
        phone: bookingState.personalDetails.phone
    };
    if (bookingState.personalDetails.dob) pd.dateOfBirth = bookingState.personalDetails.dob;
    if (bookingState.personalDetails.tob) pd.timeOfBirth = bookingState.personalDetails.tob;
    if (bookingState.personalDetails.pob) pd.placeOfBirth = bookingState.personalDetails.pob;
    if (bookingState.personalDetails.purpose) pd.consultationPurpose = bookingState.personalDetails.purpose;

    // Normalize serviceId to ensure it's always in the correct format
    const normalizedServiceId = normalizeServiceId(bookingState.service);
    
    const bookingData = {
        serviceId: normalizedServiceId,
        consultationMode: bookingState.mode.id,
        scheduledDate: bookingState.date.toISOString(),
        // Use 24-hour HH:MM format for broad server compatibility
        scheduledTime: convertTo24Hour(bookingState.time),
        timezone: bookingState.timezone || 'Asia/Kolkata',
        personalDetails: pd,
        paymentMethod: 'gpay'
    };
    if (bookingState.coupon) bookingData.couponCode = bookingState.coupon;
    
    console.log('bookingData:', bookingData);
    
    let booking;
    
    // Check if API is available
    if (window.API && window.API.Booking) {
        try {
            console.log('Calling API to create booking...');
            const response = await window.API.Booking.create(bookingData);
            console.log('API response:', response);
            if (response.success) {
                booking = response.data;
                currentBookingId = booking._id;
                console.log('Booking created with ID:', currentBookingId);
            } else {
                throw new Error(response.message || 'Failed to create booking');
            }
        } catch (error) {
            console.error('API booking error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                status: error.status
            });
            
            // Show validation errors to user if available
            let errorMessage = 'Failed to create booking. Please check all fields and try again.';
            if (error.response && error.response.errors && Array.isArray(error.response.errors)) {
                const errorMessages = error.response.errors.map(e => {
                    const field = e.param || e.field || 'unknown';
                    const msg = e.msg || e.message || 'Invalid value';
                    return `${field}: ${msg}`;
                }).join(', ');
                errorMessage = `Validation failed: ${errorMessages}`;
            } else if (error.response && error.response.message) {
                errorMessage = error.response.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showToast(errorMessage, 'error');
            
            // Don't fall back to demo mode if API is available - show error instead
            if (window.API && window.API.Booking) {
                return; // Exit early, don't proceed with booking
            }
            // Fall back to demo mode only if API is not available
            booking = createDemoBooking(bookingData);
        }
    } else {
        console.log('API not available, using demo mode');
        // Demo mode
        booking = createDemoBooking(bookingData);
    }
    
    // If booking creation failed, don't proceed
    if (!booking) {
        return;
    }
    
    // Upload screenshot if we have a real booking ID
    if (currentBookingId && selectedScreenshot && window.API) {
        try {
            console.log('Uploading screenshot to server...');
            await uploadScreenshotToServer(currentBookingId, selectedScreenshot);
            console.log('Screenshot uploaded successfully');
        } catch (error) {
            console.error('Screenshot upload error:', error);
            // Continue anyway - booking is created
        }
    } else {
        console.log('Skipping screenshot upload - currentBookingId:', currentBookingId, 'selectedScreenshot:', selectedScreenshot);
    }
    
    // Update confirmation page with pending status
    document.getElementById('confirmBookingId').textContent = booking.bookingId || generateBookingId();
    document.getElementById('confirmService').textContent = bookingState.service.name;
    document.getElementById('confirmMode').textContent = bookingState.mode.name;
    
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateStr = bookingState.date.toLocaleDateString('en-US', dateOptions);
    document.getElementById('confirmDateTime').textContent = `${dateStr} at ${bookingState.time} IST`;
    document.getElementById('confirmAmount').textContent = `₹${bookingState.total.toLocaleString()}`;
    
    // Show pending approval state
    document.getElementById('pendingApprovalState').style.display = 'block';
    document.getElementById('successState').style.display = 'none';
    
    // Go to confirmation step
    goToStep(7);
    
    // Hide sidebar on confirmation
    document.querySelector('.booking-sidebar').style.display = 'none';
    
    showToast('Booking submitted! Awaiting payment verification.', 'success');
}

function createDemoBooking(data) {
    return {
        bookingId: generateBookingId(),
        service: bookingState.service,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        status: 'awaiting_payment_approval'
    };
}

async function uploadScreenshotToServer(bookingId, file) {
    const formData = new FormData();
    formData.append('screenshot', file);
    
    const token = window.API.Token.getToken();
    const response = await fetch(`${window.API.BASE_URL}/bookings/${bookingId}/upload-screenshot`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Failed to upload screenshot');
    }
    
    return data;
}

function generateBookingId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `CW-${year}${month}${day}${random}`;
}

/* ==================== Navigation ==================== */
function initNavigation() {
    // Back buttons
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', function() {
            const backTo = parseInt(this.dataset.back);
            goToStep(backTo);
        });
    });
    
    // Step 4 continue (after date/time selection)
    document.getElementById('toStep4').addEventListener('click', function() {
        if (bookingState.date && bookingState.time) {
            goToStep(4);
        } else {
            showToast('Please select a date and time', 'error');
        }
    });
}

function goToStep(step) {
    // Validate transition
    if (step > 1 && !bookingState.service && step !== 1) {
        showToast('Please select a service first', 'error');
        return;
    }
    
    if (step > 2 && !bookingState.mode && step !== 1 && step !== 2) {
        showToast('Please select a consultation mode', 'error');
        return;
    }
    
    if (step > 3 && (!bookingState.date || !bookingState.time) && step > 3) {
        showToast('Please select a date and time', 'error');
        return;
    }
    
    // Update current step
    bookingState.currentStep = step;
    
    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach(s => {
        const stepNum = parseInt(s.dataset.step);
        s.classList.remove('active', 'completed');
        
        if (stepNum === step) {
            s.classList.add('active');
        } else if (stepNum < step) {
            s.classList.add('completed');
        }
    });
    
    // Update progress lines
    document.querySelectorAll('.progress-line').forEach((line, index) => {
        line.classList.remove('active', 'completed');
        if (index < step - 1) {
            line.classList.add('completed');
        }
    });
    
    // Show correct panel
    document.querySelectorAll('.booking-step-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const panelId = `step${step}Panel`;
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

/* ==================== Sidebar ==================== */
function updateSidebar() {
    // Service
    if (bookingState.service) {
        document.getElementById('sidebarService').textContent = bookingState.service.name;
        document.getElementById('sidebarPrice').textContent = `₹${bookingState.service.price.toLocaleString()}`;
        document.getElementById('sidebarDuration').textContent = `${bookingState.service.duration} mins`;
        document.getElementById('sidebarDurationRow').style.display = 'flex';
    }
    
    // Mode
    if (bookingState.mode) {
        document.getElementById('sidebarMode').textContent = bookingState.mode.name;
        document.getElementById('sidebarModeRow').style.display = 'flex';
    }
    
    // Date
    if (bookingState.date) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        document.getElementById('sidebarDate').textContent = bookingState.date.toLocaleDateString('en-US', options);
        document.getElementById('sidebarDateRow').style.display = 'flex';
    }
    
    // Time
    if (bookingState.time) {
        document.getElementById('sidebarTime').textContent = bookingState.time;
        document.getElementById('sidebarTimeRow').style.display = 'flex';
    }
    
    // Discount
    if (bookingState.discount > 0) {
        document.getElementById('sidebarDiscount').textContent = `-₹${bookingState.discount.toLocaleString()}`;
        document.getElementById('sidebarDiscountRow').style.display = 'flex';
    } else {
        document.getElementById('sidebarDiscountRow').style.display = 'none';
    }
    
    // Total
    document.getElementById('sidebarTotal').textContent = `₹${bookingState.total.toLocaleString()}`;
}

/* ==================== Toast Notification ==================== */
function showToast(message, type = 'info') {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        animation: toastIn 0.3s ease forwards;
        font-size: 0.95rem;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastIn {
            from { transform: translateX(-50%) translateY(100px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes toastOut {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(100px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==================== Real-time Input Validation ==================== */
document.addEventListener('DOMContentLoaded', function() {
    // Full name validation - only letters, spaces, hyphens, apostrophes
    const fullNameField = document.getElementById('fullName');
    if (fullNameField) {
        fullNameField.addEventListener('input', function(e) {
            const invalidChars = this.value.match(/[^a-zA-Z\s'-]/g);
            if (invalidChars) {
                const cursorPos = this.selectionStart;
                this.value = this.value.replace(/[^a-zA-Z\s'-]/g, '');
                this.setSelectionRange(cursorPos - 1, cursorPos - 1);
                this.style.borderColor = '#ef4444';
                setTimeout(() => { this.style.borderColor = ''; }, 1000);
            }
        });
    }
    
    // Phone number validation - only digits, spaces, hyphens
    const phoneField = document.getElementById('phoneNumber');
    if (phoneField) {
        phoneField.addEventListener('input', function(e) {
            const invalidChars = this.value.match(/[^\d\s-]/g);
            if (invalidChars) {
                const cursorPos = this.selectionStart;
                this.value = this.value.replace(/[^\d\s-]/g, '');
                this.setSelectionRange(cursorPos - 1, cursorPos - 1);
                this.style.borderColor = '#ef4444';
                setTimeout(() => { this.style.borderColor = ''; }, 1000);
            }
        });
    }
});

/* ==================== Calendar Add Events ==================== */
document.getElementById('addGoogleCal')?.addEventListener('click', function() {
    if (!bookingState.date || !bookingState.time) return;
    
    const startDate = new Date(bookingState.date);
    const [time, period] = bookingState.time.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    startDate.setHours(hours, parseInt(minutes || 0));
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + (bookingState.service?.duration || 30));
    
    const formatDate = (d) => d.toISOString().replace(/-|:|\.\d{3}/g, '');
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(bookingState.service?.name + ' - Hrimkar Astro')}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent('Astrology consultation with Hrimkar Astro')}&location=Online`;
    
    window.open(url, '_blank');
});
