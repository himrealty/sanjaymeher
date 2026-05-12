// Theme Toggle - Desktop (keep floating button for desktop)
const themeBtn = document.getElementById('themeBtn');
const mobileThemeBtn = document.getElementById('mobileThemeBtn');
const body = document.body;

// Get icon elements
let desktopIcon, mobileIcon;

if (themeBtn) {
    desktopIcon = themeBtn.querySelector('i');
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-theme');
    if (desktopIcon) {
        desktopIcon.classList.remove('fa-moon');
        desktopIcon.classList.add('fa-sun');
    }
    if (mobileThemeBtn) {
        const mobileIcon = mobileThemeBtn.querySelector('i');
        mobileIcon.classList.remove('fa-moon');
        mobileIcon.classList.add('fa-sun');
        mobileThemeBtn.innerHTML = '<i class="fas fa-sun"></i> Light/Dark Mode';
    }
}

// Desktop theme toggle
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        toggleTheme();
    });
}

// Mobile theme toggle (inside hamburger menu)
if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
        // Close mobile menu after theme change (optional)
        // mobileMenu.classList.remove('active');
    });
}

// Theme toggle function
function toggleTheme() {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    
    // Update desktop button icon
    if (desktopIcon) {
        if (isLight) {
            desktopIcon.classList.remove('fa-moon');
            desktopIcon.classList.add('fa-sun');
        } else {
            desktopIcon.classList.remove('fa-sun');
            desktopIcon.classList.add('fa-moon');
        }
    }
    
    // Update mobile button icon
    if (mobileThemeBtn) {
        const mobileIcon = mobileThemeBtn.querySelector('i');
        if (isLight) {
            mobileIcon.classList.remove('fa-moon');
            mobileIcon.classList.add('fa-sun');
            mobileThemeBtn.innerHTML = '<i class="fas fa-sun"></i> Light/Dark Mode';
        } else {
            mobileIcon.classList.remove('fa-sun');
            mobileIcon.classList.add('fa-moon');
            mobileThemeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark/Light Mode';
        }
    }
    
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
}

// Close mobile menu when clicking a link (except theme toggle)
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        // Don't close if it's the theme toggle button
        if (link.id === 'mobileThemeBtn') {
            return;
        }
        mobileMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// Also close when clicking the theme button inside mobile menu
if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', () => {
        // Don't close menu on theme toggle - let user see the change
        // But if you want to close, uncomment below:
        // mobileMenu.classList.remove('active');
    });
}

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact Form Handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            message: formData.get('message'),
            timestamp: new Date().toISOString()
        };
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Replace with your Google Apps Script URL
            const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
            
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            alert('✅ Message sent! I will contact you on WhatsApp within 24 hours.');
            contactForm.reset();
        } catch (error) {
            // Fallback: Store in localStorage
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            leads.push(data);
            localStorage.setItem('leads', JSON.stringify(leads));
            alert('✅ Message saved! I will contact you on WhatsApp within 24 hours.');
            contactForm.reset();
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Add intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};
// Theme Toggle Functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeIcons('light');
    } else {
        updateThemeIcons('dark');
    }
}

function updateThemeIcons(theme) {
    const isLight = theme === 'light';
    const desktopIcon = document.querySelector('#themeToggleDesktop .theme-icon');
    const mobileIcon = document.querySelector('#themeToggleMobile .theme-icon');
    
    if (desktopIcon) {
        desktopIcon.textContent = isLight ? '☀️' : '🌙';
    }
    if (mobileIcon) {
        mobileIcon.textContent = isLight ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const newTheme = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
}

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    
    const desktopToggle = document.getElementById('themeToggleDesktop');
    const mobileToggle = document.getElementById('themeToggleMobile');
    
    if (desktopToggle) {
        desktopToggle.addEventListener('click', toggleTheme);
    }
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleTheme);
    }
});
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to elements
document.querySelectorAll('.service-card, .service-card-full, .step-card, .faq-item, .contact-card-large').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
