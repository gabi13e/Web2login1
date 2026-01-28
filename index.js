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
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 15px 30px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideDown 0.3s ease;
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

document.querySelectorAll('.btn-add, .btn-order').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.carousel-card, .product-card');
        const title = card.querySelector('.card-title, .product-info h3').textContent;
        const price = card.querySelector('.price').textContent;
        showNotification(`${title} (${price}) added to cart!`);
    });
});

// Contact form
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Message sent successfully!');
        contactForm.reset();
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
        showNotification('Online ordering coming soon!');
    });
});

console.log('🥐 Golden Crust Bakery loaded successfully!');
// ===============================================
// AUTH MODAL SYSTEM WITH ANIMATED TRANSITIONS
// ===============================================

const authModal = document.getElementById('authModal');
const openLoginBtn = document.getElementById('openLoginModal');
const loginPanel = document.querySelector('.login-panel');
const signupPanel = document.querySelector('.signup-panel');
const modalBackdrop = document.querySelector('.modal-backdrop');
const modalCloses = document.querySelectorAll('.modal-close');
const switchBtns = document.querySelectorAll('.switch-btn');

// Open Login Modal
if (openLoginBtn) {
    openLoginBtn.addEventListener('click', () => {
        openModal('login');
    });
}

// Open modal function
function openModal(type = 'login') {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (type === 'login') {
        loginPanel.classList.add('active');
        signupPanel.classList.remove('active');
    } else {
        signupPanel.classList.add('active');
        loginPanel.classList.remove('active');
    }
}

// Close modal
function closeModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close buttons
modalCloses.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

// Backdrop click
if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
}

// ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.classList.contains('active')) {
        closeModal();
    }
});

// Switch between login and signup with smooth transition
switchBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const switchTo = this.dataset.switch;
        const authContainer = document.querySelector('.auth-modal-container');
        
        // Add transitioning class for animation
        authContainer.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        if (switchTo === 'signup') {
            // Animate out login panel
            loginPanel.style.opacity = '0';
            loginPanel.style.transform = 'translateX(-50px)';
            
            setTimeout(() => {
                loginPanel.classList.remove('active');
                signupPanel.classList.add('active');
                
                // Animate in signup panel
                signupPanel.style.opacity = '0';
                signupPanel.style.transform = 'translateX(50px)';
                
                setTimeout(() => {
                    signupPanel.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    signupPanel.style.opacity = '1';
                    signupPanel.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
            
        } else {
            // Animate out signup panel
            signupPanel.style.opacity = '0';
            signupPanel.style.transform = 'translateX(50px)';
            
            setTimeout(() => {
                signupPanel.classList.remove('active');
                loginPanel.classList.add('active');
                
                // Animate in login panel
                loginPanel.style.opacity = '0';
                loginPanel.style.transform = 'translateX(-50px)';
                
                setTimeout(() => {
                    loginPanel.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    loginPanel.style.opacity = '1';
                    loginPanel.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        }
        
        // Reset transitions after animation
        setTimeout(() => {
            loginPanel.style.transition = '';
            signupPanel.style.transition = '';
            loginPanel.style.transform = '';
            signupPanel.style.transform = '';
        }, 800);
    });
});

// ===============================================
// FORM HANDLING
// ===============================================

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        // Validate inputs
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Show loading
        const submitBtn = loginForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'LOGGING IN...';
        submitBtn.disabled = true;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Login:', { email, password: '***' });
        
        // Show success notification
        showNotification('Welcome back! Login successful.', 'success');
        
        // Reset and close
        setTimeout(() => {
            loginForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            closeModal();
        }, 1000);
    });
}

// Signup Form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = signupForm.querySelector('input[placeholder="Name"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        
        // Validate inputs
        if (!name || !email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Show loading
        const submitBtn = signupForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'CREATING...';
        submitBtn.disabled = true;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Signup:', { name, email, password: '***' });
        
        // Show success notification
        showNotification('Account created successfully!', 'success');
        
        // Switch to login after success
        setTimeout(() => {
            signupForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Smoothly transition to login panel
            signupPanel.style.opacity = '0';
            signupPanel.style.transform = 'translateX(50px)';
            
            setTimeout(() => {
                signupPanel.classList.remove('active');
                loginPanel.classList.add('active');
                
                loginPanel.style.opacity = '0';
                loginPanel.style.transform = 'translateX(-50px)';
                
                setTimeout(() => {
                    loginPanel.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    loginPanel.style.opacity = '1';
                    loginPanel.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        }, 1000);
    });
}

// ===============================================
// NOTIFICATION SYSTEM
// ===============================================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' 
        ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
        : 'linear-gradient(135deg, #f44336, #e53935)';
    
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 30px;
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 11000;
        animation: slideInRight 0.4s ease;
        font-weight: 500;
        max-width: 350px;
        font-family: 'Montserrat', sans-serif;
    `;
    notification.textContent = message;
    
    // Add icon
    const icon = document.createElement('span');
    icon.style.cssText = 'margin-right: 10px; font-size: 18px;';
    icon.textContent = type === 'success' ? '✓' : '✕';
    notification.prepend(icon);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes slideOutRight {
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 400);
    }, 4000);
}

// Social login buttons (placeholder functionality)
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = this.classList.contains('facebook') ? 'Facebook' : 
                        this.classList.contains('google') ? 'Google' : 'LinkedIn';
        showNotification(`${platform} login coming soon!`, 'success');
    });
});

// Add hover effects to panels
const panelLefts = document.querySelectorAll('.panel-left');
panelLefts.forEach(panel => {
    panel.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    panel.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

console.log('🔐 Enhanced auth modal system ready!');