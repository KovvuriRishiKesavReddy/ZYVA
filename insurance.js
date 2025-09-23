document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://zyva-healthcare-osrq.onrender.com'; // In case we switch to a real API

    const insurancePlansData = [
        {
            id: 'HI001',
            name: 'Family Health Optima',
            provider: 'Star Health',
            type: 'Health',
            coverage: '10,00,000',
            premium: 15000,
            termYears: 13,
            features: ['In-patient Hospitalization', 'Pre & Post Hospitalization', 'Day Care Treatment'],
            logo: 'https://www.shriramlife.com/wp-content/uploads/2021/06/star-health-insurance-logo.png'
        },
        {
            id: 'LI001',
            name: 'Tech Term Plan',
            provider: 'ICICI Prudential',
            type: 'Life',
            coverage: '1,00,00,000',
            premium: 12000,
            termYears: 30,
            features: ['Life Cover till 99 years', 'Tax Benefits', 'Multiple Payout Options'],
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Prudential_Life_Insurance_logo.svg/2560px-ICICI_Prudential_Life_Insurance_logo.svg.png'
        },
        {
            id: 'VI001',
            name: 'Car Secure',
            provider: 'HDFC Ergo',
            type: 'Vehicle',
            coverage: 'As per IDV',
            premium: 8500,
            termYears: 1,
            features: ['Own Damage Cover', 'Third-Party Liability', 'Zero Depreciation Add-on'],
            logo: 'https://companieslogo.com/img/orig/HDFCERGOGI.NS-26e31f47.png?t=1648443722'
        },
        {
            id: 'TI001',
            name: 'Travel Guard',
            provider: 'Bajaj Allianz',
            type: 'Travel',
            coverage: '50,000 USD',
            premium: 2500,
            termYears: 'Per Trip',
            features: ['Medical Expenses', 'Trip Cancellation', 'Baggage Loss/Delay'],
            logo: 'https://cdn.iconscout.com/icon/free/png-256/free-bajaj-allianz-3441548-2874291.png'
        },
        {
            id: 'HI002',
            name: 'ReAssure 2.0',
            provider: 'Niva Bupa',
            type: 'Health',
            coverage: '20,00,000',
            premium: 18000,
            termYears: 17,
            features: ['Unlimited Reinstatement', 'No Claim Bonus', 'Annual Health Check-up'],
            logo: 'https://media.licdn.com/dms/image/D560BAQG4w222x_oTqA/company-logo_200_200/0/1699945039863/niva_bupa_logo?e=2147483647&v=beta&t=272_w886i1l-3A5w-31-0X-6-s_o-Y4'
        },
        {
            id: 'LI002',
            name: 'Smart Term Plan',
            provider: 'Max Life Insurance',
            type: 'Life',
            coverage: '1,50,00,000',
            premium: 14000,
            termYears: 25,
            features: ['Return of Premium Option', 'Accidental Death Benefit', 'Critical Illness Rider'],
            logo: 'https://companieslogo.com/img/orig/MAXFIN.NS-60845fbb.png?t=1604239821'
        },
        {
            id: 'HI003',
            name: 'Activ Health Platinum',
            provider: 'Aditya Birla Health',
            type: 'Health',
            coverage: '50,00,000',
            premium: 22000,
            termYears: 1,
            features: ['100% HealthReturns™', 'Chronic Management Program', 'Super NCB'],
            logo: 'https://www.adityabirlacapital.com/healthinsurance/assets/images/ab-health-logo.png'
        }
    ];

    const container = document.querySelector('.insurance-list-container');
    const cartButton = document.getElementById('cart-button');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    const searchInput = document.getElementById('insurance-search');

    let cart = JSON.parse(localStorage.getItem('insuranceCart')) || [];
    let currentFilter = 'All Plans';

    function renderPlans(plans) {
        if (!container) return;
        container.innerHTML = '';
        if (plans.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No insurance plans found matching your criteria.</p>';
            return;
        }

        plans.forEach(plan => {
            const isInCart = cart.some(item => item.id === plan.id);
            const card = document.createElement('div');
            // Using classes similar to scan.js for consistency
            card.className = 'scan-card card-gradient rounded-lg shadow-md overflow-hidden transition duration-300';
            card.innerHTML = `
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-start">
                            <img src="${plan.logo}" alt="${plan.provider} Logo" class="h-12 w-12 object-contain mr-4 bg-white p-1 rounded-md shadow-sm">
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">${plan.name}</h3>
                                <p class="text-sm text-gray-600 font-medium">${plan.provider}</p>
                            </div>
                        </div>
                        <span class="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">${plan.type}</span>
                    </div>

                    <div class="mt-4 mb-4">
                        <p class="text-sm font-medium text-gray-800 mb-2">Key Features:</p>
                        <ul class="text-sm text-gray-700 space-y-1 list-disc list-inside">
                            ${plan.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="mt-6 flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Annual Premium</p>
                            <span class="text-2xl font-bold text-green-600">₹${plan.premium.toLocaleString('en-IN')}</span>
                            ${plan.termYears ? `
                                <p class="text-xs text-gray-500 mt-1">
                                    ${typeof plan.termYears === 'number' ? `for ${plan.termYears} year${plan.termYears > 1 ? 's' : ''}` : `(${plan.termYears})`}
                                </p>
                            ` : ''}
                        </div>
                        <button 
                            data-id="${plan.id}" 
                            class="add-to-cart-btn px-4 py-2 rounded-md text-white font-medium transition duration-300 ${isInCart ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}"
                            ${isInCart ? 'disabled' : ''}
                        >
                            ${isInCart ? 'Added to Cart' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
                <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span class="text-xs text-gray-600"><strong>Coverage:</strong> ₹${plan.coverage}</span>
                    <a href="#" class="view-details-btn text-xs text-blue-600 hover:text-blue-800 font-medium" data-id="${plan.id}">Learn More</a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function updateCartUI() {
        cartCount.textContent = `${cart.length} Item${cart.length !== 1 ? 's' : ''}`;
        renderCartItems();
        const total = cart.reduce((sum, item) => sum + item.premium, 0);
        cartTotalEl.textContent = `₹${total.toLocaleString('en-IN')}.00`;
    }

    function addToCart(planId) {
        if (cart.some(item => item.id === planId)) {
            showNotification('This plan is already in your cart.', 'info');
            return;
        }
        const planToAdd = insurancePlansData.find(p => p.id === planId);
        if (planToAdd) {
            cart.push(planToAdd);
            localStorage.setItem('insuranceCart', JSON.stringify(cart));
            updateCartUI();
            filterAndRenderPlans(); // Re-render to update button state
            showNotification(`${planToAdd.name} added to cart!`, 'success');
        }
    }

    function removeFromCart(planId) {
        cart = cart.filter(item => item.id !== planId);
        localStorage.setItem('insuranceCart', JSON.stringify(cart));
        updateCartUI();
        filterAndRenderPlans(); // Re-render to update button state
        showNotification('Plan removed from cart.', 'info');
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-gray-500">Your cart is empty.</p>';
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                    <p class="font-semibold text-gray-800">${item.name}</p>
                    <p class="text-sm text-gray-500">${item.provider}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-800">₹${item.premium.toLocaleString('en-IN')}</p>
                    <button data-id="${item.id}" class="remove-from-cart-btn text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    function handleCheckout() {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        const total = cart.reduce((sum, item) => sum + item.premium, 0);
        localStorage.setItem('insuranceTotal', total);
        // The cart is already in localStorage as 'insuranceCart'
        window.location.href = 'insurance_payment.html';
    }

    function filterAndRenderPlans() {
        const searchTerm = searchInput.value.toLowerCase();
        let filteredPlans = insurancePlansData;

        // Filter by category
        if (currentFilter !== 'All Plans') {
            filteredPlans = filteredPlans.filter(plan => plan.type === currentFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filteredPlans = filteredPlans.filter(plan => 
                plan.name.toLowerCase().includes(searchTerm) ||
                plan.provider.toLowerCase().includes(searchTerm) ||
                plan.type.toLowerCase().includes(searchTerm)
            );
        }

        renderPlans(filteredPlans);
    }

    function showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification fixed top-20 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
          type === 'success' ? 'bg-green-500 text-white' : 
          type === 'error' ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        }`;
        notification.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.style.transform = 'translateX(120%)';
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Event Listeners
    container.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(e.target.dataset.id);
        }
    });

    cartButton.addEventListener('click', () => cartModal.classList.remove('hidden'));
    closeCartBtn.addEventListener('click', () => cartModal.classList.add('hidden'));
    cartModal.addEventListener('click', e => {
        if (e.target === cartModal) {
            cartModal.classList.add('hidden');
        }
    });

    cartItemsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('remove-from-cart-btn')) {
            removeFromCart(e.target.dataset.id);
        }
    });

    checkoutBtn.addEventListener('click', handleCheckout);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active', 'bg-yellow-100'));
            button.classList.add('active', 'bg-yellow-100');
            currentFilter = button.textContent;
            filterAndRenderPlans();
        });
    });

    searchInput.addEventListener('input', filterAndRenderPlans);

    // Initial Load
    filterAndRenderPlans();
    updateCartUI();
});