-- Safe Migration Script: Add pet and sitter review columns to Review table
-- This script safely checks if columns exist before adding them
-- Run this script on your production database (Render, etc.)

USE PetPlatform;

-- Check and add reviewed_pet_id column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'PetPlatform' 
  AND TABLE_NAME = 'Review' 
  AND COLUMN_NAME = 'reviewed_pet_id'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE Review ADD COLUMN reviewed_pet_id INT NULL',
  'SELECT "Column reviewed_pet_id already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add reviewed_sitter_id column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'PetPlatform' 
  AND TABLE_NAME = 'Review' 
  AND COLUMN_NAME = 'reviewed_sitter_id'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE Review ADD COLUMN reviewed_sitter_id INT NULL',
  'SELECT "Column reviewed_sitter_id already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make booking_id nullable if it's not already
SET @col_exists = (
  SELECT IS_NULLABLE 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'PetPlatform' 
  AND TABLE_NAME = 'Review' 
  AND COLUMN_NAME = 'booking_id'
);

SET @sql = IF(@col_exists = 'NO',
  'ALTER TABLE Review MODIFY COLUMN booking_id INT NULL',
  'SELECT "Column booking_id is already nullable" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for reviewed_pet_id if it doesn't exist
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'PetPlatform' 
  AND TABLE_NAME = 'Review' 
  AND COLUMN_NAME = 'reviewed_pet_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE Review ADD CONSTRAINT FK_Review_Pet FOREIGN KEY (reviewed_pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE',
  'SELECT "Foreign key FK_Review_Pet already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for reviewed_sitter_id if it doesn't exist
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = 'PetPlatform' 
  AND TABLE_NAME = 'Review' 
  AND COLUMN_NAME = 'reviewed_sitter_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE Review ADD CONSTRAINT FK_Review_Sitter FOREIGN KEY (reviewed_sitter_id) REFERENCES User(user_id) ON DELETE CASCADE',
  'SELECT "Foreign key FK_Review_Sitter already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the changes
DESCRIBE Review;

