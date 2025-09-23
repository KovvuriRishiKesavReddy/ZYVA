document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_BASE_URL = 'http://localhost:3000/api';

    // DOM Elements
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('prescription-file');
    const customFilenameInput = document.getElementById('custom-filename'); // NEW
    const descriptionInput = document.getElementById('prescription-description');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadText = document.getElementById('upload-text');
    const uploadLoader = document.getElementById('upload-loader');
    const listContainer = document.getElementById('prescription-list-container');
    const listLoader = document.getElementById('prescription-list-loader');
    const noItemsMessage = document.getElementById('no-prescriptions-message');
    const alertContainer = document.getElementById('alert-container');

    // --- Helper Functions ---

    // Check if server is running
    const checkServerStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            console.log('Server check failed:', error.message);
            return false;
        }
    };

    // Fallback auth function if auth.js is not available
    const getAuthToken = () => {
        if (typeof window.getAuthToken === 'function') {
            return window.getAuthToken();
        }
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    };

    // For testing - set a dummy token
    const setDummyTokenForTesting = () => {
        localStorage.setItem('authToken', 'dummy-token-for-testing');
        console.log('Dummy token set. You can now test the upload functionality.');
        showAlert('Test token set! You can now try uploading with mock data.', 'success');
        renderMockPrescriptions();
    };

    // Mock data for testing
    const renderMockPrescriptions = () => {
        const mockPrescriptions = [
            {
                id: '1',
                originalName: 'prescription_dr_smith.pdf',
                filename: 'prescription_dr_smith.pdf',
                customFileName: null,
                description: 'Follow-up consultation with Dr. Smith',
                uploadDate: new Date().toISOString(),
                size: 245760
            },
            {
                id: '2',
                originalName: 'blood_test_results.jpg',
                filename: 'Rita_1234567890_Lab_Results_December.jpg', 
                customFileName: 'Lab Results December',
                description: 'Blood test results from lab',
                uploadDate: new Date(Date.now() - 86400000).toISOString(),
                size: 512000
            }
        ];
        
        listLoader.style.display = 'none';
        renderPrescriptions(mockPrescriptions);
        showAlert('Showing mock data - backend server not available', 'warning');
    };

    const showAlert = (message, type = 'danger') => {
        const colorMap = {
            'success': 'green',
            'warning': 'yellow', 
            'danger': 'red'
        };
        const color = colorMap[type] || 'red';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `bg-${color}-100 border border-${color}-400 text-${color}-700 px-4 py-3 rounded relative mb-4`;
        alertDiv.setAttribute('role', 'alert');
        
        let buttonHtml = '';
        if (type === 'danger' && !getAuthToken()) {
            buttonHtml = '<button onclick="setDummyTokenForTesting()" class="ml-2 underline font-medium">Set Test Token</button>';
        }
        
        alertDiv.innerHTML = `
            <span class="block sm:inline">${message}</span>
            ${buttonHtml}
        `;
        
        alertContainer.innerHTML = '';
        alertContainer.appendChild(alertDiv);
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 10000);
    };

    // Make setDummyTokenForTesting available globally for the button
    window.setDummyTokenForTesting = setDummyTokenForTesting;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // --- API Functions ---

    const fetchPrescriptions = async () => {
        const token = getAuthToken();
        if (!token) {
            listLoader.style.display = 'none';
            noItemsMessage.textContent = 'Please log in to view your prescriptions.';
            noItemsMessage.classList.remove('hidden');
            showAlert('No authentication token found. Please log in first.', 'danger');
            return;
        }

        listLoader.style.display = 'block';
        listContainer.innerHTML = '';
        noItemsMessage.classList.add('hidden');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${API_BASE_URL}/prescriptions/user`, {
                headers: { 'Authorization': `Bearer ${token}` },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 401) {
                showAlert('Authentication failed. Please log in again.', 'danger');
                if (token !== 'dummy-token-for-testing') {
                    window.location.href = 'login_page.html';
                }
                return;
            }
            
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch prescriptions.');
            }

            console.log('Fetched prescriptions:', data.files?.length || 0);
            renderPrescriptions(data.files || []);
            listLoader.style.display = 'none';

        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            listLoader.style.display = 'none';
            
            if (error.name === 'AbortError') {
                showAlert('Request timed out. Please try again.', 'danger');
            } else if (error.message.includes('fetch') || error.name === 'TypeError') {
                showAlert('Cannot connect to server. Backend not running on http://localhost:3000', 'danger');
                if (token === 'dummy-token-for-testing') {
                    setTimeout(() => renderMockPrescriptions(), 1000);
                }
            } else {
                showAlert('Failed to fetch records. Please try again later.', 'danger');
            }
            
            if (token !== 'dummy-token-for-testing') {
                noItemsMessage.textContent = 'Could not load prescriptions. Server may be offline.';
                noItemsMessage.classList.remove('hidden');
            }
        }
    };

    // UPDATED: Enhanced upload function with custom filename support
    const uploadPrescription = async (formData) => {
        const token = getAuthToken();
        if (!token) {
            showAlert('You must be logged in to upload.', 'danger');
            return;
        }

        // Disable form to prevent double submission
        uploadBtn.disabled = true;
        uploadText.classList.add('hidden');
        uploadLoader.classList.remove('hidden');
        fileInput.disabled = true;
        customFilenameInput.disabled = true; // NEW: Disable custom filename field

        try {
            // If using dummy token, simulate upload
            if (token === 'dummy-token-for-testing') {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                showAlert('Mock upload successful! (Backend not available)', 'success');
                uploadForm.reset();
                
                setTimeout(() => {
                    renderMockPrescriptions();
                }, 500);
                return;
            }

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 25000);

            console.log('Starting file upload...');
            console.log('Form data contents:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value instanceof File ? `File: ${value.name}` : value);
            }

            const response = await fetch(`${API_BASE_URL}/prescriptions/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const result = await response.json();
            console.log('Upload response:', result);

            if (!response.ok) {
                throw new Error(result.error || `Upload failed with status: ${response.status}`);
            }

            if (!result.success) {
                throw new Error(result.error || 'Upload failed.');
            }

            // Show success message with filename info
            let successMessage = 'Prescription uploaded successfully!';
            if (result.file?.customFileName) {
                successMessage += ` Saved as: "${result.file.customFileName}"`;
            }
            
            showAlert(successMessage, 'success');
            uploadForm.reset();
            
            // Refresh the list immediately after successful upload
            setTimeout(() => {
                fetchPrescriptions();
            }, 500);

        } catch (error) {
            console.error('Error uploading prescription:', error);
            
            if (error.name === 'AbortError') {
                showAlert('Upload timed out. Please try again with a smaller file.', 'danger');
            } else if (error.message.includes('fetch') || error.name === 'TypeError') {
                showAlert('Cannot connect to server. Backend not running on http://localhost:3000', 'danger');
            } else {
                showAlert(error.message || 'Upload failed. Please try again.', 'danger');
            }
        } finally {
            // Re-enable form elements
            uploadBtn.disabled = false;
            uploadText.classList.remove('hidden');
            uploadLoader.classList.add('hidden');
            fileInput.disabled = false;
            customFilenameInput.disabled = false; // NEW: Re-enable custom filename field
        }
    };

    const deletePrescription = async (fileId) => {
        if (!confirm('Are you sure you want to delete this prescription?')) {
            return;
        }

        const token = getAuthToken();
        if (!token) {
            showAlert('Authentication error.', 'danger');
            return;
        }

        try {
            if (token === 'dummy-token-for-testing') {
                showAlert('Mock deletion successful! (Backend not available)', 'success');
                setTimeout(() => renderMockPrescriptions(), 500);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/prescriptions/${fileId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete prescription.');
            }

            showAlert('Prescription deleted successfully.', 'success');
            fetchPrescriptions();

        } catch (error) {
            console.error('Error deleting prescription:', error);
            showAlert(error.message || 'Failed to delete prescription.', 'danger');
        }
    };

    const viewPrescription = async (fileId) => {
        const token = getAuthToken();
        if (!token) {
            showAlert('Authentication error.', 'danger');
            return;
        }

        if (token === 'dummy-token-for-testing') {
            showAlert('Mock view - Backend not available', 'warning');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/prescriptions/view/${fileId}`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const newWindow = window.open(url, '_blank');
                
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                }, 1000);
                
                if (!newWindow) {
                    showAlert('Pop-up blocked. Please allow pop-ups to view prescriptions.', 'warning');
                }
            } else {
                const errorData = await response.json();
                showAlert(errorData.error || 'Failed to load prescription.', 'danger');
            }
        } catch (error) {
            console.error('Error viewing prescription:', error);
            showAlert('Failed to load prescription.', 'danger');
        }
    };

    window.viewPrescription = viewPrescription;

    // --- Rendering ---

    const renderPrescriptions = (prescriptions) => {
        if (!prescriptions || prescriptions.length === 0) {
            noItemsMessage.classList.remove('hidden');
            listContainer.innerHTML = '';
            return;
        }

        noItemsMessage.classList.add('hidden');
        const tableHtml = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded On</th>
                        <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${prescriptions.map(p => createRow(p)).join('')}
                </tbody>
            </table>
        `;
        listContainer.innerHTML = tableHtml;

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const fileId = e.target.closest('button').dataset.id;
                deletePrescription(fileId);
            });
        });
    };

    // UPDATED: Enhanced row creation showing custom filename if available
    const createRow = (p) => {
        const token = getAuthToken();
        
        const viewAction = token === 'dummy-token-for-testing'
            ? `<span class="text-gray-400">View (Mock)</span>`
            : `<button onclick="viewPrescription('${p.id}')" class="text-indigo-600 hover:text-indigo-900 cursor-pointer">View</button>`;
        
        // NEW: Show custom filename if available, otherwise show original name
        const displayName = p.customFileName || p.originalName || p.filename;
        const nameLabel = p.customFileName 
            ? `${p.customFileName} <span class="text-xs text-gray-400">(renamed)</span>`
            : (p.originalName || p.filename);
            
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${nameLabel}</div>
                    <div class="text-xs text-gray-500">${formatFileSize(p.size)}</div>
                    ${p.customFileName ? `<div class="text-xs text-gray-400">Original: ${p.originalName}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${p.description || 'No description'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(p.uploadDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    ${viewAction}
                    <button data-id="${p.id}" class="delete-btn text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `;
    };

    // --- Event Listeners ---

    // UPDATED: Enhanced form submission with custom filename support
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (uploadBtn.disabled) {
            console.log('Upload already in progress, ignoring duplicate submission');
            return;
        }
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            
            // Client-side validation
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                showAlert('File too large. Maximum size is 10MB.', 'danger');
                return;
            }
            
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                showAlert('Invalid file type. Only PDF, JPG, and PNG files are allowed.', 'danger');
                return;
            }
            
            // NEW: Validate custom filename if provided
            const customName = customFilenameInput.value.trim();
            if (customName) {
                // Check for invalid characters in custom filename
                const invalidChars = /[<>:"/\\|?*]/;
                if (invalidChars.test(customName)) {
                    showAlert('Custom filename contains invalid characters. Please use only letters, numbers, spaces, hyphens, and underscores.', 'danger');
                    return;
                }
                
                if (customName.length > 100) {
                    showAlert('Custom filename is too long. Maximum 100 characters allowed.', 'danger');
                    return;
                }
            }
            
            console.log('Starting upload for file:', {
                name: file.name,
                size: file.size,
                type: file.type,
                customName: customName || 'None'
            });
            
            const formData = new FormData();
            formData.append('prescriptionFile', file);
            formData.append('description', descriptionInput.value.trim());
            // NEW: Add custom filename to form data if provided
            if (customName) {
                formData.append('customFileName', customName);
            }
            
            uploadPrescription(formData);
        } else {
            showAlert('Please select a file to upload.', 'danger');
        }
    });

    // File input validation on change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                showAlert('File too large. Maximum size is 10MB.', 'warning');
                e.target.value = '';
                return;
            }
            
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                showAlert('Invalid file type. Only PDF, JPG, and PNG files are allowed.', 'warning');
                e.target.value = '';
                return;
            }
            
            console.log('Valid file selected:', file.name);
        }
    });

    // NEW: Custom filename input validation
    customFilenameInput.addEventListener('input', (e) => {
        const value = e.target.value;
        const invalidChars = /[<>:"/\\|?*]/;
        
        if (invalidChars.test(value)) {
            e.target.setCustomValidity('Invalid characters detected. Please use only letters, numbers, spaces, hyphens, and underscores.');
            e.target.style.borderColor = '#ef4444';
        } else if (value.length > 100) {
            e.target.setCustomValidity('Too long. Maximum 100 characters allowed.');
            e.target.style.borderColor = '#ef4444';
        } else {
            e.target.setCustomValidity('');
            e.target.style.borderColor = '';
        }
    });

    // --- Initial Load ---
    
    const initializePage = async () => {
        const token = getAuthToken();
        
        console.log('🔍 Checking server status...');
        const isServerRunning = await checkServerStatus();
        
        if (!isServerRunning) {
            listLoader.style.display = 'none';
            console.log('❌ Server is not running');
            
            if (token === 'dummy-token-for-testing') {
                renderMockPrescriptions();
            } else {
                showAlert('⚠️ Backend server is not running on http://localhost:3000. Click "Set Test Token" to see demo functionality.', 'danger');
            }
            return;
        }
        
        console.log('✅ Server is running');
        
        if (token) {
            console.log('Authentication token found, loading prescriptions...');
            fetchPrescriptions();
        } else {
            console.log('No authentication token found');
            listLoader.style.display = 'none';
            showAlert('Please log in to view your prescriptions, or click "Set Test Token" to test the interface.', 'danger');
        }
    };
    
    // Initialize the page
    initializePage();
});