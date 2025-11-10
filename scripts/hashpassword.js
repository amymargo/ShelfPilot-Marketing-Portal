const bcrypt = require('bcryptjs');

// Function to hash passwords
const hashPassword = (password) => {
    const saltRounds = 10;
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) reject(err);
            resolve(hash);
        });
    });
};

module.exports = {
    hashPassword
};