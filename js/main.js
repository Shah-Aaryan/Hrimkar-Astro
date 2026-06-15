/* ============================================
   Hrimkar Astro - Main JavaScript
   ============================================ */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components with error handling
    try { initPreloader(); } catch(e) { console.error('initPreloader error:', e); }
    try { initNavbar(); } catch(e) { console.error('initNavbar error:', e); }
    try { initMobileMenu(); } catch(e) { console.error('initMobileMenu error:', e); }
    try { initTestimonialsSlider(); } catch(e) { console.error('initTestimonialsSlider error:', e); }
    try { initPlanetaryWidget(); } catch(e) { console.error('initPlanetaryWidget error:', e); }
    try { initHoroscopeForm(); } catch(e) { console.error('initHoroscopeForm error:', e); }
    try { initSmoothScroll(); } catch(e) { console.error('initSmoothScroll error:', e); }
    try { initAnimations(); } catch(e) { console.error('initAnimations error:', e); }
});

/* Preloader */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return; // Exit if preloader doesn't exist on this page
    
    window.addEventListener('load', function() {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1000);
    });
}

/* Navbar */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return; // Exit if navbar doesn't exist on this page
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

/* Mobile Menu */
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

/* Testimonials Slider */
function initTestimonialsSlider() {
    const slider = document.getElementById('testimonialsSlider');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    const cards = slider.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    
    // Create dots
    cards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = dotsContainer.querySelectorAll('.dot');
    
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    function goToSlide(index) {
        currentIndex = index;
        const cardWidth = cards[0].offsetWidth + 24; // Include gap
        slider.scrollTo({
            left: cardWidth * index,
            behavior: 'smooth'
        });
        updateDots();
    }
    
    prevBtn.addEventListener('click', () => {
        currentIndex = Math.max(0, currentIndex - 1);
        goToSlide(currentIndex);
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = Math.min(cards.length - 1, currentIndex + 1);
        goToSlide(currentIndex);
    });
    
    // Auto-play
    let autoPlay = setInterval(() => {
        currentIndex = (currentIndex + 1) % cards.length;
        goToSlide(currentIndex);
    }, 5000);
    
    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(autoPlay));
    slider.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => {
            currentIndex = (currentIndex + 1) % cards.length;
            goToSlide(currentIndex);
        }, 5000);
    });
}

/* Planetary Widget */
function initPlanetaryWidget() {
    const dateElement = document.getElementById('currentDate');
    
    if (dateElement) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

/* Horoscope Form */
function initHoroscopeForm() {
    const form = document.getElementById('horoscopeForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const zodiac = document.getElementById('zodiacSign').value;
            const email = document.getElementById('horoscopeEmail').value;
            
            if (zodiac && email) {
                // Simulate form submission
                showToast('Success! You will receive daily horoscopes in your inbox.', 'success');
                form.reset();
            }
        });
    }
}

/* Smooth Scroll */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            
            if (target) {
                e.preventDefault();
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* Animations */
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
    
    // Animate on Scroll - Enhanced
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });
    
    // Reveal animations (left, right, up)
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up').forEach(el => {
        revealObserver.observe(el);
    });
    
    // Stagger items animation
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.stagger-item').forEach(el => {
        staggerObserver.observe(el);
    });
    
    // Add animate-on-scroll class to key elements automatically
    const elementsToAnimate = [
        '.service-card',
        '.feature-card', 
        '.testimonial-card',
        '.widget-card',
        '.stat'
    ];
    
    elementsToAnimate.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
            if (!el.classList.contains('animate-on-scroll')) {
                el.classList.add('animate-on-scroll');
                el.style.transitionDelay = `${index * 0.1}s`;
                scrollObserver.observe(el);
            }
        });
    });
    
    // Magnetic button effect
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
    
    // Tilt effect for cards
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
    
    // Counter animation for stats
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.getAttribute('data-count');
                if (finalValue) {
                    animateCounter(target, 0, parseInt(finalValue), 2000);
                }
                counterObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('[data-count]').forEach(el => {
        counterObserver.observe(el);
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled * 0.002);
        }
    });
}

/* Counter Animation Helper */
function animateCounter(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(start + (range * easeOutQuart));
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = end.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/* Toast Notification */
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
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
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease forwards;
    `;
    
    document.body.appendChild(toast);
    
    // Add animation keyframes
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideUp {
                to { transform: translateX(-50%) translateY(0); }
            }
            .toast-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                margin-left: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideUp 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

/* Form Validation */
function validateForm(form) {
    let isValid = true;
    
    // Required fields
    form.querySelectorAll('[required]').forEach(field => {
        const formGroup = field.closest('.form-group');
        
        if (!field.value.trim()) {
            formGroup.classList.add('error');
            isValid = false;
        } else {
            formGroup.classList.remove('error');
        }
    });
    
    // Email validation
    form.querySelectorAll('input[type="email"]').forEach(field => {
        const formGroup = field.closest('.form-group');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (field.value && !emailRegex.test(field.value)) {
            formGroup.classList.add('error');
            isValid = false;
        }
    });
    
    // Phone validation
    form.querySelectorAll('input[type="tel"]').forEach(field => {
        const formGroup = field.closest('.form-group');
        const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
        
        if (field.value && !phoneRegex.test(field.value)) {
            formGroup.classList.add('error');
            isValid = false;
        }
    });
    
    return isValid;
}

/* Format Currency */
function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/* Format Date */
function formatDate(date, options = {}) {
    const defaultOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-IN', { ...defaultOptions, ...options });
}

/* Format Time */
function formatTime(time) {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/* Generate Unique ID */
function generateId() {
    return 'CW' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

/* Local Storage Helpers */
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        localStorage.removeItem(key);
    },
    
    clear() {
        localStorage.clear();
    }
};

/* API Helper (Mock) */
const API = {
    baseUrl: '/api',
    
    async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Return mock data based on endpoint
            return this.mockResponse(endpoint, options.method);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    mockResponse(endpoint, method) {
        // Mock responses for different endpoints
        const responses = {
            '/bookings': {
                success: true,
                data: []
            },
            '/services': {
                success: true,
                data: [
                    { id: 1, name: 'Vedic Astrology', price: 1000, duration: 30 },
                    { id: 2, name: 'Marriage Matching', price: 1000, duration: 30 },
                    { id: 3, name: 'Career Guidance', price: 1500, duration: 30 },
                    { id: 4, name: 'Health Astrology', price: 1500, duration: 30 },
                    { id: 5, name: 'Tarot Card Reading', price: 1000, duration: 30 },
                    { id: 6, name: 'Numerology', price: 1000, duration: 30 },
                    { id: 7, name: 'Love & Compatibility Guidance', price: 1000, duration: 30 }
                ]
            },
            '/slots': {
                success: true,
                data: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']
            }
        };
        
        return responses[endpoint] || { success: true, data: null };
    }
};

/* Export for use in other scripts */
window.CosmicWisdom = {
    showToast,
    validateForm,
    formatCurrency,
    formatDate,
    formatTime,
    generateId,
    Storage,
    API
};
