(function() {
    // Simulating the form submission and showing the success message
    document.getElementById('demo-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Simulate sending form data via AJAX
        // Example AJAX request would go here
        // sendFormData();

        // Hide form and show success message
        document.getElementById('demo-form').style.display = 'none';
        document.getElementById('success-message').style.display = 'flex';
        
        // Add shrink class to demo-box to reduce height
        document.querySelector('.demo-box').classList.add('shrink');
    });
})();

document.getElementById('demo-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Create a FormData object to collect form inputs
    const formData = new FormData(this);

    // Convert FormData to a plain object
    const demoData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        store_name: formData.get('store_name'),
        store_address: formData.get('store_address'),
        message: formData.get('message')
    };

    // Send the form data to the server using fetch
    fetch('/submit-demo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(demoData)
    })
    .then(response => response.text())
    .then(data => {
        if (response.ok) {
            // Hide form and show success message
            document.getElementById('demo-form').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
        } else {
            console.error('Failed to submit demo request:', data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

