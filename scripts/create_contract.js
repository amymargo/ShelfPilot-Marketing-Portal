document.addEventListener('DOMContentLoaded', () => {
    const waitlistEntry = JSON.parse(localStorage.getItem('waitlistEntry'));

    if (waitlistEntry) {
        document.getElementById('first-name').value = waitlistEntry.firstName || '';
        document.getElementById('last-name').value = waitlistEntry.lastName || '';
        document.getElementById('phone-number').value = waitlistEntry.phoneNumber || '';
        document.getElementById('email').value = waitlistEntry.email || '';
        document.getElementById('company-name').value = waitlistEntry.companyName || '';
        document.getElementById('company-address').value = waitlistEntry.companyAddress || '';
        document.getElementById('marketer').value = waitlistEntry.marketer || '';
        //clear local storage after populating form
        localStorage.removeItem('waitlistEntry');
    }

    // Call showCustomInput once in case the page is loaded with "Custom" selected
    showCustomInput();

    // Form submission logic
    document.getElementById('create-contract-form').addEventListener('submit', (event) => {
        event.preventDefault();

        // Prepare form data for submission
        const formData = new FormData(event.target);

        fetch('/create-contract', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            alert(data);  // Display response message to the user
            if (data.includes('Contract saved and user removed from waitlist successfully!')) {
                // If successfully saved and removed, redirect to waitlist page
                window.location.href = 'admin-contracts.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});

function showCustomInput() {
    const contractTermSelect = document.getElementById('contract-term');
    const customTermInput = document.getElementById('custom-term');

    if (contractTermSelect.value === 'custom') {
        customTermInput.style.display = 'block';
        customTermInput.required = true;
    } else {
        customTermInput.style.display = 'none';
        customTermInput.required = false;
    }
}
