// admin-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    fetchWaitlistData();
    fetchContractsData();
    fetchDemoRequestsData();
    fetchSellerRequestsData();
});

function fetchWaitlistData() {
    fetch('/api/waitlist')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const waitlist = data.data;

                // Populate waitlist table
                const waitlistHTML = createWaitlistHTML(waitlist);
                document.getElementById('waitlist-table-container').innerHTML = waitlistHTML;

                // Populate the marketer filter dropdown
                const marketerFilter = document.getElementById('marketer-filter');
                waitlist.forEach(entry => {
                    if (entry.marketer) {
                        const optionExists = Array.from(marketerFilter.options).some(option => option.value === entry.marketer);
                        if (!optionExists) {
                            const option = document.createElement('option');
                            option.value = entry.marketer;
                            option.textContent = entry.marketer;
                            marketerFilter.appendChild(option);
                        }
                    }
                });

                // Add event listener for filtering
                marketerFilter.addEventListener('change', function () {
                    displayFilteredWaitlist(waitlist, this.value);
                });

                // Enable resizing for the waitlist table
                enableColumnResizing('waiting-list-table');
            } else {
                console.error('Failed to fetch waitlist data');
            }
        })
        .catch(error => console.error('Error:', error));
}

function fetchContractsData() {
    fetch('/api/contracts')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const contractsHTML = createContractsHTML(data.data);
                document.getElementById('contracts-table-container').innerHTML = contractsHTML;

                // Enable resizing for the contracts table
                enableColumnResizing('contracts-table');
            } else {
                console.error('Failed to fetch contracts data');
            }
        })
        .catch(error => console.error('Error:', error));
}

function fetchDemoRequestsData() {
    fetch('/api/demo-requests')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const demoRequestsHTML = createDemoRequestsHTML(data.data);
                document.getElementById('demo-requests-table-container').innerHTML = demoRequestsHTML;
                enableColumnResizing('demo-requests-table');
            } else {
                console.error('Failed to fetch demo requests data');
            }
        })
        .catch(error => console.error('Error:', error));
}

function fetchSellerRequestsData() {
    fetch('/api/seller-requests')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const sellerRequestsHTML = createSellerRequestsHTML(data.data);
                document.getElementById('seller-requests-table-container').innerHTML = sellerRequestsHTML;
                enableColumnResizing('seller-requests-table');
            } else {
                console.error('Failed to fetch seller requests data');
            }
        })
        .catch(error => console.error('Error:', error));
}

function createWaitlistHTML(waitlist) {
    return `
    <div class="waitlist-box">
        <div class="waitlist-header">
            <h2>Waiting List</h2>
            <div>
                <label for="marketer-filter">Filter by Marketer:</label>
                <select id="marketer-filter">
                    <option value="all">All Marketers</option>
                </select>
            </div>
        </div>
        <table id="waiting-list-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Account Type</th>
                    <th>Joined</th>
                    <th>Marketer</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${waitlist.map((entry, index) => `
                    <tr>
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
                            <button class="create-contract-btn" onclick="createContract(${entry.id}, '${entry.first_name}', '${entry.last_name}', '${entry.phone_number || ''}', '${entry.email}', '${entry.company_name || ''}', '${entry.company_address || ''}', '${entry.marketer}')">Create Contract</button>
                        </td>
                    </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

function createContractsHTML(contracts) {
    let tableHTML = `
    <div class="contracts-box">
        <div class="contracts-header">
            <h2>Contracts</h2>
        </div>
        <table id="contracts-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Address</th>
                    <th>Marketer</th>
                    <th>Marketer Percent</th>
                    <th class="ein-column-header">EIN Tax ID</th>
                    <th>Sales Certificate</th>
                    <th>Term</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>`;

    contracts.forEach((contract, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${contract.first_name}</td>
                <td>${contract.last_name}</td>
                <td>${contract.phone_number || 'N/A'}</td>
                <td>${contract.email}</td>
                <td>${contract.company_name || 'N/A'}</td>
                <td>${contract.company_address || 'N/A'}</td>
                <td>${contract.marketer_name || 'N/A'}</td>
                <td>${contract.marketer_percentage}%</td>
                <td class="ein-column-header" id="ein-${contract.id}">
                    <span class="masked-ein">*****${contract.ein_tax_id.slice(-4)}</span>
                    <button onclick="window.showFullEIN(${contract.id})">Show</button>
                </td>
                <td>
                    <button onclick="window.viewCertificate('${contract.sales_certificate_path}')">View Certificate</button>
                </td>
                <td>${contract.contract_term} Months</td>
                <td>${new Date(contract.created_at).toLocaleString()}</td>
            </tr>`;
    });

    tableHTML += `</tbody></table></div>`;
    return tableHTML;
}

function createDemoRequestsHTML(demoRequests) {
    let tableHTML = `
    <div class="demo-requests-box">
        <h2>Demo Requests</h2>
        <table id="demo-requests-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Store Name</th>
                    <th>Store Address</th>
                    <th>Message</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>`;

    demoRequests.forEach((request, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${request.first_name}</td>
                <td>${request.last_name}</td>
                <td>${request.phone || 'N/A'}</td>
                <td>${request.email}</td>
                <td>${request.store_name || 'N/A'}</td>
                <td>${request.store_address || 'N/A'}</td>
                <td>${request.message || 'N/A'}</td>
                <td>${new Date(request.created_at).toLocaleString()}</td>
            </tr>`;
    });

    tableHTML += `</tbody></table></div>`;
    return tableHTML;
}

function createSellerRequestsHTML(sellerRequests) {
    let tableHTML = `
    <div class="seller-requests-box">
        <h2>Seller Requests</h2>
        <table id="seller-requests-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Company Name</th>
                    <th>Company Website</th>
                    <th>Message</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>`;

    sellerRequests.forEach((request, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${request.first_name}</td>
                <td>${request.last_name}</td>
                <td>${request.phone || 'N/A'}</td>
                <td>${request.email}</td>
                <td>${request.company_name || 'N/A'}</td>
                <td>${request.company_website || 'N/A'}</td>
                <td>${request.message || 'N/A'}</td>
                <td>${new Date(request.created_at).toLocaleString()}</td>
            </tr>`;
    });

    tableHTML += `</tbody></table></div>`;
    return tableHTML;
}

function createContract(id, firstName, lastName, phone, email, company, address, marketer) {
    const waitlistEntry = {
        firstName: firstName || '',
        lastName: lastName || '',
        phoneNumber: phone || '',
        email: email || '',
        companyName: company || '',
        companyAddress: address || '', 
        marketer: marketer || ''
    };

    localStorage.setItem('waitlistEntry', JSON.stringify(waitlistEntry));
    window.location.href = 'create_contract.html';
}

function displayFilteredWaitlist(waitlist, filter) {
    const tableBody = document.querySelector('#waiting-list-table tbody');
    tableBody.innerHTML = ''; // Clear the current table body

    waitlist.forEach((entry, index) => {
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
                    <button class="create-contract-btn" onclick="createContract(${entry.id}, '${entry.first_name}', '${entry.last_name}', '${entry.phone_number || ''}', '${entry.email}', '${entry.company_name || ''}', '${entry.company_address || ''}', '${entry.marketer}')">Create Contract</button>
                </td>`;
            tableBody.appendChild(row);
        }
    });
}