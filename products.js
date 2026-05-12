// Google Sheets data URL (replace with your Apps Script URL)
// Your Google Sheet should have columns: Name, Price, Description, ImageURL, Category, BuyLink
const SHEETS_API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// Fallback products (static, in case API fails)
const FALLBACK_PRODUCTS = [
    {
        name: "Godot Multiplayer System",
        price: "₹200/month",
        description: "Always-online WebSocket relay for casual and party games. Drop-in script, no server knowledge needed.",
        image: "https://via.placeholder.com/300x200?text=Multiplayer",
        category: "Godot",
        buyLink: "https://cggodotassets.shop"
    },
    {
        name: "Godot Auth System",
        price: "₹99 one-time",
        description: "Complete authentication — Email, Google OAuth, password reset, user profiles.",
        image: "https://via.placeholder.com/300x200?text=Auth",
        category: "Godot",
        buyLink: "https://cggodotassets.shop"
    },
    {
        name: "AdMob Plugin for Godot 4.4",
        price: "₹300 one-time",
        description: "Production-ready AdMob plugin with banner, interstitial, rewarded, and native ads.",
        image: "https://via.placeholder.com/300x200?text=AdMob",
        category: "Godot",
        buyLink: "https://cggodotassets.shop"
    },
    {
        name: "Touch Controls Bundle",
        price: "₹49 one-time",
        description: "Complete mobile touch controls — joystick, buttons, camera & gyroscope for Godot 4.",
        image: "https://via.placeholder.com/300x200?text=Touch",
        category: "Godot",
        buyLink: "https://cggodotassets.shop"
    }
];

let allProducts = [];

// Load products
async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    const countSpan = document.getElementById('productsCount');
    
    try {
        // Try to fetch from Google Sheets
        const response = await fetch(SHEETS_API_URL);
        if (response.ok) {
            const data = await response.json();
            allProducts = data.products || data;
        } else {
            throw new Error('Using fallback data');
        }
    } catch (error) {
        console.warn('Using fallback products:', error);
        allProducts = FALLBACK_PRODUCTS;
    }
    
    // Update count
    if (countSpan) {
        countSpan.textContent = `${allProducts.length} products available`;
    }
    
    // Render products
    renderProducts(allProducts);
}

// Render product cards
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="no-results">No products found. Try a different search.</div>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category || 'general'}">
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x200?text=Product'}" alt="${product.name}">
                ${product.price ? `<span class="product-price-tag">${product.price}</span>` : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
                <a href="${product.buyLink || '#'}" class="btn btn-primary btn-small" target="_blank">
                    Buy Now <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');
}

// Search/filter functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.category && product.category.toLowerCase().includes(searchTerm))
        );
        renderProducts(filtered);
    });
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', loadProducts);
