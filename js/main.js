// ==================== CONFIGURATION ====================
const SUPABASE_URL = 'https://bvavtdyxuzzabzgodbjw.supabase.co'; // ← Replace with your Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2YXZ0ZHl4dXp6YWJ6Z29kYmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTc2OTksImV4cCI6MjA4OTc3MzY5OX0.gqfiaeDtWBtuyj_CQCaiySVA2-VmuM9CVvd5N-gRlV8';             // ← Replace with your Supabase anon key
// ==================== SUPABASE FETCH HELPER ====================
async function supabaseFetch(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  });
  if (!res.ok) throw new Error(`Supabase fetch failed for ${table}: ${res.status}`);
  return res.json();
}

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
  const mobileIcon  = document.querySelector('#themeToggleMobile');
  if (desktopIcon) desktopIcon.textContent = isLight ? '☀️' : '🌙';
  if (mobileIcon)  mobileIcon.innerHTML = isLight
    ? '<span class="theme-icon">☀️</span> Switch Theme'
    : '<span class="theme-icon">🌙</span> Switch Theme';
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
  const mobileMenu   = document.getElementById('mobileMenu');
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

// ==================== APPLY COLORS ====================
function applyColors(colors) {
  const map = Array.isArray(colors)
    ? Object.fromEntries(colors.map(c => [c.key, c.value]))
    : colors;

  document.documentElement.style.setProperty('--primary-color',   map.primary_color    || '#8b5cf6');
  document.documentElement.style.setProperty('--secondary-color', map.secondary_color  || '#6d28d9');
  document.documentElement.style.setProperty('--bg-dark',         map.background_dark  || '#0a0a0f');
  document.documentElement.style.setProperty('--bg-light',        map.background_light || '#f5f5f7');
  document.documentElement.style.setProperty('--text-dark',       map.text_dark        || '#ffffff');
  document.documentElement.style.setProperty('--text-light',      map.text_light       || '#1a1a2e');

  if (document.body.classList.contains('light-theme')) {
    document.body.style.backgroundColor = map.background_light || '#f5f5f7';
  } else {
    document.body.style.backgroundColor = map.background_dark || '#0a0a0f';
  }
}

// ==================== APPLY SETTINGS ====================
function applySettings(settings) {
  const map = Array.isArray(settings)
    ? Object.fromEntries(settings.map(s => [s.key, s.value]))
    : settings;

  if (map.whatsapp_number) {
    const msg = encodeURIComponent('Hi Sanjay, I need a custom quote for my business.');
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
      a.href = `https://wa.me/${map.whatsapp_number}?text=${msg}`;
    });
  }
  if (map.site_title)  document.title = map.site_title;
  if (map.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.href = `mailto:${map.email}`;
    });
  }
}

// ==================== APPLY PRODUCTS ====================
function applyProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const active = products.filter(p => p.active !== false && p.active !== 'FALSE');

  if (!active.length) {
    grid.innerHTML = '<p style="text-align:center;color:#9090b8;">No products found.</p>';
    return;
  }

  grid.innerHTML = active.map(p => `
    <div class="service-card">
      <div class="service-icon">${escapeHtml(p.icon || p.Icon || '📦')}</div>
      <h3>${escapeHtml(p.name || p.Name || '')}</h3>
      <p class="problem-line">"${escapeHtml(p.problem || p.Problem || '')}"</p>
      <p>${escapeHtml(p.description || p.Description || '')}</p>
      <ul class="feature-list">
        ${(p.feature1 || p.Feature1) ? `<li>${escapeHtml(p.feature1 || p.Feature1)}</li>` : ''}
        ${(p.feature2 || p.Feature2) ? `<li>${escapeHtml(p.feature2 || p.Feature2)}</li>` : ''}
        ${(p.feature3 || p.Feature3) ? `<li>${escapeHtml(p.feature3 || p.Feature3)}</li>` : ''}
      </ul>
      <div style="margin-top:10px;font-weight:bold;color:var(--primary-color,#8b5cf6);">
        ${escapeHtml(p.price || p.Price || '')}
      </div>
      <a href="${escapeHtml(p.buy_link || p.BuyLink || 'contact.html')}" class="quote-btn">Get Quote →</a>
    </div>
  `).join('');

  const countEl = document.getElementById('productsCount');
  if (countEl) countEl.textContent = `${active.length} products available`;
}

// ==================== LOAD ALL DATA FROM SUPABASE ====================
async function loadAllData() {
  // Check cache (5 min TTL)
  const cached   = localStorage.getItem('siteData');
  const cacheAge = localStorage.getItem('siteDataTime');
  const isFresh  = cacheAge && (Date.now() - Number(cacheAge)) < 5 * 60 * 1000;

  if (cached && isFresh) {
    try {
      const data = JSON.parse(cached);
      applyColors(data.colors);
      applySettings(data.settings);
      applyProducts(data.products);
      return;
    } catch(e) {
      localStorage.removeItem('siteData');
    }
  }

  try {
    // Fetch all 3 in parallel — much faster than sequential
    const [colors, settings, products] = await Promise.all([
      supabaseFetch('colors'),
      supabaseFetch('settings'),
      supabaseFetch('products')
    ]);

    applyColors(colors);
    applySettings(settings);
    applyProducts(products);

    // Cache for next visit
    localStorage.setItem('siteData',     JSON.stringify({ colors, settings, products }));
    localStorage.setItem('siteDataTime', Date.now());

  } catch(error) {
    console.error('Supabase load failed, page will use CSS defaults:', error);
    // Products grid fallback message
    const grid = document.getElementById('productsGrid');
    if (grid && grid.innerHTML.includes('fa-spinner')) {
      grid.innerHTML = '<p style="text-align:center;color:#ef4444;">Unable to load products. Please try again.</p>';
    }
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
      name:    formData.get('name'),
      email:   formData.get('email'),
      phone:   formData.get('phone'),
      service: formData.get('service') || 'General',
      message: formData.get('message')
    };

    const submitBtn  = contactForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML  = '<span>⏳ Sending...</span>';
    submitBtn.disabled   = true;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey':        SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type':  'application/json',
          'Prefer':        'return=minimal'
        },
        body: JSON.stringify({ ...data, status: 'New' })
      });

      if (!res.ok) throw new Error(`Supabase error: ${res.status}`);

      showNotification('✅ Thank you! I will contact you on WhatsApp within 24 hours.', 'success');
      contactForm.reset();

    } catch(error) {
      console.error('Lead save failed:', error);
      showNotification('❌ Something went wrong. Please WhatsApp directly.', 'error');
    } finally {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled  = false;
    }
  });
}

// ==================== NOTIFICATION ====================
function showNotification(message, type = 'success') {
  let notification = document.querySelector('.site-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'site-notification';
    document.body.appendChild(notification);
    const style = document.createElement('style');
    style.textContent = `
      .site-notification {
        position: fixed; bottom: 90px; right: 20px;
        background: #10b981; color: white;
        padding: 12px 20px; border-radius: 8px;
        font-size: 14px; z-index: 10000;
        opacity: 0; transition: opacity 0.3s;
        pointer-events: none; max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      .site-notification.error { background: #ef4444; }
      .site-notification.show  { opacity: 1; }
    `;
    document.head.appendChild(style);
  }
  notification.textContent = message;
  notification.className = `site-notification ${type} show`;
  setTimeout(() => notification.classList.remove('show'), 4000);
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
  const elements = document.querySelectorAll('.service-card, .step-card, .brand-item, .service-card-full, .faq-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ==================== ACTIVE NAV ====================
function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.style.color = 'var(--primary-color)';
    }
  });
}

// ==================== ESCAPE HTML ====================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initMobileMenu();
  highlightActiveNav();

  // Load data first, then animate so cards are visible
  await loadAllData();
  initScrollAnimations();
  initContactForm();

  const desktopToggle = document.getElementById('themeToggleDesktop');
  const mobileToggle  = document.getElementById('themeToggleMobile');
  if (desktopToggle) desktopToggle.addEventListener('click', toggleTheme);
  if (mobileToggle)  mobileToggle.addEventListener('click', toggleTheme);
});

// ==================== LOGO ERROR HANDLER ====================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.brand-item img').forEach(img => {
    img.addEventListener('error', function() { this.style.display = 'none'; });
  });
});
