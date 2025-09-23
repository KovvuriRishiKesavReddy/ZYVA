document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000'; // Replace with your actual API base URL
    const policiesContainer = document.getElementById('policies-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const emptyState = document.getElementById('empty-state');
    const authWarning = document.getElementById('auth-warning');

    // Auth functions
    function getAuthToken() { return localStorage.getItem('authToken') || sessionStorage.getItem('authToken'); }
    function getCurrentUser() { const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'); return userStr ? JSON.parse(userStr) : null; }
    function isLoggedIn() { return getAuthToken() && getCurrentUser(); }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        // Check if the date is valid before formatting
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    }

    function createPolicyCard(policy) {
        const endDate = policy.policyEndDate ? new Date(policy.policyEndDate) : null;
        const policyStatus = endDate && !isNaN(endDate) && endDate > new Date() ? 'Active' : 'Expired';
        const statusClass = policyStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const totalAmount = policy.policySummary?.totalAmount || 0;
        const coveredPlans = Array.isArray(policy.policies) ? policy.policies : [];
        return `
            <div class="policy-card p-6 border border-gray-200 rounded-lg bg-white bg-opacity-90 shadow-sm">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-800 mb-1">Policy #${policy.policyId}</h2>
                        <p class="text-sm text-gray-500">Purchased on: ${formatDate(policy.createdAt)}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">${policyStatus}</span>
                        <p class="text-lg font-bold text-blue-600 mt-1">₹${totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 border-t pt-4 mt-4">
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Policy Holder</p>
                        <p class="text-sm font-medium text-gray-700">${policy.customerInfo?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Policy Period</p>
                        <p class="text-sm font-medium text-gray-700">${formatDate(policy.policyStartDate)} to ${formatDate(policy.policyEndDate)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide">Transaction ID</p>
                        <p class="text-sm font-mono text-gray-700">${policy.transactionId}</p>
                    </div>
                </div>

                <div class="border-t pt-4">
                    <h3 class="text-sm font-semibold text-gray-700 mb-3">Covered Plans:</h3>
                    <div class="space-y-2">
                        ${coveredPlans.map(plan => `
                            <div class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-800">${plan.name}</p>
                                    <p class="text-xs text-gray-500">${plan.provider}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm text-gray-600">Coverage: ₹${plan.coverage || 'N/A'}</p>
                                    <p class="text-sm font-semibold text-gray-800">Premium: ₹${plan.premium.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    async function loadPolicies() {
        if (!isLoggedIn()) {
            authWarning.style.display = 'block';
            policiesContainer.style.display = 'none';
            emptyState.style.display = 'none';
            loadingIndicator.style.display = 'none';
            return;
        }

        try {
            loadingIndicator.style.display = 'block';
            policiesContainer.style.display = 'none';
            emptyState.style.display = 'none';

            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/insurances/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                window.location.href = 'login_page.html';
                return;
            }
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const result = await response.json();
            const policies = result.success ? result.policies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

            loadingIndicator.style.display = 'none';
            if (policies.length === 0) {
                emptyState.style.display = 'block';
                policiesContainer.style.display = 'none';
            } else {
                policiesContainer.innerHTML = policies.map(createPolicyCard).join('');
                policiesContainer.style.display = 'block';
                emptyState.style.display = 'none';
            }
        } catch (error) {
            console.error("Error loading policies:", error);
            loadingIndicator.style.display = 'none';
            policiesContainer.innerHTML = `<div class="text-center text-red-500 p-4 bg-red-50 rounded-lg">Failed to load policies. Please check the console for more details.</div>`;
            policiesContainer.style.display = 'block';
            emptyState.style.display = 'none';
        }
    }

    function downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function downloadPolicy(policyId) {
        try {
            // Fetch policy details from the server
            const token = getAuthToken();
            
            // Construct the URL correctly
            const response = await fetch(`${API_BASE_URL}/api/insurances/policy/${policyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                // Log the status and status text for better debugging
                throw new Error(`Failed to fetch policy details: ${response.status}`);
            }
            const policyDetails = await response.json();

            if (!policyDetails.success) {
                throw new Error(policyDetails.message || 'Failed to fetch policy details');
            }

            // Create a text file with policy details (you can customize this)
            const text = `Policy ID: ${policyDetails.policyId}\nPlan Name: ${policyDetails.planName}\nStart Date: ${policyDetails.policyStartDate}\nEnd Date: ${policyDetails.policyEndDate}\nCoverage Amount: ${policyDetails.policySummary.totalAmount}`;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            // Trigger the download
            downloadFile(url, `policy-${policyId}.txt`);
        } catch (error) {
            console.error("Download error:", error);
            alert(`Failed to download policy: ${error.message}`);
            // Optionally, display a user-friendly error message in the UI
        }
    }

    // Event listener for download buttons (using event delegation)
    policiesContainer.addEventListener('click', (e) => {
        const downloadBtn = e.target.closest('.download-policy-btn');
        if (downloadBtn) {
            const policyId = downloadBtn.dataset.policyId;
            e.preventDefault();
            downloadPolicy(policyId);
        }
    });

    loadPolicies();
});
