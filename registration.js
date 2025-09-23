// FIXED VERSION - Improved OAuth-safe form persistence

const API_CONFIG = {
    baseUrl: 'http://localhost:3000/api'
};

// Form data management with improved OAuth persistence
let sessionFormData = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    emergencyContact: '',
    address: '',
    terms: false,
    marketing: false,
    dataProcessing: false,
    currentStep: 1,
    googleConnected: false,
    googleAuthCode: null
};

// DOM elements
let firstName, lastName, dateOfBirth, gender, phoneNumber, email, password, confirmPassword;
let bloodGroup, emergencyContact, address, terms, marketing, dataProcessing;
let togglePasswordBtn, eyeOpen, eyeClosed, passwordStrength, passwordText, passwordMatch;
let emailCheck, registerBtn, registerText, registerLoader;
let alertSuccess, alertError, successMessage, errorMessage;
let googleConnectBtnRegister, googleConnectStatus, registrationForm;

let currentStep = 1;
let googleAuthCode = null;
let isGoogleConnected = false;

// Initialize DOM elements
function initializeDOMElements() {
    // Get all DOM elements
    registrationForm = document.getElementById('registration-form');
    firstName = document.getElementById('firstName');
    lastName = document.getElementById('lastName');
    dateOfBirth = document.getElementById('dateOfBirth');
    gender = document.getElementById('gender');
    phoneNumber = document.getElementById('phoneNumber');
    email = document.getElementById('email');
    password = document.getElementById('password');
    confirmPassword = document.getElementById('confirmPassword');
    bloodGroup = document.getElementById('bloodGroup');
    emergencyContact = document.getElementById('emergencyContact');
    address = document.getElementById('address');
    terms = document.getElementById('terms');
    marketing = document.getElementById('marketing');
    dataProcessing = document.getElementById('dataProcessing');

    togglePasswordBtn = document.getElementById('toggle-password');
    eyeOpen = document.getElementById('eye-open');
    eyeClosed = document.getElementById('eye-closed');
    passwordStrength = document.getElementById('password-strength');
    passwordText = document.getElementById('password-text');
    passwordMatch = document.getElementById('password-match');
    emailCheck = document.getElementById('email-check');
    registerBtn = document.getElementById('register-btn');
    registerText = document.getElementById('register-text');
    registerLoader = document.getElementById('register-loader');
    alertSuccess = document.getElementById('alert-success');
    alertError = document.getElementById('alert-error');
    successMessage = document.getElementById('success-message');
    errorMessage = document.getElementById('error-message');

    googleConnectBtnRegister = document.getElementById('google-connect-btn-register');
    googleConnectStatus = document.getElementById('google-connect-status');

    console.log('DOM elements initialized');
}

// IMPROVED: Save form data with better error handling
function saveFormDataToSession(forOAuth = false) {
    console.log('Saving form data, forOAuth:', forOAuth);
    
    // Only save if elements are available
    if (!firstName || !lastName) {
        console.warn('Form elements not available for saving');
        return;
    }

    try {
        sessionFormData = {
            firstName: firstName.value || '',
            lastName: lastName.value || '',
            dateOfBirth: dateOfBirth ? dateOfBirth.value || '' : '',
            gender: gender ? gender.value || '' : '',
            phoneNumber: phoneNumber ? phoneNumber.value || '' : '',
            email: email ? email.value || '' : '',
            password: password ? password.value || '' : '',
            confirmPassword: confirmPassword ? confirmPassword.value || '' : '',
            bloodGroup: bloodGroup ? bloodGroup.value || '' : '',
            emergencyContact: emergencyContact ? emergencyContact.value || '' : '',
            address: address ? address.value || '' : '',
            terms: terms ? terms.checked || false : false,
            marketing: marketing ? marketing.checked || false : false,
            dataProcessing: dataProcessing ? dataProcessing.checked || false : false,
            currentStep: currentStep,
            googleConnected: isGoogleConnected,
            googleAuthCode: googleAuthCode
        };

        // Always persist to localStorage for OAuth flow
        localStorage.setItem('registrationFormState', JSON.stringify(sessionFormData));
        console.log('Form data saved to localStorage:', sessionFormData);
        
    } catch (error) {
        console.error('Failed to save form data:', error);
    }
}

// IMPROVED: Restore form data with better error handling
function restoreFormDataFromSession() {
    console.log('Restoring form data from session');
    
    try {
        const tempData = localStorage.getItem('registrationFormState');
        if (tempData) {
            const parsedData = JSON.parse(tempData);
            sessionFormData = { ...sessionFormData, ...parsedData };
            console.log('Form data recovered from localStorage:', sessionFormData);
        } else {
            console.log('No form data found in localStorage');
            return;
        }
    } catch (error) {
        console.error('Could not recover from localStorage:', error);
        return;
    }

    // Only restore if elements are available
    if (!firstName || !lastName) {
        console.warn('Form elements not available for restoring');
        return;
    }

    try {
        // Restore form values
        if (firstName) firstName.value = sessionFormData.firstName || '';
        if (lastName) lastName.value = sessionFormData.lastName || '';
        if (dateOfBirth) dateOfBirth.value = sessionFormData.dateOfBirth || '';
        if (gender) gender.value = sessionFormData.gender || '';
        if (phoneNumber) phoneNumber.value = sessionFormData.phoneNumber || '';
        if (email) email.value = sessionFormData.email || '';
        if (password) password.value = sessionFormData.password || '';
        if (confirmPassword) confirmPassword.value = sessionFormData.confirmPassword || '';
        if (bloodGroup) bloodGroup.value = sessionFormData.bloodGroup || '';
        if (emergencyContact) emergencyContact.value = sessionFormData.emergencyContact || '';
        if (address) address.value = sessionFormData.address || '';
        if (terms) terms.checked = sessionFormData.terms || false;
        if (marketing) marketing.checked = sessionFormData.marketing || false;
        if (dataProcessing) dataProcessing.checked = sessionFormData.dataProcessing || false;

        // Restore Google connection state
        if (sessionFormData.googleConnected) {
            isGoogleConnected = true;
            googleAuthCode = sessionFormData.googleAuthCode;
            updateGoogleConnectionUI(true);
            console.log('Google connection state restored');
        }

        // Restore current step
        currentStep = sessionFormData.currentStep || 1;
        console.log('Form data restored successfully, current step:', currentStep);
        
        // Update UI elements that depend on restored data
        updatePasswordStrengthUI();
        updatePasswordMatchUI();
        
    } catch (error) {
        console.error('Error restoring form data:', error);
    }
}

// Function to clear form data (only on successful registration)
function clearFormData() {
    sessionFormData = {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        bloodGroup: '',
        emergencyContact: '',
        address: '',
        terms: false,
        marketing: false,
        dataProcessing: false,
        currentStep: 1,
        googleConnected: false,
        googleAuthCode: null
    };
    
    try {
        localStorage.removeItem('registrationFormState');
        console.log('Form data cleared');
    } catch (error) {
        console.error('Error clearing form data:', error);
    }
}

async function checkEmailExists(emailValue) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/auth/check-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailValue.toLowerCase().trim() })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        return result.exists === true;
    } catch (error) {
        console.error('Email check failed:', error);
        return false;
    }
}

async function createUser(userData) {
    console.log('Making API call to register user...');

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        console.log('Registration response status:', response.status);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                console.log('Error response data:', errorData);
            } catch (parseError) {
                console.error('Could not parse error response:', parseError);
                errorData = {
                    error: `Server error (${response.status}). Please try again.`
                };
            }
            throw new Error(errorData.error || `Registration failed (${response.status})`);
        }

        const result = await response.json();
        console.log('Registration successful, server response:', result);
        return result;

    } catch (networkError) {
        console.error('Network/API error:', networkError);

        if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        } else {
            throw networkError;
        }
    }
}

function updateGoogleConnectionUI(connected) {
    if (!googleConnectBtnRegister) {
        console.warn('Google connect button not found');
        return;
    }

    if (connected) {
        googleConnectBtnRegister.innerHTML = '✅ Google Connected';
        googleConnectBtnRegister.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        googleConnectBtnRegister.classList.add('bg-green-50', 'text-green-700', 'border-green-200');
        googleConnectBtnRegister.disabled = true;

        if (googleConnectStatus) {
            googleConnectStatus.textContent = '✅ Google Account Connected Successfully';
            googleConnectStatus.classList.remove('hidden');
        }
        console.log('Google UI updated to connected state');
    } else {
        googleConnectBtnRegister.innerHTML = 'Connect with Google';
        googleConnectBtnRegister.classList.remove('bg-green-50', 'text-green-700', 'border-green-200');
        googleConnectBtnRegister.classList.add('bg-blue-600', 'hover:bg-blue-700');
        googleConnectBtnRegister.disabled = false;

        if (googleConnectStatus) {
            googleConnectStatus.classList.add('hidden');
        }
        console.log('Google UI updated to disconnected state');
    }
}

// IMPROVED: Handle Google OAuth results with better logging
function handleGoogleCallback() {
    console.log('Checking for Google OAuth callback...');
    
    // Check for URL fragment data (from server redirect)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);

    const googleCode = hashParams.get('google_code');
    const googleConnected = hashParams.get('google_connected');
    const googleError = hashParams.get('google_error');

    console.log('Hash params:', { googleCode: !!googleCode, googleConnected, googleError });

    if (googleCode && googleConnected === 'true') {
        console.log('Google OAuth successful from hash');
        googleAuthCode = googleCode;
        isGoogleConnected = true;

        // Restore form data BEFORE updating Google state
        restoreFormDataFromSession();
        
        // Update Google state
        sessionFormData.googleConnected = true;
        sessionFormData.googleAuthCode = googleCode;

        updateGoogleConnectionUI(true);
        showAlert('success', 'Google account connected successfully! Your form data has been preserved.');

        // Clean up hash
        window.location.hash = '';
        
        // Don't automatically jump to step 3, stay on current step
        console.log('Staying on current step:', currentStep);
        return;
    }

    if (googleError) {
        console.log('Google OAuth error from hash:', googleError);
        showAlert('error', `Google connection failed: ${decodeURIComponent(googleError)}`);
        window.location.hash = '';
        return;
    }

    // Fallback: Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    console.log('URL params:', { code: !!code, error, state });

    if (code) {
        console.log('Google OAuth successful from URL params');
        googleAuthCode = code;
        isGoogleConnected = true;

        // Restore form data BEFORE updating Google state
        restoreFormDataFromSession();
        
        sessionFormData.googleConnected = true;
        sessionFormData.googleAuthCode = code;

        updateGoogleConnectionUI(true);
        showAlert('success', 'Google account connected successfully! Your form data has been preserved.');

        // Clean up URL parameters
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('code');
        newUrl.searchParams.delete('error');
        newUrl.searchParams.delete('state');
        window.history.replaceState({}, document.title, newUrl.pathname);

    } else if (error) {
        console.log('Google OAuth error from URL params:', error);
        showAlert('error', `Google connection failed: ${error.replace(/_/g, ' ')}`);
        
        // Clean up URL parameters
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('code');
        newUrl.searchParams.delete('error');
        newUrl.searchParams.delete('state');
        window.history.replaceState({}, document.title, newUrl.pathname);
    }
}

// Listen for popup messages (if using popup approach)
window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) return;

    console.log('Received message:', event.data);

    if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        console.log('Google OAuth successful from popup');
        googleAuthCode = event.data.code;
        isGoogleConnected = true;

        // Restore form data first
        restoreFormDataFromSession();

        sessionFormData.googleConnected = true;
        sessionFormData.googleAuthCode = event.data.code;

        updateGoogleConnectionUI(true);
        showAlert('success', 'Google account connected successfully! Your form data has been preserved.');
    }

    if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
        console.log('Google OAuth error from popup:', event.data.error);
        showAlert('error', `Google connection failed: ${event.data.error}`);
    }
});

function hideAllAlerts() {
    if (alertSuccess) alertSuccess.classList.remove('show');
    if (alertError) alertError.classList.remove('show');
}

function showAlert(type, message) {
    hideAllAlerts();
    if (type === 'success') {
        if (successMessage) successMessage.textContent = message;
        if (alertSuccess) alertSuccess.classList.add('show');
    } else {
        if (errorMessage) errorMessage.textContent = message;
        if (alertError) alertError.classList.add('show');
    }
    console.log(`Alert shown: ${type} - ${message}`);
}

function setLoading(isLoading) {
    if (!registerBtn) return;
    
    if (isLoading) {
        registerBtn.disabled = true;
        if (registerLoader) registerLoader.style.display = 'inline-block';
        if (registerText) registerText.textContent = 'Creating Account...';
    } else {
        registerBtn.disabled = false;
        if (registerLoader) registerLoader.style.display = 'none';
        if (registerText) registerText.textContent = 'Create Account';
    }
}

function evaluatePasswordStrength(value) {
    let score = 0;
    if (!value) return 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return Math.min(score, 5);
}

function updatePasswordStrengthUI() {
    if (!passwordStrength || !password) return;

    const strength = evaluatePasswordStrength(password.value);
    passwordStrength.className = 'strength-indicator';

    const strengthClasses = {
        1: 'strength-weak', 2: 'strength-fair', 3: 'strength-good', 4: 'strength-strong', 5: 'strength-strong'
    };

    if (strength > 0) passwordStrength.classList.add(strengthClasses[strength]);

    if (passwordText) {
        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        passwordText.textContent = labels[strength] || '';
    }
}

function updatePasswordMatchUI() {
    if (!password || !confirmPassword || !passwordMatch) return;

    const match = password.value && confirmPassword.value && password.value === confirmPassword.value;
    const hasConfirmValue = confirmPassword.value.length > 0;

    if (hasConfirmValue) {
        passwordMatch.textContent = match ? '✅ Passwords match' : '❌ Passwords do not match';
        passwordMatch.className = match ? 'text-green-600 text-sm' : 'text-red-600 text-sm';
    } else {
        passwordMatch.textContent = '';
    }
}

function showStep(step) {
    console.log('Showing step:', step);
    
    document.querySelectorAll('.form-step').forEach((el, idx) => {
        el.classList.toggle('active', (idx === (step - 1)));
    });

    const steps = ['step-1', 'step-2', 'step-3'].map(id => document.getElementById(id));
    const connectors = ['connector-1', 'connector-2'].map(id => document.getElementById(id));

    steps.forEach((el, idx) => {
        if (!el) return;
        el.classList.remove('active', 'completed');
        if (idx === (step - 1)) {
            el.classList.add('active');
        } else if (idx < (step - 1)) {
            el.classList.add('completed');
        }
    });

    connectors.forEach((el, idx) => {
        if (!el) return;
        el.classList.toggle('completed', idx < (step - 1));
    });

    currentStep = step;
    sessionFormData.currentStep = step;
    saveFormDataToSession();
}

function validateStep(step) {
    if (step === 1) {
        if (!firstName || !firstName.value.trim()) return 'Please enter your first name';
        if (!lastName || !lastName.value.trim()) return 'Please enter your last name';
        if (!dateOfBirth || !dateOfBirth.value) return 'Please select your date of birth';
        if (!gender || !gender.value) return 'Please select your gender';
        if (!email || !email.value.trim()) return 'Please enter your email address';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Please enter a valid email address';
        if (!phoneNumber || !phoneNumber.value.trim()) return 'Please enter your phone number';
        if (phoneNumber.value.trim().length < 10) return 'Please enter a valid phone number';
        return '';
    }

    if (step === 2) {
        if (!password || !password.value) return 'Please enter a password';
        if (evaluatePasswordStrength(password.value) < 3) return 'Password must be stronger';
        if (!confirmPassword || !confirmPassword.value) return 'Please confirm your password';
        if (password.value !== confirmPassword.value) return 'Passwords do not match';
        return '';
    }

    if (step === 3) {
        if (!address || !address.value.trim()) return 'Please enter your address';
        if (!terms || !terms.checked) return 'You must accept the Terms and Conditions';
        if (!dataProcessing || !dataProcessing.checked) return 'You must consent to data processing';
        return '';
    }

    return '';
}

// IMPROVED: Setup event listeners with better error handling
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Google Connect handler
    if (googleConnectBtnRegister) {
        googleConnectBtnRegister.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Google connect button clicked');

            // Save form data before OAuth
            saveFormDataToSession(true);

            try {
                const response = await fetch(`${API_CONFIG.baseUrl}/auth/google/url-for-register`);
                const data = await response.json();

                if (data.success && data.url) {
                    console.log('Redirecting to Google OAuth URL');
                    window.location.href = data.url;
                } else {
                    throw new Error(data.error || 'Could not get Google authentication URL.');
                }
            } catch (error) {
                console.error('Google connect error:', error);
                showAlert('error', `Could not connect to Google. ${error.message}`);
            }
        });
    }

    // Password toggle
    if (togglePasswordBtn && password && confirmPassword && eyeOpen && eyeClosed) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPasswordVisible = password.getAttribute('type') === 'text';
            const newType = isPasswordVisible ? 'password' : 'text';

            [password, confirmPassword].forEach(field => {
                if (field) field.setAttribute('type', newType);
            });

            eyeOpen.classList.toggle('hidden', !isPasswordVisible);
            eyeClosed.classList.toggle('hidden', isPasswordVisible);
        });
    }

    // Password events
    if (password) {
        password.addEventListener('input', () => {
            updatePasswordStrengthUI();
            updatePasswordMatchUI();
            saveFormDataToSession();
        });
    }

    if (confirmPassword) {
        confirmPassword.addEventListener('input', () => {
            updatePasswordMatchUI();
            saveFormDataToSession();
        });
    }

    // Email checking with debounce
    let emailDebounceTimer;
    if (email && emailCheck) {
        email.addEventListener('input', () => {
            clearTimeout(emailDebounceTimer);
            const emailValue = email.value.trim();

            emailCheck.textContent = '';
            emailCheck.className = '';

            if (!emailValue) {
                saveFormDataToSession();
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                emailCheck.textContent = 'Please enter a valid email format';
                emailCheck.className = 'text-red-600 text-sm';
                saveFormDataToSession();
                return;
            }

            emailCheck.textContent = 'Checking database...';
            emailCheck.className = 'text-blue-600 text-sm';

            emailDebounceTimer = setTimeout(async () => {
                try {
                    const exists = await checkEmailExists(emailValue);
                    if (exists) {
                        emailCheck.textContent = '❌ Email already registered';
                        emailCheck.className = 'text-red-600 text-sm font-medium';
                    } else {
                        emailCheck.textContent = '✅ Email available';
                        emailCheck.className = 'text-green-600 text-sm font-medium';
                    }
                } catch (error) {
                    emailCheck.textContent = 'Could not verify email';
                    emailCheck.className = 'text-orange-600 text-sm';
                }
            }, 800);

            saveFormDataToSession();
        });
    }

    // Auto-save for all inputs
    const formInputs = [firstName, lastName, dateOfBirth, gender, phoneNumber, bloodGroup, emergencyContact, address, terms, marketing, dataProcessing];
    formInputs.forEach(input => {
        if (input) {
            const eventType = input.type === 'checkbox' ? 'change' : 'input';
            input.addEventListener(eventType, () => saveFormDataToSession());
        }
    });

    // Navigation buttons
    const bindNav = (id, handler) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                handler(); 
            });
        } else {
            console.warn(`Navigation button ${id} not found`);
        }
    };

    bindNav('next-step-1', () => {
        saveFormDataToSession();
        const err = validateStep(1);
        if (err) { showAlert('error', err); return; }
        showStep(2);
        hideAllAlerts();
    });

    bindNav('next-step-2', () => {
        saveFormDataToSession();
        const err = validateStep(2);
        if (err) { showAlert('error', err); return; }
        showStep(3);
        hideAllAlerts();
    });

    bindNav('prev-step-2', () => {
        saveFormDataToSession();
        showStep(1);
        hideAllAlerts();
    });

    bindNav('prev-step-3', () => {
        saveFormDataToSession();
        showStep(2);
        hideAllAlerts();
    });

    // Form submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submission started');
            hideAllAlerts();

            // Save current form state
            saveFormDataToSession();

            // Validate all steps
            for (let step = 1; step <= 3; step++) {
                const err = validateStep(step);
                if (err) {
                    showAlert('error', err);
                    showStep(step);
                    return;
                }
            }

            if (!isGoogleConnected || !googleAuthCode) {
                showAlert('error', 'Please connect your Google account before registering.');
                showStep(3);
                return;
            }

            try {
                setLoading(true);

                const emailExists = await checkEmailExists(email.value.trim());
                if (emailExists) {
                    showAlert('error', 'Email already registered. Please use different email.');
                    showStep(1);
                    return;
                }

                const userData = {
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
                    email: email.value.trim().toLowerCase(),
                    phoneNumber: phoneNumber.value.trim(),
                    password: password.value,
                    dateOfBirth: dateOfBirth.value,
                    gender: gender.value,
                    bloodGroup: bloodGroup.value || null,
                    emergencyContact: emergencyContact.value.trim() || null,
                    address: address.value.trim(),
                    marketingOptIn: marketing.checked,
                    dataProcessingConsent: dataProcessing.checked,
                    termsAccepted: terms.checked,
                    googleAuthCode: googleAuthCode
                };

                console.log('Submitting registration data...');
                const result = await createUser(userData);

                showAlert('success', 'Registration successful! Redirecting to login...');

                clearFormData();
                if (registrationForm) registrationForm.reset();
                showStep(1);

                setTimeout(() => {
                    window.location.href = 'login_page.html?registered=true';
                }, 2000);

            } catch (error) {
                console.error('Registration error:', error);
                let userMessage = 'Registration failed. Please try again.';

                if (error.message.includes('Google connection failed')) {
                    userMessage = 'Google account connection issue. Please try connecting again.';
                    isGoogleConnected = false;
                    googleAuthCode = null;
                    updateGoogleConnectionUI(false);
                } else if (error.message.includes('Email already registered')) {
                    userMessage = 'This email is already registered. Please use a different email.';
                    showStep(1);
                } else if (error.message.includes('password')) {
                    userMessage = 'Password does not meet requirements. Please check your password.';
                    showStep(2);
                } else if (error.message) {
                    userMessage = error.message;
                }

                showAlert('error', userMessage);
            } finally {
                setLoading(false);
            }
        });
    }
}

// IMPROVED: Initialize everything in proper sequence
function initialize() {
    console.log('Initializing registration form...');
    
    // 1. Initialize DOM elements
    initializeDOMElements();
    
    // 2. Handle Google OAuth callback first
    handleGoogleCallback();
    
    // 3. Restore form data
    restoreFormDataFromSession();
    
    // 4. Show current step
    showStep(currentStep);
    
    // 5. Setup event listeners
    setupEventListeners();
    
    // 6. Update UI
    updatePasswordStrengthUI();
    updatePasswordMatchUI();
    hideAllAlerts();
    
    console.log('Registration form initialized successfully. Current step:', currentStep);
    console.log('Google connected:', isGoogleConnected);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);

// Also initialize immediately if DOM is already ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}