-- Migration Script: Add pet and sitter review columns to Review table
-- Run this script if you have an existing database that needs to be updated
-- to support the new review functionality for pets and sitters

USE PetPlatform;

-- Add new columns to Review table (if they don't exist)
-- These columns allow reviews to be created directly for pets and sitters
-- instead of only through bookings

-- Add reviewed_pet_id column (allows reviews specifically for pets)
-- Note: MySQL doesn't support IF NOT EXISTS for ADD COLUMN, so check manually first
-- If column already exists, you'll get an error - that's okay, just skip this step
ALTER TABLE Review 
ADD COLUMN reviewed_pet_id INT,
ADD CONSTRAINT FK_Review_Pet FOREIGN KEY (reviewed_pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE;

-- Add reviewed_sitter_id column (allows reviews specifically for sitters)
ALTER TABLE Review 
ADD COLUMN reviewed_sitter_id INT,
ADD CONSTRAINT FK_Review_Sitter FOREIGN KEY (reviewed_sitter_id) REFERENCES User(user_id) ON DELETE CASCADE;

-- Make booking_id nullable (since reviews can now be created without a booking)
ALTER TABLE Review 
MODIFY COLUMN booking_id INT NULL;

-- Update foreign key constraint for booking_id to allow NULL
-- First, drop the existing foreign key (check the actual constraint name first)
-- You may need to run: SHOW CREATE TABLE Review; to find the constraint name
-- Common names: review_ibfk_1, Review_ibfk_1, or similar
-- If you get an error, check the constraint name and update accordingly
-- ALTER TABLE Review DROP FOREIGN KEY review_ibfk_1;

-- Add it back with ON DELETE SET NULL
ALTER TABLE Review 
ADD CONSTRAINT FK_Review_Booking FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE SET NULL;

-- Verify the changes
DESCRIBE Review;

