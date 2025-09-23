    let userRemindersCache = []; // Cache for user's reminders for search functionality

    // --- Live Notification System ---
    function showLiveNotification(message, type, link = '#') {
        const container = document.getElementById('live-notification-container');
        if (!container) return;

        const notificationId = `notif-${Date.now()}`;
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = 'bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 flex items-start gap-3 transition-all duration-500 ease-in-out transform translate-x-full opacity-0';
        
        let icon = '';
        if (type === 'reminder') {
            icon = `<div class="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center"><i class="fas fa-bell text-yellow-600"></i></div>`;
        } else if (type === 'doctor') {
            icon = `<div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><i class="fas fa-user-md text-blue-600"></i></div>`;
        } else if (type === 'scan') {
            icon = `<div class="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><i class="fas fa-microscope text-green-600"></i></div>`;
        }

        notification.innerHTML = `
            ${icon}
            <div class="flex-grow">
                <p class="text-sm font-semibold text-gray-800">${message.title}</p>
                <p class="text-xs text-gray-600">${message.body}</p>
            </div>
            <button class="close-notification-btn flex-shrink-0 text-2xl leading-none font-bold text-gray-400 hover:text-gray-700">&times;</button>
        `;

        if (link && link !== '#') {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-notification-btn')) {
                    window.location.href = link;
                }
            });
        }

        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        const close = () => {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => notification.remove(), 500);
        };

        const closeBtn = notification.querySelector('.close-notification-btn');
        const timeoutId = setTimeout(close, 5000);

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearTimeout(timeoutId);
            close();
        });
    }

    const searchData = {
            medicines: [
                "Paracetamol", "Ibuprofen", "Amoxicillin", "Aspirin", "Metformin",
                "Lisinopril", "Atorvastatin", "Omeprazole", "Amlodipine", "Simvastatin"
            ],
            doctors: [
                "Dr. Sarah Johnson - Cardiologist", "Dr. Michael Chen - Neurologist",
                "Dr. Emily Davis - Pediatrician", "Dr. James Wilson - Orthopedic",
                "Dr. Lisa Brown - Dermatologist", "Dr. Robert Taylor - General Physician"
            ],
            scans: [
                "MRI Scan", "CT Scan", "X-Ray", "Ultrasound", "Blood Test",
                "ECG", "Mammography", "Bone Density Test", "Colonoscopy"
            ]
        };

        // Hero Carousel
        let currentHeroSlide = 0;
        const heroSlides = document.querySelectorAll('.carousel-slide');
        const heroDots = document.querySelectorAll('.nav-dot');

        function showSlide(n) {
            heroSlides[currentHeroSlide].classList.remove('active');
            heroDots[currentHeroSlide].classList.remove('active');
            
            currentHeroSlide = (n + heroSlides.length) % heroSlides.length;
            
            heroSlides[currentHeroSlide].classList.add('active');
            heroDots[currentHeroSlide].classList.add('active');
        }

        function currentSlide(n) {
            showSlide(n - 1);
        }

        function nextSlide() {
            showSlide(currentHeroSlide + 1);
        }

        // Auto-advance hero carousel
        setInterval(nextSlide, 5000);

        // Analytics Carousel
        let currentAnalyticsSlide = 0;
        const analyticsTrack = document.getElementById('analyticsTrack');
        const analyticsCards = document.querySelectorAll('.analytics-card');
        
        function moveAnalytics(direction) {
            currentAnalyticsSlide = (currentAnalyticsSlide + direction + analyticsCards.length) % analyticsCards.length;
            analyticsTrack.style.transform = `translateX(-${currentAnalyticsSlide * 100}%)`;
        }

        // Expose controls globally so inline onclick works reliably
        window.moveAnalytics = moveAnalytics;
        window.currentSlide = currentSlide;
        window.nextSlide = nextSlide;

        // Auto-advance analytics carousel every 3 seconds
        setInterval(() => {
            moveAnalytics(1);
        }, 3000);

        // --- New Health Analysis Carousel ---
        const analysisTrack = document.getElementById('analysis-track');
        if (analysisTrack) {
            const prevBtn = document.getElementById('analysis-prev');
            const nextBtn = document.getElementById('analysis-next');
            const cards = analysisTrack.querySelectorAll('.analysis-card-wrapper');
            let currentIndex = 0;

            const updateCarousel = () => {
                let cardsToShow = 1;
                if (window.innerWidth >= 1024) {
                    cardsToShow = 3;
                } else if (window.innerWidth >= 640) {
                    cardsToShow = 2;
                }

                const maxIndex = Math.max(0, cards.length - cardsToShow);
                if (currentIndex > maxIndex) {
                    currentIndex = maxIndex;
                }

                const offset = -currentIndex * (100 / cardsToShow);
                analysisTrack.style.transform = `translateX(${offset}%)`;

                prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
                nextBtn.style.display = currentIndex >= maxIndex ? 'none' : 'flex';
            };

            nextBtn.addEventListener('click', () => {
                currentIndex++;
                updateCarousel();
            });

            prevBtn.addEventListener('click', () => {
                currentIndex--;
                updateCarousel();
            });

            window.addEventListener('resize', updateCarousel);
            setTimeout(updateCarousel, 100); // Initial call with a small delay
        }

        // Universal Search
        const searchInput = document.getElementById('universal-search');
        const searchDropdown = document.getElementById('search-dropdown');

        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query.length === 0) {
                searchDropdown.classList.remove('show');
                return;
            }

            let results = [];
            
            // Search through all categories
            Object.entries(searchData).forEach(([category, items]) => {
                items.forEach(item => {
                    if (item.toLowerCase().includes(query)) {
                        results.push({
                            item: item,
                            category: category,
                            link: getLink(category, item)
                        });
                    }
                });
            });

            // Enhance search with user's reminders
            if (userRemindersCache.length > 0) {
                userRemindersCache.forEach(reminder => {
                    if (reminder.medicineName.toLowerCase().includes(query)) {
                        const existingIndex = results.findIndex(r => r.item.toLowerCase() === reminder.medicineName.toLowerCase() && r.category === 'medicines');
                        
                        if (existingIndex > -1) {
                            // If the medicine is in the static list, upgrade it to a "My Reminder" link
                            results[existingIndex].category = 'My Reminder';
                            results[existingIndex].link = 'reminder.html';
                        } else if (!results.some(r => r.item.toLowerCase() === reminder.medicineName.toLowerCase())) {
                            // Otherwise, if it's not in the results at all, add it
                            results.push({
                                item: reminder.medicineName,
                                category: 'My Reminder',
                                link: 'reminder.html'
                            });
                        }
                    }
                });
            }

            if (results.length > 0) {
                searchDropdown.innerHTML = results.map(result => 
                    `<div class="search-item" onclick="navigateTo('${result.link}')">
                        <div class="font-medium text-gray-800">${result.item}</div>
                        <div class="text-sm text-gray-500 capitalize">${result.category}</div>
                    </div>`
                ).join('');
                searchDropdown.classList.add('show');
            } else {
                searchDropdown.innerHTML = '<div class="search-item text-gray-500">No results found</div>';
                searchDropdown.classList.add('show');
            }
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.remove('show');
            }
        });

        function getLink(category, item) {
            const links = {
                medicines: 'medicine.html',
                doctors: 'doctor.html',
                scans: 'scans.html'
            };
            return links[category] || '#';
        }

        function navigateTo(link) {
            if (link !== '#') {
                window.location.href = link;
            }
            searchDropdown.classList.remove('show');
        }

        // Utility functions
        function scrollToServices() {
            document.getElementById('services').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }

        function callEmergency() {
            alert('🚨 Emergency Contact: +1 (555) 911-HELP\n\nFor immediate medical emergencies, please call 911 or visit our emergency department.');
        }

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile search toggle
        document.querySelector('.mobile-search-btn').addEventListener('click', function() {
            const searchContainer = document.querySelector('.nav-search');
            searchContainer.classList.toggle('hidden');
            if (!searchContainer.classList.contains('hidden')) {
                document.getElementById('universal-search').focus();
            }
        });

        // --- New Appointment Fetching Function ---
        async function loadUpcomingAppointments() {
            const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:3000/api/appointments/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) return;

                const data = await response.json();
                if (data.success && data.appointments.length > 0) {
                    const now = new Date();
                    const upcoming = data.appointments
                        .filter(apt => ['pending', 'confirmed'].includes(apt.status))
                        .map(apt => ({
                            ...apt,
                            scheduleDateTime: new Date(`${apt.schedule.date.split('T')[0]}T${apt.schedule.time}`)
                        }))
                        .filter(apt => apt.scheduleDateTime > now)
                        .sort((a, b) => a.scheduleDateTime - b.scheduleDateTime);

                    // Find nearest doctor appointment
                    const nextDoctorAppt = upcoming.find(apt => apt.type === 'doctor');
                    if (nextDoctorAppt) {
                        const docName = nextDoctorAppt.items[0]?.name || 'Doctor';
                        showLiveNotification({ title: `Upcoming: ${docName}`, body: `Appointment at ${nextDoctorAppt.schedule.time} on ${nextDoctorAppt.scheduleDateTime.toLocaleDateString()}` }, 'doctor', 'appointments.html');
                    }

                    // Find nearest scan appointment
                    const nextScanAppt = upcoming.find(apt => apt.type === 'scan');
                    if (nextScanAppt) {
                        const scanName = nextScanAppt.items[0]?.scanName || 'Scan';
                        showLiveNotification({ title: `Upcoming: ${scanName}`, body: `Appointment at ${nextScanAppt.schedule.time} on ${nextScanAppt.scheduleDateTime.toLocaleDateString()}` }, 'scan', 'appointments.html');
                    }
                }
            } catch (error) {
                console.error('Error loading upcoming appointments for notifications:', error);
            }
        }

        // --- New Reminder Functionality ---
        async function loadTodaysReminders() {
            const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            if (!token) return;

            const container = document.getElementById('today-reminders-container');
            const subtitle = document.getElementById('reminders-subtitle');

            if (!container || !subtitle) return; // Exit if elements aren't there

            try {
                const response = await fetch('http://localhost:3000/api/reminders/today', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.success && data.reminders.length > 0) {
                    subtitle.textContent = `You have ${data.reminders.length} reminder(s) for today.`;

                    // --- Notification Logic for next reminder ---
                    const now = new Date();
                    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    
                    const allUpcomingTimes = data.reminders.flatMap(reminder => 
                        reminder.times
                            .filter(time => time >= currentTimeStr)
                            .map(time => ({ time, reminder }))
                    ).sort((a, b) => a.time.localeCompare(b.time));

                    if (allUpcomingTimes.length > 0) {
                        const nextReminderInfo = allUpcomingTimes[0];
                        showLiveNotification(
                            { title: `Next Reminder: ${nextReminderInfo.reminder.medicineName}`, body: `Take your dose at ${nextReminderInfo.time}.` },
                            'reminder',
                            'reminder.html'
                        );
                    }

                    container.innerHTML = data.reminders.map(reminder => {
                        const now = new Date();
                        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                        // Find the next upcoming time
                        const nextTime = reminder.times.sort().find(t => t >= currentTime);
                        const allTimesPassed = !nextTime;

                        return `
                        <div class="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between ${allTimesPassed ? 'opacity-60' : ''}">
                            <div>
                                <p class="font-semibold text-gray-800">${reminder.medicineName}</p>
                                <p class="text-xs text-gray-600">${reminder.dosage || ''}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-base font-mono font-semibold ${nextTime ? 'text-green-600' : 'text-gray-500'}">
                                    ${nextTime || reminder.times[reminder.times.length - 1]}
                                </p>
                                <p class="text-xs text-gray-500">${allTimesPassed ? 'Completed' : 'Upcoming'}</p>
                            </div>
                        </div>`;
                    }).join('');
                } else {
                    subtitle.textContent = "No reminders scheduled for today. Great!";
                    container.innerHTML = '<div class="flex items-center p-3 bg-blue-50 rounded-lg"><div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div><span class="text-gray-800">All clear! Add new ones from the "Manage Reminders" page.</span></div>';
                }
            } catch (error) {
                console.error('Error loading today\'s reminders:', error);
                subtitle.textContent = "Could not load reminders.";
                let errorMessage = error.message;
                if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                    errorMessage = 'Could not connect to the server. Please ensure the backend is running.';
                }
                container.innerHTML = `<p class="text-center text-red-500 p-4 bg-red-50 rounded-lg">${errorMessage}</p>`;
            }
        }

        // --- New Dashboard Stats Functionality ---
        // Updated loadDashboardStats function in home.js
// Replace your existing loadDashboardStats function with this enhanced version

async function loadDashboardStats() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) return;
    
    const appointmentCountEl = document.getElementById('appointment-count');
    const prescriptionCountEl = document.getElementById('prescription-count'); // New element

    // Fetch appointment count (existing code)
    try {
        const apptResponse = await fetch('http://localhost:3000/api/appointments/user', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (apptResponse.ok) {
            const data = await apptResponse.json();
            if (data.success && appointmentCountEl) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcomingAppointments = data.appointments.filter(appointment => {
                    if (!appointment.schedule || !appointment.schedule.date) return false;
                    
                    const appointmentDate = new Date(appointment.schedule.date);
                    if (isNaN(appointmentDate.getTime())) return false;

                    const isFutureOrToday = appointmentDate >= today;
                    const status = (appointment.status || '').toLowerCase();
                    const isNotCompletedOrCancelled = status !== 'completed' && status !== 'cancelled';

                    return isFutureOrToday && isNotCompletedOrCancelled;
                });
                appointmentCountEl.textContent = upcomingAppointments.length;
            }
        }
            } catch (error) {
                console.error('Error fetching appointment count:', error);
                if (appointmentCountEl) appointmentCountEl.textContent = 'N/A';
            }

            // NEW: Fetch prescription count
            try {
                const prescriptionResponse = await fetch('http://localhost:3000/api/prescriptions/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (prescriptionResponse.ok) {
                    const data = await prescriptionResponse.json();
                    if (data.success && prescriptionCountEl) {
                        const totalPrescriptions = data.files ? data.files.length : 0;
                        prescriptionCountEl.textContent = totalPrescriptions;
                        
                        console.log(`Dashboard: Found ${totalPrescriptions} prescription reports for user`);
                    }
                } else {
                    console.warn('Failed to fetch prescriptions for dashboard:', prescriptionResponse.status);
                    if (prescriptionCountEl) prescriptionCountEl.textContent = 'N/A';
                }
            } catch (error) {
                console.error('Error fetching prescription count for dashboard:', error);
                if (prescriptionCountEl) prescriptionCountEl.textContent = 'N/A';
            }
        }

        // --- New function to fetch all user reminders for search ---
        async function fetchUserReminders() {
            const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:3000/api/reminders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        userRemindersCache = data.reminders || [];
                    }
                }
            } catch (error) {
                console.error('Error fetching user reminders for search:', error);
                userRemindersCache = []; // Reset on error
            }
        }

        // Load reminders when the page is ready
        loadTodaysReminders();
        loadUpcomingAppointments();
        fetchUserReminders();
        loadDashboardStats();