document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const loginText = document.getElementById('login-text');
    const loginLoader = document.getElementById('login-loader');
    const alertError = document.getElementById('alert-error');
    const errorMessage = document.getElementById('error-message');
    const alertSuccess = document.getElementById('alert-success');
    const successMessage = document.getElementById('success-message');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const eyeOpen = document.getElementById('eye-open');
    const eyeClosed = document.getElementById('eye-closed');

    // OPTIMIZED: Determine server URL dynamically
    const getServerURL = () => {
        const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
        
        if (isLocalhost) {
            return 'http://localhost:3000';
        }
        
        // For production, use relative URLs or environment-specific URLs
        return 'https://zyva-healthcare-utus.onrender.com';
    };

    const SERVER_URL = getServerURL();

    // Check registration success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        successMessage.textContent = 'Registration successful! Please log in.';
        alertSuccess.classList.add('show');
        setTimeout(() => alertSuccess.classList.remove('show'), 5000);
    }

    // OPTIMIZED: Debounced password toggle (prevent rapid clicks)
    let toggleTimeout;
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            if (toggleTimeout) return;
            
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            eyeOpen.classList.toggle('hidden', isPassword);
            eyeClosed.classList.toggle('hidden', !isPassword);
            
            toggleTimeout = setTimeout(() => {
                toggleTimeout = null;
            }, 100);
        });
    }

    // OPTIMIZED: Login form with performance monitoring
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const performanceStart = performance.now();
        
        // Clear previous alerts immediately
        alertError.classList.remove('show');
        alertSuccess.classList.remove('show');

        // OPTIMIZED: Show loading state immediately
        loginText.textContent = 'Signing In...';
        loginLoader.style.display = 'inline-block';
        loginBtn.disabled = true;

        // OPTIMIZED: Get form values once
        const formData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };
        // const rememberMe = document.getElementById('remember-me').checked;

        try {
            console.log('Login attempt started for:', formData.email);
            const networkStart = performance.now();
            
            // OPTIMIZED: Shorter timeout for faster failure detection
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            // OPTIMIZED: Use dynamic server URL and streamlined headers
            const response = await fetch(`${SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const networkTime = performance.now() - networkStart;
            console.log(`Network request completed in ${networkTime.toFixed(2)}ms`);

            // OPTIMIZED: Streamlined error handling
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { error: `Server error (${response.status})` };
                }
                throw new Error(errorData.error || `Login failed (${response.status})`);
            }

            const parseStart = performance.now();
            const data = await response.json();
            const parseTime = performance.now() - parseStart;
            console.log(`JSON parsing completed in ${parseTime.toFixed(2)}ms`);
            if (data.passwordMigrated) {
                console.log('Password format was upgraded for enhanced security');
                // Optionally show a brief, non-intrusive notification
                // You could add a small toast notification here if desired
            }

            // OPTIMIZED: Efficient storage selection and writing
            const storageStart = performance.now();
            const storage =  sessionStorage;
            
            // OPTIMIZED: Batch storage operations
            const storageData = {
                authToken: data.token,
                currentUser: JSON.stringify(data.user),
                loginTime: Date.now()
            };
            
            Object.entries(storageData).forEach(([key, value]) => {
                storage.setItem(key, value);
            });
            
            const storageTime = performance.now() - storageStart;
            const totalTime = performance.now() - performanceStart;
            
            console.log(`Login completed in ${totalTime.toFixed(2)}ms (Network: ${networkTime.toFixed(2)}ms, Parse: ${parseTime.toFixed(2)}ms, Storage: ${storageTime.toFixed(2)}ms)`);
            
            // OPTIMIZED: Immediate redirect without delay
            window.location.replace('home_page.html');

        } catch (error) {
            const errorTime = performance.now() - performanceStart;
            console.error(`Login failed after ${errorTime.toFixed(2)}ms:`, error.message);
            
            // OPTIMIZED: Faster error message mapping
            let userMessage;
            const errorMsg = error.message.toLowerCase();
            
            if (error.name === 'AbortError') {
                userMessage = 'Login timeout. Server may be slow.';
            } else if (errorMsg.includes('fetch') || errorMsg.includes('network')) {
                userMessage = 'Cannot connect to server. Please check if the backend is running.';
            } else if (errorMsg.includes('401') || errorMsg.includes('invalid') || errorMsg.includes('credentials')) {
                userMessage = 'Invalid email or password.';
            } else if (errorMsg.includes('404')) {
                userMessage = 'Server endpoint not found. Please check server configuration.';
            } else if (errorMsg.includes('500')) {
                userMessage = 'Server error. Please try again.';
            } else {
                userMessage = error.message || 'Login failed. Please try again.';
            }
            
            errorMessage.textContent = userMessage;
            alertError.classList.add('show');
            
            // OPTIMIZED: Auto-hide error message after delay
            setTimeout(() => {
                alertError.classList.remove('show');
            }, 5000);
            
        } finally {
            // OPTIMIZED: Reset UI state immediately
            loginText.textContent = 'Sign In';
            loginLoader.style.display = 'none';
            loginBtn.disabled = false;
        }
    });

    // OPTIMIZED: Form validation on input for faster feedback
    const emailInput = document.getElementById('email');
const passwordInputField = document.getElementById('password'); // Clear, non-conflicting name

const validateForm = () => {
    const isValid = emailInput.value.trim().includes('@') && 
                   passwordInputField.value.length > 0; // Updated reference
    loginBtn.disabled = !isValid;
};

if (emailInput && passwordInputField) { // Updated reference
    emailInput.addEventListener('input', validateForm);
    passwordInputField.addEventListener('input', validateForm); // Updated reference
    
    // Initial validation
    validateForm();
}


    // OPTIMIZED: Prefetch user data if already logged in
    const existingToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (existingToken && window.location.pathname.includes('login')) {
        // User is already logged in, redirect immediately
        console.log('User already authenticated, redirecting...');
        window.location.replace('home_page.html');
    }

    // OPTIMIZED: Keyboard shortcuts for faster interaction
    document.addEventListener('keydown', (e) => {
    // Enter key submits form if focused on email or password
    if (e.key === 'Enter' && (e.target === emailInput || e.target === passwordInputField)) { // Updated reference
        e.preventDefault();
        if (!loginBtn.disabled) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape key clears errors
    if (e.key === 'Escape') {
        alertError.classList.remove('show');
        alertSuccess.classList.remove('show');
    }
});

    // OPTIMIZED: Performance monitoring for development
    if (window.location.hostname === 'localhost') {
        window.loginPerformance = {
            measureLoginTime: () => {
                const start = performance.now();
                return {
                    end: () => {
                        const duration = performance.now() - start;
                        console.log(`Login operation took ${duration.toFixed(2)}ms`);
                        return duration;
                    }
                };
            }
        };
    }
});