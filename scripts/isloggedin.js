window.onload = function() {
    // Check if the user is logged in
    fetch('/check-login')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                // Update the navbar to show "Profile" instead of "Login"
                const loginLink = document.querySelector('nav ul li a[href="login.html"]');
                if (loginLink) {
                    loginLink.textContent = 'Profile';
                    loginLink.href = data.account_type === 'admin' ? 'admin-dashboard.html' : 'marketer.html';
                }
            }
        })
        .catch(error => console.error('Error checking login status:', error));
};