// doctor.js - Handles doctor selection and booking functionality

document.addEventListener('DOMContentLoaded', () => {
  // Sample doctors data - you can replace this with data from your backend/API
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      spec: "Cardiologist",
      fee: "₹1500",
      experience: "15 years",
      rating: 4.8,
      image: "doctor1.jpg",
      availability: "Mon-Fri, 9AM-5PM",
      location: "Apollo Hospital, Hyderabad"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      spec: "Neurologist",
      fee: "₹2000",
      experience: "12 years",
      rating: 4.9,
      image: "doctor2.jpg",
      availability: "Tue-Sat, 10AM-6PM",
      location: "KIMS Hospital, Hyderabad"
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      spec: "Dermatologist",
      fee: "₹1200",
      experience: "10 years",
      rating: 4.7,
      image: "doctor3.jpg",
      availability: "Mon-Wed-Fri, 9AM-4PM",
      location: "Care Hospital, Hyderabad"
    },
    {
      id: 4,
      name: "Dr. Rajesh Sharma",
      spec: "Orthopedic",
      fee: "₹1800",
      experience: "18 years",
      rating: 4.9,
      image: "doctor4.jpg",
      availability: "Mon-Sat, 8AM-6PM",
      location: "Continental Hospital, Hyderabad"
    },
    {
      id: 5,
      name: "Dr. Priya Patel",
      spec: "Gynecologist",
      fee: "₹1400",
      experience: "14 years",
      rating: 4.8,
      image: "doctor5.jpg",
      availability: "Mon-Fri, 10AM-5PM",
      location: "Rainbow Hospital, Hyderabad"
    },
    {
      id: 6,
      name: "Dr. Ahmed Hassan",
      spec: "Pediatrician",
      fee: "₹1100",
      experience: "11 years",
      rating: 4.6,
      image: "doctor6.jpg",
      availability: "Daily, 9AM-7PM",
      location: "Star Hospital, Hyderabad"
    },
    {
      id: 7,
      name: "Dr. Anitha Reddy",
      spec: "Endocrinologist",
      fee: "₹1600",
      experience: "13 years",
      rating: 4.7,
      image: "doctor7.jpg",
      availability: "Mon-Fri, 9AM-5PM",
      location: "Yashoda Hospital, Hyderabad"
    },
    {
      id: 8,
      name: "Dr. Vikram Singh",
      spec: "Psychiatrist",
      fee: "₹1300",
      experience: "16 years",
      rating: 4.8,
      image: "doctor8.jpg",
      availability: "Tue-Sat, 11AM-7PM",
      location: "Nizams Institute, Hyderabad"
    }
  ];

  let currentFilter = 'All';
  let filteredDoctors = doctors;

  // Initialize the page
  init();

  function init() {
    renderSpecializationButtons();
    renderDoctors(doctors);
    setupSearchFunctionality();
    setupSpecializationButtons();
  }

  // Get unique specializations
  function getUniqueSpecializations() {
    const specs = doctors.map(doctor => doctor.spec);
    return ['All', ...new Set(specs)];
  }

  // Render specialization filter buttons
  function renderSpecializationButtons() {
    const specButtonsContainer = document.getElementById('spec-buttons');
    const specializations = getUniqueSpecializations();

    specButtonsContainer.innerHTML = '';

    specializations.forEach(spec => {
      const button = document.createElement('button');
      button.className = `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 spec-btn ${
        spec === 'All' ? 'bg-blue-600 text-white' : 'bg-white bg-opacity-80 text-gray-700 hover:bg-blue-100'
      }`;
      button.textContent = spec;
      button.dataset.spec = spec;

      if (spec === 'All') {
        button.classList.add('active');
      }

      specButtonsContainer.appendChild(button);
    });
  }

  // Setup specialization button functionality
  function setupSpecializationButtons() {
    const specButtonsContainer = document.getElementById('spec-buttons');
    
    specButtonsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('spec-btn')) {
        // Update active button
        document.querySelectorAll('.spec-btn').forEach(btn => {
          btn.classList.remove('active', 'bg-blue-600', 'text-white');
          btn.classList.add('bg-white', 'bg-opacity-80', 'text-gray-700', 'hover:bg-blue-100');
        });

        e.target.classList.add('active', 'bg-blue-600', 'text-white');
        e.target.classList.remove('bg-white', 'bg-opacity-80', 'text-gray-700', 'hover:bg-blue-100');

        // Filter doctors
        currentFilter = e.target.dataset.spec;
        applyFilters();
      }
    });
  }

  // Apply filters based on search and specialization
  function applyFilters() {
    const searchTerm = document.getElementById('doctor-search').value.toLowerCase();
    
    let filtered = doctors;

    // Filter by specialization
    if (currentFilter !== 'All') {
      filtered = filtered.filter(doctor => doctor.spec === currentFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm) ||
        doctor.spec.toLowerCase().includes(searchTerm) ||
        doctor.location.toLowerCase().includes(searchTerm)
      );
    }

    filteredDoctors = filtered;
    renderDoctors(filteredDoctors);
  }

  // Render doctors list
  function renderDoctors(doctorsToShow) {
    const doctorsContainer = document.getElementById('doctor-list');
    
    if (!doctorsContainer) {
      console.error('Doctors container not found');
      return;
    }

    doctorsContainer.innerHTML = '';

    if (doctorsToShow.length === 0) {
      doctorsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.87 0-5.43 1.555-6.826 3.934.29-.166.605-.297.933-.393M15 8a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-medium text-gray-600 mb-2">No doctors found</h3>
          <p class="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      `;
      return;
    }

    doctorsToShow.forEach(doctor => {
      const doctorCard = createDoctorCard(doctor);
      doctorsContainer.appendChild(doctorCard);
    });
  }

  // Create individual doctor card
  function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'doctor-card bg-white bg-opacity-90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer';
    
    card.innerHTML = `
      <div class="p-6">
        <div class="flex items-center mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-4 shadow-inner">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-800 mb-1">${doctor.name}</h3>
            <p class="text-blue-600 font-semibold text-sm">${doctor.spec}</p>
            <div class="flex items-center mt-1">
              <svg class="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-600">${doctor.rating}</span>
            </div>
          </div>
        </div>
        
        <div class="space-y-3 mb-6">
          <div class="flex items-center justify-between">
            <span class="text-gray-600 text-sm">Experience:</span>
            <span class="font-semibold text-gray-800">${doctor.experience}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600 text-sm">Consultation Fee:</span>
            <span class="font-bold text-green-600 text-lg">${doctor.fee}</span>
          </div>
          <div class="flex items-start justify-between">
            <span class="text-gray-600 text-sm">Available:</span>
            <span class="text-xs text-gray-500 text-right leading-tight">${doctor.availability}</span>
          </div>
          <div class="flex items-start justify-between">
            <span class="text-gray-600 text-sm">Location:</span>
            <span class="text-xs text-gray-500 text-right leading-tight">${doctor.location}</span>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button 
            class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-sm book-appointment-btn transform hover:scale-105"
            data-doctor-id="${doctor.id}"
          >
            Book Appointment
          </button>
          <button 
            class="px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold text-sm view-profile-btn"
            data-doctor-id="${doctor.id}"
          >
            View
          </button>
        </div>
      </div>
    `;

    // Add click event listeners
    const bookBtn = card.querySelector('.book-appointment-btn');
    const viewBtn = card.querySelector('.view-profile-btn');
    
    bookBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      bookAppointment(doctor);
    });
    
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      viewDoctorProfile(doctor);
    });

    return card;
  }

  // Book appointment function
  function bookAppointment(doctor) {
    // Store selected doctor in localStorage
    const selectedDoctor = {
      id: doctor.id,
      name: doctor.name,
      spec: doctor.spec,
      fee: doctor.fee,
      experience: doctor.experience,
      rating: doctor.rating,
      availability: doctor.availability,
      location: doctor.location
    };

    localStorage.setItem('selectedDoctor', JSON.stringify(selectedDoctor));

    // Show confirmation message with animation
    showNotification(`✅ Selected ${doctor.name} for booking. Redirecting...`, 'success');

    // Add loading state to button
    const bookBtn = document.querySelector(`[data-doctor-id="${doctor.id}"].book-appointment-btn`);
    const originalText = bookBtn.innerHTML;
    bookBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading...
    `;
    bookBtn.disabled = true;

    // Redirect to appointment booking page after a short delay
    setTimeout(() => {
      window.location.href = 'appoint_doctor.html';
    }, 2000);
  }

  // View doctor profile function
  function viewDoctorProfile(doctor) {
    // Create and show modal with doctor details
    showDoctorModal(doctor);
  }

  // Show doctor profile modal
  function showDoctorModal(doctor) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 transform transition-all max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Doctor Profile</h2>
          <button class="text-gray-500 hover:text-gray-700 close-modal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800">${doctor.name}</h3>
          <p class="text-blue-600 font-semibold">${doctor.spec}</p>
          <div class="flex items-center justify-center mt-2">
            <svg class="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <span class="font-semibold">${doctor.rating} Rating</span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-2 font-medium">Experience</p>
            <p class="font-semibold text-gray-800 text-lg">${doctor.experience}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-2 font-medium">Consultation Fee</p>
            <p class="font-bold text-green-600 text-xl">${doctor.fee}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-2 font-medium">Availability</p>
            <p class="text-sm text-gray-800 leading-relaxed">${doctor.availability}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-2 font-medium">Location</p>
            <p class="text-sm text-gray-800 leading-relaxed">${doctor.location}</p>
          </div>
        </div>
        
        <button class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold book-from-modal" data-doctor-id="${doctor.id}">
          Book Appointment
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('.book-from-modal').addEventListener('click', () => {
      modal.remove();
      bookAppointment(doctor);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Setup search functionality
  function setupSearchFunctionality() {
    const searchInput = document.getElementById('doctor-search');
    
    if (searchInput) {
      let searchTimeout;
      
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          applyFilters();
        }, 300);
      });
    }
  }

  // Utility function to show notifications
  function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification fixed top-20 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
      <div class="flex items-center">
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 100);

    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 4000);
  }

  // Export functions for use in other files if needed
  window.getDoctorById = function(doctorId) {
    return doctors.find(doctor => doctor.id === doctorId);
  };

  window.getAllDoctors = function() {
    return doctors;
  };

  window.clearSelectedDoctor = function() {
    localStorage.removeItem('selectedDoctor');
  };
});

// Export functions for use in other files if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getDoctorById,
    getAllDoctors,
    clearSelectedDoctor
  };
}