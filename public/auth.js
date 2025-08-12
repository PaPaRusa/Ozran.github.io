// Authentication Page JavaScript
// Author: Ozran Secure Shield
// Description: Handles all authentication functionality including login, register, form validation, and UI interactions

// Global variables
let currentTab = 'login';
let passwordStrength = 0;
const DEMO_MODE = false; // Set to true to enable simulated authentication

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupEventListeners();
    initializePasswordStrength();
});

// Initialize authentication page
function initializeAuth() {
    // Check if user is already logged in
    const userToken = localStorage.getItem('userToken');
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    
    if (userToken && userLoggedIn === 'true') {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Set default tab
    switchTab('login');
    
    // Add loading states
    addFormLoadingStates();
    
    // Initialize form validation
    initializeFormValidation();
}

// Setup all event listeners
function setupEventListeners() {
    // Password strength checker
    const registerPassword = document.getElementById('register-password');
    if (registerPassword) {
        registerPassword.addEventListener('input', checkPasswordStrength);
    }
    
    // Password confirmation checker
    const confirmPassword = document.getElementById('confirm-password');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', checkPasswordMatch);
    }
    
    // Real-time email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
        input.addEventListener('input', clearValidationState);
    });
    
    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.classList.contains('google-btn') ? 'google' :
                           this.classList.contains('microsoft-btn') ? 'microsoft' : 'linkedin';
            socialLogin(provider);
        });
    });

    // Prevent actual form submissions in demo mode
    if (DEMO_MODE) {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
            });
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-hide toast after delay
    setupToastAutoHide();
}

// Switch between login and register tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        
        // Update document title
        document.title = 'Login - Ozran Secure Shield';
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('login-email').focus();
        }, 300);
        
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        
        // Update document title
        document.title = 'Register - Ozran Secure Shield';
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('register-firstname').focus();
        }, 300);
    }
    
    // Clear any previous validation states
    clearAllValidationStates();
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const remember = form.remember.checked;

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    // Validate form
    if (!validateLoginForm(email, password)) {
        setButtonLoading(submitBtn, false);
        return;
    }

    if (DEMO_MODE) {
        // Simulated login for demo purposes
        setTimeout(() => {
            if (email && password) {
                const userData = {
                    email: email,
                    name: email.split('@')[0],
                    loginTime: new Date().toISOString(),
                    remember: remember
                };

                localStorage.setItem('userToken', generateToken());
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userData', JSON.stringify(userData));

                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showToast('Invalid credentials. Please try again.', 'error');
                setButtonLoading(submitBtn, false);
            }
        }, 1500);
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            showToast(data.error || 'Invalid credentials. Please try again.', 'error');
            setButtonLoading(submitBtn, false);
            return;
        }

        const userData = {
            email: data.email,
            name: data.username,
            loginTime: new Date().toISOString(),
            remember: remember
        };

        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));

        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showToast('An error occurred. Please try again.', 'error');
        setButtonLoading(submitBtn, false);
    }
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();

    const form = event.target;
    const formData = {
        firstname: form.firstname.value.trim(),
        lastname: form.lastname.value.trim(),
        email: form.email.value.trim(),
        company: form.company.value.trim(),
        password: form.password.value,
        confirmPassword: form.confirmPassword.value,
        terms: form.terms.checked,
        marketing: form.marketing.checked
    };

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    // Validate form
    if (!validateRegisterForm(formData)) {
        setButtonLoading(submitBtn, false);
        return;
    }

    if (DEMO_MODE) {
        // Simulated registration for demo purposes
        setTimeout(() => {
            const userData = {
                email: formData.email,
                name: `${formData.firstname} ${formData.lastname}`,
                company: formData.company,
                registrationTime: new Date().toISOString(),
                marketingOptIn: formData.marketing
            };

            localStorage.setItem('userToken', generateToken());
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(userData));

            showToast('Account created successfully! Welcome to Ozran Secure Shield.', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }, 2000);
        return;
    }

    const payload = {
        username: `${formData.firstname} ${formData.lastname}`.trim(),
        email: formData.email,
        password: formData.password
    };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
            showToast(data.error || 'Registration failed', 'error');
            setButtonLoading(submitBtn, false);
            return;
        }

        showToast('Account created successfully! Please log in.', 'success');
        form.reset();
        setTimeout(() => {
            switchTab('login');
        }, 2000);
    } catch (error) {
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Validate login form
function validateLoginForm(email, password) {
    let isValid = true;
    
    // Email validation
    if (!email) {
        showFieldError('login-email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('login-email', 'Please enter a valid email address');
        isValid = false;
    } else {
        showFieldSuccess('login-email');
    }
    
    // Password validation
    if (!password) {
        showFieldError('login-password', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('login-password', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        showFieldSuccess('login-password');
    }
    
    return isValid;
}

// Validate registration form
function validateRegisterForm(data) {
    let isValid = true;
    
    // First name validation
    if (!data.firstname) {
        showFieldError('register-firstname', 'First name is required');
        isValid = false;
    } else {
        showFieldSuccess('register-firstname');
    }
    
    // Last name validation
    if (!data.lastname) {
        showFieldError('register-lastname', 'Last name is required');
        isValid = false;
    } else {
        showFieldSuccess('register-lastname');
    }
    
    // Email validation
    if (!data.email) {
        showFieldError('register-email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(data.email)) {
        showFieldError('register-email', 'Please enter a valid email address');
        isValid = false;
    } else {
        showFieldSuccess('register-email');
    }
    
    // Company validation
    if (!data.company) {
        showFieldError('register-company', 'Company name is required');
        isValid = false;
    } else {
        showFieldSuccess('register-company');
    }
    
    // Password validation
    if (!data.password) {
        showFieldError('register-password', 'Password is required');
        isValid = false;
    } else if (data.password.length < 8) {
        showFieldError('register-password', 'Password must be at least 8 characters');
        isValid = false;
    } else if (passwordStrength < 2) {
        showFieldError('register-password', 'Password is too weak');
        isValid = false;
    } else {
        showFieldSuccess('register-password');
    }
    
    // Confirm password validation
    if (!data.confirmPassword) {
        showFieldError('confirm-password', 'Please confirm your password');
        isValid = false;
    } else if (data.password !== data.confirmPassword) {
        showFieldError('confirm-password', 'Passwords do not match');
        isValid = false;
    } else {
        showFieldSuccess('confirm-password');
    }
    
    // Terms validation
    if (!data.terms) {
        showToast('Please accept the Terms of Service to continue', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Show field error
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const container = field.closest('.form-group');
    
    field.classList.add('error');
    field.classList.remove('success');
    
    // Remove existing error message
    const existingError = container.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

// Show field success
function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    const container = field.closest('.form-group');
    
    field.classList.add('success');
    field.classList.remove('error');
    
    // Remove existing error message
    const existingError = container.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Clear validation state
function clearValidationState(event) {
    const field = event.target;
    const container = field.closest('.form-group');
    
    field.classList.remove('error', 'success');
    
    const errorMessage = container.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Clear all validation states
function clearAllValidationStates() {
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error', 'success');
    });
    
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.remove();
    });
}

// Check password strength
function checkPasswordStrength(event) {
    const password = event.target.value;
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthFill || !strengthText) return;
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Update global strength
    passwordStrength = strength;
    
    // Remove all strength classes
    strengthFill.classList.remove('weak', 'fair', 'good', 'strong');
    
    // Apply appropriate class and feedback
    if (strength <= 2) {
        strengthFill.classList.add('weak');
        feedback = 'Weak password';
    } else if (strength <= 3) {
        strengthFill.classList.add('fair');
        feedback = 'Fair password';
    } else if (strength <= 4) {
        strengthFill.classList.add('good');
        feedback = 'Good password';
    } else {
        strengthFill.classList.add('strong');
        feedback = 'Strong password';
    }
    
    strengthText.textContent = feedback;
}

// Check password match
function checkPasswordMatch(event) {
    const confirmPassword = event.target.value;
    const password = document.getElementById('register-password').value;
    
    if (confirmPassword && password !== confirmPassword) {
        showFieldError('confirm-password', 'Passwords do not match');
    } else if (confirmPassword && password === confirmPassword) {
        showFieldSuccess('confirm-password');
    }
}

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.parentNode.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Handle social login
function socialLogin(provider) {
    showToast(`Connecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`, 'info');
    
    // Simulate social login
    setTimeout(() => {
        const userData = {
            email: `user@${provider}.com`,
            name: `${provider} User`,
            provider: provider,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('userToken', generateToken());
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showToast(`Successfully logged in with ${provider}!`, 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 2000);
}

// Show forgot password modal
function showForgotPassword() {
    const modal = document.getElementById('forgot-password-modal');
    modal.classList.remove('hidden');
    
    // Focus email input
    setTimeout(() => {
        document.getElementById('forgot-email').focus();
    }, 100);
    
    // Trap focus in modal
    trapFocus(modal);
}

// Hide forgot password modal
function hideForgotPassword() {
    const modal = document.getElementById('forgot-password-modal');
    modal.classList.add('hidden');
}

// Handle forgot password form
function handleForgotPassword(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value.trim();
    
    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    // Simulate API call
    setTimeout(() => {
        hideForgotPassword();
        showToast('Password reset link sent to your email!', 'success');
        setButtonLoading(submitBtn, false);
        form.reset();
    }, 1500);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon i');
    const title = toast.querySelector('.toast-title');
    const description = toast.querySelector('.toast-description');
    
    // Set content
    description.textContent = message;
    
    // Set type-specific styling
    switch (type) {
        case 'success':
            title.textContent = 'Success!';
            icon.className = 'fas fa-check-circle';
            icon.style.color = 'var(--success)';
            break;
        case 'error':
            title.textContent = 'Error!';
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = 'var(--danger)';
            break;
        case 'warning':
            title.textContent = 'Warning!';
            icon.className = 'fas fa-exclamation-triangle';
            icon.style.color = 'var(--warning)';
            break;
        default:
            title.textContent = 'Info';
            icon.className = 'fas fa-info-circle';
            icon.style.color = 'var(--accent-primary)';
    }
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideToast();
    }, 5000);
}

// Hide toast notification
function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('hidden');
}

// Set button loading state
function setButtonLoading(button, loading) {
    const loader = button.querySelector('.btn-loader');
    const text = button.querySelector('span');
    
    if (loading) {
        button.classList.add('loading');
        loader.classList.remove('hidden');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        loader.classList.add('hidden');
        button.disabled = false;
    }
}

// Utility function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate random token
function generateToken() {
    return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Escape key to close modals
    if (event.key === 'Escape') {
        hideForgotPassword();
        hideToast();
    }
    
    // Tab switching with Ctrl+1 and Ctrl+2
    if (event.ctrlKey) {
        if (event.key === '1') {
            event.preventDefault();
            switchTab('login');
        } else if (event.key === '2') {
            event.preventDefault();
            switchTab('register');
        }
    }
}

// Trap focus within modal for accessibility
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Initialize form validation
function initializeFormValidation() {
    // Real-time validation
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    
    switch (fieldType) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(field.id, 'Please enter a valid email address');
            } else if (value) {
                showFieldSuccess(field.id);
            }
            break;
            
        case 'password':
            if (fieldName === 'password' && value.length > 0 && value.length < 8) {
                showFieldError(field.id, 'Password must be at least 8 characters');
            } else if (value.length >= 8) {
                showFieldSuccess(field.id);
            }
            break;
    }
}

// Setup toast auto-hide
function setupToastAutoHide() {
    let toastTimeout;
    
    const toast = document.getElementById('toast');
    if (toast) {
        toast.addEventListener('mouseenter', () => {
            clearTimeout(toastTimeout);
        });
        
        toast.addEventListener('mouseleave', () => {
            toastTimeout = setTimeout(hideToast, 2000);
        });
    }
}

// Add form loading states
function addFormLoadingStates() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                setButtonLoading(submitBtn, true);
            }
        });
    });
}

// Initialize password strength checker
function initializePasswordStrength() {
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        // Show strength meter when user starts typing
        passwordInput.addEventListener('focus', function() {
            const strengthContainer = document.querySelector('.password-strength');
            if (strengthContainer) {
                strengthContainer.style.display = 'block';
            }
        });
    }
}

// Email validation on blur
function validateEmail(event) {
    const email = event.target.value.trim();
    if (email && !isValidEmail(email)) {
        showFieldError(event.target.id, 'Please enter a valid email address');
    } else if (email) {
        showFieldSuccess(event.target.id);
    }
}

// Development helpers (remove in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔐 Ozran Secure Shield - Authentication System Loaded');
    console.log('💡 Quick Login: Any email/password combination will work for demo');
    console.log('⌨️  Keyboard Shortcuts: Ctrl+1 (Login), Ctrl+2 (Register), Escape (Close Modals)');
    
    // Add demo credentials helper
    window.fillDemoCredentials = function() {
        if (currentTab === 'login') {
            document.getElementById('login-email').value = 'demo@ozran.com';
            document.getElementById('login-password').value = 'demo123';
        } else {
            document.getElementById('register-firstname').value = 'John';
            document.getElementById('register-lastname').value = 'Doe';
            document.getElementById('register-email').value = 'john.doe@company.com';
            document.getElementById('register-company').value = 'Tech Corp';
            document.getElementById('register-password').value = 'SecurePass123!';
            document.getElementById('confirm-password').value = 'SecurePass123!';
        }
    };
}