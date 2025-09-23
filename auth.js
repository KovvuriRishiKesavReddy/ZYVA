(function() {
    function getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }
    
    function getCurrentUser() {
        const u = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        return u ? JSON.parse(u) : null;
    }
    
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenu = document.getElementById('userMenu');
    const menuName = document.getElementById('menuName');
    const menuEmail = document.getElementById('menuEmail');
    const logoutBtn = document.getElementById('logout-btn');
    
    let currentUser = getCurrentUser();
    
    function getInitials() {
        if (currentUser && (currentUser.firstName || currentUser.lastName)) {
            const f = (currentUser.firstName || '').trim().charAt(0);
            const l = (currentUser.lastName || '').trim().charAt(0);
            return ((f + l) || f || l || 'U').toUpperCase();
        }
        const name = currentUser?.name || currentUser?.email || '';
        const parts = name.trim().split(/\s+/);
        const first = parts[0]?.[0] || '';
        const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
        return (first + last).toUpperCase() || first.toUpperCase() || 'U';
    }
    
    function updateUI() {
        currentUser = getCurrentUser();
        if (currentUser && getAuthToken()) {
            if (userMenuButton) {
                userMenuButton.style.display = 'flex';
                userMenuButton.textContent = getInitials();
            }
            if (menuName) {
                const n = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.name || 'User';
                menuName.textContent = n;
            }
            if (menuEmail) {
                menuEmail.textContent = currentUser.email || '';
            }
        } else {
            if (userMenuButton) userMenuButton.style.display = 'none';
            if (userMenu) userMenu.classList.add('hidden');
        }
    }
    
    // Handle profile link clicks
    function handleProfileClick(e) {
        // Check if user is authenticated
        if (!currentUser || !getAuthToken()) {
            e.preventDefault();
            alert('Please log in to access your profile.');
            window.location.href = 'login_page.html';
            return false;
        }
        // If authenticated, allow normal navigation
        return true;
    }
    
    // Add click handlers for profile-related links
    document.addEventListener('DOMContentLoaded', function() {
        // Find all profile-related links
        const profileLinks = document.querySelectorAll('a[href="profile.html"], a[href*="profile"], a[href="my_insurance.html"], a[href*="my_"]');
        
        profileLinks.forEach(link => {
            link.addEventListener('click', handleProfileClick);
        });
    });
    
    if (userMenuButton) {
        userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (userMenu) userMenu.classList.toggle('hidden');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target) && e.target !== userMenuButton) {
            userMenu.classList.add('hidden');
        }
    });
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'login_page.html';
        });
    }
    
    // Initial UI update on page load
    document.addEventListener('DOMContentLoaded', updateUI);
    
    // Listen for storage changes to update UI across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'authToken' || e.key === 'currentUser') {
            updateUI();
        }
    });
    
    // Expose functions globally if needed
    window.authUtils = {
        isAuthenticated: function() {
            return !!(getCurrentUser() && getAuthToken());
        },
        getCurrentUser: getCurrentUser,
        getAuthToken: getAuthToken,
        requireAuth: function(redirectUrl = 'login_page.html') {
            if (!this.isAuthenticated()) {
                window.location.href = redirectUrl;
                return false;
            }
            return true;
        }
    };
})();