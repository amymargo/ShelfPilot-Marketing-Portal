// template.js

// Define the HTML for the navbar
const navbarHTML = `
<header>
    <div class="navbar">
        <a href="index.html" class="logo-link">
            <div class="logo">
                <img src="images/newlogo.png" alt="ShelfPilot Logo">
            </div>
        </a>
        <nav>
            <ul>
                <li><a href="about.html">About Us</a></li>
                <li><a href="request_demo.html">Request a Demo</a></li>
                <li><a href="sellers.html">Sellers</a></li>
                <li><a href="login.html">Login</a></li>
            </ul>
        </nav>
    </div>
</header>
`;

// Define the HTML for the footer
const footerHTML = `
<footer>
    <p>&copy; 2024 ShelfPilot Inc. All rights reserved.</p>
</footer>
`;

// Inject the navbar into the element with ID 'navbar'
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navbar').innerHTML = navbarHTML;
    document.getElementById('footer').innerHTML = footerHTML;
});
