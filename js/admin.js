/**
 * Hrimkar Astro - Admin Panel JavaScript
 * Professional SaaS-style admin dashboard functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin.js DOMContentLoaded');
    try { initializeSidebar(); } catch(e) { console.error('initializeSidebar error:', e); }
    try { initializeAdminNav(); } catch(e) { console.error('initializeAdminNav error:', e); }
    try { initializeUserDropdown(); } catch(e) { console.error('initializeUserDropdown error:', e); }
    try { initializeModals(); } catch(e) { console.error('initializeModals error:', e); }
    try { initializeAvailability(); } catch(e) { console.error('initializeAvailability error:', e); }
    try { initializeSearch(); } catch(e) { console.error('initializeSearch error:', e); }
    try { hideLoadingOverlay(); } catch(e) { console.error('hideLoadingOverlay error:', e); }
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
 * Admin Navigation
 */
function initializeAdminNav() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    console.log('Initializing admin nav, found', navItems.length, 'nav items and', sections.length, 'sections');
    
    // Sidebar navigation
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const sectionId = this.dataset.section + 'Section';
            console.log('Navigating to section:', sectionId);
            navigateToSection(sectionId, navItems, sections);
            
            // Close sidebar on mobile
            if (window.innerWidth < 992) {
                document.getElementById('sidebar')?.classList.remove('open');
            }
        });
    });

    // View all links and other navigation links
    document.querySelectorAll('.view-all-link[data-section], [data-section]').forEach(link => {
        if (!link.classList.contains('nav-item')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.dataset.section + 'Section';
                console.log('View all link navigating to:', sectionId);
                navigateToSection(sectionId, navItems, sections);
            });
        }
    });
}

function navigateToSection(sectionId, navItems, sections) {
    console.log('navigateToSection called with:', sectionId);
    
    // Update nav
    navItems.forEach(nav => {
        const isActive = nav.dataset.section + 'Section' === sectionId;
        nav.classList.toggle('active', isActive);
        console.log('Nav item', nav.dataset.section, 'active:', isActive);
    });
    
    // Show section
    sections.forEach(section => {
        const isActive = section.id === sectionId;
        section.classList.toggle('active', isActive);
        console.log('Section', section.id, 'active:', isActive);
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
}

/**
 * User Dropdown Menu
 */
function initializeUserDropdown() {
    const userDropdown = document.getElementById('userDropdown');
    
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            if (window.innerWidth < 992) {
                this.classList.toggle('active');
            }
        });
    }
}

/**
 * Modals
 */
function initializeModals() {
    // Upload Report Modal
    const uploadBtn = document.getElementById('uploadReportBtn');
    const uploadModal = document.getElementById('uploadReportModal');
    const closeUploadModal = document.getElementById('closeUploadModal');
    const cancelUpload = document.getElementById('cancelUpload');
    
    if (uploadBtn && uploadModal) {
        uploadBtn.addEventListener('click', () => {
            uploadModal.classList.add('active');
        });
        
        closeUploadModal?.addEventListener('click', () => {
            uploadModal.classList.remove('active');
        });
        
        cancelUpload?.addEventListener('click', () => {
            uploadModal.classList.remove('active');
        });
        
        // Close on backdrop click
        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) {
                uploadModal.classList.remove('active');
            }
        });
    }
    
    // Upload form submission
    const uploadForm = document.getElementById('uploadReportForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Report uploaded successfully!', 'success');
            uploadModal.classList.remove('active');
            uploadForm.reset();
        });
    }
}

/**
 * Availability Management
 */
function initializeAvailability() {
    // Day checkboxes
    document.querySelectorAll('.day-toggle input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const dayRow = this.closest('.day-row');
            const timeRange = dayRow.querySelector('.time-range');
            const inputs = timeRange?.querySelectorAll('input');
            
            if (this.checked) {
                dayRow.classList.remove('disabled');
                inputs?.forEach(input => input.disabled = false);
            } else {
                dayRow.classList.add('disabled');
                inputs?.forEach(input => input.disabled = true);
            }
        });
    });
}

/**
 * Search Functionality
 */
function initializeSearch() {
    // Booking search
    const bookingSearch = document.getElementById('bookingSearch');
    if (bookingSearch) {
        bookingSearch.addEventListener('input', function() {
            filterTable('bookingsTableBody', this.value);
        });
    }
    
    // User search
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            filterTable('usersTableBody', this.value);
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterByStatus('bookingsTableBody', this.value);
        });
    }
}

function filterTable(tableId, searchTerm) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

function filterByStatus(tableId, status) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (status === 'all') {
            row.style.display = '';
        } else {
            const statusBadge = row.querySelector('.status-badge');
            const rowStatus = statusBadge?.textContent.toLowerCase().trim();
            row.style.display = rowStatus === status ? '' : 'none';
        }
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
 * Toast Notification
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
                background: #ffffff;
                border: 1px solid #E5E7EB;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 0.9rem;
                color: #111827;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 9999;
                animation: slideIn 0.3s ease;
            }
            .toast-success { border-left: 3px solid #10b981; }
            .toast-success i { color: #10b981; }
            .toast-error { border-left: 3px solid #ef4444; }
            .toast-error i { color: #ef4444; }
            .toast-info { border-left: 3px solid #3b82f6; }
            .toast-info i { color: #3b82f6; }
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
 * Confirm Action Dialog
 */
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

/**
 * Notification Bell Click
 */
document.getElementById('notificationBtn')?.addEventListener('click', function() {
    showToast('You have 5 new notifications', 'info');
});

// Export functions for use in HTML
window.adminFunctions = {
    confirmAction,
    showToast,
    showLoadingOverlay,
    hideLoadingOverlay
