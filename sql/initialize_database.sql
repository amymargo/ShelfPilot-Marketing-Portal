CREATE DATABASE IF NOT EXISTS shelfpilot;
USE shelfpilot;

CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(100),
    account_type ENUM('admin', 'marketer', 'small_business', 'brand', 'wholesaler', 'other') NOT NULL
);

CREATE TABLE waitlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    company_name VARCHAR(100),
    account_type ENUM('small_business', 'brand', 'wholesaler', 'other') NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marketer VARCHAR(50),
    phone_number VARCHAR(20),
    company_address VARCHAR(255)
);

CREATE TABLE demo_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    store_name VARCHAR(100) NOT NULL,
    store_address VARCHAR(255) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    company_website VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15),
    email VARCHAR(100),
    company_name VARCHAR(100),
    company_address VARCHAR(255),
    marketer_name VARCHAR(50),
    marketer_percentage DECIMAL(5,2),
    ein_tax_id VARCHAR(128),
    sales_certificate_path VARCHAR(255),
    contract_term INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO accounts (username, password, first_name, last_name, email, company_name, account_type, created_at)
VALUES ('admin', '$2a$10$Fl2I8GbzsdSm/hrUBREV9eVP4iYucGQGdN2yZAacv.WbFsRZmm3Sq', 'Example', 'Admin', 'user@shelfpilot.com', 'ShelfPilot', 'admin', NOW());
