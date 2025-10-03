document.addEventListener('DOMContentLoaded', () => {
    // ================== MEDICINE DATA ==================
    const medicines = [
        {
            id: 1,
            name: 'Paracetamol 500mg',
            category: 'otc',
            description: 'Pain & Fever Relief',
            price: 29.99,
            originalPrice: 35.00,
            stock: 'In Stock',
            details: '10 Tablets per strip, Manufactured by: ABC Pharma',
            delivery: 'Delivery by tomorrow'
        },
        {
            id: 2,
            name: 'Atorvastatin 20mg',
            category: 'prescription',
            description: 'Cholesterol Control',
            price: 249.99,
            originalPrice: 299.00,
            stock: 'Rx Required',
            details: '5 Tablets per strip, Manufactured by: XYZ Pharma',
            delivery: 'Delivery in 2 days'
        },
        {
            id: 3,
            name: 'Vitamin C 500mg',
            category: 'wellness',
            description: 'Immunity Booster',
            price: 199.99,
            originalPrice: 249.00,
            stock: 'In Stock',
            details: '30 Capsules, Manufactured by: NutriWell',
            delivery: 'Delivery by today'
        },
        {
            id: 4,
            name: 'Ibuprofen 200mg',
            category: 'otc',
            description: 'Anti-inflammatory',
            price: 45.50,
            originalPrice: 50.00,
            stock: 'In Stock',
            details: '15 Tablets per strip, Manufactured by: Generic Drugs Inc.',
            delivery: 'Delivery by tomorrow'
        },
        {
            id: 5,
            name: 'Omeprazole 20mg',
            category: 'prescription',
            description: 'Acid Reflux Relief',
            price: 150.00,
            originalPrice: 180.00,
            stock: 'Rx Required',
            details: '7 Capsules per strip, Manufactured by: GastroCare Solutions',
            delivery: 'Delivery in 3 days'
        },
        {
            id: 6,
            name: 'Dolo 650mg',
            category: 'otc',
            description: 'Cold & Fever',
            price: 120.00,
            originalPrice: 200.00,
            stock: 'In Stock',
            details: '10 Capsules per strip, Manufactured by: Dr.Reddys Laboratories',
            delivery: 'Delivery by Tomorrow'
        },
        {
            id: 7,
            name: 'Augmentin 625mg',
            category: 'prescription',
            description: 'Broad-spectrum Antibiotic',
            price: 260.00,
            originalPrice: 320.00,
            stock: 'Rx Required',
            details: '6 Tablets per strip, Manufactured by: GlaxoSmithKline',
            delivery: 'Delivery in 2 days'
        },
        {
            id: 8,
            name: 'Cetirizine 10mg',
            category: 'otc',
            description: 'Anti-Allergy',
            price: 30.00,
            originalPrice: 45.00,
            stock: 'In Stock',
            details: '10 Tablets per strip, Manufactured by: Sun Pharma',
            delivery: 'Delivery by Tomorrow'
        },
        {
            id: 9,
            name: 'Metformin 500mg',
            category: 'prescription',
            description: 'Diabetes Control',
            price: 55.00,
            originalPrice: 70.00,
            stock: 'Rx Required',
            details: '15 Tablets per strip, Manufactured by: Abbott',
            delivery: 'Delivery in 2 days'
        },
        {
            id: 10,
            name: 'Rabeprazole 20mg',
            category: 'prescription',
            description: 'Acid Reflux Relief',
            price: 70.00,
            originalPrice: 90.00,
            stock: 'Rx Required',
            details: '7 Capsules per strip, Manufactured by: Cipla',
            delivery: 'Delivery in 3 days'
        },
        {
            id: 11,
            name: 'Amoxicillin 500mg',
            category: 'prescription',
            description: 'Bacterial Infection',
            price: 90.00,
            originalPrice: 120.00,
            stock: 'Rx Required',
            details: '10 Capsules per strip, Manufactured by: Pfizer',
            delivery: 'Delivery in 2 days'
        },
        {
            id: 12,
            name: 'Montelukast 10mg',
            category: 'prescription',
            description: 'Asthma & Allergies',
            price: 110.00,
            originalPrice: 150.00,
            stock: 'Rx Required',
            details: '10 Tablets per strip, Manufactured by: Lupin',
            delivery: 'Delivery in 2 days'
        },
        {
            id: 13,
            name: 'Aspirin 75mg',
            category: 'otc',
            description: 'Heart & Pain Relief',
            price: 45.00,
            originalPrice: 60.00,
            stock: 'In Stock',
            details: '14 Tablets per strip, Manufactured by: Zydus Cadila',
            delivery: 'Delivery by Tomorrow'
        },
        {
            id: 14,
            name: 'Pantoprazole 40mg',
            category: 'prescription',
            description: 'Gastric Protection',
            price: 100.00,
            originalPrice: 130.00,
            stock: 'Rx Required',
            details: '10 Tablets per strip, Manufactured by: Torrent Pharma',
            delivery: 'Delivery in 3 days'
        },
        {
            id: 15,
            name: 'Azithromycin 500mg',
            category: 'prescription',
            description: 'Antibiotic for Infection',
            price: 150.00,
            originalPrice: 190.00,
            stock: 'Rx Required',
            details: '3 Tablets per strip, Manufactured by: Alembic',
            delivery: 'Delivery in 2 days'
        },
        {
            id: 16,
            name: 'Zincovit Tablet',
            category: 'wellness',
            description: 'Multivitamin Supplement',
            price: 110.00,
            originalPrice: 150.00,
            stock: 'In Stock',
            details: '15 Tablets per strip, Manufactured by: Apex Laboratories',
            delivery: 'Delivery by Today'
        },
        {
            id: 17,
            name: 'Levocetirizine 5mg',
            category: 'otc',
            description: 'Allergy Relief',
            price: 55.00,
            originalPrice: 70.00,
            stock: 'In Stock',
            details: '10 Tablets per strip, Manufactured by: Glenmark',
            delivery: 'Delivery by Tomorrow'
        },
        {
            id: 18,
            name: 'Diclofenac 50mg',
            category: 'otc',
            description: 'Pain & Inflammation',
            price: 40.00,
            originalPrice: 55.00,
            stock: 'In Stock',
            details: '10 Tablets per strip, Manufactured by: Mankind Pharma',
            delivery: 'Delivery by Tomorrow'
        },
        {
            id: 19,
            name: 'Hydroxychloroquine 200mg',
            category: 'prescription',
            description: 'Antimalarial / Autoimmune',
            price: 150.00,
            originalPrice: 185.00,
            stock: 'Rx Required',
            details: '10 Tablets per strip, Manufactured by: Ipca Laboratories',
            delivery: 'Delivery in 3 days'
        },
        {
            id: 20,
            name: 'Fluconazole 150mg',
            category: 'prescription',
            description: 'Antifungal',
            price: 120.00,
            originalPrice: 140.00,
            stock: 'Rx Required',
            details: '1 Tablet per strip, Manufactured by: Cipla',
            delivery: 'Delivery in 2 days'
        },
        {
            id: 21,
            name: 'Levothyroxine 50mcg',
            category: 'prescription',
            description: 'Thyroid Hormone',
            price: 70.00,
            originalPrice: 95.00,
            stock: 'Rx Required',
            details: '15 Tablets per strip, Manufactured by: Sun Pharma',
            delivery: 'Delivery in 3 days'
        },
        {
            id: 22,
            name: 'Salbutamol Inhaler 100mcg',
            category: 'prescription',
            description: 'Asthma Relief',
            price: 250.00,
            originalPrice: 300.00,
            stock: 'Rx Required',
            details: '200 Doses, Manufactured by: Cipla',
            delivery: 'Delivery in 2 days'
        },
        {
            id: 23,
            name: 'Nexium 40mg',
            category: 'prescription',
            description: 'Gastroesophageal Reflux Disease',
            price: 180.00,
            originalPrice: 210.00,
            stock: 'Rx Required',
            details: '14 Capsules per strip, Manufactured by: AstraZeneca',
            delivery: 'Delivery in 3 days'
        },
        {
            id: 24,
            name: 'Multivitamin Syrup',
            category: 'wellness',
            description: 'Vitamin & Mineral Supplement',
            price: 90.00,
            originalPrice: 110.00,
            stock: 'In Stock',
            details: '100ml Bottle, Manufactured by: Patanjali',
            delivery: 'Delivery by Today'
        },
        {
            id: 25,
            name: 'Calcium Carbonate 500mg',
            category: 'wellness',
            description: 'Calcium Supplement',
            price: 80.00,
            originalPrice: 105.00,
            stock: 'In Stock',
            details: '30 Tablets, Manufactured by: Himalaya',
            delivery: 'Delivery by Today'
        },
        {
            id: 26,
            name: 'Cough Syrup Benadryl',
            category: 'otc',
            description: 'Cough Relief',
            price: 60.00,
            originalPrice: 80.00,
            stock: 'In Stock',
            details: '100ml Bottle, Manufactured by: Johnson & Johnson',
            delivery: 'Delivery by Tomorrow'
        },
        {
            id: 27,
            name: 'Loratadine 10mg',
            category: 'otc',
            description: 'Antihistamine',
            price: 50.00,
            originalPrice: 65.00,
            stock: 'In Stock',
            details: '10 Tablets per strip, Manufactured by: Pfizer',
            delivery: 'Delivery by Tomorrow'
        },
        {
            id: 28,
            name: 'Clindamycin 300mg',
            category: 'prescription',
            description: 'Antibiotic',
            price: 140.00,
            originalPrice: 170.00,
            stock: 'Rx Required',
            details: '10 Capsules per strip, Manufactured by: Torrent Pharma',
            delivery: 'Delivery in 2 days'
        },
        {
            id: 29,
            name: 'Vitamin D3 1000IU',
            category: 'wellness',
            description: 'Vitamin D Supplement',
            price: 110.00,
            originalPrice: 130.00,
            stock: 'In Stock',
            details: '30 Capsules, Manufactured by: Nutrilite',
            delivery: 'Delivery by Today'
        },
        {
            id: 30,
            name: 'Prednisolone 20mg',
            category: 'prescription',
            description: 'Steroid for Inflammation',
            price: 130.00,
            originalPrice: 160.00,
            stock: 'Rx Required',
            details: '10 Tablets per strip, Manufactured by: Lupin',
            delivery: 'Delivery in 3 days'
        },
        {
            id: 31,
            name: 'Paracetamol Syrup',
            category: 'otc',
            description: 'Pain & Fever Relief',
            price: 40.00,
            originalPrice: 55.00,
            stock: 'In Stock',
            details: '60ml Bottle, Manufactured by: Sanofi',
            delivery: 'Delivery by Tomorrow'
        },
        {
            id: 32,
            name: 'Omega 3 Fish Oil Capsules',
            category: 'wellness',
            description: 'Heart Health Supplement',
            price: 220.00,
            originalPrice: 270.00,
            stock: 'In Stock',
            details: '30 Capsules, Manufactured by: HealthAid',
            delivery: 'Delivery by Today'
        }
    ];

    // ================== DOM ELEMENTS ==================
    const medicineList = document.querySelector('.medicine-list-container');
    const searchInput = document.querySelector('input[placeholder="Search medicines, symptoms or categories"]');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    const cartButton = document.getElementById('cart-button');
    const cartCountSpan = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalSpan = document.getElementById('cart-total');
    const navLinks = document.querySelectorAll('.nav-link');
    const checkoutBtn = document.getElementById('checkout-btn');

    // ================== CART STATE & LOCALSTORAGE ==================
    let cartItems = JSON.parse(localStorage.getItem('medicineCart')) || [];

    // ================== SAVE CART TO LOCALSTORAGE ==================
    function saveCartToLocalStorage() {
        localStorage.setItem('medicineCart', JSON.stringify(cartItems));
        
        // Calculate and save total for payments page
        const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        localStorage.setItem('cartTotal', cartTotal.toFixed(2));
        
        // Save order details for payment summary
        const orderSummary = {
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                originalPrice: item.originalPrice,
                quantity: item.quantity,
                description: item.description,
                details: item.details,
                totalPrice: (item.price * item.quantity)
            })),
            itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: cartTotal.toFixed(2),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
    }

    // ================== UPDATE CART COUNT ==================
    function updateCartCount() {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = `${totalItems} Items`;
        
        // Update mobile cart count
        const cartCountMobile = document.getElementById('cart-count-mobile');
        if (cartCountMobile) {
            cartCountMobile.textContent = totalItems;
        }
    }

    // ================== RENDER MEDICINES ==================
    function renderMedicines(medicineArray) {
        medicineList.innerHTML = '';
        if (medicineArray.length === 0) {
            medicineList.innerHTML = '<p class="col-span-full text-center text-gray-500">No medicines found.</p>';
            return;
        }

        medicineArray.forEach(med => {
            const stockStatusColor = med.stock === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            const medicineCard = document.createElement('div');
            medicineCard.className = 'medicine-card card-gradient rounded-lg shadow-md overflow-hidden transition duration-300';
            medicineCard.innerHTML = `
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">${med.name}</h3>
                            <p class="text-sm text-gray-600">${med.description}</p>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatusColor}">${med.stock}</span>
                    </div>
                    
                    <div class="mt-4">
                        <p class="text-sm text-gray-700 mb-2">${med.details.split(',')[0]}</p>
                        <p class="text-sm text-gray-700">${med.details.split(',')[1] || ''}</p>
                    </div>
                    
                    <div class="mt-6 flex items-center justify-between">
                        <div>
                            <span class="text-2xl font-bold text-gray-800">₹${med.price.toFixed(2)}</span>
                            <span class="ml-2 text-sm line-through text-gray-500">₹${med.originalPrice.toFixed(2)}</span>
                        </div>
                        <button class="add-to-cart-btn px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition duration-300" data-id="${med.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
                <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span class="text-xs text-gray-600">${med.delivery}</span>
                    <button class="view-details-btn text-xs text-yellow-600 hover:text-yellow-800 font-medium" data-id="${med.id}">View Details</button>
                </div>
            `;
            medicineList.appendChild(medicineCard);
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
                        <p class="text-sm text-gray-600">₹${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="update-quantity-btn px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300" data-id="${item.id}" data-action="decrement">-</button>
                        <span class="font-medium text-gray-800 px-2">${item.quantity}</span>
                        <button class="update-quantity-btn px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300" data-id="${item.id}" data-action="increment">+</button>
                        <button class="remove-from-cart-btn text-red-500 hover:text-red-700 px-2" data-id="${item.id}">&times;</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemEl);
            });
        }
        cartTotalSpan.textContent = `₹${total.toFixed(2)}`;
    }

    // ================== SEARCH FUNCTION ==================
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filtered = medicines.filter(med =>
            med.name.toLowerCase().includes(searchTerm) ||
            med.description.toLowerCase().includes(searchTerm) ||
            med.details.toLowerCase().includes(searchTerm) ||
            med.category.toLowerCase().includes(searchTerm)
        );
        renderMedicines(filtered);
    });

    // ================== FILTER FUNCTION ==================
    document.querySelector('.filter-buttons').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white', 'active');
                btn.classList.add('bg-white', 'bg-opacity-80', 'text-gray-700', 'hover:bg-blue-100');
            });
            const categoryMap = {
                'All Medicines': 'all',
                'Prescription': 'prescription',
                'OTC': 'otc',
                'Chronic Conditions': 'chronic',
                'Wellness': 'wellness'
            };
            const category = categoryMap[e.target.textContent.trim()];
            const filtered = category === 'all' ? medicines : medicines.filter(med => med.category === category);
            renderMedicines(filtered);
            e.target.classList.add('bg-blue-600', 'text-white', 'active');
            e.target.classList.remove('bg-white', 'bg-opacity-80', 'text-gray-700', 'hover:bg-blue-100');
        }
    });

    // ================== ADD TO CART ==================
    medicineList.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn) {
            const medicineId = parseInt(btn.dataset.id);
            const med = medicines.find(m => m.id === medicineId);
            if (!med) return;

            const existing = cartItems.find(item => item.id === medicineId);
            if (existing) {
                existing.quantity++;
            } else {
                cartItems.push({ ...med, quantity: 1 });
            }
            
            saveCartToLocalStorage();
            updateCartCount();
            showPopup(`${med.name} added to cart!`);
        }
    });

    // ================== VIEW DETAILS ==================
    medicineList.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-details-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            const medicineId = parseInt(btn.dataset.id);
            const med = medicines.find(m => m.id === medicineId);
            if (med) {
                showMedicineModal(med);
            }
        }
    });

    // ================== UPDATE / REMOVE IN CART ==================
    cartItemsContainer.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('remove-from-cart-btn')) {
            cartItems = cartItems.filter(item => item.id !== id);
            showPopup('Item removed from cart');
        } else if (e.target.classList.contains('update-quantity-btn')) {
            const action = e.target.dataset.action;
            const item = cartItems.find(i => i.id === id);
            if (item) {
                if (action === 'increment') {
                    item.quantity++;
                } else if (action === 'decrement' && item.quantity > 1) {
                    item.quantity--;
                } else if (action === 'decrement' && item.quantity === 1) {
                    // Remove item if quantity becomes 0
                    cartItems = cartItems.filter(i => i.id !== id);
                    showPopup('Item removed from cart');
                }
            }
        }
        
        saveCartToLocalStorage();
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
        if (e.target.id === 'cart-modal') {
            cartModal.classList.add('hidden');
        }
    });

    // ================== CHECKOUT BUTTON ==================
    checkoutBtn.addEventListener('click', () => {
        if (cartItems.length === 0) {
            showPopup('Your cart is empty!');
            return;
        }
        
        // Final save before checkout
        saveCartToLocalStorage();
        
        // Redirect to payments page
        window.location.href = 'payments.html';
    });

    // ================== NAVIGATION ACTIVE STATE ==================
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // ================== MEDICINE MODAL ==================
    function showMedicineModal(medicine) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 transform transition-all max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">Medicine Profile</h2>
                    <button class="text-gray-500 hover:text-gray-700 close-modal">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="text-center mb-6">
                    <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">${medicine.name}</h3>
                    <p class="text-blue-600 font-semibold">${medicine.description}</p>
                    <div class="flex items-center justify-center mt-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${medicine.stock === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${medicine.stock}</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-2 font-medium">Price</p>
                        <p class="font-bold text-green-600 text-xl">₹${medicine.price.toFixed(2)}</p>
                        <p class="text-sm text-gray-500 line-through">₹${medicine.originalPrice.toFixed(2)}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-2 font-medium">Category</p>
                        <p class="text-sm text-gray-800 capitalize">${medicine.category}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-2 font-medium">Details</p>
                        <p class="text-sm text-gray-800 leading-relaxed">${medicine.details}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-2 font-medium">Delivery</p>
                        <p class="text-sm text-gray-800 leading-relaxed">${medicine.delivery}</p>
                    </div>
                </div>
                
                <button class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold add-from-modal" data-id="${medicine.id}">
                    Add to Cart
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.add-from-modal').addEventListener('click', () => {
            const medicineId = parseInt(modal.querySelector('.add-from-modal').dataset.id);
            const med = medicines.find(m => m.id === medicineId);
            if (med) {
                const existing = cartItems.find(item => item.id === medicineId);
                if (existing) {
                    existing.quantity++;
                } else {
                    cartItems.push({ ...med, quantity: 1 });
                }
                
                saveCartToLocalStorage();
                updateCartCount();
                showPopup(`${med.name} added to cart!`);
            }
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // ================== POPUP NOTIFICATION ==================
    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'fixed bottom-20 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        popup.textContent = message;
        document.body.appendChild(popup);
        
        // Add animation
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            popup.style.transition = 'all 0.3s ease';
            popup.style.opacity = '1';
            popup.style.transform = 'translateY(0)';
        }, 10);
        
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transform = 'translateY(-20px)';
            setTimeout(() => popup.remove(), 300);
        }, 2500);
    }

    // ================== INITIALIZE ON PAGE LOAD ==================
    function initializePage() {
        // Load cart from localStorage
        cartItems = JSON.parse(localStorage.getItem('medicineCart')) || [];
        
        // Render initial content
        renderMedicines(medicines);
        updateCartCount();
        
        // Set default filter to "All Medicines"
        const allMedicinesBtn = document.querySelector('.filter-buttons button');
        if (allMedicinesBtn) {
            allMedicinesBtn.classList.add('bg-blue-600', 'text-white', 'active');
            allMedicinesBtn.classList.remove('bg-white', 'bg-opacity-80', 'text-gray-700', 'hover:bg-blue-100');
        }
    }

    // ================== MOBILE MENU FUNCTIONALITY ==================
    function initializeMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
    }

    // ================== INITIAL RENDER ==================
    initializePage();
    initializeMobileMenu();
});