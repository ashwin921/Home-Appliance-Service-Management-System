const express = require('express');
const router = express.Router();
const { customerDb } = require('../db');
const authMiddleware = require('../middleware/auth');


router.post('/', authMiddleware, async (req, res) => {
    try {
        const { customer_id, appliance_id, description, request_date } = req.body;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }


        if (!appliance_id || !description || !request_date) {
            return res.status(400).json({ 
                message: 'Appliance, description, and request date are required' 
            });
        }


        const [appliances] = await customerDb.query(
            'SELECT 1 FROM Appliance WHERE appliance_id = ? AND customer_id = ?',
            [appliance_id, customer_id]
        );

        if (appliances.length === 0) {
            return res.status(400).json({ message: 'Invalid appliance selection' });
        }


        const [result] = await customerDb.query(
            `INSERT INTO Service_Request (customer_id, appliance_id, description, request_date, status) 
             VALUES (?, ?, ?, ?, 'Pending')`,
            [customer_id, appliance_id, description, request_date]
        );

        res.status(201).json({
            message: 'Service request submitted successfully',
            request_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/:customer_id', authMiddleware, async (req, res) => {
    try {
        const { customer_id } = req.params;


        if (req.user.customerId !== parseInt(customer_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }


        const [resultSets] = await customerDb.query('CALL get_customer_service_summary(?)', [customer_id]);
        

        const requests = resultSets[0] || [];

        res.json(requests);
    } catch (error) {
        console.error('Error fetching service requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete('/:request_id', authMiddleware, async (req, res) => {
    try {
        const { request_id } = req.params;


        const [requests] = await customerDb.query(
            'SELECT customer_id, status FROM Service_Request WHERE request_id = ?',
            [request_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        const request = requests[0];


        if (req.user.customerId !== request.customer_id) {
            return res.status(403).json({ message: 'Access denied' });
        }


        if (request.status !== 'Pending') {
            return res.status(400).json({ 
                message: 'Only pending requests can be cancelled' 
            });
        }


        await customerDb.query('DELETE FROM Service_Request WHERE request_id = ?', [request_id]);

        res.json({ message: 'Service request cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling service request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/:request_id/rating', authMiddleware, async (req, res) => {
    try {
        const { request_id } = req.params;
        const { rating } = req.body;


        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }


        const [requests] = await customerDb.query(
            'SELECT customer_id, status, rating FROM Service_Request WHERE request_id = ?',
            [request_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        const request = requests[0];


        if (req.user.customerId !== request.customer_id) {
            return res.status(403).json({ message: 'Access denied' });
        }


        if (request.status !== 'Completed') {
            return res.status(400).json({ 
                message: 'Only completed requests can be rated' 
            });
        }


        if (request.rating !== null) {
            return res.status(400).json({ 
                message: 'This service has already been rated' 
            });
        }


        await customerDb.query(
            'UPDATE Service_Request SET rating = ? WHERE request_id = ?',
            [rating, request_id]
        );

        res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
