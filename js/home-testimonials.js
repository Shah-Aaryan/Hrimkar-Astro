/**
 * Hrimkar Astro - Home Page Testimonials
 * Fetches and displays testimonials from database on the homepage
 */

const HomeTestimonials = {
    apiBaseUrl: (typeof window !== 'undefined' && window.API && window.API.BASE_URL) ? window.API.BASE_URL : 'https://hrimkar-astro-1.onrender.com/api',
    testimonials: [],
    currentIndex: 0,
    itemsPerPage: 3,
    autoPlayInterval: null,

    // Initialize the testimonials slider
    async init() {
        await this.fetchTestimonials();
        this.renderTestimonials();
        this.setupSliderControls();
        this.setupDots();
        this.startAutoPlay();
    },

    // Fetch testimonials from API
    async fetchTestimonials() {
        const slider = document.getElementById('testimonialsSlider');
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/reviews?limit=12&sort=-rating`);
            const data = await response.json();
            
            if (data.success && data.data && data.data.length > 0) {
                this.testimonials = data.data;
            } else {
                // Fallback to featured reviews
                const featuredResponse = await fetch(`${this.apiBaseUrl}/reviews/featured`);
                const featuredData = await featuredResponse.json();
                
                if (featuredData.success && featuredData.data) {
                    this.testimonials = featuredData.data;
                }
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            // Show error state
            if (slider) {
                slider.innerHTML = `
                    <div class="testimonials-error">
                        <p>Unable to load testimonials. Please try again later.</p>
                    </div>
                `;
            }
        }
    },

    // Generate star rating HTML
    generateStars(rating) {
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
    },

    // Get avatar URL or generate initials
    getAvatarHtml(testimonial) {
        if (testimonial.avatar && !testimonial.avatar.includes('default')) {
            return `<img src="${testimonial.avatar}" alt="${testimonial.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="author-initials" style="display:none;">${this.getInitials(testimonial.name)}</div>`;
        }
        return `<div class="author-initials">${this.getInitials(testimonial.name)}</div>`;
    },

    // Get initials from name
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    // Render testimonials to the slider
    renderTestimonials() {
        const slider = document.getElementById('testimonialsSlider');
        if (!slider || this.testimonials.length === 0) {
            if (slider) {
                slider.innerHTML = `
                    <div class="testimonials-empty">
                        <p>No testimonials available yet.</p>
                    </div>
                `;
            }
            return;
        }

        // Clear loading state
        slider.innerHTML = '';

        // Render visible testimonials
        this.updateVisibleTestimonials();
    },

    // Update visible testimonials based on current index
    updateVisibleTestimonials() {
        const slider = document.getElementById('testimonialsSlider');
        if (!slider) return;

        slider.innerHTML = '';

        // Get the testimonials to display (3 at a time)
        const startIndex = this.currentIndex * this.itemsPerPage;
        const visibleTestimonials = this.testimonials.slice(startIndex, startIndex + this.itemsPerPage);

        visibleTestimonials.forEach(testimonial => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <div class="testimonial-rating">
                    ${this.generateStars(testimonial.rating)}
                </div>
                <p class="testimonial-text">"${testimonial.content}"</p>
                <div class="testimonial-author">
                    ${this.getAvatarHtml(testimonial)}
                    <div class="author-info">
                        <strong>${testimonial.name}</strong>
                        <span>${testimonial.location || 'India'}</span>
                    </div>
                </div>
            `;
            slider.appendChild(card);
        });

        // Update dots
        this.updateDots();
    },

    // Setup slider controls
    setupSliderControls() {
        const prevBtn = document.getElementById('prevTestimonial');
        const nextBtn = document.getElementById('nextTestimonial');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prev();
                this.resetAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.next();
                this.resetAutoPlay();
            });
        }
    },

    // Setup dots navigation
    setupDots() {
        const dotsContainer = document.getElementById('sliderDots');
        if (!dotsContainer) return;

        const totalPages = Math.ceil(this.testimonials.length / this.itemsPerPage);
        dotsContainer.innerHTML = '';

        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('span');
            dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                this.currentIndex = i;
                this.updateVisibleTestimonials();
                this.resetAutoPlay();
            });
            dotsContainer.appendChild(dot);
        }
    },

    // Update dots active state
    updateDots() {
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    },

    // Navigate to previous set
    prev() {
        const totalPages = Math.ceil(this.testimonials.length / this.itemsPerPage);
        this.currentIndex = (this.currentIndex - 1 + totalPages) % totalPages;
        this.updateVisibleTestimonials();
    },

    // Navigate to next set
    next() {
        const totalPages = Math.ceil(this.testimonials.length / this.itemsPerPage);
        this.currentIndex = (this.currentIndex + 1) % totalPages;
        this.updateVisibleTestimonials();
    },

    // Start auto-play
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, 5000);
    },

    // Reset auto-play timer
    resetAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        this.startAutoPlay();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    HomeTestimonials.init();
});
