document.addEventListener('DOMContentLoaded', () => {
    // Enhanced debugging for token issues
    console.log('=== COMPREHENSIVE TOKEN DEBUG ===');
    
    // Check all possible token storage locations
    const tokens = {
        'localStorage.authToken': localStorage.getItem('authToken'),
        'sessionStorage.authToken': sessionStorage.getItem('authToken'),
        'localStorage.token': localStorage.getItem('token'),
        'sessionStorage.token': sessionStorage.getItem('token'),
        'localStorage.accessToken': localStorage.getItem('accessToken'),
        'sessionStorage.accessToken': sessionStorage.getItem('accessToken')
    };
    
    console.log('All possible tokens:', tokens);
    
    // Get the first available token
    const token = Object.values(tokens).find(t => t && t.length > 0);
    console.log('Selected token:', token);
    console.log('Token length:', token ? token.length : 'null');
    console.log('Token starts with:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
        console.error('❌ NO TOKEN FOUND - User should be redirected to login');
        window.location.href = 'login_page.html';
        return;
    }

    const API_BASE_URL = 'https://zyva-healthcare-utus.onrender.com';
    console.log('API Base URL:', API_BASE_URL);
    console.log('Current domain:', window.location.origin);
    console.log('================================');

    const form = document.getElementById('reminder-form');
    const frequencySelect = document.getElementById('frequency');
    const timeInputsContainer = document.getElementById('time-inputs');
    const remindersList = document.getElementById('reminders-list');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    // Custom Notification function
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-5 p-4 rounded-lg shadow-xl text-white z-50 transition-all duration-500 ease-in-out transform`;

        if (type === 'success') {
            notification.classList.add('bg-green-500');
        } else if (type === 'info') {
            notification.classList.add('bg-blue-500');
        } else {
            notification.classList.add('bg-red-500');
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        notification.style.transform = 'translateX(calc(100% + 2rem))';
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        const duration = type === 'error' ? 4000 : 1000;
        setTimeout(() => {
            notification.style.transform = 'translateX(calc(100% + 2rem))';
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }

    // Set date constraints
    if (startDateInput) {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.min = today;
        startDateInput.value = today;

        if (endDateInput) {
            endDateInput.min = today;
            startDateInput.addEventListener('change', () => {
                if (startDateInput.value) {
                    endDateInput.min = startDateInput.value;
                    if (endDateInput.value && endDateInput.value < startDateInput.value) {
                        endDateInput.value = '';
                    }
                }
            });
        }
    }

    // Dynamic Time Inputs
    function generateTimeInputs(count) {
        if (!timeInputsContainer) return;
        
        timeInputsContainer.innerHTML = '';
        if (count > 0) {
            const gridDiv = document.createElement('div');
            gridDiv.className = 'grid grid-cols-2 gap-3';
            for (let i = 1; i <= count; i++) {
                const timeInputDiv = document.createElement('div');
                timeInputDiv.innerHTML = `
                    <label for="time${i}" class="block text-xs font-medium text-gray-600">Time ${i}</label>
                    <input type="time" id="time${i}" name="time${i}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5">
                `;
                gridDiv.appendChild(timeInputDiv);
            }
            timeInputsContainer.appendChild(gridDiv);
        }
    }

    if (frequencySelect) {
        frequencySelect.addEventListener('change', (e) => {
            generateTimeInputs(parseInt(e.target.value, 10));
        });
        generateTimeInputs(parseInt(frequencySelect.value || 1, 10));
    }

    // FIXED Load Reminders with correct endpoints and authentication
    async function loadReminders() {
        if (!remindersList) {
            console.error('❌ remindersList element not found');
            return;
        }

        console.log('\n=== TESTING API AUTHENTICATION ===');
        remindersList.innerHTML = '<p class="text-gray-500 text-center py-8">Loading reminders...</p>';

        // Test different possible endpoints and authentication methods
        const testEndpoints = [
            '/api/reminders',           // Most common
            '/api/reminder/user',       // Alternative naming
            '/api/user/reminders',      // User-first approach
            '/reminders',               // Simple endpoint
            '/api/reminders/user'       // Your current endpoint
        ];

        const authMethods = [
            {
                name: 'Bearer Token',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'x-auth-token',
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            }
        ];

        // Test each combination
        for (const endpoint of testEndpoints) {
            for (const method of authMethods) {
                console.log(`\n--- Testing: ${endpoint} with ${method.name} ---`);
                
                try {
                    const url = `${API_BASE_URL}${endpoint}`;
                    console.log('Request URL:', url);
                    console.log('Request Headers:', method.headers);
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: method.headers
                    });

                    console.log(`Response Status: ${response.status} (${response.statusText})`);

                    if (response.status === 404) {
                        console.log('❌ Endpoint not found, trying next...');
                        continue;
                    }

                    const responseText = await response.text();
                    console.log('Response Text:', responseText);

                    let data;
                    try {
                        data = JSON.parse(responseText);
                    } catch (parseError) {
                        console.log('JSON Parse Error:', parseError.message);
                        continue;
                    }

                    if (response.ok && (data.success || data.reminders || Array.isArray(data))) {
                        console.log(`✅ SUCCESS with ${endpoint} using ${method.name}!`);
                        
                        const reminders = data.reminders || data;
                        if (Array.isArray(reminders) && reminders.length > 0) {
                            renderReminders(reminders);
                            showNotification(`Successfully loaded ${reminders.length} reminders`, 'success');
                        } else {
                            showEmptyState();
                            showNotification('Connected successfully, but no reminders found', 'info');
                        }
                        return; // Success, stop testing
                    } else if (response.status === 401) {
                        console.log('🔒 Unauthorized - trying next method...');
                        continue;
                    } else {
                        console.log(`❌ Failed: ${data.error || 'Unknown error'}`);
                    }

                } catch (error) {
                    console.error(`❌ Network Error:`, error);
                    continue;
                }
            }
        }

        // If we get here, all methods failed
        console.log('❌ ALL METHODS FAILED');
        showConnectionError();
    }

    function showEmptyState() {
        remindersList.innerHTML = `
            <div class="text-center py-16 px-6 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-200">
                <svg class="w-20 h-20 text-blue-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <h3 class="text-2xl font-semibold text-gray-700 mb-2">No Reminders Yet</h3>
                <p class="text-gray-500 max-w-sm mx-auto">Create your first medication reminder using the form above.</p>
            </div>
        `;
    }

    function showConnectionError() {
        remindersList.innerHTML = `
            <div class="text-center p-8 bg-red-50 rounded-lg border border-red-200">
                <h3 class="text-xl font-semibold text-red-800 mb-2">Connection Failed</h3>
                <p class="text-red-600 mb-4">Unable to connect to the reminder service. Please check:</p>
                <ul class="text-red-600 text-sm mb-4 text-left max-w-sm mx-auto">
                    <li>• Your internet connection</li>
                    <li>• Server availability</li>
                    <li>• API endpoint configuration</li>
                </ul>
                <button onclick="location.reload()" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Retry Connection
                </button>
            </div>
        `;
        showNotification('Failed to connect to reminder service', 'error');
    }

    function renderReminders(reminders) {
        if (!remindersList || !Array.isArray(reminders)) return;
        
        remindersList.innerHTML = '';
        reminders.forEach(reminder => {
            const reminderCard = document.createElement('div');
            reminderCard.className = 'bg-white/70 backdrop-blur-sm rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1';
            
            const formattedTimes = reminder.times ? reminder.times.map(t => {
                const [hour, minute] = t.split(':');
                const h = parseInt(hour, 10);
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${h12}:${minute} ${ampm}`;
            }).join(', ') : 'No times specified';

            reminderCard.innerHTML = `
                <div class="p-5">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-xl text-blue-800">${reminder.medicineName || reminder.name || 'Unnamed Medicine'}</h4>
                            <p class="text-sm font-medium text-gray-600">${reminder.dosage || 'No dosage specified'}</p>
                        </div>
                        <button data-id="${reminder._id || reminder.id}" class="delete-reminder-btn text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-100">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="px-5 pb-5 space-y-3">
                    <div class="flex items-center text-sm">
                        <svg class="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-semibold text-gray-700">${formattedTimes}</span>
                    </div>
                    <div class="flex items-center text-sm">
                        <svg class="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span class="text-gray-700">
                            ${reminder.startDate ? `From <strong>${new Date(reminder.startDate).toLocaleDateString()}</strong>` : ''}
                            ${reminder.endDate ? ` to <strong>${new Date(reminder.endDate).toLocaleDateString()}</strong>` : ' indefinitely'}
                        </span>
                    </div>
                    ${reminder.notes ? `
                    <div class="flex items-start text-sm pt-2">
                        <svg class="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                        </svg>
                        <p class="text-gray-600 italic">${reminder.notes}</p>
                    </div>
                    ` : ''}
                </div>
            `;
            remindersList.appendChild(reminderCard);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-reminder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reminderId = e.currentTarget.getAttribute('data-id');
                deleteReminder(reminderId);
            });
        });
    }

    // Add form submission handler
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const reminderData = {
                medicineName: formData.get('medicineName'),
                dosage: formData.get('dosage'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                notes: formData.get('notes'),
                times: []
            };

            // Collect all time inputs
            const frequency = parseInt(formData.get('frequency') || '1', 10);
            for (let i = 1; i <= frequency; i++) {
                const time = formData.get(`time${i}`);
                if (time) reminderData.times.push(time);
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/reminders`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reminderData)
                });

                if (response.ok) {
                    showNotification('Reminder created successfully!', 'success');
                    form.reset();
                    generateTimeInputs(1); // Reset to default
                    loadReminders(); // Refresh the list
                } else {
                    const error = await response.json();
                    showNotification(error.error || 'Failed to create reminder', 'error');
                }
            } catch (error) {
                console.error('Error creating reminder:', error);
                showNotification('Network error. Please try again.', 'error');
            }
        });
    }

    // Delete reminder function
    async function deleteReminder(reminderId) {
        if (!confirm('Are you sure you want to delete this reminder?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/reminders/${reminderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                showNotification('Reminder deleted successfully!', 'success');
                loadReminders(); // Refresh the list
            } else {
                showNotification('Failed to delete reminder', 'error');
            }
        } catch (error) {
            console.error('Error deleting reminder:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }

    // Test API connection function for debugging
    window.testAPIConnection = loadReminders;
    window.debugToken = () => console.log('Current token:', token);
    
    // Initial load
    setTimeout(() => {
        console.log('🚀 Starting reminder system...');
        loadReminders();
    }, 1000);
});