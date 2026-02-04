// Carousel
let currentSlide = 0;
const track = document.querySelector('.carousel-track');
const cards = document.querySelectorAll('.carousel-card');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const dotsContainer = document.querySelector('.carousel-dots');

let slidesPerView = 3;
let autoScrollInterval;

function updateSlidesPerView() {
    if (window.innerWidth <= 768) {
        slidesPerView = 1;
    } else if (window.innerWidth <= 968) {
        slidesPerView = 2;
    } else {
        slidesPerView = 3;
    }
}

function createDots() {
    const dotsCount = cards.length - slidesPerView + 1;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

function updateCarousel() {
    const cardWidth = cards[0].offsetWidth;
    const gap = 20;
    const offset = currentSlide * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
    
    // Update dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    const maxSlide = cards.length - slidesPerView;
    currentSlide = currentSlide >= maxSlide ? 0 : currentSlide + 1;
    updateCarousel();
}

function prevSlide() {
    const maxSlide = cards.length - slidesPerView;
    currentSlide = currentSlide <= 0 ? maxSlide : currentSlide - 1;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function startAutoScroll() {
    autoScrollInterval = setInterval(nextSlide, 3000);
}

function stopAutoScroll() {
    clearInterval(autoScrollInterval);
}

// Carousel Events
prevBtn.addEventListener('click', () => {
    prevSlide();
    stopAutoScroll();
    startAutoScroll();
});

nextBtn.addEventListener('click', () => {
    nextSlide();
    stopAutoScroll();
    startAutoScroll();
});

track.addEventListener('mouseenter', stopAutoScroll);
track.addEventListener('mouseleave', startAutoScroll);

// Touch support
let touchStartX = 0;
let touchEndX = 0;

track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoScroll();
});

track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) {
        nextSlide();
    } else if (touchEndX - touchStartX > 50) {
        prevSlide();
    }
    startAutoScroll();
});

// Initialize carousel
updateSlidesPerView();
createDots();
updateCarousel();
startAutoScroll();

window.addEventListener('resize', () => {
    updateSlidesPerView();
    createDots();
    updateCarousel();
});

// Counter Animation
function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Parallax Scrolling
let ticking = false;

function handleParallax() {
    const scrolled = window.pageYOffset;
    
    // Hero parallax
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    // Message background parallax
    const messageBg = document.querySelector('.message-bg');
    if (messageBg) {
        const messageSection = document.querySelector('.brand-message');
        const rect = messageSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            messageBg.style.transform = `translateY(${(scrolled - messageSection.offsetTop) * 0.3}px)`;
        }
    }
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(handleParallax);
        ticking = true;
    }
});

// Scroll reveal
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate counters
            if (entry.target.classList.contains('stat-number')) {
                animateCounter(entry.target);
            }
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.product-card, .stat, .carousel-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

document.querySelectorAll('.stat-number').forEach(el => {
    observer.observe(el);
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active navigation
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Mobile menu
const mobileToggle = document.querySelector('.mobile-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Add to cart notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' 
        ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
        : 'linear-gradient(135deg, #f44336, #e53935)';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 15px 30px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideDown 0.3s ease;
        font-family: 'Montserrat', sans-serif;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    @keyframes slideUp {
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Add to cart with PHP backend
async function addToCart(productId) {
    try {
        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('quantity', 1);
        
        const response = await fetch('cart.php?action=add', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Item added to cart!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Cart error:', error);
        showNotification('Please login to add items to cart', 'error');
    }
}

document.querySelectorAll('.btn-add, .btn-order').forEach(btn => {
    btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        if (productId) {
            addToCart(productId);
        } else {
            const card = this.closest('.carousel-card, .product-card');
            const title = card.querySelector('.card-title, .product-info h3').textContent;
            const price = card.querySelector('.price').textContent;
            showNotification(`${title} (${price}) - Please login to add to cart!`, 'error');
        }
    });
});

// Contact form with PHP backend
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        
        try {
            const response = await fetch('contact.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                contactForm.reset();
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            showNotification('Failed to send message. Please try again.', 'error');
        }
    });
}

// CTA buttons
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        const products = document.getElementById('products');
        if (products) {
            const navHeight = navbar.offsetHeight;
            window.scrollTo({
                top: products.offsetTop - navHeight,
                behavior: 'smooth'
            });
        }
    });
});

document.querySelectorAll('.btn-secondary').forEach(btn => {
    btn.addEventListener('click', () => {
        showNotification('Online ordering coming soon!', 'success');
    });
});

console.log('🥐 Golden Crust Bakery with PHP backend loaded successfully!');