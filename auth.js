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

            // Load cart count badge
            try {
                const cartRes = await fetch('cart.php?action=get');
                const cartData = await cartRes.json();
                if (cartData.success && typeof updateCartBadge === 'function') {
                    updateCartBadge(cartData.count);
                }
            } catch (e) { /* cart not critical on load */ }
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

            // Clear cart badge
            if (typeof updateCartBadge === 'function') {
                updateCartBadge(0);
            }
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Open Login Modal button
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
    btn.addEventListener('click', function () {
        const switchTo = this.dataset.switch;

        if (switchTo === 'signup') {
            loginPanel.style.opacity = '0';
            loginPanel.style.transform = 'translateX(-50px)';

            setTimeout(() => {
                loginPanel.classList.remove('active');
                signupPanel.classList.add('active');

                signupPanel.style.opacity = '0';
                signupPanel.style.transform = 'translateX(50px)';

                setTimeout(() => {
                    signupPanel.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    signupPanel.style.opacity = '1';
                    signupPanel.style.transform = 'translateX(0)';
                }, 50);
            }, 300);

        } else {
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
        }

        setTimeout(() => {
            loginPanel.style.transition = '';
            signupPanel.style.transition = '';
            loginPanel.style.transform = '';
            signupPanel.style.transform = '';
        }, 800);
    });
});

// ===============================================
// LOGIN FORM
// ===============================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        const submitBtn = loginForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'LOGGING IN...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            const response = await fetch('login.php', { method: 'POST', body: formData });
            const data = await response.json();

            if (data.success) {
                showNotification(data.message, 'success');
                updateLoginButton(data.user.name);

                // Load cart count after login
                try {
                    const cartRes = await fetch('cart.php?action=get');
                    const cartData = await cartRes.json();
                    if (cartData.success && typeof updateCartBadge === 'function') {
                        updateCartBadge(cartData.count);
                    }
                } catch (e) { /* non-critical */ }

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

// ===============================================
// SIGNUP FORM
// ===============================================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = signupForm.querySelector('input[placeholder="Name"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;

        if (!name || !email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        const submitBtn = signupForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'CREATING...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);

            const response = await fetch('signup.php', { method: 'POST', body: formData });
            const data = await response.json();

            if (data.success) {
                showNotification(data.message, 'success');

                setTimeout(() => {
                    signupForm.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;

                    // Transition to login panel
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
// SOCIAL LOGIN BUTTONS (placeholder)
// ===============================================
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const platform = this.classList.contains('facebook') ? 'Facebook'
            : this.classList.contains('google') ? 'Google' : 'LinkedIn';
        showNotification(`${platform} login coming soon!`, 'success');
    });
});

// Panel left hover effect
document.querySelectorAll('.panel-left').forEach(panel => {
    panel.addEventListener('mouseenter', function () {
        this.style.transform = 'scale(1.02)';
        this.style.transition = 'transform 0.3s ease';
    });
    panel.addEventListener('mouseleave', function () {
        this.style.transform = 'scale(1)';
    });
});

console.log('🔐 Auth modal system ready!');

// ===============================================
// ADMIN LOGIN FUNCTIONALITY
// ===============================================
const adminPanel = document.querySelector('.admin-panel');

// Open admin login when "Login as Admin" button clicked
document.getElementById('openAdminLoginModal')?.addEventListener('click', () => {
    // Hide login panel, show admin panel
    loginPanel.classList.remove('active');
    adminPanel.classList.add('active');
});

// Admin Login Form Handler
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = adminLoginForm.querySelector('input[name="admin_username"]').value;
        const email = adminLoginForm.querySelector('input[name="admin_email"]').value;
        const password = adminLoginForm.querySelector('input[name="admin_password"]').value;
        const code = adminLoginForm.querySelector('input[name="admin_code"]').value;

        // Validate all fields
        if (!username || !email || !password || !code) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Validate security code (must be 6 characters)
        if (code.length !== 6) {
            showNotification('Security code must be 6 characters', 'error');
            return;
        }

        const submitBtn = adminLoginForm.querySelector('.submit-btn-admin');
        const origText = submitBtn.textContent;
        submitBtn.textContent = 'VERIFYING...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('security_code', code);

            // Send to admin_login.php
            const response = await fetch('admin_login.php', { method: 'POST', body: formData });
            const data = await response.json();

            if (data.success) {
                showNotification('Admin access granted! Redirecting...', 'success');

                // Redirect immediately — do not update the main nav button
                setTimeout(() => {
                    window.location.href = data.redirect || 'admin_dashboard.html';
                }, 1000);
            } else {
                showNotification(data.message || 'Invalid admin credentials', 'error');
                submitBtn.textContent = origText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Admin login error:', error);
            showNotification('Admin login failed. Please try again.', 'error');
            submitBtn.textContent = origText;
            submitBtn.disabled = false;
        }
    });
}

// Update switch buttons to handle admin panel
document.querySelectorAll('.switch-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const switchTo = this.dataset.switch;
        const authContainer = document.querySelector('.auth-modal-container');
        
        // Hide all panels first
        document.querySelectorAll('.auth-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Show target panel
        if (switchTo === 'signup') {
            signupPanel.classList.add('active');
        } else if (switchTo === 'login') {
            loginPanel.classList.add('active');
        } else if (switchTo === 'admin') {
            adminPanel.classList.add('active');
        }
    });
});

console.log('🔐 Admin login system ready!');