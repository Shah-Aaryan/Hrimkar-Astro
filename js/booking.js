/**
 * Hrimkar Astro - Booking System
 * Handles calendar, time slots, and booking flow
 */

document.addEventListener('DOMContentLoaded', function() {
    // State Management
    const bookingState = {
        selectedService: null,
        selectedMode: 'phone',
        selectedDate: null,
        selectedTime: null,
        price: 0,
        duration: 0,
        discount: 0,
        currentStep: 1
    };

    // Services Data
    const servicesData = {
        vedic: { name: 'Vedic Astrology', price: 1100, duration: 30 },
        marriage: { name: 'Marriage Matching', price: 1100, duration: 30 },
        career: { name: 'Career Guidance', price: 1100, duration: 30 },
        health: { name: 'Health Astrology', price: 1100, duration: 30 },
        tarot: { name: 'Tarot Card Reading', price: 1100, duration: 30 },
        numerology: { name: 'Numerology', price: 1100, duration: 30 },
        'love-compatibility': { name: 'Love & Compatibility Guidance', price: 1100, duration: 30 }
    };

    // Available Time Slots
    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
        '06:00 PM', '07:00 PM', '08:00 PM'
    ];

    // Calendar State
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // DOM Elements
    const steps = document.querySelectorAll('.booking-steps .step');
    const stepContents = document.querySelectorAll('.booking-step-content');
    const calendarDays = document.getElementById('calendarDays');
    const calendarTitle = document.getElementById('calendarTitle');
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');
    const timeSlotsDiv = document.getElementById('timeSlots');

    // Initialize
    initializeBookingForm();
    initializeCalendar();
    initializePaymentMethods();

    function initializeBookingForm() {
        // Service Selection
        const serviceInputs = document.querySelectorAll('input[name="service"]');
        serviceInputs.forEach(input => {
            input.addEventListener('change', function() {
                bookingState.selectedService = this.value;
                bookingState.price = parseInt(this.dataset.price);
                bookingState.duration = parseInt(this.dataset.duration);
                updateSummary();
            });
        });

        // Mode Selection
        const modeInputs = document.querySelectorAll('input[name="mode"]');
        modeInputs.forEach(input => {
            input.addEventListener('change', function() {
                bookingState.selectedMode = this.value;
                updateSummary();
            });
        });

        // Step Navigation
        document.getElementById('toStep2').addEventListener('click', () => goToStep(2));
        document.getElementById('toStep3').addEventListener('click', () => goToStep(3));
        document.getElementById('toStep4').addEventListener('click', () => goToStep(4));
        document.getElementById('backToStep1').addEventListener('click', () => goToStep(1));
        document.getElementById('backToStep2').addEventListener('click', () => goToStep(2));
        document.getElementById('backToStep3').addEventListener('click', () => goToStep(3));

        // Confirm Booking
        document.getElementById('confirmBooking').addEventListener('click', confirmBooking);

        // Coupon Code
        document.getElementById('applyCoupon').addEventListener('click', applyCoupon);
        document.getElementById('removeCoupon')?.addEventListener('click', removeCoupon);
    }

    function goToStep(step) {
        // Validate current step
        if (!validateStep(bookingState.currentStep)) {
            return;
        }

        // Update step indicators
        steps.forEach((s, index) => {
            if (index < step) {
                s.classList.add('completed');
                s.classList.remove('active');
            } else if (index === step - 1) {
                s.classList.add('active');
                s.classList.remove('completed');
            } else {
                s.classList.remove('active', 'completed');
            }
        });

        // Show step content
        stepContents.forEach((content, index) => {
            if (index === step - 1) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        bookingState.currentStep = step;

        // Scroll to top
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }

    function validateStep(step) {
        switch(step) {
            case 1:
                if (!bookingState.selectedService) {
                    showNotification('Please select a service', 'error');
                    return false;
                }
                return true;
            case 2:
                if (!bookingState.selectedDate) {
                    showNotification('Please select a date', 'error');
                    return false;
                }
                if (!bookingState.selectedTime) {
                    showNotification('Please select a time slot', 'error');
                    return false;
                }
                return true;
            case 3:
                const name = document.getElementById('fullName').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const dob = document.getElementById('dob').value;
                const birthTime = document.getElementById('birthTime').value;
                const birthPlace = document.getElementById('birthPlace').value;

                if (!name || !email || !phone) {
                    showNotification('Please fill in all required fields', 'error');
                    return false;
                }

                // For astrology services, birth details are required
                const astroServices = ['vedic', 'marriage', 'career', 'health'];
                if (astroServices.includes(bookingState.selectedService)) {
                    if (!dob || !birthTime || !birthPlace) {
                        showNotification('Birth details are required for astrology services', 'error');
                        return false;
                    }
                }

                if (!validateEmail(email)) {
                    showNotification('Please enter a valid email', 'error');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Calendar Functions
    function initializeCalendar() {
        renderCalendar();
        
        document.getElementById('prevMonth').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }

    function renderCalendar() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        calendarTitle.textContent = `${months[currentMonth]} ${currentYear}`;
        calendarDays.innerHTML = '';

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        const today = new Date();

        // Empty cells for days before first day
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('span');
            emptyDay.className = 'day empty';
            calendarDays.appendChild(emptyDay);
        }

        // Days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayEl = document.createElement('span');
            dayEl.className = 'day';
            dayEl.textContent = day;

            const dayDate = new Date(currentYear, currentMonth, day);
            
            // Check if past date
            if (dayDate < today.setHours(0, 0, 0, 0)) {
                dayEl.classList.add('disabled');
            } else {
                // Randomly block some dates (simulating unavailable dates)
                const isBlocked = Math.random() < 0.1;
                if (isBlocked) {
                    dayEl.classList.add('blocked');
                } else {
                    dayEl.addEventListener('click', () => selectDate(dayDate, dayEl));
                }
            }

            // Check if selected
            if (bookingState.selectedDate && 
                dayDate.toDateString() === bookingState.selectedDate.toDateString()) {
                dayEl.classList.add('selected');
            }

            calendarDays.appendChild(dayEl);
        }
    }

    function selectDate(date, element) {
        // Remove previous selection
        document.querySelectorAll('.calendar-days .day').forEach(d => {
            d.classList.remove('selected');
        });

        element.classList.add('selected');
        bookingState.selectedDate = date;
        
        // Show time slots
        renderTimeSlots();
        updateSummary();
    }

    function renderTimeSlots() {
        timeSlotsContainer.style.display = 'block';
        timeSlotsDiv.innerHTML = '';

        timeSlots.forEach(slot => {
            const slotEl = document.createElement('button');
            slotEl.type = 'button';
            slotEl.className = 'time-slot';
            slotEl.textContent = slot;

            // Randomly make some slots unavailable
            const isUnavailable = Math.random() < 0.2;
            if (isUnavailable) {
                slotEl.classList.add('unavailable');
            } else {
                slotEl.addEventListener('click', () => selectTimeSlot(slot, slotEl));
            }

            if (bookingState.selectedTime === slot) {
                slotEl.classList.add('selected');
            }

            timeSlotsDiv.appendChild(slotEl);
        });
    }

    function selectTimeSlot(time, element) {
        // Remove previous selection
        document.querySelectorAll('.time-slot').forEach(s => {
            s.classList.remove('selected');
        });

        element.classList.add('selected');
        bookingState.selectedTime = time;
        updateSummary();
    }

    // Payment Methods
    function initializePaymentMethods() {
        const paymentInputs = document.querySelectorAll('input[name="payment"]');
        paymentInputs.forEach(input => {
            input.addEventListener('change', function() {
                // Hide all payment details
                document.querySelectorAll('.payment-details').forEach(d => {
                    d.style.display = 'none';
                });

                // Show selected payment details
                const detailsId = this.value + 'Details';
                const details = document.getElementById(detailsId);
                if (details) {
                    details.style.display = 'block';
                }
            });
        });
    }

    // Coupon Functions
    function applyCoupon() {
        const couponInput = document.getElementById('couponCode');
        const code = couponInput.value.trim().toUpperCase();

        const validCoupons = {
            'FIRST10': 0.10,
            'COSMIC20': 0.20,
            'WELCOME15': 0.15
        };

        if (validCoupons[code]) {
            bookingState.discount = bookingState.price * validCoupons[code];
            
            document.getElementById('couponApplied').style.display = 'flex';
            document.querySelector('#couponApplied span').innerHTML = 
                `<i class="fas fa-check-circle"></i> ${code} applied`;
            document.getElementById('discountRow').style.display = 'flex';
            
            couponInput.style.display = 'none';
            document.getElementById('applyCoupon').style.display = 'none';
            
            updateSummary();
            showNotification('Coupon applied successfully!', 'success');
        } else {
            showNotification('Invalid coupon code', 'error');
        }
    }

    function removeCoupon() {
        bookingState.discount = 0;
        
        document.getElementById('couponApplied').style.display = 'none';
        document.getElementById('discountRow').style.display = 'none';
        
        document.getElementById('couponCode').style.display = 'block';
        document.getElementById('couponCode').value = '';
        document.getElementById('applyCoupon').style.display = 'block';
        
        updateSummary();
    }

    // Update Summary
    function updateSummary() {
        const summaryService = document.getElementById('summaryService');
        const summaryDuration = document.getElementById('summaryDuration');
        const summaryDate = document.getElementById('summaryDate');
        const summaryTime = document.getElementById('summaryTime');
        const summaryMode = document.getElementById('summaryMode');
        const summaryDiscount = document.getElementById('summaryDiscount');
        const summaryTotal = document.getElementById('summaryTotal');

        if (bookingState.selectedService) {
            const service = servicesData[bookingState.selectedService];
            summaryService.textContent = service.name;
            summaryDuration.textContent = service.duration + ' minutes';
        }

        if (bookingState.selectedDate) {
            summaryDate.textContent = bookingState.selectedDate.toLocaleDateString('en-IN', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
            });
        }

        if (bookingState.selectedTime) {
            summaryTime.textContent = bookingState.selectedTime;
        }

        const modeNames = {
            phone: 'Phone Call',
            video: 'Video Call',
            chat: 'WhatsApp Chat'
        };
        summaryMode.textContent = modeNames[bookingState.selectedMode];

        if (bookingState.discount > 0) {
            summaryDiscount.textContent = '-₹' + bookingState.discount.toFixed(0);
        }

        const total = bookingState.price - bookingState.discount;
        summaryTotal.textContent = '₹' + total.toLocaleString('en-IN');
    }

    // Confirm Booking
    function confirmBooking() {
        const termsAccept = document.getElementById('termsAccept');
        const disclaimerAccept = document.getElementById('disclaimerAccept');

        if (!termsAccept.checked) {
            showNotification('Please accept the Terms & Conditions', 'error');
            return;
        }

        if (!disclaimerAccept.checked) {
            showNotification('Please accept the disclaimer', 'error');
            return;
        }

        // Simulate payment processing
        const btn = document.getElementById('confirmBooking');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        setTimeout(() => {
            // Generate booking ID
            const bookingId = 'CW' + Date.now().toString().slice(-6);
            
            // Update confirmation display
            document.getElementById('bookingIdDisplay').textContent = bookingId;
            document.getElementById('confirmService').textContent = 
                servicesData[bookingState.selectedService].name;
            document.getElementById('confirmDateTime').textContent = 
                bookingState.selectedDate.toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'short', day: 'numeric'
                }) + ' at ' + bookingState.selectedTime;
            document.getElementById('confirmMode').textContent = 
                document.getElementById('summaryMode').textContent;
            document.getElementById('confirmAmount').textContent = 
                document.getElementById('summaryTotal').textContent;

            // Show confirmation
            stepContents.forEach(content => content.classList.remove('active'));
            document.getElementById('confirmationContent').classList.add('active');

            // Update steps
            steps.forEach(step => {
                step.classList.add('completed');
                step.classList.remove('active');
            });

            // Hide sidebar
            document.querySelector('.booking-sidebar').style.display = 'none';

        }, 2000);
    }

    // Notification System
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
