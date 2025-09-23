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
        // Uncomment the next line when done debugging
        // window.location.href = 'login_page.html';
        // return;
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

    // ENHANCED Load Reminders with multiple authentication methods
    async function loadReminders() {
        if (!remindersList) {
            console.error('❌ remindersList element not found');
            return;
        }

        console.log('\n=== TESTING API AUTHENTICATION ===');
        remindersList.innerHTML = '<p class="text-gray-500 text-center py-8">Testing API connection...</p>';

        // Test different authentication methods
        const testMethods = [
            {
                name: 'Bearer Token',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'Direct Token in Authorization',
                headers: { 
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'x-auth-token',
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'x-access-token',
                headers: { 
                    'x-access-token': token,
                    'Content-Type': 'application/json'
                }
            }
        ];

        for (let i = 0; i < testMethods.length; i++) {
            const method = testMethods[i];
            console.log(`\n--- Testing Method ${i + 1}: ${method.name} ---`);
            
            try {
                console.log('Request URL:', `${API_BASE_URL}/api/reminders/user`);
                console.log('Request Headers:', method.headers);
                
                const response = await fetch(`${API_BASE_URL}/api/reminders/user`, {
                    method: 'GET',
                    headers: method.headers
                });

                console.log(`Response Status: ${response.status} (${response.statusText})`);
                console.log('Response OK:', response.ok);

                // Log all response headers
                const responseHeaders = {};
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                console.log('Response Headers:', responseHeaders);

                // Try to get response text first
                const responseText = await response.text();
                console.log('Response Text:', responseText);

                // Try to parse as JSON
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.log('JSON Parse Error:', parseError.message);
                    data = { error: 'Invalid JSON response', responseText };
                }

                console.log('Parsed Data:', data);

                if (response.ok && data.success) {
                    console.log(`✅ SUCCESS with ${method.name}!`);
                    
                    if (data.reminders && data.reminders.length > 0) {
                        renderReminders(data.reminders);
                        showNotification(`Connected successfully using ${method.name}`, 'success');
                    } else {
                        remindersList.innerHTML = `
                            <div class="text-center py-16 px-6 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-200">
                                <svg class="w-20 h-20 text-blue-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                <h3 class="text-2xl font-semibold text-gray-700 mb-2">No Reminders Yet</h3>
                                <p class="text-gray-500 max-w-sm mx-auto">Authentication successful! Your reminders will appear here.</p>
                            </div>
                        `;
                        showNotification(`No reminders found, but API connection works with ${method.name}`, 'info');
                    }
                    return; // Success, stop testing other methods
                } else {
                    console.log(`❌ Failed with ${method.name}`);
                    if (response.status === 401) {
                        console.log('🔒 Unauthorized - Token may be invalid or expired');
                    }
                }

            } catch (error) {
                console.error(`❌ Network Error with ${method.name}:`, error);
                
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    console.log('🌐 Network error - possible CORS or server issue');
                }
            }
        }

        // If we get here, all methods failed
        console.log('❌ ALL AUTHENTICATION METHODS FAILED');
        remindersList.innerHTML = `
            <div class="text-center p-8 bg-red-50 rounded-lg border border-red-200">
                <h3 class="text-xl font-semibold text-red-800 mb-2">API Connection Failed</h3>
                <p class="text-red-600 mb-4">Could not authenticate with the API. Check the console for details.</p>
                <button onclick="location.reload()" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Retry Connection
                </button>
            </div>
        `;
        showNotification('All authentication methods failed. Check console.', 'error');
    }

    function renderReminders(reminders) {
        if (!remindersList) return;
        
        remindersList.innerHTML = '';
        reminders.forEach(reminder => {
            const reminderCard = document.createElement('div');
            reminderCard.className = 'bg-white/70 backdrop-blur-sm rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1';
            
            const formattedTimes = reminder.times.map(t => {
                const [hour, minute] = t.split(':');
                const h = parseInt(hour, 10);
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${h12}:${minute} ${ampm}`;
            }).join(', ');

            reminderCard.innerHTML = `
                <div class="p-5">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-xl text-blue-800">${reminder.medicineName}</h4>
                            <p class="text-sm font-medium text-gray-600">${reminder.dosage || 'No dosage specified'}</p>
                        </div>
                        <button data-id="${reminder._id}" class="delete-reminder-btn text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-100">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="px-5 pb-5 space-y-3">
                    <div class="flex items-center text-sm">
                        <svg class="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span class="font-semibold text-gray-700">${formattedTimes}</span>
                    </div>
                    <div class="flex items-center text-sm">
                        <svg class="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span class="text-gray-700">
                            From <strong>${new Date(reminder.startDate).toLocaleDateString()}</strong>
                            ${reminder.endDate ? ' to <strong>' + new Date(reminder.endDate).toLocaleDateString() + '</strong>' : ' indefinitely'}
                        </span>
                    </div>
                    ${reminder.notes ? `
                    <div class="flex items-start text-sm pt-2">
                        <svg class="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                        <p class="text-gray-600 italic">${reminder.notes}</p>
                    </div>
                    ` : ''}
                </div>
            `;
            remindersList.appendChild(reminderCard);
        });
    }

    // Test API connection button (add this to your HTML for quick testing)
    window.testAPIConnection = loadReminders;

    // Add other event listeners and form submissions here...
    // (keeping the rest of your original code for form submission, deletion, etc.)
    
    // Initial load
    setTimeout(() => {
        console.log('🚀 Starting API connection test...');
        loadReminders();
    }, 1000); // Small delay to ensure page is fully loaded
});