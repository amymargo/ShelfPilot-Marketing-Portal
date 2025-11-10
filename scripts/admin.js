console.log('admin.js loaded');

document.getElementById('profile-link').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Open the profile menu
    document.getElementById('profile-menu').classList.add('active');
    
    // Move only the right side of the navbar to the left
    document.querySelector('.navbar-right').classList.add('shifted');
});

document.getElementById('close-menu').addEventListener('click', function() {
    // Close the profile menu
    document.getElementById('profile-menu').classList.remove('active');
    
    // Move the right side of the navbar back to its original position
    document.querySelector('.navbar-right').classList.remove('shifted');
});

// Logout functionality
document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Call the server to destroy the session
    fetch('/logout', {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to the login page after successful logout
            window.location.href = '/login.html';
        } else {
            console.error('Failed to log out');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const marketerFilter = document.getElementById('marketer-filter');
    const tableBody = document.querySelector('#waiting-list-table tbody');
    let waitingList = [];

    // Fetch waitlist data from the server
    fetch('/api/waitlist')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                waitingList = data.data;
                console.log(waitingList); // Check if company_address is present in each entry

                // Populate marketers in the dropdown filter
                const marketers = [...new Set(waitingList.map(item => item.marketer))];
                marketers.forEach(marketer => {
                    const option = document.createElement('option');
                    option.value = marketer;
                    option.textContent = marketer;
                    marketerFilter.appendChild(option);
                });

                // Display the initial data
                displayData();
            } else {
                console.error('Failed to fetch waitlist data');
            }
        })
        .catch(error => console.error('Error:', error));

function displayData(filter = 'all') {
    tableBody.innerHTML = ''; // Clear table body
    waitingList.forEach((entry, index) => {
        if (filter === 'all' || entry.marketer === filter) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.first_name}</td>
                <td>${entry.last_name}</td>
                <td>${entry.phone_number || 'N/A'}</td>
                <td>${entry.email}</td>
                <td>${entry.company_name || 'N/A'}</td>
                <td>${entry.account_type}</td>
                <td>${new Date(entry.joined_at).toLocaleString()}</td>
                <td>${entry.marketer || 'N/A'}</td>
                <td>
                    <button class="create-contract-btn"
                        onclick="createContract(${entry.id}, '${entry.first_name}', '${entry.last_name}', '${entry.phone_number || ''}', 
                                '${entry.email}', '${entry.company_name || ''}', '${entry.company_address || ''}', '${entry.marketer}')">
                        Create Contract
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
}

    // Handle dropdown filter change
    marketerFilter.addEventListener('change', function() {
        displayData(this.value);
    });
});

function createContract(id, firstName, lastName, phone, email, company, address, marketer) {
    const waitlistEntry = {
        firstName: firstName || '',
        lastName: lastName || '',
        phoneNumber: phone || '',
        email: email || '',
        companyName: company || '',
        companyAddress: address || '', // Add the company address here
        marketer: marketer || ''
    };

    localStorage.setItem('waitlistEntry', JSON.stringify(waitlistEntry));
    window.location.href = 'create_contract.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const tableHeaders = document.querySelectorAll('th');

    tableHeaders.forEach((header, index) => {
        const resizer = document.createElement('div');
        resizer.classList.add('resizer');
        header.appendChild(resizer);

        // Add event listener for resizing
        let startX;
        let startWidth;

        resizer.addEventListener('mousedown', function(e) {
            startX = e.pageX;
            startWidth = header.offsetWidth;

            // Attach listeners to handle resizing
            document.addEventListener('mousemove', resizeColumn);
            document.addEventListener('mouseup', stopResizing);
        });

        // Function to resize the column
        const resizeColumn = (e) => {
            const diffX = e.pageX - startX;
            header.style.width = `${startWidth + diffX}px`;
            // Update the corresponding cells
            document.querySelectorAll(`td:nth-child(${index + 1})`).forEach(cell => {
                cell.style.width = `${startWidth + diffX}px`;
            });
        };

        // Stop resizing when mouse button is released
        const stopResizing = () => {
            document.removeEventListener('mousemove', resizeColumn);
            document.removeEventListener('mouseup', stopResizing);
        };
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const createContractButtons = document.querySelectorAll('.create-contract-button'); // Assuming each row has this button

    createContractButtons.forEach(button => {
        button.addEventListener('click', () => {
            const waitlistEntry = {
                firstName: button.dataset.firstName,
                lastName: button.dataset.lastName,
                phoneNumber: button.dataset.phoneNumber,
                email: button.dataset.email,
                companyName: button.dataset.companyName,
                companyAddress: button.dataset.companyAddress,
                accountType: button.dataset.accountType,
                marketer: button.dataset.marketer
            };
            // Save to local storage or pass via URL
            localStorage.setItem('waitlistEntry', JSON.stringify(waitlistEntry));
            window.location.href = 'create_contract.html';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#contracts-table tbody');
    // if (!tableBody) {
    //     console.error('Table body not found.');
    //     return;
    // }

    // Fetch contracts data from the server
    fetch('/api/contracts')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayContracts(data.data);
            } else {
                console.error('Failed to fetch contracts data');
            }
        })
        .catch(error => console.error('Error:', error));

// Display contracts data in the table
function displayContracts(contracts) {
    tableBody.innerHTML = ''; // Clear table body

    contracts.forEach((contract, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${contract.first_name}</td>
            <td>${contract.last_name}</td>
            <td>${contract.phone_number || 'N/A'}</td>
            <td>${contract.email}</td>
            <td>${contract.company_name || 'N/A'}</td>
            <td>${contract.company_address || 'N/A'}</td>
            <td>${contract.marketer_name || 'N/A'}</td>
            <td>${contract.marketer_percentage}%</td>
            <td class="ein-column" id="ein-${contract.id}">
                <span class="masked-ein">*****${contract.ein_tax_id.slice(-4)}</span>
                <button onclick="showFullEIN(${contract.id})">Show</button>
            </td>
            <td>
                <button onclick="viewCertificate('${contract.sales_certificate_path}')">View Certificate</button>
            </td>
            <td>${contract.contract_term} Months</td>
            <td>${new Date(contract.created_at).toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

window.showFullEIN = function(contractId) {
    const password = prompt("Enter your password to view the full EIN:");
    if (password) {
        // Send a POST request to verify the password and get the full EIN
        fetch(`/view-full-ein`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contractId, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the EIN display with the full value
                const einCell = document.getElementById(`ein-${contractId}`).querySelector('.masked-ein');
                einCell.textContent = data.fullEin;
            } else {
                alert('Incorrect password or error occurred.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
};

    // Function to view the sales certificate
    window.viewCertificate = function (filePath) {
        window.open(`${filePath}`, '_blank');
    };
    
    window.showFullEIN = function (contractId) {
        const password = prompt("Enter your password to view the full EIN:");
        if (password) {
            // Send a POST request to verify the password and get the full EIN
            fetch(`/view-full-ein`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contractId, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById(`ein-${contractId}`).textContent = data.fullEin;
                } else {
                    alert('Incorrect password or error occurred.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    };    
});

function enableColumnResizing(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const headers = table.querySelectorAll('th');

    headers.forEach((header, index) => {
        const resizer = document.createElement('div');
        resizer.classList.add('resizer');
        header.appendChild(resizer);

        let startX, startWidth;

        resizer.addEventListener('mousedown', (e) => {
            startX = e.pageX;
            startWidth = header.offsetWidth;

            const resizeColumn = (e) => {
                const diffX = e.pageX - startX;
                const newWidth = `${startWidth + diffX}px`;

                // Apply the new width to the header and corresponding cells
                header.style.width = newWidth;
                document.querySelectorAll(`#${tableId} td:nth-child(${index + 1})`).forEach((cell) => {
                    cell.style.width = newWidth;
                });
            };

            const stopResizing = () => {
                document.removeEventListener('mousemove', resizeColumn);
                document.removeEventListener('mouseup', stopResizing);
            };

            document.addEventListener('mousemove', resizeColumn);
            document.addEventListener('mouseup', stopResizing);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadDemoRequests();
    loadSellerRequests();
});

// Fetch and display demo requests
function loadDemoRequests() {
    const tableBody = document.querySelector('#demo-requests-table tbody');
    // if (!tableBody) {
    //     console.error('Demo requests table body not found.');
    //     return;
    // }

    fetch('/api/demo-requests')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayDemoRequests(data.data);
            } else {
                console.error('Failed to fetch demo requests data');
            }
        })
        .catch(error => console.error('Error fetching demo requests:', error));
}

function displayDemoRequests(requests) {
    const tableBody = document.querySelector('#demo-requests-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    requests.forEach((request, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${request.first_name}</td>
            <td>${request.last_name}</td>
            <td>${request.phone || 'N/A'}</td>
            <td>${request.email}</td>
            <td>${request.store_name || 'N/A'}</td>
            <td>${request.store_address || 'N/A'}</td>
            <td>${request.message || 'N/A'}</td>
            <td>${new Date(request.created_at).toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Fetch and display seller requests
function loadSellerRequests() {
    const tableBody = document.querySelector('#seller-requests-table tbody');
    // if (!tableBody) {
    //     console.error('Seller requests table body not found.');
    //     return;
    // }

    fetch('/api/seller-requests')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displaySellerRequests(data.data);
            } else {
                console.error('Failed to fetch seller requests data');
            }
        })
        .catch(error => console.error('Error fetching seller requests:', error));
}

function displaySellerRequests(requests) {
    const tableBody = document.querySelector('#seller-requests-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    requests.forEach((request, index) => {
        const shortMessage =
            request.message.length > 30
                ? `${request.message.slice(0, 30)}...`
                : request.message;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${request.first_name}</td>
            <td>${request.last_name}</td>
            <td>${request.phone || 'N/A'}</td>
            <td>${request.email}</td>
            <td>${request.company_name || 'N/A'}</td>
            <td>${request.company_website || 'N/A'}</td>
            <td class="message-cell" data-full-message="${request.message}">
                ${shortMessage}
            </td>
            <td>${new Date(request.created_at).toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });

    // Add click event to the "Message" column
    document.querySelectorAll('#seller-requests-table .message-cell').forEach(cell => {
        cell.addEventListener('click', event => {
            const fullMessage = cell.getAttribute('data-full-message');
            showMessageModal(fullMessage); // Call the modal function
        });
    });
}

function displayDemoRequests(requests) {
    const tableBody = document.querySelector('#demo-requests-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    requests.forEach((request, index) => {
        const shortMessage = request.message.length > 30 ? request.message.slice(0, 30) + '...' : request.message;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${request.first_name}</td>
            <td>${request.last_name}</td>
            <td>${request.phone || 'N/A'}</td>
            <td>${request.email}</td>
            <td>${request.store_name || 'N/A'}</td>
            <td>${request.store_address || 'N/A'}</td>
            <td class="message-cell" data-full-message="${request.message}">
                ${shortMessage}
            </td>
            <td>${new Date(request.created_at).toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });

    // Add click event to message cells
    document.querySelectorAll('.message-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const fullMessage = cell.getAttribute('data-full-message');
            showMessageModal(fullMessage); // Call the modal function
        });
    });
}

function showMessageModal(message) {
    // Create the modal element
    const modal = document.createElement('div');
    modal.classList.add('message-modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <p>${message}</p>
        </div>
    `;

    // Append the modal to the body
    document.body.appendChild(modal);

    // Close modal on button click
    modal.querySelector('.close-btn').addEventListener('click', () => {
        modal.remove();
    });

    // Close modal when clicking outside the modal content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}