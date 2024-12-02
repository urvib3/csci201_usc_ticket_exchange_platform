-- Create the WeatherConditions database
CREATE DATABASE TicketExchange;

-- Use the newly created database
USE TicketExchange;

-- Create the 'users' table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,  -- Automatically increments user_id
    username VARCHAR(255) NOT NULL UNIQUE,   -- Unique username for each user
    password VARCHAR(255) NOT NULL,          -- Password (hashed/encrypted in practice)
    university VARCHAR(255) NOT NULL,    	 -- University (required)       
    phone_number VARCHAR(15), 				 -- Phone Number (optional)
    socials VARCHAR(255)					 -- Socials (optional)
);