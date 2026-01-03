// OTP-based registration logic
async function requestOtp() {
    const email = document.getElementById('registerEmail').value.trim();
    if (!validateEmail(email)) {
        showNotification('Enter a valid email to receive OTP', 'error');
        return;
    }
    try {
        const btn = document.querySelector('#otpRequestGroup button');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
        console.log('Requesting OTP for:', email);
        const res = await window.API.Auth.requestOtp(email);
        console.log('OTP response:', res);
        if (res.success) {
            showNotification('OTP sent to your email!', 'success');
            document.getElementById('otpSentMsg').style.display = '';
            document.getElementById('otpInputGroup').style.display = '';
            document.getElementById('registerBtn').style.display = '';
        } else {
            showNotification(res.message || 'Failed to send OTP', 'error');
        }
    } catch (e) {
        console.error('OTP Error:', e);
        showNotification(e.message || 'Failed to send OTP', 'error');
    } finally {
        const btn = document.querySelector('#otpRequestGroup button');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-key"></i> Send OTP to Email';
    }
}

async function handleRegisterWithOtp() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const otp = document.getElementById('registerOtp').value.trim();
    const agreeTerms = document.getElementById('agreeTerms')?.checked;
    if (!firstName || !lastName || !email || !phone || !password || !otp) {
        showNotification('Please fill in all fields and OTP', 'error');
        return;
    }
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    if (!agreeTerms) {
        showNotification('Please agree to the Terms of Service', 'error');
        return;
    }
    const btn = document.getElementById('registerBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    btn.disabled = true;
    try {
        const response = await window.API.Auth.registerWithOtp({ firstName, lastName, email, phone, password, otp });
        if (response.success) {
            showNotification('Account created successfully!', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        }
    } catch (error) {
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
/**
 * Hrimkar Astro - Authentication JavaScript
 * Integrated with Backend API using JWT
 */

// Check if API is available
const isAPIAvailable = () => typeof window.API !== 'undefined';

// Toggle Password Visibility
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Show Login Form
function showLogin() {
    hideAllForms();
    document.getElementById('loginForm').style.display = 'block';
}

// Show Register Form
function showRegister() {
    hideAllForms();
    document.getElementById('registerForm').style.display = 'block';
}

// Show Forgot Password Form
function showForgotPassword() {
    hideAllForms();
    document.getElementById('forgotForm').style.display = 'block';
}

// Show Success Message
function showSuccess(title, text) {
    hideAllForms();
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successText').textContent = text;
    document.getElementById('successMessage').style.display = 'block';
}

// Hide All Forms
function hideAllForms() {
    const forms = ['loginForm', 'registerForm', 'forgotForm', 'successMessage'];
    forms.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;
    
    // Validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    const btn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;
    
    try {
        if (isAPIAvailable()) {
            // Real API call
            const response = await window.API.Auth.login(email, password);
            
            if (response.success) {
                showNotification('Login successful! Redirecting...', 'success');
                
                // Store remember me preference
                if (rememberMe) {
                    localStorage.setItem('cosmic_remember', 'true');
                }
                
                // Check for redirect URL parameter
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');
                
                // Redirect based on role or redirect parameter
                setTimeout(() => {
                    if (redirectUrl) {
                        window.location.href = redirectUrl;
                    } else if (response.data.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
            }
        } else {
            // Demo mode - no backend
            console.log('API not available, using demo mode');
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');
                
                // Demo credentials
                if (email === 'admin@hrimkarastro.com') {
                    localStorage.setItem('cosmic_demo_user', JSON.stringify({
                        firstName: 'Admin',
                        lastName: 'User',
                        email: email,
                        role: 'admin'
                    }));
                    window.location.href = redirectUrl || 'admin.html';
                } else {
                    localStorage.setItem('cosmic_demo_user', JSON.stringify({
                        firstName: 'Demo',
                        lastName: 'User',
                        email: email,
                        role: 'user'
                    }));
                    window.location.href = redirectUrl || 'dashboard.html';
                }
            }, 1500);
        }
    } catch (error) {
        showNotification(error.message || 'Login failed. Please try again.', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Handle Register
async function handleRegister() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const agreeTerms = document.getElementById('agreeTerms')?.checked;
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('Please agree to the Terms of Service', 'error');
        return;
    }
    
    const btn = document.querySelector('#registerForm button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    btn.disabled = true;
    
    try {
        if (isAPIAvailable()) {
            // Real API call
            const response = await window.API.Auth.register({
                firstName,
                lastName,
                email,
                phone,
                password
            });
            
            if (response.success) {
                showNotification('Account created successfully!', 'success');
                
                // Check for redirect URL parameter
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');
                
                setTimeout(() => {
                    window.location.href = redirectUrl || 'dashboard.html';
                }, 1000);
            }
        } else {
            // Demo mode
            setTimeout(() => {
                // Check for redirect URL parameter
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');
                
                localStorage.setItem('cosmic_demo_user', JSON.stringify({
                    firstName,
                    lastName,
                    email: email,
                    role: 'user'
                }));
                
                showNotification('Account created successfully!', 'success');
                
                setTimeout(() => {
                    window.location.href = redirectUrl || 'dashboard.html';
                }, 1000);
            }, 1500);
        }
    } catch (error) {
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Handle Forgot Password
async function handleForgotPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        showNotification('Please enter your email', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    const btn = document.querySelector('#forgotForm button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    
    // Simulate sending reset email (backend endpoint can be added later)
    setTimeout(() => {
        showSuccess(
            'Email Sent!',
            'If an account exists with this email, password reset instructions have been sent.'
        );
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1500);
}

// Validate Email
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password Strength Checker
function checkPasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score < 2) {
        return { class: 'weak', text: 'Weak password' };
    } else if (score < 4) {
        return { class: 'medium', text: 'Medium password' };
    } else {
        return { class: 'strong', text: 'Strong password' };
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    // Add styles if not present
    if (!document.querySelector('#notificationStyles')) {
        const styles = document.createElement('style');
        styles.id = 'notificationStyles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: white;
                font-size: 0.95rem;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                z-index: 10000;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification.success {
                border-color: rgba(16, 185, 129, 0.3);
            }
            .notification.success i {
                color: #10b981;
            }
            .notification.error {
                border-color: rgba(239, 68, 68, 0.3);
            }
            .notification.error i {
                color: #ef4444;
            }
            .notification.warning i {
                color: #f59e0b;
            }
            .notification.info i {
                color: #3b82f6;
            }
        `;
        document.head.appendChild(styles);
    }

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle Logout (can be called from anywhere)
async function handleLogout() {
    try {
        if (isAPIAvailable()) {
            await window.API.Auth.logout();
        } else {
            localStorage.removeItem('cosmic_demo_user');
        }
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Password strength indicator
    const passwordInput = document.getElementById('registerPassword');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            
            strengthIndicator.className = 'password-strength ' + strength.class;
            const textEl = strengthIndicator.querySelector('.strength-text');
            if (textEl) textEl.textContent = strength.text;
        });
    }
    
    // Check URL parameters for redirect and mode
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    const mode = urlParams.get('mode');
    
    // Show appropriate form based on mode parameter
    if (mode === 'register') {
        showRegister();
    }
    
    // Show notification if redirected from booking
    if (redirectUrl === 'booking.html') {
        setTimeout(() => {
            showNotification('Please login to book an appointment', 'info');
        }, 500);
    }
    
    // Check if user is already logged in
    if (isAPIAvailable() && window.API.Token.isLoggedIn()) {
        // Redirect to dashboard or redirect URL if already logged in
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'login.html') {
            window.location.href = redirectUrl || 'dashboard.html';
        }
    }
    
    // Form submit handlers (prevent default form submission)
    const loginFormEl = document.getElementById('loginFormEl');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
    
    const registerFormEl = document.getElementById('registerFormEl');
    if (registerFormEl) {
        registerFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegister();
        });
    }
    
    const forgotFormEl = document.getElementById('forgotFormEl');
    if (forgotFormEl) {
        forgotFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            handleForgotPassword();
        });
    }
});

// Export functions for global use
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleForgotPassword = handleForgotPassword;
window.handleLogout = handleLogout;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showForgotPassword = showForgotPassword;
window.togglePassword = togglePassword;
