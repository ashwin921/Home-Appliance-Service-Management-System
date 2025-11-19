CREATE DATABASE IF NOT EXISTS home_service_db;
USE home_service_db;

CREATE TABLE Service_Center (
    center_id INT AUTO_INCREMENT PRIMARY KEY,
    center_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL
);

CREATE TABLE Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,  
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50),
    dob DATE,
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(100) NOT NULL,
    landmark VARCHAR(100),
    stage VARCHAR(50),
    city VARCHAR(50) NOT NULL,
    pincode CHAR(6) NOT NULL CHECK (pincode REGEXP '^[1-9][0-9]{5}$')
);

CREATE TABLE Technician (
    technician_id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50),
    phone_no VARCHAR(15),
    rating DECIMAL(2,1) CHECK (rating BETWEEN 0 AND 5),
    photo LONGBLOB,
    center_id INT,
    FOREIGN KEY (center_id) REFERENCES Service_Center(center_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Appliance (
    appliance_id INT,
    customer_id INT,
    type VARCHAR(50) NOT NULL,
    brand VARCHAR(50),
    model_no VARCHAR(50),
    PRIMARY KEY (appliance_id, customer_id),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Service_Request (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255),
    request_date DATE,
    status VARCHAR(20) DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    rating DECIMAL(2,1) CHECK (rating BETWEEN 1 AND 5),
    customer_id INT NOT NULL,
    technician_id INT,
    appliance_id INT,
    FOREIGN KEY (appliance_id, customer_id)
        REFERENCES Appliance(appliance_id, customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES Technician(technician_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE Invoice (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    issue_date DATE,
    total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
    payment_status VARCHAR(20) DEFAULT 'Unpaid'
        CHECK (payment_status IN ('Unpaid', 'Paid', 'Pending')),
    FOREIGN KEY (request_id) REFERENCES Service_Request(request_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Skill (
    technician_id INT NOT NULL,
    skill VARCHAR(50) NOT NULL,
    PRIMARY KEY (technician_id, skill),
    FOREIGN KEY (technician_id) REFERENCES Technician(technician_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Phone_no (
    customer_id INT NOT NULL,
    phone_no VARCHAR(15) NOT NULL
        CHECK (phone_no REGEXP '^[0-9]+$'),
    PRIMARY KEY (phone_no),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO Service_Center (center_name, location) VALUES
('FixIt Hub', 'Bangalore'),
('Appliance Care', 'Hyderabad'),
('TechPro Services', 'Chennai'),
('HomeEase Repairs', 'Pune'),
('QuickFix Solutions', 'Delhi');

INSERT INTO Customer (fname, lname, email, password_hash, address_line1, landmark, stage, city, pincode) VALUES
('Ravi', 'Kumar', 'ravi.kumar@gmail.com',
 SHA2('Ravi#123', 256),
 '#12, 2nd Floor, 5th Cross', 'Near BTM Bus Stop', 'BTM Layout', 'Bangalore', '560076'),

('Ananya', 'Rao', 'ananya.rao@gmail.com',
 SHA2('Ananya@456', 256),
 '#22, 1st Main Road', 'Opp. Cyber Towers', 'Madhapur', 'Hyderabad', '500081'),

('Karthik', 'Iyer', 'karthik.iyer@gmail.com',
 SHA2('Karthik$789', 256),
 '#45, 3rd Avenue', 'Beside City Mall', 'Anna Nagar', 'Chennai', '600040'),

('Sneha', 'Patil', 'sneha.patil@gmail.com',
 SHA2('Sneha*111', 256),
 '#18, Ground Floor, Lane 2', 'Near FC Road Signal', 'Shivajinagar', 'Pune', '411005'),

('Amit', 'Sharma', 'amit.sharma@gmail.com',
 SHA2('Amit!222', 256),
 '#7, 1st Floor, Block B', 'Close to Metro Station', 'Connaught Place', 'Delhi', '110001');

INSERT INTO Technician (fname, lname, phone_no, rating, center_id) VALUES
('Arun', 'Singh', '9876500001', 4.6, 1),
('Ravi', 'Teja', '9876500002', 4.3, 2),
('Suresh', 'Kumar', '9876500003', 4.8, 3),
('Pooja', 'Nair', '9876500004', 4.1, 4),
('Vivek', 'Gupta', '9876500005', 4.5, 5),
('Manoj', 'Verma', '9876500006', 4.2, 1),
('Rahul', 'Das', '9876500007', 4.0, 2),
('Priya', 'Menon', '9876500008', 4.7, 3),
('Deepak', 'Reddy', '9876500009', 4.4, 1),
('Lakshmi', 'Iyer', '9876500010', 4.9, 2),
('Rajesh', 'Pillai', '9876500011', 3.8, 3),
('Neha', 'Joshi', '9876500012', 4.3, 4),
('Vijay', 'Kumar', '9876500013', 4.6, 5),
('Kavya', 'Sharma', '9876500014', 4.1, 1),
('Sanjay', 'Rao', '9876500015', 4.5, 2),
('Meera', 'Singh', '9876500016', 4.2, 3),
('Ankit', 'Verma', '9876500017', 4.7, 4),
('Divya', 'Nair', '9876500018', 4.0, 5),
('Arjun', 'Patel', '9876500019', 4.8, 1),
('Sowmya', 'Das', '9876500020', 4.4, 2),
('Kiran', 'Gupta', '9876500021', 4.3, 3),
('Snehal', 'Reddy', '9876500022', 4.6, 4),
('Nikhil', 'Kumar', '9876500023', 4.1, 5),
('Asha', 'Menon', '9876500024', 4.9, 1),
('Ramesh', 'Iyer', '9876500025', 4.5, 2);

UPDATE Technician
SET photo = LOAD_FILE('C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/male.png')
WHERE technician_id IN (1,2,3,5,6,7,9,11,13,15,17,19,21,23,25);

UPDATE Technician
SET photo = LOAD_FILE('C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/female.png')
WHERE technician_id IN (4,8,10,12,14,16,18,20,22,24);

INSERT INTO Skill VALUES
(1,'Refrigerator'),(1,'Washing Machine'),
(2,'Air Conditioner'),
(3,'Microwave'),(3,'Television'),
(4,'Washing Machine'),(4,'Television'),
(5,'Air Conditioner'),
(6,'Television'),
(7,'Refrigerator'),
(8,'Microwave'),
(9,'Refrigerator'),(9,'Air Conditioner'),
(10,'Washing Machine'),(10,'Microwave'),
(11,'Television'),(11,'Refrigerator'),
(12,'Air Conditioner'),(12,'Washing Machine'),
(13,'Microwave'),(13,'Television'),
(14,'Refrigerator'),(14,'Air Conditioner'),
(15,'Washing Machine'),(15,'Microwave'),
(16,'Television'),(16,'Refrigerator'),
(17,'Air Conditioner'),(17,'Washing Machine'),(17,'Television'),
(18,'Microwave'),(18,'Television'),
(19,'Refrigerator'),(19,'Washing Machine'),(19,'Air Conditioner'),
(20,'Television'),(20,'Microwave'),
(21,'Refrigerator'),(21,'Air Conditioner'),
(22,'Washing Machine'),(22,'Microwave'),
(23,'Television'),(23,'Refrigerator'),
(24,'Air Conditioner'),(24,'Washing Machine'),(24,'Microwave'),
(25,'Television'),(25,'Refrigerator'),(25,'Air Conditioner');

INSERT INTO Appliance VALUES
(1,1,'Refrigerator','LG','GL-I292RPZL'),
(2,1,'Washing Machine','Samsung','WW65R20'),
(1,2,'Air Conditioner','Daikin','FTHT35'),
(1,3,'Microwave','IFB','25SC4'),
(1,4,'Television','Sony','BraviaX80'),
(1,5,'Refrigerator','Whirlpool','IF278'),
(2,5,'Air Conditioner','Voltas','183V');

INSERT INTO Phone_no VALUES
(1,'9800011001'),(1,'9800011002'),
(2,'9900099001'),
(3,'9900099002'),
(4,'9800022001'),
(5,'9800033001');

INSERT INTO Service_Request (customer_id, appliance_id, description, request_date, status, technician_id, rating)
VALUES
(1,1,'Fridge not cooling','2025-10-20','Completed',1,4.5),       
(1,2,'Washer drum not spinning','2025-10-22','Completed',1,4.8), 
(2,1,'AC making noise','2025-10-18','Completed',2,4.2),          
(3,1,'Microwave wont heat','2025-10-25','Completed',3,5.0),      
(4,1,'TV screen flickering','2025-10-27','Completed',4,4.0),     
(5,1,'Fridge ice build-up','2025-10-21','Completed',23,4.3),     
(5,2,'AC not cooling','2025-10-28','Completed',5,4.7);           

INSERT INTO Invoice (request_id, total_cost, payment_status, issue_date)
VALUES
(1,1400.00,'Paid','2025-10-21'),
(2,1600.00,'Paid','2025-10-23'),
(3,1800.00,'Paid','2025-10-19'),
(4,2000.00,'Paid','2025-10-26'),
(5,1500.00,'Paid','2025-10-28'),
(6,1200.00,'Paid','2025-10-22'),
(7,1900.00,'Paid','2025-10-29');





DELIMITER $$

CREATE TRIGGER after_invoice_insert_complete
AFTER INSERT ON Invoice
FOR EACH ROW
BEGIN
    UPDATE Service_Request
    SET status='Completed'
    WHERE request_id = NEW.request_id;
END$$

CREATE TRIGGER after_service_rating_update
AFTER UPDATE ON Service_Request
FOR EACH ROW
BEGIN
    IF NEW.rating IS NOT NULL AND OLD.rating IS NULL AND NEW.technician_id IS NOT NULL THEN
        UPDATE Technician
        SET rating = (
            SELECT ROUND(AVG(rating), 1)
            FROM Service_Request
            WHERE technician_id = NEW.technician_id
            AND rating IS NOT NULL
        )
        WHERE technician_id = NEW.technician_id;
    END IF;
END$$

CREATE TRIGGER before_sr_insert_assign
BEFORE INSERT ON Service_Request
FOR EACH ROW
BEGIN
    DECLARE v_type VARCHAR(100);
    DECLARE v_best_tech INT;

    IF NEW.appliance_id IS NOT NULL AND NEW.customer_id IS NOT NULL AND NEW.technician_id IS NULL THEN
        
        SELECT type INTO v_type
        FROM Appliance
        WHERE appliance_id = NEW.appliance_id AND customer_id = NEW.customer_id LIMIT 1;

        IF v_type IS NOT NULL THEN
            SELECT t.technician_id INTO v_best_tech
            FROM Technician t
            INNER JOIN Skill s ON s.technician_id = t.technician_id AND s.skill = v_type
            INNER JOIN Service_Center sc ON sc.center_id = t.center_id
            INNER JOIN Customer cu ON cu.customer_id = NEW.customer_id
            LEFT JOIN Service_Request sr ON sr.technician_id = t.technician_id
              AND sr.status IN ('Pending','In Progress')
            WHERE sc.location = cu.city
            GROUP BY t.technician_id
            ORDER BY COUNT(sr.request_id) ASC, t.rating DESC
            LIMIT 1;

            IF v_best_tech IS NOT NULL THEN
                SET NEW.technician_id = v_best_tech;
            END IF;
        END IF;
    END IF;
END$$

CREATE TRIGGER before_sr_update_reassign
BEFORE UPDATE ON Service_Request
FOR EACH ROW
BEGIN
    DECLARE v_type VARCHAR(100);
    DECLARE v_best_tech INT;

    IF OLD.technician_id IS NOT NULL AND NEW.technician_id IS NULL AND NEW.status = 'Pending' THEN
        
        SELECT type INTO v_type
        FROM Appliance
        WHERE appliance_id = NEW.appliance_id AND customer_id = NEW.customer_id LIMIT 1;

        IF v_type IS NOT NULL THEN
            SELECT t.technician_id INTO v_best_tech
            FROM Technician t
            INNER JOIN Skill s ON s.technician_id = t.technician_id AND s.skill = v_type
            INNER JOIN Service_Center sc ON sc.center_id = t.center_id
            INNER JOIN Customer cu ON cu.customer_id = NEW.customer_id
            LEFT JOIN Service_Request sr ON sr.technician_id = t.technician_id
              AND sr.status IN ('Pending','In Progress')
            WHERE sc.location = cu.city
            GROUP BY t.technician_id
            ORDER BY COUNT(sr.request_id) ASC, t.rating DESC
            LIMIT 1;

            IF v_best_tech IS NOT NULL THEN
                SET NEW.technician_id = v_best_tech;
            END IF;
        END IF;
    END IF;
END$$



CREATE FUNCTION get_average_rating(p_center_id INT)
RETURNS DECIMAL(3,2)
DETERMINISTIC
BEGIN
    DECLARE avg_rating DECIMAL(3,2) DEFAULT 0;
    SELECT AVG(rating) INTO avg_rating FROM Technician WHERE center_id=p_center_id;
    RETURN IFNULL(avg_rating,0);
END$$



CREATE PROCEDURE get_customer_service_summary(IN cust_id INT)
BEGIN
    SELECT 
        sr.request_id,
        sr.description,
        sr.request_date,
        sr.status,
        sr.rating AS service_rating,
        a.type AS appliance_type,
        a.brand AS appliance_brand,
        a.model_no AS appliance_model,
        t.technician_id,
        CONCAT(t.fname, ' ', IFNULL(t.lname, '')) AS technician_name,
        t.phone_no AS technician_phone,
        t.photo AS technician_photo,
        i.total_cost,
        i.payment_status
    FROM Service_Request sr
    JOIN Appliance a ON sr.appliance_id = a.appliance_id AND sr.customer_id = a.customer_id
    LEFT JOIN Technician t ON sr.technician_id = t.technician_id
    LEFT JOIN Invoice i ON sr.request_id = i.request_id
    WHERE sr.customer_id = cust_id
    ORDER BY sr.request_date DESC, sr.request_id DESC;
END$$

DELIMITER ;


CREATE USER 'customer_user'@'localhost' IDENTIFIED BY 'customer_pass123';

GRANT ALL PRIVILEGES ON home_service_db.Customer TO 'customer_user'@'localhost';
GRANT ALL PRIVILEGES ON home_service_db.Phone_no TO 'customer_user'@'localhost';
GRANT ALL PRIVILEGES ON home_service_db.Service_Request TO 'customer_user'@'localhost';
GRANT ALL PRIVILEGES ON home_service_db.Appliance TO 'customer_user'@'localhost';

GRANT SELECT ON home_service_db.Technician TO 'customer_user'@'localhost';
GRANT SELECT ON home_service_db.Service_Center TO 'customer_user'@'localhost';
GRANT SELECT ON home_service_db.Skill TO 'customer_user'@'localhost';
GRANT SELECT ON home_service_db.Invoice TO 'customer_user'@'localhost';


GRANT EXECUTE ON PROCEDURE home_service_db.get_customer_service_summary TO 'customer_user'@'localhost';



CREATE USER 'technician_user'@'localhost' IDENTIFIED BY 'technician_pass123';


GRANT ALL PRIVILEGES ON home_service_db.Technician TO 'technician_user'@'localhost';
GRANT ALL PRIVILEGES ON home_service_db.Skill TO 'technician_user'@'localhost';
GRANT ALL PRIVILEGES ON home_service_db.Service_Request TO 'technician_user'@'localhost';
GRANT ALL PRIVILEGES ON home_service_db.Invoice TO 'technician_user'@'localhost';


GRANT SELECT ON home_service_db.Customer TO 'technician_user'@'localhost';
GRANT SELECT ON home_service_db.Phone_no TO 'technician_user'@'localhost';
GRANT SELECT ON home_service_db.Appliance TO 'technician_user'@'localhost';
GRANT SELECT ON home_service_db.Service_Center TO 'technician_user'@'localhost';


GRANT EXECUTE ON FUNCTION home_service_db.get_average_rating TO 'technician_user'@'localhost';


FLUSH PRIVILEGES;
