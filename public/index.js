// Main Website JavaScript for Ozran Secure Shield
// Author: Ozran Secure Shield Team
// Description: Homepage functionality, animations, and interactions

// Global Variables
let mobileNavOpen = false;
let isAnnualPricing = false;

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    setupEventListeners();
    initializeAnimations();
    initializePricingToggle();
});

// Initialize website
function initializeWebsite() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Smooth scrolling is handled via CSS; this function call is a placeholder
    // for future enhancements
    initializeSmoothScroll();
    
    // Initialize header scroll effects
    initializeHeaderEffects();
    
    // Initialize intersection observer for animations
    initializeScrollAnimations();
    
    console.log('🚀 Ozran Secure Shield website initialized');
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth-status', { credentials: 'include' });
        if (response.ok) {
            // Update login button to show dashboard link
            const loginBtns = document.querySelectorAll('.btn[onclick*="/auth"]');
            loginBtns.forEach(btn => {
                btn.textContent = 'Dashboard';
                btn.onclick = () => window.location.href = '/dashboard';
            });
        }
    } catch (error) {
        console.error('Auth check failed', error);
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileNav);
    }
    
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }
    
    // Close mobile nav when clicking outside
    if (mobileNav) {
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                closeMobileNav();
            }
        });
    }
    
    // Pricing toggle
    const pricingToggle = document.getElementById('pricingToggle');
    if (pricingToggle) {
        pricingToggle.addEventListener('change', togglePricing);
    }
    
    // Navigation links smooth scroll
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
    });
    
    // Header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);
    
    // Window resize
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Form submissions (if any)
    setupFormHandlers();
    
    // Button click analytics
    setupAnalytics();
}

// Mobile Navigation Functions
function toggleMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    if (mobileNavOpen) {
        closeMobileNav();
    } else {
        openMobileNav();
    }
}

function openMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    mobileNav.classList.add('active');
    mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
    document.body.style.overflow = 'hidden';
    mobileNavOpen = true;
    
    // Animate menu items
    const menuItems = mobileNav.querySelectorAll('.mobile-nav-links li');
    menuItems.forEach((item, index) => {
        item.style.animation = `slideInLeft 0.3s ease-out ${index * 0.1}s forwards`;
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
    });
}

function closeMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    mobileNav.classList.remove('active');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.style.overflow = '';
    mobileNavOpen = false;
}

// Smooth Scroll Functions
function initializeSmoothScroll() {
    // Already handled by CSS scroll-behavior: smooth
    // This function can be used for additional smooth scroll enhancements
}

function handleSmoothScroll(e) {
    const href = e.currentTarget.getAttribute('href');
    
    if (href.startsWith('#')) {
        e.preventDefault();
        
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile nav if open
            if (mobileNavOpen) {
                closeMobileNav();
            }
        }
    }
}

// Header Effects
function initializeHeaderEffects() {
    const header = document.querySelector('.header');
    if (header) {
        // Initial header state
        updateHeaderState();
    }
}

function handleHeaderScroll() {
    updateHeaderState();
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        hero.style.transform = `translateY(${parallax}px)`;
    }
}

function updateHeaderState() {
    const header = document.querySelector('.header');
    const scrollPosition = window.scrollY;
    
    if (scrollPosition > 100) {
        header.style.backgroundColor = 'rgba(14, 17, 23, 0.98)';
        header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
        header.style.backgroundColor = 'rgba(14, 17, 23, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.2)';
    }
}

// Pricing Toggle Functions
function initializePricingToggle() {
    updatePricingDisplay();
}

function togglePricing() {
    isAnnualPricing = !isAnnualPricing;
    updatePricingDisplay();
    
    // Add animation to price changes
    const prices = document.querySelectorAll('.price');
    prices.forEach(price => {
        price.style.transform = 'scale(1.1)';
        setTimeout(() => {
            price.style.transform = 'scale(1)';
        }, 200);
    });
}

function updatePricingDisplay() {
    const prices = document.querySelectorAll('.price');
    
    prices.forEach(price => {
        const monthlyPrice = parseInt(price.getAttribute('data-monthly'));
        const annualPrice = parseInt(price.getAttribute('data-annual'));
        
        if (isAnnualPricing) {
            price.textContent = `$${annualPrice}`;
        } else {
            price.textContent = `$${monthlyPrice}`;
        }
    });
}

// Animation Functions
function initializeAnimations() {
    // Animate hero stats on load
    animateStats();
    
    // Animate dashboard preview
    animateDashboardPreview();
    
    // Setup scroll-triggered animations
    setupScrollAnimations();
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach((stat, index) => {
        setTimeout(() => {
            const finalValue = stat.textContent;
            const isPercentage = finalValue.includes('%');
            const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
            
            animateCounter(stat, 0, numericValue, 2000, isPercentage ? '%' : finalValue.includes('+') ? '+' : '');
        }, index * 300);
    });
}

function animateCounter(element, start, end, duration, suffix = '') {
    const range = end - start;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (range * easeOut));
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function animateDashboardPreview() {
    const dashboardPreview = document.querySelector('.dashboard-preview');
    if (dashboardPreview) {
        // Add floating animation after page load
        setTimeout(() => {
            dashboardPreview.style.animation = 'float 6s ease-in-out infinite';
        }, 1000);
    }
    
    // Animate progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        setTimeout(() => {
            progressFill.style.width = '25%';
        }, 1500);
    }
    
    // Animate chart bars
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.opacity = '1';
            bar.style.transform = 'scaleY(1)';
        }, 2000 + (index * 100));
    });
}

function setupScrollAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Special animations for specific elements
                if (entry.target.classList.contains('feature-card')) {
                    animateFeatureCard(entry.target);
                } else if (entry.target.classList.contains('pricing-card')) {
                    animatePricingCard(entry.target);
                } else if (entry.target.classList.contains('testimonial-card')) {
                    animateTestimonialCard(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card, .section-header');
    animateElements.forEach(el => observer.observe(el));
}

function initializeScrollAnimations() {
    // Add CSS for scroll animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .feature-card, .pricing-card, .testimonial-card {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
        
        .chart-bar {
            opacity: 0;
            transform: scaleY(0);
            transform-origin: bottom;
            transition: all 0.5s ease-out;
        }
    `;
    document.head.appendChild(style);
}

function animateFeatureCard(card) {
    const icon = card.querySelector('.feature-icon');
    if (icon) {
        setTimeout(() => {
            icon.style.transform = 'scale(1.1)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 200);
        }, 300);
    }
}

function animatePricingCard(card) {
    const price = card.querySelector('.price');
    if (price) {
        setTimeout(() => {
            price.style.color = 'var(--accent-primary)';
            price.style.transform = 'scale(1.05)';
            setTimeout(() => {
                price.style.transform = 'scale(1)';
            }, 300);
        }, 200);
    }
}

function animateTestimonialCard(card) {
    const avatar = card.querySelector('.author-avatar');
    if (avatar) {
        setTimeout(() => {
            avatar.style.transform = 'scale(1.1)';
            setTimeout(() => {
                avatar.style.transform = 'scale(1)';
            }, 200);
        }, 400);
    }
}

// Form Handlers
function setupFormHandlers() {
    // Newsletter signup (if exists)
    const newsletterForms = document.querySelectorAll('form[data-type="newsletter"]');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', handleNewsletterSubmit);
    });
    
    // Contact forms (if exists)
    const contactForms = document.querySelectorAll('form[data-type="contact"]');
    contactForms.forEach(form => {
        form.addEventListener('submit', handleContactSubmit);
    });
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Simulate API call
    showNotification("Thanks for subscribing! We'll keep you updated.", "success");
    e.target.reset();
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    // Simulate API call
    showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
    e.target.reset();
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-secondary);
                color: var(--text-primary);
                padding: 1rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 1rem;
                border-left: 4px solid var(--accent-primary);
                animation: slideInRight 0.3s ease-out;
            }
            
            .notification-success { border-left-color: var(--success); }
            .notification-error { border-left-color: var(--danger); }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-tertiary);
                cursor: pointer;
                padding: 0.25rem;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Analytics Setup
function setupAnalytics() {
    // Track button clicks
    const ctaButtons = document.querySelectorAll('.btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            trackEvent('CTA Click', action);
        });
    });
    
    // Track section views
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackEvent('Section View', entry.target.id);
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(section => sectionObserver.observe(section));
}

function trackEvent(category, action, label = '') {
    // Implement your analytics tracking here
    console.log(`Analytics: ${category} - ${action}${label ? ` - ${label}` : ''}`);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleResize() {
    // Close mobile nav on resize to desktop
    if (window.innerWidth > 992 && mobileNavOpen) {
        closeMobileNav();
    }
    
    // Recalculate animations if needed
    const animatedElements = document.querySelectorAll('.animate-in');
    animatedElements.forEach(el => {
        // Reset animations for responsive changes
        el.style.transform = 'none';
    });
}

// Performance Monitoring
function measurePerformance() {
    // Log page load performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page load time: ${pageLoadTime}ms`);
            
            // Track performance metric
            trackEvent('Performance', 'Page Load Time', `${Math.round(pageLoadTime / 100) * 100}ms`);
        }, 0);
    });
}

// Initialize performance monitoring
measurePerformance();

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    // Escape key to close mobile nav
    if (e.key === 'Escape' && mobileNavOpen) {
        closeMobileNav();
    }
    
    // Tab navigation improvements
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Website Error:', e.error);
    // Don't show errors to users in production
    if (location.hostname === 'localhost') {
        showNotification('A JavaScript error occurred. Check the console.', 'error');
    }
});

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleMobileNav,
        closeMobileNav,
        togglePricing,
        showNotification,
        trackEvent
    };
}

// Development helpers
if (location.hostname === 'localhost') {
    console.log('🔧 Development mode - Extra features enabled');
    
    // Add debug helpers
    window.ozranDebug = {
        toggleMobileNav,
        showNotification,
        trackEvent,
        animateStats,
        updatePricingDisplay
    };
}