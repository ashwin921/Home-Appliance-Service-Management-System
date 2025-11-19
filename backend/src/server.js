const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/auth');
const applianceRoutes = require('./routes/appliances');
const serviceRequestRoutes = require('./routes/serviceRequests');
const customerRoutes = require('./routes/customer');
const technicianRoutes = require('./routes/technician');


app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/appliances', applianceRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/technician', technicianRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});