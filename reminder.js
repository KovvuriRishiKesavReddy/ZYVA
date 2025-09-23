document.addEventListener('DOMContentLoaded', () => {
    // Check for login status
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'login_page.html';
        return;
    }

    const API_BASE_URL = 'https://zyva-healthcare-utus.onrender.com';

    const form = document.getElementById('reminder-form');
    const frequencySelect = document.getElementById('frequency');
    const timeInputsContainer = document.getElementById('time-inputs');
    const remindersList = document.getElementById('reminders-list');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    // --- Custom Notification ---
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        // Using Tailwind classes for styling
        notification.className = `fixed top-20 right-5 p-4 rounded-lg shadow-xl text-white z-50 transition-all duration-500 ease-in-out transform`;

        if (type === 'success') {
            notification.classList.add('bg-green-500');
        } else if (type === 'info') {
            notification.classList.add('bg-blue-500');
        } else { // 'error'
            notification.classList.add('bg-red-500');
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        notification.style.transform = 'translateX(calc(100% + 2rem))';
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Animate out and remove.
        const duration = type === 'error' ? 4000 : 1000; // Errors stay for 4s, others for 1s.
        setTimeout(() => {
            notification.style.transform = 'translateX(calc(100% + 2rem))';
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }

    // Set minimum start date to today and pre-fill it
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    startDateInput.value = today;

    // Also set min for end date and update it when start date changes
    endDateInput.min = today;
    startDateInput.addEventListener('change', () => {
        if (startDateInput.value) {
            endDateInput.min = startDateInput.value;
            // If end date is before new start date, clear it
            if (endDateInput.value && endDateInput.value < startDateInput.value) {
                endDateInput.value = '';
            }
        }
    });
    // --- Dynamic Time Inputs ---
    function generateTimeInputs(count) {
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

    frequencySelect.addEventListener('change', (e) => {
        generateTimeInputs(parseInt(e.target.value, 10));
    });

    // Initial generation
    generateTimeInputs(parseInt(frequencySelect.value, 10));


    // --- Load Reminders ---
    async function loadReminders() {
        remindersList.innerHTML = '<p class="text-gray-500 text-center py-8">Loading your reminders...</p>';
        try {
            const response = await fetch(`${API_BASE_URL}/api/reminders/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = 'login_page.html';
                }
                throw new Error(`Failed to fetch reminders: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success && data.reminders.length > 0) {
                renderReminders(data.reminders);
            } else {
                remindersList.innerHTML = `
                    <div class="text-center py-16 px-6 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-200">
                        <svg class="w-20 h-20 text-blue-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        <h3 class="text-2xl font-semibold text-gray-700 mb-2">No Reminders Yet</h3>
                        <p class="text-gray-500 max-w-sm mx-auto">Your active reminders will appear here. Use the form on the left to schedule your first one and stay on top of your health.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
            remindersList.innerHTML = `<p class="text-center text-red-500 p-4 bg-red-50 rounded-lg">Could not load reminders. ${error.message}</p>`;
        }
    }

    function renderReminders(reminders) {
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

    // --- Add Reminder ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-reminder-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const formData = new FormData(form);
        const times = [];
        for (let i = 1; i <= parseInt(formData.get('frequency'), 10); i++) {
            times.push(formData.get(`time${i}`));
        }

        const payload = {
            medicineName: formData.get('medicineName'),
            dosage: formData.get('dosage'),
            medicineForm: formData.get('medicineForm'),
            times: times,
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate') || null,
            notes: formData.get('notes'),
            addToCalendar: formData.get('google-calendar') === 'on'
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/reminders/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to save reminder.');

            // Handle new response structure
            if (data.success) {
                showNotification('Reminder saved successfully!');
                if (data.calendarSyncStatus && data.calendarSyncStatus.startsWith('failed')) {
                    // Show a non-blocking warning about calendar sync failure
                    showNotification(`Could not sync to Google Calendar. You may need to re-connect your account.`, 'error');
                }
            }

            form.reset();
            // Re-apply today's date after form reset
            startDateInput.value = new Date().toISOString().split('T')[0];
            generateTimeInputs(1); // Reset time inputs
            loadReminders(); // Refresh the list
        } catch (error) {
            console.error('Error saving reminder:', error);
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Reminder';
        }
    });

    // --- Delete Reminder ---
    remindersList.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-reminder-btn');
        if (deleteBtn) {
            const reminderId = deleteBtn.dataset.id;
            if (confirm('Are you sure you want to delete this reminder?')) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/reminders/user/${reminderId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Failed to delete reminder.');

                    showNotification('Reminder deleted.', 'info');
                    loadReminders(); // Refresh list
                } catch (error) {
                    console.error('Error deleting reminder:', error);
                    showNotification(`Error: ${error.message}`, 'error');
                }
            }
        }
    });

    // Initial load
    loadReminders();
});