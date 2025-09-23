document.addEventListener('DOMContentLoaded', () => {
    // ================== SCAN DATA ==================
    const scans = [
        {
            id: 1,
            name: 'CT Scan (Head)',
            category: 'ct',
            description: 'Detailed imaging of head and brain structures',
            price: 3499,
            originalPrice: 4499,
            stock: 'Available',
            details: 'Contrast dye optional, Duration: 15-30 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 2,
            name: 'MRI (Full Body)',
            category: 'mri',
            description: 'Comprehensive full body diagnostic imaging',
            price: 8999,
            originalPrice: 10999,
            stock: 'Available',
            details: 'No metal objects allowed, Duration: 30-60 minutes',
            delivery: 'Results in 48 hours'
        },
        {
            id: 3,
            name: 'X-Ray (Chest)',
            category: 'xray',
            description: 'Basic chest examination for lungs and heart',
            price: 799,
            originalPrice: 999,
            stock: 'Available',
            details: 'No preparation needed, Duration: 5 minutes',
            delivery: 'Results in 2 hours'
        },
        {
            id: 4,
            name: 'Ultrasound (Abdomen)',
            category: 'ultrasound',
            description: 'Visualization of abdominal organs and structures',
            price: 1299,
            originalPrice: 1599,
            stock: 'Available',
            details: 'Fasting required for 6 hours, Duration: 20-30 minutes',
            delivery: 'Results in 4 hours'
        },
        {
            id: 5,
            name: 'PET Scan',
            category: 'pet',
            description: 'Advanced imaging for cancer detection',
            price: 12999,
            originalPrice: 14999,
            stock: 'Available at select centers',
            details: 'Radioactive tracer injection required, Duration: 2 hours',
            delivery: 'Results in 72 hours'
        },
        {
            id: 6,
            name: 'Mammography',
            category: 'xray',
            description: 'Breast cancer screening examination',
            price: 1899,
            originalPrice: 2199,
            stock: 'Available',
            details: 'Specialized X-ray for breast tissue',
            delivery: 'Results in 24 hours'
        },
        {
            id: 7,
            name: 'MRI Scan (Spine)',
            category: 'mri',
            description: 'Detailed imaging of spinal cord and vertebrae',
            price: 4999,
            originalPrice: 5999,
            stock: 'Available',
            details: 'No radiation, Duration: 30-45 minutes',
            delivery: 'Results in 48 hours'
        },
        {
            id: 8,
            name: 'CT Angiography',
            category: 'ct',
            description: 'Imaging of blood vessels using CT technology',
            price: 5499,
            originalPrice: 6499,
            stock: 'Available',
            details: 'Contrast dye required, Duration: 20-40 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 9,
            name: 'Doppler Ultrasound',
            category: 'ultrasound',
            description: 'Assessment of blood flow and heart valve function',
            price: 1799,
            originalPrice: 2200,
            stock: 'Available',
            details: 'Non-invasive, Duration: 20-30 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 10,
            name: 'Bone Densitometry (DEXA Scan)',
            category: 'dexa',
            description: 'Measurement of bone mineral density',
            price: 1999,
            originalPrice: 2500,
            stock: 'Available',
            details: 'Low radiation dose, Duration: 15 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 11,
            name: 'Echocardiogram',
            category: 'cardiac',
            description: 'Ultrasound scan of the heart to check function',
            price: 2499,
            originalPrice: 2999,
            stock: 'Available',
            details: 'Non-invasive, Duration: 30-40 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 12,
            name: 'CT Scan (Chest)',
            category: 'ct',
            description: 'Detailed imaging of lungs and chest structures',
            price: 3999,
            originalPrice: 4999,
            stock: 'Available',
            details: 'Contrast dye optional, Duration: 15-30 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 13,
            name: 'Ultrasound (Pelvis)',
            category: 'ultrasound',
            description: 'Imaging of pelvic organs and structures',
            price: 1399,
            originalPrice: 1699,
            stock: 'Available',
            details: 'Full bladder required, Duration: 20-30 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 14,
            name: 'MRI Scan (Knee)',
            category: 'mri',
            description: 'Detailed imaging of knee joint and tissues',
            price: 4799,
            originalPrice: 5799,
            stock: 'Available',
            details: 'No radiation, Duration: 30-40 minutes',
            delivery: 'Results in 48 hours'
        },
        {
            id: 15,
            name: 'MRI Scan (Brain)',
            category: 'mri',
            description: 'High resolution imaging of brain tissue',
            price: 5299,
            originalPrice: 6299,
            stock: 'Available',
            details: 'No metal objects allowed, Duration: 30-45 minutes',
            delivery: 'Results in 48 hours'
        },
        {
            id: 16,
            name: 'CT Scan (Abdomen)',
            category: 'ct',
            description: 'Cross-sectional imaging of abdominal organs',
            price: 3999,
            originalPrice: 4799,
            stock: 'Available',
            details: 'Contrast dye advised, Duration: 20-30 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 17,
            name: 'Ultrasound (Thyroid)',
            category: 'ultrasound',
            description: 'Imaging of thyroid gland',
            price: 1299,
            originalPrice: 1499,
            stock: 'Available',
            details: 'No preparation needed, Duration: 15-20 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 18,
            name: 'PET CT Scan',
            category: 'pet',
            description: 'Combined PET and CT scan for cancer detection',
            price: 13999,
            originalPrice: 15999,
            stock: 'Available at select centers',
            details: 'Radioactive tracer, Duration: 2-3 hours',
            delivery: 'Results in 72 hours'
        },
        {
            id: 19,
            name: 'Cardiac Stress Test',
            category: 'cardiac',
            description: 'Exercise test for heart functioning under stress',
            price: 3499,
            originalPrice: 3999,
            stock: 'Available',
            details: 'Treadmill based, Duration: 30-60 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 20,
            name: 'Chest X-Ray (PA View)',
            category: 'xray',
            description: 'Posteroanterior view of chest',
            price: 899,
            originalPrice: 1100,
            stock: 'Available',
            details: 'Quick imaging, Duration: 5-10 minutes',
            delivery: 'Results in 12 hours'
        },
        {
            id: 21,
            name: '3D Mammography',
            category: 'xray',
            description: 'Advanced 3D breast imaging',
            price: 3999,
            originalPrice: 4499,
            stock: 'Available',
            details: 'Low radiation dose, Duration: 15-20 minutes',
            delivery: 'Results in 48 hours'
        },
        {
            id: 22,
            name: 'MRI Angiography',
            category: 'mri',
            description: 'MRI imaging of blood vessels',
            price: 5999,
            originalPrice: 6999,
            stock: 'Available',
            details: 'Contrast agent used, Duration: 30-40 minutes',
            delivery: 'Results in 48 hours'
        },
        {
            id: 23,
            name: 'CT Colonography',
            category: 'ct',
            description: 'Virtual colonoscopy for colorectal screening',
            price: 4999,
            originalPrice: 5999,
            stock: 'Available',
            details: 'Contrast preparation required, Duration: 30 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 24,
            name: 'Ultrasound Doppler (Carotid)',
            category: 'ultrasound',
            description: 'Evaluation of carotid arteries',
            price: 1599,
            originalPrice: 1800,
            stock: 'Available',
            details: 'Non-invasive, Duration: 20-30 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 25,
            name: 'X-Ray (Extremities)',
            category: 'xray',
            description: 'Imaging of hands, feet, arms, and legs',
            price: 799,
            originalPrice: 999,
            stock: 'Available',
            details: 'Quick procedure, Duration: 10 minutes',
            delivery: 'Results in 12 hours'
        },
        {
            id: 26,
            name: 'MRI Scan (Shoulder)',
            category: 'mri',
            description: 'Detailed imaging of shoulder joint and tissues',
            price: 4799,
            originalPrice: 5799,
            stock: 'Available',
            details: 'No radiation, Duration: 30-40 minutes',
            delivery: 'Results in 48 hours'
        },
        {
            id: 27,
            name: 'CT Scan (Pelvis)',
            category: 'ct',
            description: 'Cross-sectional imaging of pelvic region',
            price: 3999,
            originalPrice: 4999,
            stock: 'Available',
            details: 'Contrast dye advised, Duration: 20-30 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 28,
            name: 'Ultrasound (Breast)',
            category: 'ultrasound',
            description: 'Breast tissue imaging with ultrasound',
            price: 1299,
            originalPrice: 1600,
            stock: 'Available',
            details: 'No radiation, Duration: 20 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 29,
            name: 'PET Scan (Brain)',
            category: 'pet',
            description: 'Metabolic brain imaging with PET',
            price: 12999,
            originalPrice: 14999,
            stock: 'Available at select centers',
            details: 'Radioactive tracer, Duration: 2 hours',
            delivery: 'Results in 72 hours'
        },
        {
            id: 30,
            name: 'Chest CT Angiography',
            category: 'ct',
            description: 'Detailed imaging of chest blood vessels',
            price: 5999,
            originalPrice: 6999,
            stock: 'Available',
            details: 'Contrast required, Duration: 20-40 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 31,
            name: 'X-Ray (Skull)',
            category: 'xray',
            description: 'Skull imaging for injuries and abnormalities',
            price: 899,
            originalPrice: 1100,
            stock: 'Available',
            details: 'Quick imaging, Duration: 10 minutes',
            delivery: 'Results in 12 hours'
        },
        {
            id: 32,
            name: 'MRI Scan (Hip)',
            category: 'mri',
            description: 'Detailed imaging of the hip joint and bones',
            price: 4999,
            originalPrice: 5999,
            stock: 'Available',
            details: 'No metal objects allowed, Duration: 30-40 minutes',
            delivery: 'Results in 48 hours'
        },
        // Blood Test scans
        {
            id: 33,
            name: 'Complete Blood Count (CBC)',
            category: 'bloodtest',
            description: 'Measures different components of blood',
            price: 500,
            originalPrice: 700,
            stock: 'Available',
            details: 'No special preparation needed, Duration: 10 minutes',
            delivery: 'Results in 24 hours'
        },
        {
            id: 34,
            name: 'Blood Glucose Test',
            category: 'bloodtest',
            description: 'Measures blood sugar levels',
            price: 300,
            originalPrice: 400,
            stock: 'Available',
            details: 'Fasting recommended, Duration: 5 minutes',
            delivery: 'Results in 12 hours'
        },
        {
            id: 35,
            name: 'Lipid Profile',
            category: 'bloodtest',
            description: 'Measures cholesterol and triglycerides',
            price: 700,
            originalPrice: 900,
            stock: 'Available',
            details: 'Fasting required for 12 hours, Duration: 10 minutes',
            delivery: 'Results in 24 hours'
        }
    ];

    // ================== DOM ELEMENTS ==================
    const scanList = document.querySelector('.scan-list-container');
    const searchInput = document.querySelector('input[placeholder="Search scans, types or categories"]');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    const cartButton = document.getElementById('cart-button');
    const cartCountSpan = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalSpan = document.getElementById('cart-total');
    const navLinks = document.querySelectorAll('.nav-link');
    const checkoutBtn = document.getElementById('checkout-btn');

    // ================== CART STATE ==================
    let cartItems = [];

    // ================== CATEGORY FILTER STATE ==================
    let currentCategory = 'all';

    // ================== UPDATE CART COUNT ==================
    function updateCartCount() {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;
    }

    // ================== RENDER SCANS ==================
    function renderScans(scanArray) {
        scanList.innerHTML = '';
        if (scanArray.length === 0) {
            scanList.innerHTML = '<p class="col-span-full text-center text-gray-500">No scans found matching your criteria.</p>';
            return;
        }
        scanArray.forEach(scan => {
            const stockStatusColor = scan.stock.includes('Available') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            const scanCard = document.createElement('div');
            scanCard.className = 'scan-card card-gradient rounded-lg shadow-md overflow-hidden transition duration-300';
            scanCard.innerHTML = `
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">${scan.name}</h3>
                            <p class="text-sm text-gray-600">${scan.description}</p>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatusColor}">${scan.stock}</span>
                    </div>
                    <div class="mt-4">
                        <p class="text-sm text-gray-700 mb-2">${scan.details}</p>
                    </div>
                    <div class="mt-6 flex items-center justify-between">
                        <div>
                            <span class="text-2xl font-bold text-gray-800">₹${scan.price.toFixed(2)}</span>
                            <span class="ml-2 text-sm line-through text-gray-500">₹${scan.originalPrice.toFixed(2)}</span>
                        </div>
                        <button class="add-to-cart-btn px-4 py-2 rounded-md ${scan.stock.includes('Available') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-medium transition duration-300" 
                                data-id="${scan.id}" 
                                ${!scan.stock.includes('Available') ? 'disabled' : ''}>
                            ${scan.stock.includes('Available') ? 'Book Now' : 'Not Available'}
                        </button>
                    </div>
                </div>
                <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span class="text-xs text-gray-600">${scan.delivery}</span>
                    <button class="view-details-btn text-xs text-blue-600 hover:text-blue-800 font-medium" data-id="${scan.id}">Learn More</button>
                </div>
            `;
            scanList.appendChild(scanCard);
        });
    }

    // ================== RENDER CART ==================
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-gray-500">Your cart is empty.</p>';
        } else {
            cartItems.forEach(item => {
                total += item.price * item.quantity;
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'flex items-center justify-between py-2 border-b border-gray-200';
                cartItemEl.innerHTML = `
                    <div>
                        <p class="font-semibold text-gray-800">${item.name}</p>
                        <p class="text-sm text-gray-600">₹${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                                                <button class="update-quantity-btn px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300" data-id="${item.id}" data-action="decrement">-</button>
                        <span class="font-medium text-gray-800">${item.quantity}</span>
                        <button class="update-quantity-btn px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300" data-id="${item.id}" data-action="increment">+</button>
                        <button class="remove-from-cart-btn text-red-500 hover:text-red-700" data-id="${item.id}">&times;</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemEl);
            });
        }
        cartTotalSpan.textContent = `₹${total.toFixed(2)}`;
    }

    // ================== SEARCH FUNCTION (Category + Search) ==================
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        let filtered = scans.filter(scan =>
            (currentCategory === 'all' || scan.category === currentCategory) &&
            (
                scan.name.toLowerCase().includes(searchTerm) ||
                scan.description.toLowerCase().includes(searchTerm) ||
                scan.details.toLowerCase().includes(searchTerm) ||
                scan.category.toLowerCase().includes(searchTerm)
            )
        );
        renderScans(filtered);
    });

    // ================== FILTER FUNCTION (Updates Category) ==================
    document.querySelector('.filter-buttons').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            filterButtons.forEach(btn => btn.classList.remove('bg-yellow-100', 'active'));
            const categoryMap = {
                'All Scans': 'all',
                'CT': 'ct',
                'MRI': 'mri',
                'X-Ray': 'xray',
                'Ultrasound': 'ultrasound',
                'Blood Test': 'bloodtest',
                'PET': 'pet'
            };
            const selectedCategory = categoryMap[e.target.textContent.trim()];
            if (selectedCategory) {
                currentCategory = selectedCategory;
                const searchTerm = searchInput.value.trim().toLowerCase();
                let filtered = scans.filter(scan =>
                    (currentCategory === 'all' || scan.category === currentCategory) &&
                    (
                        scan.name.toLowerCase().includes(searchTerm) ||
                        scan.description.toLowerCase().includes(searchTerm) ||
                        scan.details.toLowerCase().includes(searchTerm) ||
                        scan.category.toLowerCase().includes(searchTerm)
                    )
                );
                renderScans(filtered);
                e.target.classList.add('bg-yellow-100', 'active');
            }
        }
    });

    // ================== ADD TO CART ==================
    scanList.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (btn) {
        const scanId = parseInt(btn.dataset.id);
        console.log('Adding scan ID:', scanId);
        
        const scan = scans.find(s => s.id === scanId);
        if (!scan || !scan.stock.includes('Available')) {
            console.log('Scan not found or not available:', scan);
            return;
        }
        
        console.log('Found scan:', scan);
        console.log('Current cart before adding:', cartItems);
        
        const existing = cartItems.find(item => item.id === scanId);
        if (existing) {
            console.log('Scan already in cart, incrementing quantity');
            existing.quantity++;
        } else {
            console.log('Adding new scan to cart');
            cartItems.push({ 
                id: scanId,
                name: scan.name,
                category: scan.category,
                description: scan.description,
                price: scan.price,
                originalPrice: scan.originalPrice,
                stock: scan.stock,
                details: scan.details,
                delivery: scan.delivery,
                quantity: 1 
            });
        }
        
        console.log('Cart after adding:', cartItems);
        console.log('Cart length:', cartItems.length);
        
        updateCartCount();
        showPopup(`${scan.name} added to cart!`);
    }
});

    // ================== UPDATE / REMOVE IN CART ==================
    cartItemsContainer.addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);
    console.log('Cart interaction with item ID:', id);
    console.log('Current cart before update:', cartItems);
    
    if (e.target.classList.contains('remove-from-cart-btn')) {
        console.log('Removing item from cart');
        cartItems = cartItems.filter(item => item.id !== id);
    } else if (e.target.classList.contains('update-quantity-btn')) {
        const action = e.target.dataset.action;
        const item = cartItems.find(i => i.id === id);
        console.log('Updating quantity:', action, 'for item:', item);
        
        if (item) {
            if (action === 'increment') {
                item.quantity++;
            } else if (action === 'decrement' && item.quantity > 1) {
                item.quantity--;
            }
        }
    }
    
    console.log('Cart after update:', cartItems);
    console.log('Cart length:', cartItems.length);
    
    renderCartItems();
    updateCartCount();
});

    // ================== CART MODAL OPEN/CLOSE ==================
    cartButton.addEventListener('click', () => {
        cartModal.classList.remove('hidden');
        renderCartItems();
    });
    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.add('hidden');
    });
    cartModal.addEventListener('click', (e) => {
        if (e.target.id === 'cart-modal') cartModal.classList.add('hidden');
    });

    // ================== CHECKOUT BUTTON ==================
    checkoutBtn.addEventListener('click', () => {
    console.log('Checkout clicked. Current cart items:', cartItems);
    
    if (cartItems.length === 0) {
        showPopup('Your cart is empty!');
        return;
    }
    
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // FIXED: Clear any existing data first
    localStorage.removeItem('selectedScans');
    localStorage.removeItem('cartTotal');
    localStorage.removeItem('appointmentData');
    
    // Store cart total
    localStorage.setItem('cartTotal', totalAmount.toFixed(2));
    
    // FIXED: Create clean selectedScans array without duplicates
    const selectedScans = cartItems
        .filter(item => item && item.id) // Ensure valid items
        .map(item => ({
            id: parseInt(item.id),
            scanName: item.name,
            category: item.category,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity) || 1,
            description: item.description,
            details: item.details
        }));
    
    console.log('Selected scans to store:', selectedScans);
    console.log('Array length:', selectedScans.length);
    
    // Store the scans data
    localStorage.setItem('selectedScans', JSON.stringify(selectedScans));
    
    // FIXED: Verify storage immediately
    const storedData = localStorage.getItem('selectedScans');
    const parsedData = JSON.parse(storedData);
    console.log('Verification - Stored data length:', parsedData.length);
    console.log('Verification - Stored data:', parsedData);
    
    // Close cart modal
    cartModal.classList.add('hidden');
    
    // Show success message
    showPopup(`Proceeding to book ${selectedScans.length} scan${selectedScans.length > 1 ? 's' : ''}!`);
    
    // Redirect to appointment booking page
    window.location.href = 'appointment.html';
});

    // ================== NAVIGATION ACTIVE STATE ==================
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // ================== POPUP NOTIFICATION ==================
    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'fixed bottom-20 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg';
        popup.textContent = message;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.remove();
        }, 2000);
    }

    // ================== INITIAL RENDER ==================
    renderScans(scans);
    updateCartCount();
});
