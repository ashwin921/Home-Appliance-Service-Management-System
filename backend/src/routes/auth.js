const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { customerDb } = require('../db');


const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};


router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;


        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }


        const [rows] = await customerDb.query(
            'SELECT 1 FROM Customer WHERE email = ? LIMIT 1',
            [email]
        );

        return res.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error('Email check error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/register', async (req, res) => {
    try {
        console.log('Received registration request:', {
            ...req.body,
            password: req.body.password ? '[REDACTED]' : undefined
        });
        
        const { 
            fname, 
            lname, 
            email, 
            password,
            dob,
            address_line1, 
            landmark, 
            stage, 
            city, 
            pincode,
            primary_phone,
            secondary_phone
        } = req.body;

        console.log('Registration request received:', {
            ...req.body,
            password: '[REDACTED]'
        });


        console.log('Registration data:', {
            fname, lname, email, dob,
            address_line1, landmark, stage, city, pincode, primary_phone, secondary_phone
        });


        if (!fname || !email || !password || !dob || !address_line1 || !city || !pincode || !primary_phone) {
            return res.status(400).json({ 
                message: 'Required fields: First Name, Email, Password, Date of Birth, Address Line 1, City, Pincode, and Primary Phone' 
            });
        }


        const dobDate = new Date(dob);
        if (dobDate > new Date()) {
            return res.status(400).json({ message: 'Date of birth cannot be in the future' });
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }


        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(pincode)) {
            return res.status(400).json({ message: 'Pincode must be 6 digits and not start with 0' });
        }


        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(primary_phone)) {
            return res.status(400).json({ message: 'Primary phone must be 10 digits' });
        }
        if (secondary_phone && !phoneRegex.test(secondary_phone)) {
            return res.status(400).json({ message: 'Secondary phone must be 10 digits' });
        }


        const [existingUsers] = await customerDb.query(
            'SELECT 1 FROM Customer WHERE email = ? LIMIT 1',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }


        const [existingPhone] = await customerDb.query(
            'SELECT 1 FROM Phone_no WHERE phone_no = ? LIMIT 1',
            [primary_phone]
        );

        if (existingPhone.length > 0) {
            return res.status(409).json({ message: 'Primary phone number already exists' });
        }


        if (secondary_phone) {
            const [existingSecondaryPhone] = await customerDb.query(
                'SELECT 1 FROM Phone_no WHERE phone_no = ? LIMIT 1',
                [secondary_phone]
            );

            if (existingSecondaryPhone.length > 0) {
                return res.status(409).json({ message: 'Secondary phone number already exists' });
            }
        }


        const hashedPassword = hashPassword(password);

        console.log('Registration data before insert:', {
            dob, landmark, stage
        });


        const [result] = await customerDb.query(
            `INSERT INTO Customer (
                fname, lname, email, password_hash, dob, 
                address_line1, landmark, stage, city, pincode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fname, lname, email, hashedPassword, dob,
                address_line1, landmark || null, stage || null, city, pincode
            ]
        );

        const customerId = result.insertId;
        console.log('Insert successful, new customer ID:', customerId);


        await customerDb.query(
            'INSERT INTO Phone_no (customer_id, phone_no) VALUES (?, ?)',
            [customerId, primary_phone]
        );


        if (secondary_phone) {
            await customerDb.query(
                'INSERT INTO Phone_no (customer_id, phone_no) VALUES (?, ?)',
                [customerId, secondary_phone]
            );
        }

        res.status(201).json({
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        
        const [customers] = await customerDb.query(
            'SELECT customer_id, fname, email, password_hash FROM Customer WHERE email = ?',
            [email]
        );

        if (customers.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const customer = customers[0];
        const hashedPassword = hashPassword(password);

        if (hashedPassword !== customer.password_hash) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { customerId: customer.customer_id, email: customer.email, name: customer.fname },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            customer: {
                id: customer.customer_id,
                fname: customer.fname,
                email: customer.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
