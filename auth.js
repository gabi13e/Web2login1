// ===============================================
// AUTH MODAL SYSTEM WITH ANIMATED TRANSITIONS & PHP INTEGRATION
// ===============================================

const authModal = document.getElementById('authModal');
const openLoginBtn = document.getElementById('openLoginModal');
const loginPanel = document.querySelector('.login-panel');
const signupPanel = document.querySelector('.signup-panel');
const modalBackdrop = document.querySelector('.modal-backdrop');
const modalCloses = document.querySelectorAll('.modal-close');
const switchBtns = document.querySelectorAll('.switch-btn');

// Check login status on page load
window.addEventListener('DOMContentLoaded', checkLoginStatus);

async function checkLoginStatus() {
    try {
        const response = await fetch('check_session.php');
        const data = await response.json();
        
        if (data.logged_in) {
            updateLoginButton(data.user.name);
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

function updateLoginButton(userName) {
    const loginBtn = document.getElementById('openLoginModal');
    if (loginBtn) {
        loginBtn.textContent = `Hi, ${userName}`;
        loginBtn.onclick = () => {
            if (confirm('Do you want to logout?')) {
                logout();
            }
        };
    }
}

async function logout() {
    try {
        const response = await fetch('logout.php');
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            const loginBtn = document.getElementById('openLoginModal');
            if (loginBtn) {
                loginBtn.textContent = 'Login';
                loginBtn.onclick = () => openModal('login');
            }
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

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
// FORM HANDLING WITH PHP
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
        
        try {
            // Send login request to PHP backend
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            
            const response = await fetch('login.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success notification
                showNotification(data.message, 'success');
                
                // Update UI for logged-in user
                updateLoginButton(data.user.name);
                
                // Reset and close
                setTimeout(() => {
                    loginForm.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    closeModal();
                }, 1000);
            } else {
                showNotification(data.message, 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('An error occurred. Please try again.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
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
        
        try {
            // Send signup request to PHP backend
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            
            const response = await fetch('signup.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success notification
                showNotification(data.message, 'success');
                
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
            } else {
                showNotification(data.message, 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('An error occurred. Please try again.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
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

console.log('🔐 Enhanced auth modal system with PHP backend ready!');