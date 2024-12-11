-- Drop if exists
DROP DATABASE IF EXISTS DatabaseName;

-- Create the WeatherConditions database
CREATE DATABASE TicketExchange;

-- Use the newly created database
USE TicketExchange;

-- Create the 'users' table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,  -- Automatically increments user_id
    fullname VARCHAR(255) NOT NULL,   -- Unique username for each user
    username VARCHAR(255) NOT NULL UNIQUE,   -- Unique username for each user
    password VARCHAR(255) NOT NULL,          -- Password (hashed/encrypted in practice)
    university VARCHAR(255) NOT NULL,    	 -- University (required)       
    phone_number VARCHAR(15), 				 -- Phone Number (optional)
    socials VARCHAR(255)					 -- Socials (optional)
);

CREATE TABLE tickets (
    ticketID INT AUTO_INCREMENT PRIMARY KEY,  -- Automatically increments user_id
    user_id INT NOT NULL,
    eventName VARCHAR(255) NOT NULL,
    startDate INT NOT NULL,
    endDate INT NOT NULL,
    ticketPrice FLOAT NOT NULL,
    additionalInfo VARCHAR(1500),
    negotiable BOOLEAN NOT NULL,
    numTickets INT NOT NULL,
    status INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)

-- Create the offers table
CREATE TABLE offers (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,  -- Automatically increments offer_id
    buyer_id INT NOT NULL,                    -- Buyer ID (references users table)
    seller_id INT NOT NULL,                   -- Seller ID (references users table)
    ticket_id INT NOT NULL,                   -- Ticket ID (references Ticket table)
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,  -- References the 'users' table for buyer
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE, -- References the 'users' table for seller
    FOREIGN KEY (ticket_id) REFERENCES Ticket(ticket_id) ON DELETE CASCADE -- References the 'Ticket' table
);

-- Create the past offers table
CREATE TABLE pastoffers (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,  -- Automatically increments offer_id
    buyer_id INT NOT NULL,                    -- Buyer ID (references users table)
    seller_id INT NOT NULL,                   -- Seller ID (references users table)
    ticket_id INT NOT NULL,                   -- Ticket ID (references Ticket table)
    status VARCHAR(20) NOT NULL,              -- status: approved or rejected
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,  -- References the 'users' table for buyer
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE, -- References the 'users' table for seller
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticketID) ON DELETE CASCADE -- References the 'Ticket' table
);
