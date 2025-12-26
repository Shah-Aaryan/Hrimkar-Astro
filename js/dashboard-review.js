/**
 * Hrimkar Astro - Dashboard Review Module
 * Handles review submission from user dashboard
 */

const REVIEW_API_BASE = 'http://localhost:5000/api';

// Dashboard Review Module
const DashboardReview = {
    existingReview: null,
    currentRating: 0,

    // Initialize the review module
    init() {
        this.setupStarRating();
        this.setupCharacterCount();
        this.setupForm();
        this.loadExistingReview();
        this.prefillUserData();
    },

    // Prefill user data from token
    prefillUserData() {
        if (window.API && window.API.Token) {
            const user = window.API.Token.getUser();
            if (user) {
                const nameInput = document.getElementById('reviewDisplayName');
                if (nameInput && !nameInput.value) {
                    nameInput.value = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                }
            }
        }
    },

    // Setup star rating interaction
    setupStarRating() {
        const starContainer = document.getElementById('dashboardStarRating');
        const ratingInput = document.getElementById('reviewRatingValue');
        const ratingText = document.getElementById('ratingText');
        
        if (!starContainer) return;

        const stars = starContainer.querySelectorAll('i');
        const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.currentRating = rating;
                ratingInput.value = rating;
                
                this.updateStarDisplay(stars, rating);
                ratingText.textContent = ratingLabels[rating];
            });

            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                this.updateStarDisplay(stars, rating, true);
            });

            star.addEventListener('mouseleave', () => {
                this.updateStarDisplay(stars, this.currentRating);
            });
        });
    },

    // Update star display
    updateStarDisplay(stars, rating, isHover = false) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
                if (isHover) star.classList.add('hover');
            } else {
                star.classList.remove('fas', 'hover');
                star.classList.add('far');
            }
        });
    },

    // Setup character count
    setupCharacterCount() {
        const textarea = document.getElementById('reviewContent');
        const charCount = document.getElementById('reviewCharCount');
        
        if (!textarea || !charCount) return;

        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });
    },

    // Setup form submission
    setupForm() {
        const form = document.getElementById('dashboardReviewForm');

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },

    // Load existing review if user has one
    async loadExistingReview() {
        if (!window.API || !window.API.Token || !window.API.Token.isLoggedIn()) {
            return;
        }

        try {
            const token = window.API.Token.getToken();
            const response = await fetch(`${REVIEW_API_BASE}/reviews/my-review`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success && data.data) {
                this.existingReview = data.data;
                this.populateForm(data.data);
                this.showEditMode();
            }
        } catch (error) {
            console.error('Error loading existing review:', error);
        }
    },

    // Populate form with existing review data
    populateForm(review) {
        document.getElementById('reviewDisplayName').value = review.name || '';
        document.getElementById('reviewOccupation').value = review.occupation || '';
        document.getElementById('reviewLocation').value = review.location || '';
        document.getElementById('reviewCategory').value = review.category || 'general';
        document.getElementById('reviewServiceType').value = review.serviceType || '';
        document.getElementById('reviewContent').value = review.content || '';
        document.getElementById('reviewRatingValue').value = review.rating || 0;
        document.getElementById('reviewCharCount').textContent = (review.content || '').length;

        // Update star display
        this.currentRating = review.rating || 0;
        const stars = document.querySelectorAll('#dashboardStarRating i');
        const ratingText = document.getElementById('ratingText');
        const ratingLabels = ['Select a rating', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        
        this.updateStarDisplay(stars, this.currentRating);
        ratingText.textContent = ratingLabels[this.currentRating];
    },

    // Show edit mode UI
    showEditMode() {
        const formTitle = document.getElementById('reviewFormTitle');
        const submitBtn = document.getElementById('submitReviewBtn');
        const statusMessage = document.getElementById('reviewStatusMessage');

        if (formTitle) formTitle.textContent = 'Update Your Review';
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Review';

        // Show approval status
        if (statusMessage && this.existingReview) {
            const status = this.existingReview.isApproved ? 
                '<i class="fas fa-check-circle"></i> Your review is approved and visible on our testimonials page.' :
                '<i class="fas fa-clock"></i> Your review is pending approval. It will be visible after moderation.';
            
            statusMessage.innerHTML = status;
            statusMessage.className = `review-status-message ${this.existingReview.isApproved ? 'approved' : 'pending'}`;
            statusMessage.style.display = 'flex';
        }
    },

    // Handle form submission
    async handleSubmit(e) {
        e.preventDefault();

        const rating = parseInt(document.getElementById('reviewRatingValue').value);
        
        if (rating === 0) {
            this.showNotification('Please select a rating', 'error');
            return;
        }

        const reviewData = {
            name: document.getElementById('reviewDisplayName').value.trim(),
            occupation: document.getElementById('reviewOccupation').value.trim(),
            location: document.getElementById('reviewLocation').value.trim(),
            category: document.getElementById('reviewCategory').value,
            serviceType: document.getElementById('reviewServiceType').value.trim(),
            rating: rating,
            content: document.getElementById('reviewContent').value.trim()
        };

        if (reviewData.content.length < 10) {
            this.showNotification('Review must be at least 10 characters', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitReviewBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            const token = window.API.Token.getToken();
            const isUpdate = !!this.existingReview;
            
            const response = await fetch(`${REVIEW_API_BASE}/reviews${isUpdate ? '/my-review' : ''}`, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message || (isUpdate ? 'Review updated successfully!' : 'Review submitted successfully!'), 'success');
                this.existingReview = data.data;
                this.showEditMode();
            } else {
                throw new Error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Submit review error:', error);
            this.showNotification(error.message || 'Error submitting review', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    },

    // Reset form to initial state
    resetForm() {
        const form = document.getElementById('dashboardReviewForm');
        if (form) form.reset();

        // Reset stars
        this.currentRating = 0;
        const stars = document.querySelectorAll('#dashboardStarRating i');
        this.updateStarDisplay(stars, 0);
        document.getElementById('ratingText').textContent = 'Select a rating';
        document.getElementById('reviewRatingValue').value = 0;
        document.getElementById('reviewCharCount').textContent = '0';

        // Reset UI
        document.getElementById('reviewFormTitle').textContent = 'Submit Your Review';
        document.getElementById('submitReviewBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
        document.getElementById('reviewStatusMessage').style.display = 'none';

        // Prefill user data again
        this.prefillUserData();
    },

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.dashboard-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `dashboard-notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;

        document.body.appendChild(notification);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        // Show with animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to initialize
    setTimeout(() => {
        DashboardReview.init();
    }, 500);
});
