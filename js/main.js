// ==================== GOOGLE SHEETS CONFIGURATION ====================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbympMOqYHBEWIerQyqDAQ5p4CUiJUqcL45UXswWrRD1Z8IJKj2wOMs9KpfyjToEfC-T6w/exec'; // Replace with your URL

// ==================== THEME MANAGEMENT ====================
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
        const mobileBtnText = document.querySelector('#themeToggleMobile');
        if (mobileBtnText) {
            mobileBtnText.innerHTML = isLight ? '<span class="theme-icon">☀️</span> Switch Theme' : '<span class="theme-icon">🌙</span> Switch Theme';
        }
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const newTheme = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
}

// ==================== MOBILE MENU ====================
function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// ==================== LOAD COLORS FROM GOOGLE SHEET ====================
async function loadColors() {
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=colors`);
        const result = await response.json();
        
        if (result.success) {
            const colors = result.data;
            
            // Apply CSS custom properties
            document.documentElement.style.setProperty('--primary-color', colors.primary_color || '#8b5cf6');
            document.documentElement.style.setProperty('--secondary-color', colors.secondary_color || '#6d28d9');
            document.documentElement.style.setProperty('--bg-dark', colors.background_dark || '#0a0a0f');
            document.documentElement.style.setProperty('--bg-light', colors.background_light || '#f5f5f7');
            document.documentElement.style.setProperty('--text-dark', colors.text_dark || '#ffffff');
            document.documentElement.style.setProperty('--text-light', colors.text_light || '#1a1a2e');
            
            // Update body background based on current theme
            if (document.body.classList.contains('light-theme')) {
                document.body.style.backgroundColor = colors.background_light;
            } else {
                document.body.style.backgroundColor = colors.background_dark;
            }
        }
    } catch (error) {
        console.warn('Could not load colors from sheet:', error);
    }
}

// ==================== LOAD PRODUCTS FROM GOOGLE SHEET ====================
// ==================== LOAD PRODUCTS FROM GOOGLE SHEET ====================
async function loadProducts() {
    // Look for the products grid container
    const productsGrid = document.getElementById('productsGrid');
    
    // Debug: Check if container exists
    console.log('Products container found:', productsGrid);
    
    if (!productsGrid) {
        console.warn('No #productsGrid container found on this page - products will not load');
        return;
    }
    
    try {
        console.log('Fetching products from:', `${GOOGLE_SCRIPT_URL}?action=products`);
        
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=products`);
        const result = await response.json();
        
        console.log('Products API response:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            productsGrid.innerHTML = ''; // Clear loading message
            
            result.data.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'service-card';
                productCard.innerHTML = `
                    <div class="service-icon">${product.Icon || '📦'}</div>
                    <h3>${escapeHtml(product.Name)}</h3>
                    <p class="problem-line">"${escapeHtml(product.Problem || 'Need this?')}"</p>
                    <p>${escapeHtml(product.Description)}</p>
                    <ul class="feature-list">
                        ${product.Feature1 ? `<li>${escapeHtml(product.Feature1)}</li>` : ''}
                        ${product.Feature2 ? `<li>${escapeHtml(product.Feature2)}</li>` : ''}
                        ${product.Feature3 ? `<li>${escapeHtml(product.Feature3)}</li>` : ''}
                    </ul>
                    <div style="margin-top: 10px; font-weight: bold; color: var(--primary-color, #8b5cf6);">${escapeHtml(product.Price)}</div>
                    <a href="${product.BuyLink || 'contact.html'}" class="quote-btn">Get Quote →</a>
                `;
                productsGrid.appendChild(productCard);
            });
            
            // Update products count
            const countSpan = document.getElementById('productsCount');
            if (countSpan) {
                countSpan.textContent = `${result.data.length} products available`;
            }
        } else {
            productsGrid.innerHTML = '<p style="text-align: center; color: #9090b8;">No products found. Add products in your Google Sheet.</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p style="text-align: center; color: #ef4444;">Unable to load products. Check console for details.</p>';
    }
}
// Helper function to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== LOAD SETTINGS FROM GOOGLE SHEET ====================
async function loadSettings() {
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=settings`);
        const result = await response.json();
        
        if (result.success) {
            const settings = result.data;
            
            // Update WhatsApp links
            if (settings.whatsapp_number) {
                const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
                whatsappLinks.forEach(link => {
                    const message = encodeURIComponent('Hi Sanjay, I need a custom quote for my business.');
                    link.href = `https://wa.me/${settings.whatsapp_number}?text=${message}`;
                });
            }
            
            // Update page title
            if (settings.site_title) {
                document.title = settings.site_title;
            }
            
            // Update logo if present
            if (settings.logo_url) {
                const logoElements = document.querySelectorAll('.logo-text');
                logoElements.forEach(logo => {
                    if (logo.tagName === 'IMG') {
                        logo.src = settings.logo_url;
                    }
                });
            }
            
            // Update contact email
            if (settings.email) {
                const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
                emailLinks.forEach(link => {
                    link.href = `mailto:${settings.email}`;
                });
            }
        }
    } catch (error) {
        console.warn('Could not load settings:', error);
    }
}

// ==================== CONTACT FORM HANDLER ====================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = {
            type: 'contact',
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service') || 'General',
            message: formData.get('message'),
            page: window.location.pathname
        };
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>⏳ Sending...</span>';
        submitBtn.disabled = true;
        
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            showNotification('✅ Thank you! I will contact you on WhatsApp within 24 hours.', 'success');
            contactForm.reset();
        } catch (error) {
            // Fallback: Save to localStorage
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            leads.push({ ...data, timestamp: new Date().toISOString() });
            localStorage.setItem('leads', JSON.stringify(leads));
            showNotification('✅ Message saved! I will contact you soon.', 'success');
            contactForm.reset();
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'success') {
    // Check if notification container exists, create if not
    let notification = document.querySelector('.site-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'site-notification';
        document.body.appendChild(notification);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .site-notification {
                position: fixed;
                bottom: 90px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .site-notification.show {
                opacity: 1;
            }
            body.light-theme .site-notification {
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
    const elements = document.querySelectorAll('.service-card, .step-card, .brand-item, .service-card-full, .faq-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==================== ACTIVE NAVIGATION HIGHLIGHT ====================
function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.style.color = 'var(--primary-color)';
        }
    });
}

// ==================== INITIALIZE EVERYTHING ====================
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initMobileMenu();
    highlightActiveNav();

    await loadColors();
    await loadSettings();
    await loadProducts();

    initScrollAnimations(); 
    initContactForm();
    
    // Setup theme toggle event listeners
    const desktopToggle = document.getElementById('themeToggleDesktop');
    const mobileToggle = document.getElementById('themeToggleMobile');
    
    if (desktopToggle) {
        desktopToggle.addEventListener('click', toggleTheme);
    }
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleTheme);
    }
});

// ==================== LOGO ERROR HANDLER ====================
// Handle missing client logos gracefully
document.addEventListener('DOMContentLoaded', () => {
    const brandImages = document.querySelectorAll('.brand-item img');
    brandImages.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            // Parent span will still show the text
        });
    });
});
