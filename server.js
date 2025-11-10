const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const xss = require('xss');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;
const crypto = require('crypto');
require('dotenv').config();

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'sales_certificates');
    },
    filename: (req, file, cb) => {
        // Extract company name from the form data and sanitize it to avoid special characters
        const companyName = req.body.company_name.replace(/[^a-zA-Z0-9]/g, '_'); // Replaces special characters with underscores

        // Get the current date in a desired format (e.g., YYYYMMDD)
        const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');

        // Construct the filename using company name and date
        const filename = `${companyName}_${currentDate}${path.extname(file.originalname)}`;

        cb(null, filename);
    }
});

const upload = multer({ storage: storage });  

// Set up MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Middleware to handle form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
    secret: 's93#tyUIksz890!LkjqwER@mnbvCIop',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 } // Set to 30 minutes for production
}));

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // // Check if the form data is being received
    // console.log('Received username:', username);
    // console.log('Received password:', password);

    const sql = 'SELECT * FROM accounts WHERE username = ?';
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.json({ success: false, message: 'Database error' });
        }

        if (result.length === 0) {
            return res.json({ success: false, message: 'Account not found. Try again.' });
        }

        const user = result[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Password compare error:', err);
                return res.json({ success: false, message: 'Error comparing password' });
            }

            if (isMatch) {
                req.session.username = user.username;
                req.session.account_type = user.account_type;
                res.json({ success: true, account_type: user.account_type });
            } else {
                res.json({ success: false, message: 'Incorrect password. Try again.' });
            }
        });
    });
});

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhoneNumber = (phone_number) => {
    const phoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    return phoneRegex.test(phone_number);
};

app.post('/waitlist', (req, res) => {
    const { first_name, last_name, email, phone_number, company, account_type } = req.body;
    const username = req.session.username;

    // If user is logged in, fetch their full name to use as the marketer
    if (username) {
        const sqlGetMarketer = 'SELECT CONCAT(first_name, " ", last_name) AS marketer FROM accounts WHERE username = ?';

        db.query(sqlGetMarketer, [username], (err, results) => {
            if (err || results.length === 0) {
                console.error('Error fetching marketer information:', err);
                return res.status(500).json({ success: false, message: 'Could not find marketer information' });
            }

            // Proceed to insert waitlist entry with marketer's full name
            insertWaitlistEntry(req, res, results[0].marketer);
        });
    } else {
        // Insert with null marketer if no user is logged in
        insertWaitlistEntry(req, res, null);
    }
});

// Helper function to insert waitlist entry
function insertWaitlistEntry(req, res, marketer) {
    const { first_name, last_name, email, phone_number, company, account_type } = req.body;

    // Validate email format and max length (100 characters)
    if (!validateEmail(email) || email.length > 100) {
        return res.status(400).json({ success: false, message: 'Invalid email format or length' });
    }

    // Validate phone number format
    if (!validatePhoneNumber(phone_number)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    // Validate name lengths (1 to 50 characters for first_name and last_name)
    if (first_name.length < 1 || first_name.length > 50 || last_name.length < 1 || last_name.length > 50) {
        return res.status(400).json({ success: false, message: 'First name and last name must be between 1 and 50 characters' });
    }

    // Insert into database
    const sql = `INSERT INTO waitlist (first_name, last_name, email, phone_number, company_name, account_type, marketer) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [first_name, last_name, email, phone_number, company || null, account_type, marketer], (err) => {
        if (err) {
            console.error('Database insert error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.status(200).json({ success: true, message: 'You have successfully joined the waitlist!' });
    });
}

app.get('/api/waitlist', (req, res) => {
    const sql = 'SELECT id, first_name, last_name, phone_number, email, company_name, company_address, account_type, marketer, joined_at FROM waitlist';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Sanitize the data before sending it to the client
        const sanitizedResults = results.map(entry => ({
            id: entry.id,
            first_name: xss(entry.first_name),
            last_name: xss(entry.last_name),
            phone_number: xss(entry.phone_number),
            email: xss(entry.email),
            company_name: xss(entry.company_name),
            company_address: xss(entry.company_address), // Include the address here
            account_type: xss(entry.account_type),
            marketer: xss(entry.marketer),
            joined_at: entry.joined_at // Date field doesn't need sanitizing
        }));

        res.status(200).json({ success: true, data: sanitizedResults });
    });
});

// Route to check if the user is logged in
app.get('/check-login', (req, res) => {
    if (req.session.username) {
        // User is logged in, send account type and username
        res.json({
            loggedIn: true,
            username: req.session.username,
            account_type: req.session.account_type
        });
    } else {
        // User is not logged in
        res.json({ loggedIn: false });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.json({ success: false, message: 'Failed to log out' });
        }
        res.json({ success: true });
    });
});

// POST route to handle contract creation
app.post('/create-contract', upload.single('sales_certificate'), (req, res) => {
    const {
      first_name, last_name, phone_number, email,
      company_name, company_address, marketer,
      marketer_percentage, ein, contract_term, custom_term
    } = req.body;
  
    // Validate EIN Tax ID
    if (!/^\d{2}-?\d{7}$/.test(ein)) {
        return res.status(400).send('EIN Tax ID must be 9 digits, with or without a dash.');
    }
    const encryptedEin = encrypt(ein);
  
    // Determine the actual contract term (in months)
    let finalContractTerm = contract_term === 'custom' ? parseInt(custom_term) : parseInt(contract_term);
    if (isNaN(finalContractTerm) || finalContractTerm <= 0) {
      return res.status(400).send('Invalid contract term.');
    }
  
    // Get the file path of the uploaded file
    const filePath = req.file ? req.file.path : null;
  
    // SQL query to insert data
    const insertContractSql = `
      INSERT INTO contracts (first_name, last_name, phone_number, email, company_name, 
      company_address, marketer_name, marketer_percentage, ein_tax_id, 
      sales_certificate_path, contract_term) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
    const values = [
      first_name, last_name, phone_number, email, company_name, company_address,
      marketer, parseFloat(marketer_percentage), encryptedEin, filePath, finalContractTerm
    ];
  
    db.query(insertContractSql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data into contracts:', err);
            return res.status(500).send('Database error');
        }

        // After successful contract insertion, delete the user from the waitlist
        const deleteWaitlistSql = `DELETE FROM waitlist WHERE email = ?`;
        
        db.query(deleteWaitlistSql, [email], (deleteErr) => {
            if (deleteErr) {
                console.error('Error deleting user from waitlist:', deleteErr);
                return res.status(500).send('Error removing user from waitlist');
            }

            res.send('Contract saved and user removed from waitlist successfully!');
        });
    });
}); 

const algorithm = 'aes-256-cbc';
const secretKey = process.env.SECRET_KEY; // Store securely in .env file

if (!secretKey || secretKey.length !== 32) {
    throw new Error('The SECRET_KEY environment variable must be set to a 32-character string.');
}

// Encryption function
function encrypt(text) {
    const iv = crypto.randomBytes(16); // Ensure IV is 16 bytes
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

// Decryption function
function decrypt(encryptedText) {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    if (iv.length !== 16) {
        throw new Error('Invalid IV length');
    }
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

app.get('/api/contracts', (req, res) => {
    const sql = `
        SELECT id, first_name, last_name, phone_number, email, company_name, 
               company_address, marketer_name, marketer_percentage, ein_tax_id, 
               sales_certificate_path, contract_term, created_at
        FROM contracts`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Prepare results to show only the last 4 digits of decrypted EIN
        const sanitizedResults = results.map(contract => {
            let decryptedEIN;
            try {
                // Attempt to decrypt the EIN
                decryptedEIN = decrypt(contract.ein_tax_id);
            } catch (error) {
                console.error('Error decrypting EIN:', error);
                // In case of decryption error, set to fully masked
                decryptedEIN = null;
            }

            // Only show the last 4 digits if decryption is successful
            const maskedEIN = decryptedEIN ? '*****' + decryptedEIN.slice(-4) : '*****';

            return {
                ...contract,
                ein_tax_id: maskedEIN
            };
        });

        res.status(200).json({ success: true, data: sanitizedResults });
    });
});

// POST route to view full EIN after verifying the password
app.post('/view-full-ein', (req, res) => {
    const { contractId, password } = req.body;

    // Fetch the current user's password hash from the session or database
    const sql = 'SELECT password FROM accounts WHERE username = ?';
    db.query(sql, [req.session.username], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ success: false, message: 'User not found or database error' });
        }

        const storedHash = results[0].password;

        // Compare the entered password with the stored hash
        bcrypt.compare(password, storedHash, (compareErr, isMatch) => {
            if (compareErr || !isMatch) {
                return res.status(401).json({ success: false, message: 'Incorrect password' });
            }

            // Fetch the encrypted EIN from the contracts table
            const sqlGetEin = 'SELECT ein_tax_id FROM contracts WHERE id = ?';
            db.query(sqlGetEin, [contractId], (err, results) => {
                if (err || results.length === 0) {
                    return res.status(500).json({ success: false, message: 'Database error or contract not found' });
                }

                const encryptedEin = results[0].ein_tax_id;
                const fullEin = decrypt(encryptedEin);

                // Send the full EIN back to the client
                res.status(200).json({ success: true, fullEin });
            });
        });
    });
});

// Endpoint to handle demo form submission
app.post('/submit-demo', (req, res) => {
    const { first_name, last_name, phone, email, store_name, store_address, message } = req.body;

    const sql = `INSERT INTO demo_requests (first_name, last_name, phone, email, store_name, store_address, message) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [first_name, last_name, phone, email, store_name, store_address, message], (err, result) => {
        if (err) {
            console.error('Error saving demo request:', err);
            res.status(500).send('An error occurred');
            return;
        }
        res.send('Demo request saved successfully');
    });
});

// Endpoint to handle supplier form submission
app.post('/submit-supplier', (req, res) => {
    const { first_name, last_name, phone, email, company_name, company_website, message } = req.body;

    const sql = `INSERT INTO supplier_submissions (first_name, last_name, phone, email, company_name, company_website, message) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [first_name, last_name, phone, email, company_name, company_website, message], (err, result) => {
        if (err) {
            console.error('Error saving supplier submission:', err);
            res.status(500).send('An error occurred');
            return;
        }
        res.send('Supplier submission saved successfully');
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Endpoint to fetch demo requests
app.get('/api/demo-requests', (req, res) => {
    const sql = `SELECT id, first_name, last_name, phone, email, store_name, store_address, message, created_at 
                 FROM demo_requests ORDER BY created_at DESC`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Sanitize the data before sending to the client
        const sanitizedResults = results.map(entry => ({
            id: entry.id,
            first_name: xss(entry.first_name),
            last_name: xss(entry.last_name),
            phone: xss(entry.phone),
            email: xss(entry.email),
            store_name: xss(entry.store_name),
            store_address: xss(entry.store_address),
            message: xss(entry.message),
            created_at: entry.created_at
        }));

        res.status(200).json({ success: true, data: sanitizedResults });
    });
});

// Endpoint to fetch seller requests
app.get('/api/seller-requests', (req, res) => {
    const sql = `SELECT id, first_name, last_name, phone, email, company_name, company_website, message, created_at 
                 FROM supplier_submissions ORDER BY created_at DESC`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Sanitize the data before sending to the client
        const sanitizedResults = results.map(entry => ({
            id: entry.id,
            first_name: xss(entry.first_name),
            last_name: xss(entry.last_name),
            phone: xss(entry.phone),
            email: xss(entry.email),
            company_name: xss(entry.company_name),
            company_website: xss(entry.company_website),
            message: xss(entry.message),
            created_at: entry.created_at
        }));

        res.status(200).json({ success: true, data: sanitizedResults });
    });
});
