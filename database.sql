-- Create the database and use it
CREATE DATABASE IF NOT EXISTS PetPlatform;

USE PetPlatform;

-- Create Location table first (since it's referenced later)
CREATE TABLE IF NOT EXISTS Location (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    area VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(10)
);

-- Create User table (depends on Location)
CREATE TABLE IF NOT EXISTS User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    user_type ENUM('Owner', 'Sitter', 'Both') DEFAULT 'Owner',
    address VARCHAR(255),
    location_id INT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    FOREIGN KEY (location_id) REFERENCES Location(location_id)
);

-- Create Pet table (depends on User)
CREATE TABLE IF NOT EXISTS Pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT,
    pet_name VARCHAR(100),
    species ENUM('Dog', 'Cat', 'Rabbit', 'Bird', 'Other'),
    breed VARCHAR(100),
    age INT,
    gender ENUM('Male', 'Female'),
    vaccinated ENUM('Y', 'N') DEFAULT 'N',
    status ENUM('Available', 'Adopted', 'Being_Sat') DEFAULT 'Available',
    FOREIGN KEY (owner_id) REFERENCES User(user_id)
);

-- Create AdoptionRequest table (depends on Pet, User)
CREATE TABLE IF NOT EXISTS AdoptionRequest (
    adoption_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT,
    adopter_id INT,
    request_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id),
    FOREIGN KEY (adopter_id) REFERENCES User(user_id)
);

-- Create SittingRequest table (depends on Pet, User)
CREATE TABLE IF NOT EXISTS SittingRequest (
    sitting_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT,
    sitter_id INT,
    pet_id INT,
    start_date DATE,
    end_date DATE,
    total_cost DECIMAL(10,2),
    status ENUM('Pending', 'Accepted', 'Completed', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (owner_id) REFERENCES User(user_id),
    FOREIGN KEY (sitter_id) REFERENCES User(user_id),
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id)
);

-- Create Booking table (independent)
CREATE TABLE IF NOT EXISTS Booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    request_type ENUM('Adoption', 'Sitting'),
    request_id INT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Confirmed', 'Completed', 'Cancelled') DEFAULT 'Confirmed'
);

-- Create Payment table (depends on Booking)
CREATE TABLE IF NOT EXISTS Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    amount DECIMAL(10,2),
    payment_method ENUM('CreditCard', 'UPI', 'NetBanking', 'Cash') DEFAULT 'UPI',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('Paid', 'Failed', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id)
);

-- Create Review table (depends on Booking, User, Pet)
CREATE TABLE IF NOT EXISTS Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    reviewed_pet_id INT,
    reviewed_sitter_id INT,
    reviewer_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_sitter_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- Insert sample data

-- 1️ Insert sample locations
INSERT INTO Location (area, city, pincode)
VALUES
('Koramangala', 'Bangalore', '560095'),
('Viman Nagar', 'Pune', '411014'),
('Adyar', 'Chennai', '600020')
ON DUPLICATE KEY UPDATE area=area;

-- 2️ Insert sample users (Note: passwords are hashed in production)
INSERT INTO User (name, email, phone, password, user_type, address, location_id, rating)
VALUES
('Alice Johnson', 'alice@example.com', '9876543210', 'pass123', 'Owner', '123, Koramangala', 1, 4.8),
('Bob Williams', 'bob@example.com', '9123456789', 'pass456', 'Sitter', '45, Viman Nagar', 2, 4.5),
('Charlie Smith', 'charlie@example.com', '9988776655', 'pass789', 'Both', '78, Adyar', 3, 4.9)
ON DUPLICATE KEY UPDATE name=name;

-- 3️ Insert sample pets
INSERT INTO Pet (owner_id, pet_name, species, breed, age, gender, vaccinated, status)
VALUES
(1, 'Buddy', 'Dog', 'Golden Retriever', 3, 'Male', 'Y', 'Available'),
(1, 'Mittens', 'Cat', 'Persian', 2, 'Female', 'Y', 'Available'),
(3, 'Coco', 'Rabbit', 'Dutch', 1, 'Female', 'N', 'Being_Sat')
ON DUPLICATE KEY UPDATE pet_name=pet_name;

-- 4️ Insert sample adoption requests
INSERT INTO AdoptionRequest (pet_id, adopter_id, request_date, status)
VALUES
(1, 3, '2025-10-10', 'Approved'),
(2, 2, '2025-10-20', 'Pending')
ON DUPLICATE KEY UPDATE pet_id=pet_id;

-- 5️ Insert sample sitting requests
INSERT INTO SittingRequest (owner_id, sitter_id, pet_id, start_date, end_date, total_cost, status)
VALUES
(1, 2, 3, '2025-10-01', '2025-10-05', 2500.00, 'Completed'),
(3, 1, 1, '2025-10-15', '2025-10-18', 1800.00, 'Accepted')
ON DUPLICATE KEY UPDATE owner_id=owner_id;

-- 6️ Insert sample bookings
INSERT INTO Booking (request_type, request_id, date_created, status)
VALUES
('Adoption', 1, '2025-10-10 10:00:00', 'Completed'),
('Sitting', 1, '2025-10-01 09:00:00', 'Completed')
ON DUPLICATE KEY UPDATE request_type=request_type;

-- 7️ Insert sample payments
INSERT INTO Payment (booking_id, amount, payment_method, payment_status)
VALUES
(1, 0.00, 'Cash', 'Paid'),          -- adoption (no fee)
(2, 2500.00, 'UPI', 'Paid')        -- pet sitting fee
ON DUPLICATE KEY UPDATE booking_id=booking_id;

-- 8️ Insert sample reviews
INSERT INTO Review (booking_id, reviewer_id, rating, comment)
VALUES
(2, 1, 5, 'Excellent pet sitting experience! Buddy was happy and well cared for.'),
(1, 3, 4, 'Smooth adoption process. Thank you!')
ON DUPLICATE KEY UPDATE booking_id=booking_id;

-- Show all created tables
SHOW TABLES;
