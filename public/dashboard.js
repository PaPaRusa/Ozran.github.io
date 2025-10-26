// Dashboard JavaScript for Ozran Secure Shield
// Author: Ozran Secure Shield Team
// Description: Complete dashboard functionality with charts, navigation, modals, and user interactions

// Global Variables
let currentSection = 'overview';
let currentProfileTab = 'personal';
let chartInstances = {};
let sampleData = {};

/**
 * Performs an immediate check after the dashboard loads to ensure the session is active.
 * This prevents the 'see page for a second then log out' issue.
 */
document.addEventListener('DOMContentLoaded', function() {
    fetch('/auth-status')
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                // If the server explicitly says Unauthorized (401/403), trigger logout.
                console.warn('Session expired or unauthorized. Triggering logout.');
                logout(); 
            }
            // If response.status is 200, the user is authorized, and the page remains.
        })
        .catch(err => {
            // Handle network issues gracefully
            console.error('Failed to check auth status:', err);
            // Optionally redirect if critical endpoint is unreachable
            // logout(); 
        });
    
    // Initialize charts and other dashboard features here (e.g., initCharts();)
});

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async function() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        window.location.href = 'auth.html';
        return;
    }

    initializeDashboard();
    loadSampleData();
    setupEventListeners();
    initializeCharts();
    loadUserData();
});

// Initialize Dashboard
function initializeDashboard() {
    // Set default section
    showSection('overview');

    // Initialize responsive behavior
    handleResponsiveLayout();

    // Set up periodic data refresh
    startDataRefresh();

    console.log('🚀 Dashboard initialized successfully');
}

// Check if user is authenticated
async function isAuthenticated() {
    try {
        const res = await fetch('/auth-status', { credentials: 'include' });
        return res.ok;
    } catch (error) {
        console.error('Auth status check failed', error);
        return false;
    }
}

// Load sample data for demonstration
function loadSampleData() {
    sampleData = {
        employees: [
            {
                id: 1,
                name: 'Sarah Wilson',
                email: 'sarah.wilson@company.com',
                department: 'Marketing',
                riskScore: 85,
                riskLevel: 'high',
                trainingProgress: 75,
                lastActivity: '2 days ago',
                avatar: 'https://via.placeholder.com/40'
            },
            {
                id: 2,
                name: 'Michael Johnson',
                email: 'michael.johnson@company.com',
                department: 'IT',
                riskScore: 25,
                riskLevel: 'low',
                trainingProgress: 100,
                lastActivity: '1 day ago',
                avatar: 'https://via.placeholder.com/40'
            },
            {
                id: 3,
                name: 'Emily Davis',
                email: 'emily.davis@company.com',
                department: 'Finance',
                riskScore: 55,
                riskLevel: 'medium',
                trainingProgress: 60,
                lastActivity: '3 days ago',
                avatar: 'https://via.placeholder.com/40'
            },
            {
                id: 4,
                name: 'David Brown',
                email: 'david.brown@company.com',
                department: 'HR',
                riskScore: 45,
                riskLevel: 'medium',
                trainingProgress: 90,
                lastActivity: '5 days ago',
                avatar: 'https://via.placeholder.com/40'
            }
        ],
        campaigns: [
            {
                id: 1,
                name: 'Q4 Security Assessment',
                status: 'active',
                launchDate: 'Dec 15, 2024',
                recipients: 156,
                openRate: 28,
                clickRate: 15,
                description: 'Comprehensive security awareness test targeting all departments with focus on social engineering tactics.'
            },
            {
                id: 2,
                name: 'HR Policy Update Test',
                status: 'completed',
                launchDate: 'Nov 28, 2024',
                recipients: 89,
                openRate: 34,
                clickRate: 22,
                description: 'Test employee response to fake HR policy update notifications and credential harvesting attempts.'
            },
            {
                id: 3,
                name: 'IT Security Drill',
                status: 'completed',
                launchDate: 'Nov 10, 2024',
                recipients: 203,
                openRate: 19,
                clickRate: 8,
                description: 'Monthly security drill testing employee awareness of IT support impersonation attacks.'
            }
        ],
        templates: [
            {
                id: 1,
                name: 'Banking Security Alert',
                category: 'financial',
                subject: 'Urgent: Your account will be suspended',
                successRate: 42,
                usageCount: 8,
                status: 'popular'
            },
            {
                id: 2,
                name: 'Office 365 Login',
                category: 'it',
                subject: 'Office 365 Sign-in Required',
                successRate: 38,
                usageCount: 12,
                status: 'high-success'
            },
            {
                id: 3,
                name: 'IT Support Request',
                category: 'it',
                subject: 'IT Support: Password Reset Required',
                successRate: null,
                usageCount: 0,
                status: 'new'
            }
        ]
    };
}

// Setup Event Listeners
function setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', toggleMobileSidebar);
    }

    // User menu toggle
    const userMenuTrigger = document.querySelector('.user-menu-trigger');
    if (userMenuTrigger) {
        userMenuTrigger.addEventListener('click', toggleUserMenu);
    }

    // Profile tab switching
    const profileMenuItems = document.querySelectorAll('.profile-menu-item');
    profileMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchProfileTab(tab);
        });
    });

    // Template category filtering
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterTemplates(this.getAttribute('data-category'));
        });
    });

    // Modal backdrop clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-backdrop')) {
            closeAllModals();
        }
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Table select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }

    // Form submissions
    setupFormHandlers();

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Window resize
    window.addEventListener('resize', debounce(handleResponsiveLayout, 250));

    // Click outside to close dropdowns
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu')) {
            hideUserMenu();
        }
    });
}

// Navigation Functions
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Add animation
        targetSection.style.animation = 'fadeIn 0.3s ease-out';
        setTimeout(() => {
            targetSection.style.animation = '';
        }, 300);
    }

    // Update navigation
    updateNavigation(sectionName);
    
    // Update page title
    updatePageTitle(sectionName);
    
    // Update current section
    currentSection = sectionName;
    
    // Section-specific initialization
    initializeSection(sectionName);
}

function updateNavigation(activeSection) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const section = link.getAttribute('data-section');
        if (section === activeSection) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updatePageTitle(sectionName) {
    const titles = {
        'overview': 'Overview',
        'employees': 'Employee Management',
        'campaigns': 'Phishing Campaigns',
        'templates': 'Phishing Templates',
        'profile': 'Profile Settings'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && titles[sectionName]) {
        pageTitle.textContent = titles[sectionName];
    }
    
    // Update document title
    document.title = `${titles[sectionName]} - Ozran Secure Shield`;
}

function initializeSection(sectionName) {
    switch (sectionName) {
        case 'overview':
            refreshOverviewData();
            break;
        case 'employees':
            loadEmployeeTable();
            break;
        case 'campaigns':
            loadCampaigns();
            break;
        case 'templates':
            loadTemplates();
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}

// Sidebar Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    
    // Store preference
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    
    // Add overlay for mobile
    if (sidebar.classList.contains('active')) {
        createMobileOverlay();
    } else {
        removeMobileOverlay();
    }
}

function createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 50;
        backdrop-filter: blur(2px);
    `;
    overlay.addEventListener('click', toggleMobileSidebar);
    document.body.appendChild(overlay);
}

function removeMobileOverlay() {
    const overlay = document.querySelector('.mobile-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// User Menu Functions
function toggleUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    dropdown.classList.toggle('active');
}

function hideUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    dropdown.classList.remove('active');
}

// Profile Tab Functions
function switchProfileTab(tabName) {
    // Update menu items
    const menuItems = document.querySelectorAll('.profile-menu-item');
    menuItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update tab content
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.getElementById(tabName + '-tab');
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    currentProfileTab = tabName;
}

// Chart Functions
function initializeCharts() {
    initializeCampaignChart();
    initializeVulnerabilityChart();
}

function initializeCampaignChart() {
    const ctx = document.getElementById('campaignChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstances.campaignChart) {
        chartInstances.campaignChart.destroy();
    }

    chartInstances.campaignChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Open Rate',
                data: [32, 28, 24, 26, 22, 24],
                borderColor: '#4f8cff',
                backgroundColor: 'rgba(79, 140, 255, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Click Rate',
                data: [18, 15, 12, 14, 10, 12],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#c4c9d4',
                        font: {
                            family: 'Inter'
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#8a91a0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#8a91a0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function initializeVulnerabilityChart() {
    const ctx = document.getElementById('vulnerabilityChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstances.vulnerabilityChart) {
        chartInstances.vulnerabilityChart.destroy();
    }

    chartInstances.vulnerabilityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Low Risk', 'Medium Risk', 'High Risk'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            cutout: '60%'
        }
    });
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        // Trap focus in modal
        trapFocus(modal);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Clear form if it exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
    document.body.style.overflow = '';
}

function showAddEmployeeModal() {
    showModal('add-employee-modal');
}

function showCreateCampaignModal() {
    showModal('create-campaign-modal');
}

function showCreateTemplateModal() {
    showModal('create-template-modal');
}

// Toast Functions
function showToast(message, type = 'success', duration = 5000) {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon i');
    const title = toast.querySelector('.toast-title');
    const description = toast.querySelector('.toast-description');
    
    // Set content
    description.textContent = message;
    
    // Set type-specific styling
    const iconClasses = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const titles = {
        success: 'Success!',
        error: 'Error!',
        warning: 'Warning!',
        info: 'Info'
    };
    
    icon.className = iconClasses[type] || iconClasses.success;
    icon.className += ' toast-icon ' + type;
    title.textContent = titles[type] || titles.success;
    
    // Show toast
    toast.classList.add('active');
    
    // Auto-hide
    setTimeout(() => {
        hideToast();
    }, duration);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('active');
}

// Data Loading Functions
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Update user name in header
    const userNameElement = document.getElementById('userName');
    const profileNameElement = document.getElementById('profileName');
    
    if (userData.name) {
        if (userNameElement) userNameElement.textContent = userData.name;
        if (profileNameElement) profileNameElement.textContent = userData.name;
    }
    
    // Update user email if available
    if (userData.email) {
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            if (input.closest('.profile-form')) {
                input.value = userData.email;
            }
        });
    }
}

function refreshOverviewData() {
    // Animate KPI cards
    animateKPICards();
    
    // Refresh charts
    if (chartInstances.campaignChart) {
        updateChartData(chartInstances.campaignChart, generateRandomData());
    }
    
    if (chartInstances.vulnerabilityChart) {
        updateChartData(chartInstances.vulnerabilityChart, [
            Math.floor(Math.random() * 20) + 40,
            Math.floor(Math.random() * 20) + 30,
            Math.floor(Math.random() * 20) + 15
        ]);
    }
}

function loadEmployeeTable() {
    // This would typically load from an API
    // For now, we're using sample data
    updateEmployeeTable(sampleData.employees);
}

function loadCampaigns() {
    // Update campaign cards with latest data
    updateCampaignCards(sampleData.campaigns);
}

function loadTemplates() {
    // Update template grid
    updateTemplateGrid(sampleData.templates);
}

function loadProfileData() {
    // Load user profile data into forms
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Update profile form fields
    if (userData.name) {
        const nameParts = userData.name.split(' ');
        const firstNameInput = document.querySelector('#personal-tab input[type="text"]');
        const lastNameInput = document.querySelectorAll('#personal-tab input[type="text"]')[1];
        
        if (firstNameInput && nameParts[0]) firstNameInput.value = nameParts[0];
        if (lastNameInput && nameParts[1]) lastNameInput.value = nameParts[1];
    }
    
    if (userData.email) {
        const emailInput = document.querySelector('#personal-tab input[type="email"]');
        if (emailInput) emailInput.value = userData.email;
    }
}

// Animation Functions
function animateKPICards() {
    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            
            setTimeout(() => {
                card.style.transform = '';
                card.style.boxShadow = '';
            }, 200);
        }, index * 100);
    });
}

// Utility Functions
function generateRandomData() {
    return Array.from({length: 6}, () => Math.floor(Math.random() * 30) + 10);
}

function updateChartData(chart, newData) {
    if (chart.data.datasets[0]) {
        if (Array.isArray(newData)) {
            chart.data.datasets[0].data = newData;
        } else {
            chart.data.datasets.forEach((dataset, index) => {
                if (newData[index]) {
                    dataset.data = newData[index];
                }
            });
        }
        chart.update();
    }
}

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
    
    // Focus first element
    if (firstElement) {
        firstElement.focus();
    }
}

// Search Functions
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    if (currentSection === 'employees') {
        searchEmployees(query);
    } else if (currentSection === 'campaigns') {
        searchCampaigns(query);
    } else if (currentSection === 'templates') {
        searchTemplates(query);
    }
}

function searchEmployees(query) {
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach(row => {
        const name = row.querySelector('.employee-name')?.textContent.toLowerCase() || '';
        const email = row.querySelector('.employee-email')?.textContent.toLowerCase() || '';
        const department = row.querySelector('.department-badge')?.textContent.toLowerCase() || '';
        
        if (name.includes(query) || email.includes(query) || department.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function searchCampaigns(query) {
    const campaignCards = document.querySelectorAll('.campaign-card');
    campaignCards.forEach(card => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.campaign-description')?.textContent.toLowerCase() || '';
        
        if (name.includes(query) || description.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function searchTemplates(query) {
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const category = card.querySelector('.template-category')?.textContent.toLowerCase() || '';
        
        if (name.includes(query) || category.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter Functions
function filterTemplates(category) {
    // Update active category button
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Filter template cards
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.3s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
}

// Table Functions
function handleSelectAll(event) {
    const checkboxes = document.querySelectorAll('.data-table .table-checkbox:not(#selectAll)');
    checkboxes.forEach(checkbox => {
        checkbox.checked = event.target.checked;
    });
    
    updateBulkActions();
}

function updateBulkActions() {
    const selectedCount = document.querySelectorAll('.data-table .table-checkbox:checked:not(#selectAll)').length;
    
    // Update UI based on selection
    if (selectedCount > 0) {
        showBulkActions(selectedCount);
    } else {
        hideBulkActions();
    }
}

function showBulkActions(count) {
    // This would show bulk action buttons
    console.log(`${count} items selected`);
}

function hideBulkActions() {
    // This would hide bulk action buttons
    console.log('No items selected');
}

// Form Handlers
function setupFormHandlers() {
    // Add Employee Form
    const addEmployeeForm = document.querySelector('#add-employee-modal form');
    if (addEmployeeForm) {
        addEmployeeForm.addEventListener('submit', handleAddEmployee);
    }
    
    // Create Campaign Form
    const createCampaignForm = document.querySelector('#create-campaign-modal form');
    if (createCampaignForm) {
        createCampaignForm.addEventListener('submit', handleCreateCampaign);
    }
    
    // Create Template Form
    const createTemplateForm = document.querySelector('#create-template-modal form');
    if (createTemplateForm) {
        createTemplateForm.addEventListener('submit', handleCreateTemplate);
    }
    
    // Profile Forms
    const profileForms = document.querySelectorAll('.profile-form, .security-form');
    profileForms.forEach(form => {
        form.addEventListener('submit', handleProfileUpdate);
    });
}

function handleAddEmployee(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const employeeData = {
        name: `${formData.get('firstName')} ${formData.get('lastName')}`,
        email: formData.get('email'),
        department: formData.get('department'),
        jobTitle: formData.get('jobTitle'),
        riskScore: Math.floor(Math.random() * 100),
        trainingProgress: 0,
        lastActivity: 'Never'
    };
    
    // Add to sample data
    sampleData.employees.push({
        id: sampleData.employees.length + 1,
        ...employeeData,
        riskLevel: employeeData.riskScore > 70 ? 'high' : employeeData.riskScore > 40 ? 'medium' : 'low',
        avatar: 'https://via.placeholder.com/40'
    });
    
    // Refresh table
    loadEmployeeTable();
    
    // Close modal and show success
    hideModal('add-employee-modal');
    showToast('Employee added successfully!');
}

function handleCreateCampaign(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const campaignData = {
        name: formData.get('campaignName'),
        description: formData.get('description'),
        launchDate: formData.get('launchDate'),
        template: formData.get('template'),
        targetAudience: formData.getAll('targetAudience')
    };
    
    // Add to sample data
    sampleData.campaigns.push({
        id: sampleData.campaigns.length + 1,
        ...campaignData,
        status: 'scheduled',
        recipients: Math.floor(Math.random() * 200) + 50,
        openRate: 0,
        clickRate: 0
    });
    
    // Refresh campaigns
    loadCampaigns();
    
    // Close modal and show success
    hideModal('create-campaign-modal');
    showToast('Campaign created successfully!');
}

function handleCreateTemplate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const templateData = {
        name: formData.get('templateName'),
        category: formData.get('category'),
        subject: formData.get('subject'),
        sender: formData.get('sender'),
        content: formData.get('content'),
        landingPage: formData.get('landingPage')
    };
    
    // Add to sample data
    sampleData.templates.push({
        id: sampleData.templates.length + 1,
        ...templateData,
        successRate: null,
        usageCount: 0,
        status: 'new'
    });
    
    // Refresh templates
    loadTemplates();
    
    // Close modal and show success
    hideModal('create-template-modal');
    showToast('Template created successfully!');
}

function handleProfileUpdate(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const updates = {};
    
    // Process form data
    for (let [key, value] of formData.entries()) {
        updates[key] = value;
    }
    
    // Update localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    Object.assign(userData, updates);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Show success message
    showToast('Profile updated successfully!');
}

// Action Functions
function exportEmployees() {
    // Simulate CSV export
    showToast('Exporting employee data...', 'info');
    
    setTimeout(() => {
        // Create CSV content
        const csvContent = generateEmployeeCSV(sampleData.employees);
        downloadCSV(csvContent, 'employees.csv');
        showToast('Employee data exported successfully!');
    }, 1500);
}

function generateEmployeeCSV(employees) {
    const headers = ['Name', 'Email', 'Department', 'Risk Score', 'Training Progress', 'Last Activity'];
    const rows = employees.map(emp => [
        emp.name,
        emp.email,
        emp.department,
        emp.riskScore,
        `${emp.trainingProgress}%`,
        emp.lastActivity
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function refreshRecommendations() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        // Add spinning animation
        const icon = refreshBtn.querySelector('i');
        icon.style.animation = 'spin 1s linear infinite';
        
        setTimeout(() => {
            icon.style.animation = '';
            showToast('Recommendations updated!', 'info');
        }, 1000);
    }
}

// Update Functions
function updateEmployeeTable(employees) {
    // This would typically update the table with new data
    // For demo purposes, we'll just show that data is loaded
    console.log('Employee table updated with', employees.length, 'employees');
}

function updateCampaignCards(campaigns) {
    // Update campaign cards with new data
    console.log('Campaign cards updated with', campaigns.length, 'campaigns');
}

function updateTemplateGrid(templates) {
    // Update template grid with new data
    console.log('Template grid updated with', templates.length, 'templates');
}

// Responsive Functions
function handleResponsiveLayout() {
    const width = window.innerWidth;
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (width <= 992) {
        // Mobile/tablet layout
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
        
        // Hide sidebar by default on mobile
        if (width <= 768) {
            sidebar.classList.remove('active');
            removeMobileOverlay();
        }
    } else {
        // Desktop layout
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    }
    
    // Resize charts
    Object.values(chartInstances).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
    // Check for modifier keys
    const isCtrl = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    
    // Escape key - close modals/dropdowns
    if (event.key === 'Escape') {
        closeAllModals();
        hideUserMenu();
        return;
    }
    
    // Ctrl+K - Focus search
    if (isCtrl && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
        return;
    }
    
    // Number keys for navigation (1-5)
    if (!event.target.matches('input, textarea, select') && !isCtrl && !isShift) {
        const sectionMap = {
            '1': 'overview',
            '2': 'employees',
            '3': 'campaigns',
            '4': 'templates',
            '5': 'profile'
        };
        
        if (sectionMap[event.key]) {
            event.preventDefault();
            showSection(sectionMap[event.key]);
        }
    }
    
    // Ctrl+N - New items based on current section
    if (isCtrl && event.key === 'n') {
        event.preventDefault();
        
        switch (currentSection) {
            case 'employees':
                showAddEmployeeModal();
                break;
            case 'campaigns':
                showCreateCampaignModal();
                break;
            case 'templates':
                showCreateTemplateModal();
                break;
        }
    }
}

// Data Refresh
function startDataRefresh() {
    // Refresh data every 5 minutes
    setInterval(() => {
        if (currentSection === 'overview') {
            refreshOverviewData();
        }
    }, 300000); // 5 minutes
    
    // Update notification badge periodically
    setInterval(updateNotificationBadge, 60000); // 1 minute
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        // Simulate new notifications
        const currentCount = parseInt(badge.textContent) || 0;
        const newCount = Math.random() > 0.8 ? currentCount + 1 : currentCount;
        badge.textContent = newCount;
        
        if (newCount > currentCount) {
            // Animate new notification
            badge.style.animation = 'pulse 0.5s ease-out';
            setTimeout(() => {
                badge.style.animation = '';
            }, 500);
        }
    }
}

// Logout Function
async function logout() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        try {
            await fetch('/logout', { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error('Logout failed', error);
        }

        // Clear user data
        localStorage.removeItem('userData');

        // Show logout message
        showToast('Logged out successfully!', 'info', 2000);

        // Redirect to auth page
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1000);
    }
}

// Utility Functions for Data Manipulation
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatPercentage(value) {
    return `${Math.round(value)}%`;
}

function getRiskColor(score) {
    if (score >= 70) return '#ef4444'; // High risk - red
    if (score >= 40) return '#f59e0b'; // Medium risk - yellow
    return '#10b981'; // Low risk - green
}

function getRiskLabel(score) {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
}

// Animation Functions
function animateCounter(element, start, end, duration = 1000) {
    const range = end - start;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (range * easeOut));
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function animateProgressBar(element, targetWidth, duration = 800) {
    element.style.width = '0%';
    element.style.transition = `width ${duration}ms ease-out`;
    
    setTimeout(() => {
        element.style.width = targetWidth;
    }, 50);
}

// Local Storage Helpers
function saveUserPreference(key, value) {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    preferences[key] = value;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

function getUserPreference(key, defaultValue = null) {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
}

// Error Handling
function handleError(error, context = 'Dashboard') {
    console.error(`${context} Error:`, error);
    showToast(`An error occurred in ${context}. Please try again.`, 'error');
}

window.addEventListener('error', function(event) {
    handleError(event.error, 'Global');
});

window.addEventListener('unhandledrejection', function(event) {
    handleError(event.reason, 'Promise');
});

// Performance Monitoring
function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
}

// API Simulation Functions (for future backend integration)
class APIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            handleError(error, 'API');
            throw error;
        }
    }
    
    async get(endpoint) {
        return this.request(endpoint);
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Initialize API client
const api = new APIClient();

// Feature Detection
function supportsLocalStorage() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

function supportsServiceWorker() {
    return 'serviceWorker' in navigator;
}

// Initialize feature detection
if (!supportsLocalStorage()) {
    console.warn('Local storage is not supported. Some features may not work correctly.');
}

// Service Worker Registration (for future offline functionality)
if (supportsServiceWorker()) {
    navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('ServiceWorker registration failed:', error);
    });
}

// Accessibility Functions
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

function setupAccessibilityFeatures() {
    // Add skip links
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add ARIA labels where needed
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach(button => {
        if (!button.textContent.trim()) {
            const icon = button.querySelector('i');
            if (icon) {
                button.setAttribute('aria-label', getIconLabel(icon.className));
            }
        }
    });
}

function getIconLabel(iconClass) {
    const iconLabels = {
        'fa-bars': 'Menu',
        'fa-times': 'Close',
        'fa-search': 'Search',
        'fa-bell': 'Notifications',
        'fa-user': 'User profile',
        'fa-edit': 'Edit',
        'fa-trash': 'Delete',
        'fa-eye': 'View',
        'fa-plus': 'Add',
        'fa-download': 'Download',
        'fa-sync-alt': 'Refresh'
    };
    
    for (const [className, label] of Object.entries(iconLabels)) {
        if (iconClass.includes(className)) {
            return label;
        }
    }
    
    return 'Button';
}

// Initialize accessibility features
setupAccessibilityFeatures();

// Debug Functions (remove in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Dashboard Debug Mode Enabled');
    
    // Add debug helpers to window object
    window.debugDashboard = {
        currentSection,
        sampleData,
        chartInstances,
        showToast,
        showSection,
        switchProfileTab,
        filterTemplates
    };
    
    console.log('🚀 Debug helpers available at window.debugDashboard');
    console.log('💡 Quick test: window.debugDashboard.showToast("Debug test!", "info")');
}

// Export functions for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeDashboard,
        showSection,
        showToast,
        logout
    };
}