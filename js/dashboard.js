// ==================== SETTINGS/BACKEND INTEGRATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Personal Details Form
    const personalForm = document.getElementById('personalDetailsForm');
    if (personalForm) {
        personalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            showLoadingOverlay();
            const name = document.getElementById('profileName').value.trim();
            const email = document.getElementById('profileEmail').value.trim();
            const phone = document.getElementById('profilePhone').value.trim();
            const whatsapp = document.getElementById('profileWhatsapp').value.trim();
            try {
                const res = await AuthAPI.updateDetails({ name, email, phone, whatsapp });
                showToast('Profile updated successfully', 'success');
            } catch (err) {
                showToast('Failed to update profile', 'error');
            }
            hideLoadingOverlay();
        });
    }

    // Birth Details Form
    const birthForm = document.getElementById('birthDetailsForm');
    if (birthForm) {
        birthForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            showLoadingOverlay();
            const dob = document.getElementById('profileDob').value;
            const tob = document.getElementById('profileTob').value;
            const pob = document.getElementById('profilePob').value.trim();
            try {
                const res = await AuthAPI.updateDetails({ dob, tob, pob });
                showToast('Birth details updated', 'success');
            } catch (err) {
                showToast('Failed to update birth details', 'error');
            }
            hideLoadingOverlay();
        });
    }

    // Password Change Form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            showLoadingOverlay();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (newPassword !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                hideLoadingOverlay();
                return;
            }
            try {
                await AuthAPI.updatePassword(currentPassword, newPassword);
                showToast('Password updated successfully', 'success');
                passwordForm.reset();
            } catch (err) {
                showToast('Failed to update password', 'error');
            }
            hideLoadingOverlay();
        });
    }
});
/**
 * Hrimkar Astro - Dashboard
 * Professional SaaS-style user dashboard functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user came from services page with a service parameter
    // If so, redirect to booking page with the service
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
        window.location.href = `booking.html?service=${serviceParam}`;
        return;
    }
    
    initializeSidebar();
    initializeNavigation();
    initializeUserDropdown();
    initializeFilterTabs();
    initializeViewAllLinks();
    hideLoadingOverlay();
});

/**
 * Sidebar Toggle (Mobile)
 */
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 992) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
}

/**
 * Dashboard Navigation
 */
function initializeNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.dataset.section + 'Section';
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                if (section.id === sectionId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            // Close sidebar on mobile
            if (window.innerWidth < 992) {
                document.getElementById('sidebar')?.classList.remove('open');
            }

            // Scroll to top
            window.scrollTo(0, 0);
        });
    });

    // Handle dropdown menu navigation links
    const dropdownLinks = document.querySelectorAll('.dropdown-menu a[data-section]');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section + 'Section';
            
            // Update sidebar nav
            navItems.forEach(nav => {
                nav.classList.toggle('active', nav.dataset.section === this.dataset.section);
            });
            
            // Show section
            sections.forEach(section => {
                section.classList.toggle('active', section.id === sectionId);
            });
        });
    });
}

/**
 * User Dropdown Menu
 */
function initializeUserDropdown() {
    const userDropdown = document.getElementById('userDropdown');
    
    if (userDropdown) {
        // Dropdown is handled via CSS hover, but add click support for mobile
        userDropdown.addEventListener('click', function(e) {
            if (window.innerWidth < 992) {
                this.classList.toggle('active');
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear auth tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            // Redirect to login
            window.location.href = 'login.html';
        });
    }
}

/**
 * Filter Tabs (Appointments)
 */
function initializeFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterTableRows(filter);
        });
    });
}

/**
 * Filter Table Rows based on status
 */
function filterTableRows(filter) {
    const rows = document.querySelectorAll('#appointmentsTable tbody tr[data-status]');
    
    rows.forEach(row => {
        const status = row.dataset.status;
        
        if (filter === 'all') {
            row.style.display = '';
        } else if (filter === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * View All Links - Navigate to respective sections
 */
function initializeViewAllLinks() {
    const viewAllLinks = document.querySelectorAll('.view-all-link[data-section], .card-action[data-section]');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    viewAllLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section + 'Section';
            
            // Update sidebar nav
            navItems.forEach(nav => {
                nav.classList.toggle('active', nav.dataset.section === this.dataset.section);
            });
            
            // Show section
            sections.forEach(section => {
                section.classList.toggle('active', section.id === sectionId);
            });
            
            // Scroll to top
            window.scrollTo(0, 0);
        });
    });
}

/**
 * Hide Loading Overlay
 */
function hideLoadingOverlay() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        loader.classList.remove('active');
    }
}

/**
 * Show Loading Overlay
 */
function showLoadingOverlay() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        loader.classList.add('active');
    }
}

/**
 * Simple Toast Notification
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add toast styles if not exist
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-notification {
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 14px 20px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 0.9rem;
                color: var(--text-primary);
                box-shadow: var(--shadow-lg);
                z-index: 9999;
                animation: slideIn 0.3s ease;
            }
            .toast-success { border-left: 3px solid var(--success); }
            .toast-success i { color: var(--success); }
            .toast-error { border-left: 3px solid var(--error); }
            .toast-error i { color: var(--error); }
            .toast-info { border-left: 3px solid var(--info); }
            .toast-info i { color: var(--info); }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Notification Bell Click
 */
document.getElementById('notificationBtn')?.addEventListener('click', function() {
    showToast('You have 3 new notifications', 'info');
});
