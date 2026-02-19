// ===============================================
// GOLDEN CRUST BAKERY — index.js
// ===============================================

// ===============================================
// NAVBAR — scroll shrink + active link highlight
// ===============================================
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.pageYOffset > 50);

    let current = '';
    sections.forEach(section => {
        if (window.pageYOffset >= section.offsetTop - 200) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
});

// ===============================================
// MOBILE MENU
// ===============================================
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// ===============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - navbar.offsetHeight,
                behavior: 'smooth'
            });
        }
    });
});

// ===============================================
// HERO BUTTONS
// ===============================================
document.getElementById('heroExplore')?.addEventListener('click', () => {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('heroOrder')?.addEventListener('click', () => {
    const items = document.getElementById('cartItems');
    if (items && items.children.length > 0) {
        openCart();
    } else {
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }
});

// ===============================================
// PARALLAX
// ===============================================
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;

            const heroBg = document.querySelector('.hero-bg');
            if (heroBg) heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;

            const messageBg = document.querySelector('.message-bg');
            const messageSection = document.querySelector('.brand-message');
            if (messageBg && messageSection) {
                const rect = messageSection.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    messageBg.style.transform = `translateY(${(scrolled - messageSection.offsetTop) * 0.3}px)`;
                }
            }
            ticking = false;
        });
        ticking = true;
    }
});

// ===============================================
// CAROUSEL — built dynamically from products API
// ===============================================
let currentSlide = 0;
let carouselProducts = [];
let autoScrollInterval;

function getSlidesPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 968) return 2;
    return 3;
}

function buildCarousel(products) {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    if (!track) return;

    carouselProducts = products;
    currentSlide = 0;
    track.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';

    products.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'carousel-card';
        // Use featured_image_url for carousel, fall back to image_url if not set
        const featuredSrc = p.featured_image_url || p.image_url;
        card.innerHTML = `
            <div class="card-image">
                <img src="${featuredSrc}" alt="${p.name}" loading="lazy">
                ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
            </div>
            <div class="card-body">
                <h3 class="card-title">${p.name}</h3>
                <p class="card-desc">${p.description}</p>
                <a class="card-view-link" href="#products" onclick="document.getElementById('products').scrollIntoView({behavior:'smooth'}); return false;">
                    View in Menu &rarr;
                </a>
            </div>
        `;
        track.appendChild(card);

        if (dotsContainer) {
            const dot = document.createElement('div');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    });

    updateCarousel();
    stopAutoScroll();
    startAutoScroll();
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track || !track.children.length) return;
    const cardWidth = track.children[0].offsetWidth;
    const gap = 20;
    track.style.transform = `translateX(-${currentSlide * (cardWidth + gap)}px)`;
    document.querySelectorAll('#carouselDots .dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function nextSlide() {
    const max = Math.max(0, carouselProducts.length - getSlidesPerView());
    currentSlide = currentSlide >= max ? 0 : currentSlide + 1;
    updateCarousel();
}

function prevSlide() {
    const max = Math.max(0, carouselProducts.length - getSlidesPerView());
    currentSlide = currentSlide <= 0 ? max : currentSlide - 1;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function startAutoScroll() { autoScrollInterval = setInterval(nextSlide, 3000); }
function stopAutoScroll()  { clearInterval(autoScrollInterval); }

document.querySelector('.carousel-btn.prev')?.addEventListener('click', () => { prevSlide(); stopAutoScroll(); startAutoScroll(); });
document.querySelector('.carousel-btn.next')?.addEventListener('click', () => { nextSlide(); stopAutoScroll(); startAutoScroll(); });
document.querySelector('.carousel-wrapper')?.addEventListener('mouseenter', stopAutoScroll);
document.querySelector('.carousel-wrapper')?.addEventListener('mouseleave', startAutoScroll);

// Swipe support
let touchStartX = 0;
document.querySelector('.carousel-wrapper')?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAutoScroll(); });
document.querySelector('.carousel-wrapper')?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    startAutoScroll();
});

window.addEventListener('resize', updateCarousel);

// ===============================================
// FALLBACK PRODUCTS — Unsplash images matched to each product
// featured_image_url  → shown in the Featured Carousel (tall/portrait crop)
// image_url           → shown in the Products Grid (square crop)
// hover_image_url     → hover state in the Products Grid
// ===============================================
const FALLBACK_PRODUCTS = [
    {
        id: 1, name: 'Fruit Tart', badge: 'Seasonal',
        description: 'Fresh seasonal fruits on pastry cream',
        price: '260.00', category: 'pastry',
        image_url:          'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=400&fit=crop',
        hover_image_url:    'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=400&h=400&fit=crop',
        featured_image_url: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&h=800&fit=crop',
    },
    {
        id: 2, name: 'Chocolate Éclair', badge: 'Classic',
        description: 'Choux pastry with chocolate glaze',
        price: '220.00', category: 'pastry',
        image_url:          'https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=400&h=400&fit=crop',
        hover_image_url:    'https://images.unsplash.com/photo-1548365328-8c6db3220e4d?w=400&h=400&fit=crop',
        featured_image_url: 'https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=600&h=800&fit=crop',
    },
    {
        id: 3, name: 'Apple Turnover', badge: 'Traditional',
        description: 'Caramelized apples in puff pastry',
        price: '190.00', category: 'pastry',
        image_url:          'https://images.unsplash.com/photo-1621955511865-e1fcb0cb3001?w=400&h=400&fit=crop',
        hover_image_url:    'https://images.unsplash.com/photo-1621955511865-e1fcb0cb3001?w=400&h=400&fit=crop&sat=-30',
        featured_image_url: 'https://images.unsplash.com/photo-1621955511865-e1fcb0cb3001?w=600&h=800&fit=crop',
    },
    {
        id: 4, name: 'Butter Croissant', badge: "Chef's Choice",
        description: 'Flaky, buttery layers with golden crust',
        price: '180.00', category: 'bread',
        image_url:          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop',
        hover_image_url:    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
        featured_image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=800&fit=crop',
    },
    {
        id: 5, name: 'Pain au Chocolat', badge: 'Popular',
        description: 'Dark chocolate in buttery pastry',
        price: '200.00', category: 'pastry',
        image_url:          'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=400&fit=crop',
        hover_image_url:    'https://images.unsplash.com/photo-1548365328-8c6db3220e4d?w=400&h=400&fit=crop',
        featured_image_url: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&h=800&fit=crop',
    },
    {
        id: 6, name: 'Almond Danish', badge: 'New',
        description: 'Sweet almond cream and flaky pastry',
        price: '220.00', category: 'pastry',
        image_url:          'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400&h=400&fit=crop',
        hover_image_url:    'https://images.unsplash.com/photo-1571066812040-4c4b8c82a59e?w=400&h=400&fit=crop',
        featured_image_url: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600&h=800&fit=crop',
    },
    {
        id: 7, name: 'Sourdough Loaf', badge: null,
        description: 'Naturally fermented with a crispy crust and tangy flavor',
        price: '320.00', category: 'bread',
        image_url:          'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&h=400&fit=crop',
        hover_image_url:    'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=400&h=400&fit=crop',
        featured_image_url: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=600&h=800&fit=crop',
    },
    {
        id: 8, name: 'Baguette', badge: null,
        description: 'Classic French bread with a golden crust and airy interior',
        price: '160.00', category: 'bread',
        image_url:          'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=400&h=400&fit=crop',
        hover_image_url:    'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&h=400&fit=crop',
        featured_image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=600&h=800&fit=crop',
    },
    {
        id: 9, name: 'Cinnamon Roll', badge: 'Bestseller',
        description: 'Soft swirled pastry with cream cheese frosting',
        price: '210.00', category: 'pastry',
        image_url:          'https://images.unsplash.com/photo-1609765910012-dfc3a8f9e22f?w=400&h=400&fit=crop',
        hover_image_url:    'https://images.unsplash.com/photo-1591985667794-3e8a15a6a6c5?w=400&h=400&fit=crop',
        featured_image_url: 'https://images.unsplash.com/photo-1609765910012-dfc3a8f9e22f?w=600&h=800&fit=crop',
    },
];

// ===============================================
// LOAD PRODUCTS FROM API
// ===============================================
async function loadProducts(category = '') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = Array(6).fill('<div class="product-card skeleton"></div>').join('');

    try {
        const url = 'products.php?action=list' + (category ? `&category=${encodeURIComponent(category)}` : '');
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.products.length > 0) {
            renderProductGrid(data.products);
            if (!category) buildCarousel(data.products);
        } else {
            console.warn('No products from API, using fallback data');
            useFallbackProducts(category);
        }
    } catch (err) {
        console.error('Products load error:', err);
        console.warn('API failed, using fallback data');
        useFallbackProducts(category);
    }
}

function useFallbackProducts(category = '') {
    let products = FALLBACK_PRODUCTS;
    if (category) {
        products = FALLBACK_PRODUCTS.filter(p => p.category === category);
    }
    renderProductGrid(products);
    if (!category) buildCarousel(products);
}

function renderProductGrid(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    products.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';

        const hoverSrc = p.hover_image_url || p.image_url;
        const outOfStock = !p.in_stock || p.in_stock == 0;
        if (outOfStock) card.classList.add('out-of-stock');

        card.innerHTML = `
            <div class="product-image">
                ${p.badge && !outOfStock ? `<span class="product-badge">${p.badge}</span>` : ''}
                ${outOfStock ? `<span class="product-badge oos-badge">Out of Stock</span>` : ''}
                <img class="img-primary" src="${p.image_url}" alt="${p.name}" loading="lazy">
                <img class="img-hover" src="${hoverSrc}" alt="${p.name} detail" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="product-meta">${p.description}</p>
                <div class="product-row">
                    <span class="price">&#8369;${parseFloat(p.price).toFixed(2)}</span>
                    ${!outOfStock ? `
                    <div class="qty-controls">
                        <button class="qty-circle dec" data-product-id="${p.id}">&#8722;</button>
                        <span class="qty-val">1</span>
                        <button class="qty-circle inc" data-product-id="${p.id}">&#43;</button>
                    </div>` : ''}
                </div>
                <button class="btn-order ${outOfStock ? 'btn-oos' : ''}"
                        data-product-id="${p.id}"
                        ${outOfStock ? 'disabled' : ''}>
                    ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        grid.appendChild(card);
        requestAnimationFrame(() => setTimeout(() => card.classList.add('visible'), 50 + idx * 60));
    });

    grid.querySelectorAll('.qty-circle').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const row = this.closest('.qty-controls');
            const valEl = row.querySelector('.qty-val');
            let val = parseInt(valEl.textContent);

            if (this.classList.contains('inc')) {
                val++;
                spawnParticles(e);
            } else if (this.classList.contains('dec') && val > 1) {
                val--;
            }

            valEl.textContent = val;
            valEl.classList.remove('bump');
            void valEl.offsetWidth;
            valEl.classList.add('bump');
        });
    });

    grid.querySelectorAll('.btn-order:not([disabled])').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const circle = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            circle.className = 'ripple-circle';
            circle.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
            this.appendChild(circle);
            setTimeout(() => circle.remove(), 600);

            const card = this.closest('.product-card');
            const qty = parseInt(card.querySelector('.qty-val').textContent);
            addToCartWithQty(parseInt(this.dataset.productId), qty);
        });
    });
}

function spawnParticles(e) {
    const colors = ['#C87941', '#3C2A1C', '#E8DCC4', '#8B6F47'];
    const x = e.clientX;
    const y = e.clientY;

    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'qty-particle';
        const angle = (i / 8) * 2 * Math.PI;
        const dist = 30 + Math.random() * 30;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        p.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            background: ${colors[i % colors.length]};
            --tx: ${tx}px;
            --ty: ${ty}px;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
}

async function addToCartWithQty(productId, quantity) {
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('quantity', quantity);

    try {
        const res  = await fetch('cart.php?action=add', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
            showNotification(`Added ${quantity} to cart!`, 'success');
            const cartRes  = await fetch('cart.php?action=get');
            const cartData = await cartRes.json();
            if (cartData.success) updateCartBadge(cartData.count);
        } else {
            showNotification(data.message, 'error');
            if (data.message.toLowerCase().includes('login')) {
                setTimeout(() => openModal('login'), 800);
            }
        }
    } catch (err) {
        showNotification('Could not add to cart. Please try again.', 'error');
    }
}

// ===============================================
// CATEGORY TABS
// ===============================================
document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        loadProducts(this.dataset.category);
    });
});

// ===============================================
// CART DRAWER
// ===============================================
document.getElementById('openCartDrawer')?.addEventListener('click', async () => {
    try {
        const res = await fetch('check_session.php');
        const data = await res.json();
        
        if (data.logged_in) {
            openCart();
        } else {
            showNotification('Please login to view your cart', 'error');
            setTimeout(() => openModal('login'), 500);
        }
    } catch (err) {
        showNotification('Please login to view your cart', 'error');
        setTimeout(() => openModal('login'), 500);
    }
});
document.getElementById('closeCartDrawer')?.addEventListener('click', closeCart);
document.getElementById('cartBackdrop')?.addEventListener('click', closeCart);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('cartDrawer')?.classList.contains('active')) closeCart();
});

function openCart() {
    document.getElementById('cartDrawer')?.classList.add('active');
    document.body.style.overflow = 'hidden';
    fetchCart();
}

function closeCart() {
    document.getElementById('cartDrawer')?.classList.remove('active');
    document.body.style.overflow = '';
}

async function fetchCart() {
    try {
        const res = await fetch('cart.php?action=get');
        const data = await res.json();

        if (!data.success) {
            document.getElementById('cartEmpty').style.display = 'flex';
            document.getElementById('cartEmpty').innerHTML = `
                <span style="font-size:48px;">&#x1F512;</span>
                <p>Please login to view your cart</p>
                <button class="btn-browse" onclick="closeCart(); openModal('login')">Login</button>
            `;
            document.getElementById('cartItems').innerHTML = '';
            document.getElementById('cartFooter').style.display = 'none';
            return;
        }
        renderCart(data);
    } catch (err) {
        console.error('Cart fetch error:', err);
    }
}

function renderCart(data) {
    const cartEmpty  = document.getElementById('cartEmpty');
    const cartItems  = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal  = document.getElementById('cartTotal');

    if (!data.items.length) {
        cartEmpty.style.display = 'flex';
        cartEmpty.innerHTML = `
            <span style="font-size:48px;">&#x1F6D2;</span>
            <p>Your cart is empty</p>
            <button class="btn-browse" onclick="closeCart(); document.querySelector('#products').scrollIntoView({behavior:'smooth'})">Browse Products</button>
        `;
        cartItems.innerHTML = '';
        cartFooter.style.display = 'none';
        updateCartBadge(0);
        return;
    }

    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';
    cartItems.innerHTML = '';

    data.items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img class="cart-item-img" src="${item.image_url}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">&#8369;${parseFloat(item.price).toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" data-cart-id="${item.id}" data-action="dec">&#8722;</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" data-cart-id="${item.id}" data-action="inc">&#43;</button>
                </div>
            </div>
            <button class="cart-item-remove" data-cart-id="${item.id}" title="Remove">&#10005;</button>
        `;
        cartItems.appendChild(el);
    });

    cartItems.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id  = parseInt(btn.dataset.cartId);
            const qty = parseInt(btn.parentElement.querySelector('.qty-display').textContent);
            await updateCartItem(id, btn.dataset.action === 'inc' ? qty + 1 : qty - 1);
            fetchCart();
        });
    });

    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
            await removeCartItem(parseInt(btn.dataset.cartId));
            fetchCart();
        });
    });

    cartTotal.textContent = `\u20B1${parseFloat(data.total).toFixed(2)}`;
    updateCartBadge(data.count);
}

function updateCartBadge(count) {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count > 99 ? '99+' : count;
    } else {
        badge.style.display = 'none';
    }
}

async function addToCart(productId) {
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('quantity', 1);

    try {
        const res  = await fetch('cart.php?action=add', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
            showNotification('Added to cart!', 'success');
            const cartRes  = await fetch('cart.php?action=get');
            const cartData = await cartRes.json();
            if (cartData.success) updateCartBadge(cartData.count);
        } else {
            showNotification(data.message, 'error');
            if (data.message.toLowerCase().includes('login')) {
                setTimeout(() => openModal('login'), 800);
            }
        }
    } catch (err) {
        showNotification('Could not add to cart. Please try again.', 'error');
    }
}

async function updateCartItem(cartId, quantity) {
    const fd = new FormData();
    fd.append('cart_id', cartId);
    fd.append('quantity', quantity);
    await fetch('cart.php?action=update', { method: 'POST', body: fd });
}

async function removeCartItem(cartId) {
    const fd = new FormData();
    fd.append('cart_id', cartId);
    await fetch('cart.php?action=remove', { method: 'POST', body: fd });
}

// ===============================================
// CONTACT FORM
// ===============================================
document.getElementById('contactForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('contactSubmitBtn');
    const orig = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
        const res  = await fetch('contact.php', { method: 'POST', body: new FormData(this) });
        const data = await res.json();
        showNotification(data.message, data.success ? 'success' : 'error');
        if (data.success) this.reset();
    } catch (err) {
        showNotification('Failed to send. Please try again.', 'error');
    } finally {
        btn.textContent = orig;
        btn.disabled = false;
    }
});

// ===============================================
// COUNTER ANIMATION
// ===============================================
function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const step = target / (2000 / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            el.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// ===============================================
// SCROLL REVEAL + COUNTER TRIGGER
// ===============================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('stat-number')) animateCounter(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('.fade-in, .stat-number').forEach(el => observer.observe(el));

// ===============================================
// NOTIFICATION
// ===============================================
function showNotification(message, type = 'success') {
    document.querySelectorAll('.gc-toast').forEach(n => n.remove());

    const toast = document.createElement('div');
    toast.className = 'gc-toast';
    toast.style.cssText = `
        position:fixed; top:90px; right:30px;
        background:${type === 'success' ? 'linear-gradient(135deg,#4CAF50,#45a049)' : 'linear-gradient(135deg,#f44336,#e53935)'};
        color:white; padding:14px 22px; border-radius:12px;
        box-shadow:0 8px 24px rgba(0,0,0,0.2); z-index:11000;
        font-weight:500; max-width:320px; font-family:'Montserrat',sans-serif;
        display:flex; align-items:center; gap:10px;
        animation:gcSlideIn 0.4s ease;
    `;

    const icon = document.createElement('span');
    icon.textContent = type === 'success' ? '\u2713' : '\u2715';
    icon.style.fontSize = '16px';

    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);

    if (!document.getElementById('gc-toast-style')) {
        const s = document.createElement('style');
        s.id = 'gc-toast-style';
        s.textContent = `
            @keyframes gcSlideIn  { from{opacity:0;transform:translateX(100px)} to{opacity:1;transform:translateX(0)} }
            @keyframes gcSlideOut { to{opacity:0;transform:translateX(100px)} }
        `;
        document.head.appendChild(s);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'gcSlideOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ===============================================
// INIT
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

console.log('\uD83E\uDD50 Golden Crust Bakery loaded!');