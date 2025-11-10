(function() {
    // Show the form section when "Start Selling Today" button is clicked
    document.getElementById('show-form-button').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor behavior
        document.getElementById('form-section').style.display = 'block'; // Show the form section
        this.style.display = 'none'; // Optionally hide the "Start Selling Today" button
    });

    // Handle form submission and show success message
    document.getElementById('supplier-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Simulate sending form data via AJAX
        // Example AJAX request would go here
        // sendFormData();

        // Hide form and show success message
        document.getElementById('supplier-form').style.display = 'none';
        document.getElementById('success-message').style.display = 'block';
    });
})();

document.getElementById('supplier-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Create a FormData object to collect form inputs
    const formData = new FormData(this);

    // Convert FormData to a plain object
    const supplierData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        company_name: formData.get('company_name'),
        company_website: formData.get('company_website'),
        message: formData.get('message')
    };

    // Send the form data to the server using fetch
    fetch('/submit-supplier', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierData)
    })
    .then(response => response.text())
    .then(data => {
        if (response.ok) {
            // Hide form and show success message
            document.getElementById('supplier-form').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
        } else {
            console.error('Failed to submit supplier submission:', data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

