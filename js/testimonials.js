/**
 * Hrimkar Astro - Testimonials API Service
 * Handles all testimonial/review related operations
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Token Service (reuse from api.js if available)
const TestimonialTokenService = {
    getToken: () => localStorage.getItem('cosmic_token'),
    getUser: () => {
        const user = localStorage.getItem('cosmic_user');
        return user ? JSON.parse(user) : null;
    },
    isLoggedIn: () => !!localStorage.getItem('cosmic_token')
};

// API request helper
async function testimonialApiRequest(endpoint, options = {}) {
    const token = TestimonialTokenService.getToken();
    
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

// Testimonials API
const TestimonialsAPI = {
    // Get all approved reviews
    getReviews: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return testimonialApiRequest(`/reviews${queryParams ? '?' + queryParams : ''}`);
    },
    
    // Get featured reviews
    getFeaturedReviews: async () => {
        return testimonialApiRequest('/reviews/featured');
    },
    
    // Get review stats
    getStats: async () => {
        return testimonialApiRequest('/reviews/stats');
    },
    
    // Submit a new review (requires login)
    submitReview: async (reviewData) => {
        return testimonialApiRequest('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },
    
    // Get user's own review
    getMyReview: async () => {
        return testimonialApiRequest('/reviews/my-review');
    },
    
    // Update user's own review
    updateMyReview: async (reviewData) => {
        return testimonialApiRequest('/reviews/my-review', {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        });
    },
    
    // Delete user's own review
    deleteMyReview: async () => {
        return testimonialApiRequest('/reviews/my-review', {
            method: 'DELETE'
        });
    }
};

// DOM Elements
let testimonialsGrid;
let featuredGrid;
let filterButtons;
let loadMoreBtn;
let reviewModal;
let reviewForm;
let currentPage = 1;
let currentFilter = 'all';
let isLoading = false;

// Initialize testimonials page
document.addEventListener('DOMContentLoaded', function() {
    initializeTestimonialsPage();
});

async function initializeTestimonialsPage() {
    // Cache DOM elements
    testimonialsGrid = document.querySelector('.testimonials-grid');
    featuredGrid = document.querySelector('.featured-grid');
    filterButtons = document.querySelectorAll('.filter-btn');
    loadMoreBtn = document.querySelector('.load-more button');
    
    // Setup event listeners
    setupFilterButtons();
    setupLoadMore();
    setupReviewModal();
    
    // Load initial data
    await Promise.all([
        loadFeaturedReviews(),
        loadReviews(),
        loadStats()
    ]);
}

// Setup filter buttons
function setupFilterButtons() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            currentPage = 1;
            
            // Clear existing reviews
            if (testimonialsGrid) {
                testimonialsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading reviews...</div>';
            }
            
            await loadReviews();
        });
    });
}

// Setup load more button
function setupLoadMore() {
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async function() {
            currentPage++;
            await loadReviews(true);
        });
    }
}

// Load featured reviews
async function loadFeaturedReviews() {
    if (!featuredGrid) return;
    
    try {
        const response = await TestimonialsAPI.getFeaturedReviews();
        
        if (response.success && response.data.length > 0) {
            featuredGrid.innerHTML = response.data.map(review => createFeaturedReviewCard(review)).join('');
        }
    } catch (error) {
        console.error('Error loading featured reviews:', error);
    }
}

// Load reviews
async function loadReviews(append = false) {
    if (!testimonialsGrid || isLoading) return;
    
    isLoading = true;
    
    try {
        const params = {
            page: currentPage,
            limit: 6
        };
        
        if (currentFilter !== 'all') {
            params.category = currentFilter;
        }
        
        const response = await TestimonialsAPI.getReviews(params);
        
        if (response.success) {
            const reviewsHTML = response.data.map(review => createReviewCard(review)).join('');
            
            if (append) {
                testimonialsGrid.insertAdjacentHTML('beforeend', reviewsHTML);
            } else {
                if (response.data.length > 0) {
                    testimonialsGrid.innerHTML = reviewsHTML;
                } else {
                    testimonialsGrid.innerHTML = '<div class="no-reviews">No reviews found for this category.</div>';
                }
            }
            
            // Show/hide load more button
            if (loadMoreBtn) {
                loadMoreBtn.parentElement.style.display = 
                    currentPage < response.totalPages ? 'block' : 'none';
            }
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        if (!append) {
            testimonialsGrid.innerHTML = '<div class="error-message">Error loading reviews. Please try again later.</div>';
        }
    } finally {
        isLoading = false;
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await TestimonialsAPI.getStats();
        
        if (response.success) {
            // Update stats display if elements exist
            const avgRatingEl = document.querySelector('.stat-value[data-stat="rating"]');
            const totalReviewsEl = document.querySelector('.stat-value[data-stat="reviews"]');
            
            if (avgRatingEl) {
                avgRatingEl.textContent = `${response.data.averageRating}/5`;
            }
            if (totalReviewsEl) {
                totalReviewsEl.textContent = `${response.data.totalReviews}+`;
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Get initials from name
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Create featured review card HTML
function createFeaturedReviewCard(review) {
    const stars = generateStars(review.rating);
    const date = new Date(review.createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    const initials = getInitials(review.name);
    
    return `
        <div class="featured-testimonial">
            <div class="featured-quote">
                <i class="fas fa-quote-left"></i>
                <p>${escapeHtml(review.content)}</p>
            </div>
            <div class="featured-author">
                <div class="author-initials">${initials}</div>
                <div>
                    <h4>${escapeHtml(review.name)}</h4>
                    <span>${escapeHtml(review.occupation || '')}${review.location ? ', ' + escapeHtml(review.location) : ''}</span>
                    <div class="rating">${stars}</div>
                </div>
            </div>
            ${review.serviceType ? `<span class="testimonial-service">${escapeHtml(review.serviceType)}</span>` : ''}
        </div>
    `;
}

// Create review card HTML
function createReviewCard(review) {
    const stars = generateStars(review.rating);
    const date = new Date(review.createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    const initials = getInitials(review.name);
    
    return `
        <div class="testimonial-card" data-category="${review.category}">
            <div class="testimonial-header">
                <div class="author-initials">${initials}</div>
                <div>
                    <h4>${escapeHtml(review.name)}</h4>
                    <span>${escapeHtml(review.occupation || '')}</span>
                </div>
                <div class="rating">${stars}</div>
            </div>
            <p>${escapeHtml(review.content)}</p>
            <span class="testimonial-date">${date}</span>
        </div>
    `;
}

// Generate star rating HTML
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup review modal
function setupReviewModal() {
    const writeReviewBtn = document.querySelector('.review-cta a');
    
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!TestimonialTokenService.isLoggedIn()) {
                showNotification('Please login to write a review', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html?redirect=testimonials.html';
                }, 1500);
                return;
            }
            
            openReviewModal();
        });
    }
}

// Open review modal
function openReviewModal() {
    // Check if modal already exists
    let modal = document.getElementById('reviewModal');
    
    if (!modal) {
        modal = createReviewModal();
        document.body.appendChild(modal);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load existing review if any
    loadExistingReview();
}

// Create review modal HTML
function createReviewModal() {
    const user = TestimonialTokenService.getUser();
    const defaultName = user ? `${user.firstName} ${user.lastName}` : '';
    
    const modal = document.createElement('div');
    modal.id = 'reviewModal';
    modal.className = 'review-modal';
    modal.innerHTML = `
        <div class="review-modal-content">
            <button class="modal-close" onclick="closeReviewModal()">
                <i class="fas fa-times"></i>
            </button>
            <h2>Write a Review</h2>
            <p class="modal-subtitle">Share your experience with us</p>
            
            <form id="reviewForm">
                <div class="form-group">
                    <label for="reviewName">Your Name</label>
                    <input type="text" id="reviewName" name="name" value="${escapeHtml(defaultName)}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="reviewOccupation">Occupation</label>
                        <input type="text" id="reviewOccupation" name="occupation" placeholder="e.g., Software Engineer">
                    </div>
                    <div class="form-group">
                        <label for="reviewLocation">Location</label>
                        <input type="text" id="reviewLocation" name="location" placeholder="e.g., Mumbai">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="reviewCategory">Service Category</label>
                    <select id="reviewCategory" name="category">
                        <option value="general">General</option>
                        <option value="vedic">Vedic Astrology</option>
                        <option value="marriage">Marriage Matching</option>
                        <option value="career">Career Guidance</option>
                        <option value="tarot">Tarot Reading</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="reviewServiceType">Service Type</label>
                    <input type="text" id="reviewServiceType" name="serviceType" placeholder="e.g., Birth Chart Analysis">
                </div>
                
                <div class="form-group">
                    <label>Your Rating</label>
                    <div class="star-rating" id="starRating">
                        <i class="far fa-star" data-rating="1"></i>
                        <i class="far fa-star" data-rating="2"></i>
                        <i class="far fa-star" data-rating="3"></i>
                        <i class="far fa-star" data-rating="4"></i>
                        <i class="far fa-star" data-rating="5"></i>
                    </div>
                    <input type="hidden" id="reviewRating" name="rating" value="0" required>
                </div>
                
                <div class="form-group">
                    <label for="reviewContent">Your Review</label>
                    <textarea id="reviewContent" name="content" rows="4" placeholder="Share your experience..." required minlength="10" maxlength="1000"></textarea>
                    <small class="char-count"><span id="charCount">0</span>/1000 characters</small>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-ghost" onclick="closeReviewModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="submitReviewBtn">
                        <i class="fas fa-paper-plane"></i> Submit Review
                    </button>
                </div>
            </form>
            
            <div id="existingReviewActions" class="existing-review-actions" style="display: none;">
                <button type="button" class="btn btn-danger" onclick="deleteReview()">
                    <i class="fas fa-trash"></i> Delete My Review
                </button>
            </div>
        </div>
    `;
    
    // Setup form and rating after adding to DOM
    setTimeout(() => {
        setupStarRating();
        setupReviewForm();
        setupCharCount();
    }, 0);
    
    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeReviewModal();
        }
    });
    
    return modal;
}

// Close review modal
function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Setup star rating interaction
function setupStarRating() {
    const starRating = document.getElementById('starRating');
    const ratingInput = document.getElementById('reviewRating');
    
    if (!starRating) return;
    
    const stars = starRating.querySelectorAll('i');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            ratingInput.value = rating;
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('hover');
                }
            });
        });
        
        star.addEventListener('mouseleave', function() {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// Setup character count
function setupCharCount() {
    const textarea = document.getElementById('reviewContent');
    const charCount = document.getElementById('charCount');
    
    if (!textarea || !charCount) return;
    
    textarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });
}

// Setup review form submission
function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const rating = parseInt(document.getElementById('reviewRating').value);
        
        if (rating === 0) {
            showNotification('Please select a rating', 'error');
            return;
        }
        
        const formData = {
            name: document.getElementById('reviewName').value,
            occupation: document.getElementById('reviewOccupation').value,
            location: document.getElementById('reviewLocation').value,
            category: document.getElementById('reviewCategory').value,
            serviceType: document.getElementById('reviewServiceType').value,
            rating: rating,
            content: document.getElementById('reviewContent').value
        };
        
        const submitBtn = document.getElementById('submitReviewBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        try {
            // Check if updating existing review
            const existingActions = document.getElementById('existingReviewActions');
            const isUpdate = existingActions && existingActions.style.display !== 'none';
            
            let response;
            if (isUpdate) {
                response = await TestimonialsAPI.updateMyReview(formData);
            } else {
                response = await TestimonialsAPI.submitReview(formData);
            }
            
            showNotification(response.message, 'success');
            closeReviewModal();
            
            // Refresh reviews
            currentPage = 1;
            await loadReviews();
            
        } catch (error) {
            showNotification(error.message || 'Error submitting review', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
        }
    });
}

// Load existing review if user has one
async function loadExistingReview() {
    try {
        const response = await TestimonialsAPI.getMyReview();
        
        if (response.success && response.data) {
            const review = response.data;
            
            // Populate form with existing data
            document.getElementById('reviewName').value = review.name || '';
            document.getElementById('reviewOccupation').value = review.occupation || '';
            document.getElementById('reviewLocation').value = review.location || '';
            document.getElementById('reviewCategory').value = review.category || 'general';
            document.getElementById('reviewServiceType').value = review.serviceType || '';
            document.getElementById('reviewContent').value = review.content || '';
            document.getElementById('reviewRating').value = review.rating || 0;
            
            // Update star display
            const stars = document.querySelectorAll('#starRating i');
            stars.forEach((star, index) => {
                if (index < review.rating) {
                    star.classList.remove('far');
                    star.classList.add('fas');
                }
            });
            
            // Update char count
            document.getElementById('charCount').textContent = (review.content || '').length;
            
            // Show delete button
            document.getElementById('existingReviewActions').style.display = 'block';
            document.getElementById('submitReviewBtn').innerHTML = '<i class="fas fa-save"></i> Update Review';
        }
    } catch (error) {
        console.error('Error loading existing review:', error);
    }
}

// Delete review
async function deleteReview() {
    if (!confirm('Are you sure you want to delete your review?')) {
        return;
    }
    
    try {
        const response = await TestimonialsAPI.deleteMyReview();
        showNotification(response.message, 'success');
        closeReviewModal();
        
        // Refresh reviews
        currentPage = 1;
        await loadReviews();
        
    } catch (error) {
        showNotification(error.message || 'Error deleting review', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Export for global access
window.closeReviewModal = closeReviewModal;
window.deleteReview = deleteReview;
