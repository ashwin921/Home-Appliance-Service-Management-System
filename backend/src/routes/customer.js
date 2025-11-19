const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { customerDb } = require('../db');
const authMiddleware = require('../middleware/auth');


const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};


router.get('/profile/:customer_id', authMiddleware, async (req, res) => {
    try {
        const { customer_id } = req.params;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [customers] = await customerDb.query(
            `SELECT customer_id, fname, lname, dob, email, 
                    address_line1, landmark, stage, city, pincode
             FROM Customer 
             WHERE customer_id = ?`,
            [customer_id]
        );

        if (customers.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }


        const [phones] = await customerDb.query(
            'SELECT phone_no FROM Phone_no WHERE customer_id = ? ORDER BY phone_no',
            [customer_id]
        );

        const profile = customers[0];
        profile.primary_phone = phones[0]?.phone_no || '';
        profile.secondary_phone = phones[1]?.phone_no || '';

        res.json(profile);
    } catch (error) {
        console.error('Error fetching customer profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/profile/:customer_id', authMiddleware, async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { fname, lname, dob } = req.body;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }


        if (!fname || fname.trim() === '') {
            return res.status(400).json({ message: 'First name is required' });
        }

        if (!dob) {
            return res.status(400).json({ message: 'Date of birth is required' });
        }


        const dobDate = new Date(dob);
        if (dobDate > new Date()) {
            return res.status(400).json({ message: 'Date of birth cannot be in the future' });
        }

        await customerDb.query(
            'UPDATE Customer SET fname = ?, lname = ?, dob = ? WHERE customer_id = ?',
            [fname, lname || '', dob, customer_id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/address/:customer_id', authMiddleware, async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { address_line1, landmark, stage, city, pincode } = req.body;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }


        if (!address_line1 || address_line1.trim() === '') {
            return res.status(400).json({ message: 'Address Line 1 is required' });
        }

        if (!city || city.trim() === '') {
            return res.status(400).json({ message: 'City is required' });
        }

        if (!pincode) {
            return res.status(400).json({ message: 'Pincode is required' });
        }


        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(pincode)) {
            return res.status(400).json({ message: 'Pincode must be 6 digits and not start with 0' });
        }

        await customerDb.query(
            `UPDATE Customer 
             SET address_line1 = ?, landmark = ?, stage = ?, city = ?, pincode = ? 
             WHERE customer_id = ?`,
            [address_line1, landmark || null, stage || null, city, pincode, customer_id]
        );

        res.json({ message: 'Address updated successfully' });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/verify-password', authMiddleware, async (req, res) => {
    try {
        const { customer_id, old_password } = req.body;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!old_password) {
            return res.status(400).json({ message: 'Old password is required' });
        }

        const [customers] = await customerDb.query(
            'SELECT password_hash FROM Customer WHERE customer_id = ?',
            [customer_id]
        );

        if (customers.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const hashedOldPassword = hashPassword(old_password);

        if (hashedOldPassword !== customers[0].password_hash) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        res.json({ message: 'Password verified successfully' });
    } catch (error) {
        console.error('Error verifying password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/change-password/:customer_id', authMiddleware, async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { new_password } = req.body;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }


        if (!new_password || new_password.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const hashedNewPassword = hashPassword(new_password);

        await customerDb.query(
            'UPDATE Customer SET password_hash = ? WHERE customer_id = ?',
            [hashedNewPassword, customer_id]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/phone/:customer_id', authMiddleware, async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { primary_phone, secondary_phone } = req.body;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }


        if (!primary_phone) {
            return res.status(400).json({ message: 'Primary phone is required' });
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(primary_phone)) {
            return res.status(400).json({ message: 'Primary phone must be 10 digits' });
        }

        if (secondary_phone && !phoneRegex.test(secondary_phone)) {
            return res.status(400).json({ message: 'Secondary phone must be 10 digits' });
        }


        const [currentPhones] = await customerDb.query(
            'SELECT phone_no FROM Phone_no WHERE customer_id = ? ORDER BY phone_no',
            [customer_id]
        );


        const [existingPrimary] = await customerDb.query(
            'SELECT customer_id FROM Phone_no WHERE phone_no = ? AND customer_id != ?',
            [primary_phone, customer_id]
        );

        if (existingPrimary.length > 0) {
            return res.status(409).json({ message: 'Primary phone number already exists' });
        }


        if (secondary_phone) {
            const [existingSecondary] = await customerDb.query(
                'SELECT customer_id FROM Phone_no WHERE phone_no = ? AND customer_id != ?',
                [secondary_phone, customer_id]
            );

            if (existingSecondary.length > 0) {
                return res.status(409).json({ message: 'Secondary phone number already exists' });
            }
        }


        await customerDb.query('DELETE FROM Phone_no WHERE customer_id = ?', [customer_id]);


        await customerDb.query(
            'INSERT INTO Phone_no (customer_id, phone_no) VALUES (?, ?)',
            [customer_id, primary_phone]
        );


        if (secondary_phone) {
            await customerDb.query(
                'INSERT INTO Phone_no (customer_id, phone_no) VALUES (?, ?)',
                [customer_id, secondary_phone]
            );
        }

        res.json({ message: 'Phone numbers updated successfully' });
    } catch (error) {
        console.error('Error updating phone numbers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
