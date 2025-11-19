const express = require('express');
const router = express.Router();
const { technicianDb } = require('../db');
const multer = require('multer');


const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});


router.get('/:technician_id/requests', async (req, res) => {
    try {
        const { technician_id } = req.params;

        const [requests] = await technicianDb.query(`
            SELECT 
                sr.request_id,
                sr.description,
                sr.request_date,
                sr.status,
                sr.customer_id,
                sr.appliance_id,
                c.fname AS customer_fname,
                c.lname AS customer_lname,
                c.address_line1,
                c.landmark,
                c.stage,
                c.city,
                c.pincode,
                a.type AS appliance_type,
                a.brand AS appliance_brand,
                a.model_no AS appliance_model,
                i.invoice_id,
                i.payment_status,
                i.total_cost
            FROM Service_Request sr
            JOIN Customer c ON sr.customer_id = c.customer_id
            JOIN Appliance a ON sr.appliance_id = a.appliance_id AND sr.customer_id = a.customer_id
            LEFT JOIN Invoice i ON sr.request_id = i.request_id
            WHERE sr.technician_id = ? 
            AND (
                sr.status IN ('Pending', 'In Progress')
                OR (sr.status = 'Completed' AND i.payment_status = 'Unpaid')
            )
            ORDER BY sr.request_date ASC, sr.request_id ASC
        `, [technician_id]);


        for (let request of requests) {
            const [phones] = await technicianDb.query(
                'SELECT phone_no FROM Phone_no WHERE customer_id = ? ORDER BY phone_no',
                [request.customer_id]
            );
            request.customer_phones = phones.map(p => p.phone_no);
        }

        res.json(requests);
    } catch (error) {
        console.error('Error fetching technician requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/:technician_id/history', async (req, res) => {
    try {
        const { technician_id } = req.params;

        const [requests] = await technicianDb.query(`
            SELECT 
                sr.request_id,
                sr.description,
                sr.request_date,
                sr.status,
                sr.customer_id,
                c.fname AS customer_fname,
                c.lname AS customer_lname,
                c.address_line1,
                c.landmark,
                c.stage,
                c.city,
                c.pincode,
                a.type AS appliance_type,
                a.brand AS appliance_brand,
                a.model_no AS appliance_model,
                i.invoice_id,
                i.issue_date,
                i.total_cost,
                i.payment_status
            FROM Service_Request sr
            JOIN Customer c ON sr.customer_id = c.customer_id
            JOIN Appliance a ON sr.appliance_id = a.appliance_id AND sr.customer_id = a.customer_id
            JOIN Invoice i ON sr.request_id = i.request_id
            WHERE sr.technician_id = ? 
            AND sr.status = 'Completed'
            AND i.payment_status = 'Paid'
            ORDER BY sr.request_date DESC, sr.request_id DESC
        `, [technician_id]);


        for (let request of requests) {
            const [phones] = await technicianDb.query(
                'SELECT phone_no FROM Phone_no WHERE customer_id = ? ORDER BY phone_no',
                [request.customer_id]
            );
            request.customer_phones = phones.map(p => p.phone_no);
        }

        res.json(requests);
    } catch (error) {
        console.error('Error fetching technician history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/requests/:request_id/start', async (req, res) => {
    try {
        const { request_id } = req.params;
        const { technician_id } = req.body;


        const [requests] = await technicianDb.query(
            'SELECT status, technician_id FROM Service_Request WHERE request_id = ?',
            [request_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        const request = requests[0];

        if (request.technician_id !== parseInt(technician_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only start pending requests' });
        }


        await technicianDb.query(
            "UPDATE Service_Request SET status = 'In Progress' WHERE request_id = ?",
            [request_id]
        );

        res.json({ message: 'Job started successfully' });
    } catch (error) {
        console.error('Error starting job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/requests/:request_id/finish', async (req, res) => {
    try {
        const { request_id } = req.params;
        const { technician_id, total_cost, issue_date } = req.body;


        if (!total_cost || total_cost <= 0) {
            return res.status(400).json({ message: 'Valid total cost is required' });
        }


        const [requests] = await technicianDb.query(
            'SELECT status, technician_id FROM Service_Request WHERE request_id = ?',
            [request_id]
        );

        if (requests.length === 0) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        const request = requests[0];

        if (request.technician_id !== parseInt(technician_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (request.status !== 'In Progress') {
            return res.status(400).json({ message: 'Can only finish in-progress requests' });
        }


        const [existingInvoice] = await technicianDb.query(
            'SELECT invoice_id FROM Invoice WHERE request_id = ?',
            [request_id]
        );

        if (existingInvoice.length > 0) {
            return res.status(400).json({ message: 'Invoice already exists for this request' });
        }


        const [result] = await technicianDb.query(
            `INSERT INTO Invoice (request_id, issue_date, total_cost, payment_status) 
             VALUES (?, ?, ?, 'Unpaid')`,
            [request_id, issue_date, total_cost]
        );

        res.json({ 
            message: 'Job completed and invoice created successfully',
            invoice_id: result.insertId
        });
    } catch (error) {
        console.error('Error finishing job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/invoices/:invoice_id/mark-paid', async (req, res) => {
    try {
        const { invoice_id } = req.params;
        const { technician_id } = req.body;


        const [invoices] = await technicianDb.query(`
            SELECT i.invoice_id, i.payment_status, sr.technician_id
            FROM Invoice i
            JOIN Service_Request sr ON i.request_id = sr.request_id
            WHERE i.invoice_id = ?
        `, [invoice_id]);

        if (invoices.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const invoice = invoices[0];

        if (invoice.technician_id !== parseInt(technician_id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (invoice.payment_status === 'Paid') {
            return res.status(400).json({ message: 'Invoice is already marked as paid' });
        }


        await technicianDb.query(
            "UPDATE Invoice SET payment_status = 'Paid' WHERE invoice_id = ?",
            [invoice_id]
        );

        res.json({ message: 'Invoice marked as paid successfully' });
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/:technician_id/profile', async (req, res) => {
    try {
        const { technician_id } = req.params;


        const [technicians] = await technicianDb.query(`
            SELECT 
                t.technician_id,
                t.fname,
                t.lname,
                t.phone_no,
                t.rating,
                t.photo,
                t.center_id,
                sc.center_name,
                sc.location AS center_location
            FROM Technician t
            LEFT JOIN Service_Center sc ON t.center_id = sc.center_id
            WHERE t.technician_id = ?
        `, [technician_id]);

        if (technicians.length === 0) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        const profile = technicians[0];


        if (profile.center_id) {
            const [centerRating] = await technicianDb.query(
                'SELECT get_average_rating(?) as center_rating',
                [profile.center_id]
            );
            profile.center_rating = centerRating[0].center_rating;
        } else {
            profile.center_rating = 0;
        }


        const [completedJobs] = await technicianDb.query(`
            SELECT COUNT(*) as count
            FROM Service_Request
            WHERE technician_id = ? AND status = 'Completed'
        `, [technician_id]);
        profile.completed_jobs = completedJobs[0].count;


        const [activeJobs] = await technicianDb.query(`
            SELECT COUNT(*) as count
            FROM Service_Request
            WHERE technician_id = ? AND status IN ('Pending', 'In Progress')
        `, [technician_id]);
        profile.active_jobs = activeJobs[0].count;


        const [skills] = await technicianDb.query(`
            SELECT skill
            FROM Skill
            WHERE technician_id = ?
            ORDER BY skill
        `, [technician_id]);
        profile.skills = skills.map(s => s.skill);

        res.json(profile);
    } catch (error) {
        console.error('Error fetching technician profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/:technician_id/profile', upload.single('photo'), async (req, res) => {
    try {
        const { technician_id } = req.params;
        const { fname, lname, phone_no } = req.body;


        if (!fname || fname.trim() === '') {
            return res.status(400).json({ message: 'First name is required' });
        }

        if (phone_no && !/^[0-9]{10}$/.test(phone_no)) {
            return res.status(400).json({ message: 'Phone number must be 10 digits' });
        }


        const [technicians] = await technicianDb.query(
            'SELECT technician_id FROM Technician WHERE technician_id = ?',
            [technician_id]
        );

        if (technicians.length === 0) {
            return res.status(404).json({ message: 'Technician not found' });
        }


        if (req.file) {

            await technicianDb.query(
                'UPDATE Technician SET fname = ?, lname = ?, phone_no = ?, photo = ? WHERE technician_id = ?',
                [fname.trim(), lname ? lname.trim() : null, phone_no, req.file.buffer, technician_id]
            );
        } else {

            await technicianDb.query(
                'UPDATE Technician SET fname = ?, lname = ?, phone_no = ? WHERE technician_id = ?',
                [fname.trim(), lname ? lname.trim() : null, phone_no, technician_id]
            );
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating technician profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/available-skills', async (req, res) => {
    try {

        const [appliances] = await technicianDb.query(`
            SELECT DISTINCT type
            FROM Appliance
            ORDER BY type
        `);
        
        const skills = appliances.map(a => a.type);
        res.json(skills);
    } catch (error) {
        console.error('Error fetching available skills:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/:technician_id/skills', async (req, res) => {
    try {
        const { technician_id } = req.params;
        const { skill } = req.body;

        if (!skill || skill.trim() === '') {
            return res.status(400).json({ message: 'Skill is required' });
        }


        const [technicians] = await technicianDb.query(
            'SELECT technician_id FROM Technician WHERE technician_id = ?',
            [technician_id]
        );

        if (technicians.length === 0) {
            return res.status(404).json({ message: 'Technician not found' });
        }


        const [existingSkills] = await technicianDb.query(
            'SELECT * FROM Skill WHERE technician_id = ? AND skill = ?',
            [technician_id, skill.trim()]
        );

        if (existingSkills.length > 0) {
            return res.status(400).json({ message: 'Skill already exists' });
        }


        await technicianDb.query(
            'INSERT INTO Skill (technician_id, skill) VALUES (?, ?)',
            [technician_id, skill.trim()]
        );

        res.json({ message: 'Skill added successfully' });
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete('/:technician_id/skills/:skill', async (req, res) => {
    try {
        const { technician_id, skill } = req.params;


        const [existingSkills] = await technicianDb.query(
            'SELECT * FROM Skill WHERE technician_id = ? AND skill = ?',
            [technician_id, skill]
        );

        if (existingSkills.length === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }


        await technicianDb.query(
            'DELETE FROM Skill WHERE technician_id = ? AND skill = ?',
            [technician_id, skill]
        );

        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
