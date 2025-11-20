# Database Migration Guide - Review Functionality

## Problem
The Review table needs additional columns (`reviewed_pet_id` and `reviewed_sitter_id`) to support the new review functionality for pets and sitters.

## Solution
Run the migration script on your production database (Render, etc.)

## Steps for Render.com

### Option 1: Using Render MySQL Database Dashboard
1. Go to your Render dashboard
2. Navigate to your MySQL database instance
3. Click on "Connect" or "Open MySQL Shell"
4. Copy and paste the contents of `migration_add_review_columns_safe.sql`
5. Execute the script

### Option 2: Using MySQL Command Line
1. Connect to your Render MySQL database:
   ```bash
   mysql -h <render-mysql-host> -u <username> -p <database-name>
   ```
2. Run the migration script:
   ```bash
   source migration_add_review_columns_safe.sql
   ```
   OR paste the contents directly into the MySQL prompt

### Option 3: Direct SQL Execution
If you have database credentials, you can execute this directly:

```sql
USE PetPlatform;

-- Add reviewed_pet_id column (safe - checks if exists first)
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

-- Add reviewed_sitter_id column (safe - checks if exists first)
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

-- Make booking_id nullable
ALTER TABLE Review MODIFY COLUMN booking_id INT NULL;

-- Add foreign key for reviewed_pet_id
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

-- Add foreign key for reviewed_sitter_id
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
```

## Verify Migration
After running the migration, verify it worked:

```sql
DESCRIBE Review;
```

You should see:
- `reviewed_pet_id` (INT, NULL)
- `reviewed_sitter_id` (INT, NULL)

## After Migration
1. Restart your backend server on Render
2. Test the review endpoints:
   - GET `/api/reviews/pets/1` - should return empty array or existing reviews
   - GET `/api/reviews/sitters/1` - should return empty array or existing reviews

## Troubleshooting
- If you get foreign key constraint errors, you may need to drop existing constraints first
- Check Render logs for any SQL errors
- The controller now checks for column existence and returns helpful error messages if columns are missing

