// Upgraded State Storage (with tags & stock quantities)
let products = [
    { id: 1, title: "Wireless Headphones", price: 180000, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", category: "electronics", stock: 3 },
    { id: 2, title: "Smart Fitness Watch", price: 250000, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", category: "electronics", stock: 8 },
    { id: 3, title: "Premium Vintage Jacket", price: 145000, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500", category: "fashion", stock: 2 }
];
let currentOrder = null;
let userEmail = "";
let walletPoints = 120;
let activeCategory = "all";
let searchQuery = "";

// DOM Selectors
const authScreen = document.getElementById('auth-screen');
const appWrapper = document.getElementById('app-wrapper');
const loginForm = document.getElementById('login-form');
const productsGrid = document.getElementById('products-grid');
const addProductForm = document.getElementById('add-product-form');
const paymentModal = document.getElementById('payment-modal');
const cartStatus = document.getElementById('cart-status');
const checkoutSummary = document.getElementById('checkout-summary');
const totalAmountText = document.getElementById('total-amount');
const rewardPointsDisplay = document.getElementById('reward-points');

// Authentication Setup
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userEmail = document.getElementById('auth-email').value;
    document.getElementById('user-display').innerText = userEmail;
    authScreen.classList.remove('active');
    appWrapper.classList.add('active');
    renderProducts();
    startFlashSaleCountdown();
});

document.getElementById('logout-btn').addEventListener('click', () => {
    appWrapper.classList.remove('active');
    authScreen.classList.add('active');
});

// Dynamic Rendering Engine with Filtering & Searching
function renderProducts() {
    productsGrid.innerHTML = '';
    
    const filtered = products.filter(p => {
        const matchesCategory = activeCategory === "all" || p.category === activeCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if(filtered.length === 0) {
        productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted);">No products found matching filters.</p>`;
        return;
    }

    filtered.forEach(product => {
        const isLowStock = product.stock <= 3;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${product.stock <= 3 ? `<span class="badge-hot">🔥 LOW STOCK</span>` : ''}
            <img src="${product.img}" alt="${product.title}" class="product-img">
            <div class="product-info">
                <h4 class="product-title">${product.title}</h4>
                <p class="product-price">${product.price.toLocaleString()} UGX</p>
                <div class="stock-warning">
                    <span>⚡ Only ${product.stock} items left in store</span>
                </div>
                <div class="product-actions">
                    <button onclick="selectProduct(${product.id})" class="btn-primary" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Order'}
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="btn-danger">Delete</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// Interactive Real-time Search Engine
document.getElementById('search-bar').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
});

// Category Tag Switcher
const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        tags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        activeCategory = tag.dataset.category;
        renderProducts();
    });
});

// Merchant Console updates
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('prod-title').value;
    const price = parseInt(document.getElementById('prod-price').value);
    const img = document.getElementById('prod-image').value;

    const newProduct = { id: Date.now(), title, price, img, category: "electronics", stock: 10 };
    products.push(newProduct);
    renderProducts();
    addProductForm.reset();
});

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    renderProducts();
    if(currentOrder && currentOrder.id === id) clearOrder();
}

// Order Management & Checkout logic
function selectProduct(id) {
    currentOrder = products.find(p => p.id === id);
    if(currentOrder) {
        cartStatus.innerText = `Selected: ${currentOrder.title}`;
        totalAmountText.innerText = `${currentOrder.price.toLocaleString()} UGX`;
        checkoutSummary.classList.remove('hidden');
    }
}

function clearOrder() {
    currentOrder = null;
    cartStatus.innerText = "Your cart is empty. Select a product to order.";
    checkoutSummary.classList.add('hidden');
}

// Checkout Windows
document.getElementById('pay-now-btn').addEventListener('click', () => paymentModal.classList.remove('hidden'));
document.querySelector('.close-modal').addEventListener('click', () => paymentModal.classList.add('hidden'));

const channelBtns = document.querySelectorAll('.channel-btn');
const momoForm = document.getElementById('momo-form');
const bankForm = document.getElementById('bank-form');

channelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        channelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if(btn.dataset.channel === 'momo') {
            momoForm.classList.remove('hidden');
            bankForm.classList.add('hidden');
        } else {
            bankForm.classList.remove('hidden');
            momoForm.classList.add('hidden');
        }
    });
});

momoForm.addEventListener('submit', handlePaymentSuccess);
bankForm.addEventListener('submit', handlePaymentSuccess);

function handlePaymentSuccess(e) {
    e.preventDefault();
    
    // Deduct standard stock metric
    const targetProd = products.find(p => p.id === currentOrder.id);
    if(targetProd && targetProd.stock > 0) {
        targetProd.stock -= 1;
        
        // Reward Loyalty points
        walletPoints += 25;
        rewardPointsDisplay.innerText = walletPoints;
        
        alert(`🎉 Order Confirmed!\nSuccessfully processed transaction for ${currentOrder.title}.\nYou earned +25 Loyalty points!`);
    }
    
    paymentModal.classList.add('hidden');
    clearOrder();
    renderProducts();
}

// Dynamic Counter (Simulates a 4-hour countdown window loop)
function startFlashSaleCountdown() {
    let hours = 3, minutes = 59, seconds = 59;
    const timerElement = document.getElementById('countdown');
    
    setInterval(() => {
        seconds--;
        if(seconds < 0) { seconds = 59; minutes--; }
        if(minutes < 0) { minutes = 59; hours--; }
        if(hours < 0) { hours = 3; } // Reset loop
        
        let h = hours < 10 ? "0" + hours : hours;
        let m = minutes < 10 ? "0" + minutes : minutes;
        let s = seconds < 10 ? "0" + seconds : seconds;
        
        timerElement.innerText = `${h}:${m}:${s}`;
    }, 1000);
}
