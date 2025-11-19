const express = require('express');
const router = express.Router();
const { customerDb } = require('../db');
const authMiddleware = require('../middleware/auth');


router.get('/:customer_id', authMiddleware, async (req, res) => {
    try {
        const { customer_id } = req.params;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [appliances] = await customerDb.query(
            `SELECT appliance_id, customer_id, type, brand, model_no 
             FROM Appliance 
             WHERE customer_id = ? 
             ORDER BY appliance_id`,
            [customer_id]
        );

        res.json(appliances);
    } catch (error) {
        console.error('Error fetching appliances:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/', authMiddleware, async (req, res) => {
    try {
        const { customer_id, type, brand, model_no } = req.body;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }


        if (!type) {
            return res.status(400).json({ message: 'Appliance type is required' });
        }


        const [result] = await customerDb.query(
            'SELECT IFNULL(MAX(appliance_id), 0) + 1 AS next_id FROM Appliance WHERE customer_id = ?',
            [customer_id]
        );

        const appliance_id = result[0].next_id;


        await customerDb.query(
            `INSERT INTO Appliance (appliance_id, customer_id, type, brand, model_no) 
             VALUES (?, ?, ?, ?, ?)`,
            [appliance_id, customer_id, type, brand || null, model_no || null]
        );

        res.status(201).json({
            message: 'Appliance added successfully',
            appliance: {
                appliance_id,
                customer_id,
                type,
                brand,
                model_no
            }
        });
    } catch (error) {
        console.error('Error adding appliance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
