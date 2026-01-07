
// Define API_BASE_URL and TokenService at the top so they are available everywhere
const API_BASE_URL = 'https://hrimkar-astro-1.onrender.com/api';
const TokenService = {
    getToken: () => localStorage.getItem('cosmic_token'),
    setToken: (token) => localStorage.setItem('cosmic_token', token),
    removeToken: () => localStorage.removeItem('cosmic_token'),
    getUser: () => {
        const user = localStorage.getItem('cosmic_user');
        return user ? JSON.parse(user) : null;
    },
    setUser: (user) => localStorage.setItem('cosmic_user', JSON.stringify(user)),
    removeUser: () => localStorage.removeItem('cosmic_user'),
    isLoggedIn: () => !!localStorage.getItem('cosmic_token')
};

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = TokenService.getToken();
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== AUTH API ====================
const AuthAPI = {
    // Request OTP for registration
    requestOtp: async (email) => {
        return await apiRequest('/auth/request-otp', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    // Register with OTP verification
    registerWithOtp: async (userData) => {
        const response = await apiRequest('/auth/register-with-otp', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success && response.token) {
            TokenService.setToken(response.token);
            TokenService.setUser(response.data);
        }
        
        return response;
    },

    // Register new user
    register: async (userData) => {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success && response.token) {
            TokenService.setToken(response.token);
            TokenService.setUser(response.data);
        }
        
        return response;
    },
    
    // Login user
    login: async (email, password) => {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.success && response.token) {
            TokenService.setToken(response.token);
            TokenService.setUser(response.data);
        }
        
        return response;
    },
    
    // Logout user
    logout: async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            TokenService.removeToken();
            TokenService.removeUser();
        }
    },
    
    // Get current user
    getMe: async () => {
        return await apiRequest('/auth/me');
    },
    
    // Verify token
    verifyToken: async () => {
        try {
            const response = await apiRequest('/auth/verify');
            return response.success;
        } catch {
            TokenService.removeToken();
            TokenService.removeUser();
            return false;
        }
    },
    
    // Update user details
    updateDetails: async (userData) => {
        const response = await apiRequest('/auth/updatedetails', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
        
        if (response.success) {
            TokenService.setUser(response.data);
        }
        
        return response;
    },
    
    // Update password
    updatePassword: async (currentPassword, newPassword) => {
        return await apiRequest('/auth/updatepassword', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    },

    // Forgot password - request OTP
    forgotPassword: async (email) => {
        return await apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    // Verify reset OTP
    verifyResetOtp: async (email, otp) => {
        return await apiRequest('/auth/verify-reset-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp })
        });
    },

    // Reset password with OTP
    resetPassword: async (email, otp, newPassword) => {
        return await apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, otp, newPassword })
        });
    }
};

// ==================== BOOKING API ====================
const BookingAPI = {
    // Create new booking
    create: async (bookingData) => {
        return await apiRequest('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },
    
    // Get all user bookings
    getMyBookings: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return await apiRequest(`/bookings?${queryString}`);
    },
    
    // Get single booking
    getBooking: async (id) => {
        return await apiRequest(`/bookings/${id}`);
    },
    
    // Get booking by reference ID
    getByRef: async (bookingId) => {
        return await apiRequest(`/bookings/ref/${bookingId}`);
    },
    
    // Cancel booking
    cancel: async (id, reason) => {
        return await apiRequest(`/bookings/${id}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        });
    },
    
    // Reschedule booking
    reschedule: async (id, newDate, newTime, reason) => {
        return await apiRequest(`/bookings/${id}/reschedule`, {
            method: 'PUT',
            body: JSON.stringify({ newDate, newTime, reason })
        });
    },
    
    // Add feedback
    addFeedback: async (id, rating, review) => {
        return await apiRequest(`/bookings/${id}/feedback`, {
            method: 'PUT',
            body: JSON.stringify({ rating, review })
        });
    },
    
    // Validate coupon
    validateCoupon: async (couponCode, serviceId) => {
        return await apiRequest('/bookings/validate-coupon', {
            method: 'POST',
            body: JSON.stringify({ couponCode, serviceId })
        });
    },
    
    // Get available time slots
    getAvailableSlots: async (date) => {
        return await apiRequest(`/bookings/slots/${date}`);
    },
    
    // Upload payment screenshot
    uploadScreenshot: async (bookingId, file) => {
        const formData = new FormData();
        formData.append('screenshot', file);
        
        const token = TokenService.getToken();
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/upload-screenshot`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload screenshot');
        }
        
        return data;
    }
};

// ==================== UI HELPERS ====================
const UIHelpers = {
    // Show toast notification
    showToast: (message, type = 'info') => {
        const existingToast = document.querySelector('.api-toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = `api-toast api-toast-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: ${colors[type]};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: toastSlideIn 0.3s ease forwards;
            font-size: 0.95rem;
            font-family: var(--font-body, sans-serif);
        `;
        
        // Add animation styles
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes toastSlideIn {
                    to { transform: translateX(-50%) translateY(0); }
                }
                @keyframes toastSlideOut {
                    to { transform: translateX(-50%) translateY(100px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // Show loading state on button
    setButtonLoading: (button, loading = true) => {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    },
    
    // Redirect if not logged in
    requireAuth: () => {
        if (!TokenService.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    // Redirect if already logged in
    redirectIfLoggedIn: (redirectTo = 'dashboard.html') => {
        if (TokenService.isLoggedIn()) {
            window.location.href = redirectTo;
            return true;
        }
        return false;
    }
};

// Export for use in other files
window.API = {
    Auth: AuthAPI,
    Booking: BookingAPI,
    Token: TokenService,
    UI: UIHelpers,
    BASE_URL: API_BASE_URL
};

// Auto-check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Update nav based on login status
    const updateNavigation = () => {
        const user = TokenService.getUser();
        const authLinks = document.querySelectorAll('.auth-nav-link');
        const userMenu = document.querySelector('.user-menu');
        const loginBtn = document.querySelector('.nav-login-btn');
        
        if (user && userMenu) {
            userMenu.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'none';
            
            const userName = userMenu.querySelector('.user-name');
            if (userName) userName.textContent = user.firstName;
        }
    };
    
    updateNavigation();
});
