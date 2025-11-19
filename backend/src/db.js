const mysql = require('mysql2');
require('dotenv').config();


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});


const customerPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: 'customer_user',
    password: 'customer_pass123',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});


const technicianPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: 'technician_user',
    password: 'technician_pass123',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});


const promisePool = pool.promise();
const customerPromisePool = customerPool.promise();
const technicianPromisePool = technicianPool.promise();

module.exports = {
    db: promisePool,              
    customerDb: customerPromisePool,     
    technicianDb: technicianPromisePool  
};
