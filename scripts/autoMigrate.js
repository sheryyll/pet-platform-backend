const db = require('../config/database');

/**
 * Auto-migration script to add missing columns to Review table
 * This runs automatically on server startup
 */
async function autoMigrateReviewTable() {
  try {
    console.log('🔍 Checking Review table schema...');
    
    // Get database name
    const [dbInfo] = await db.query('SELECT DATABASE() as db_name');
    const dbName = dbInfo[0]?.db_name || process.env.DB_NAME || 'PetPlatform';
    
    // Check if reviewed_pet_id exists
    const [petColumn] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Review' 
      AND COLUMN_NAME = 'reviewed_pet_id'
    `, [dbName]);
    
    // Check if reviewed_sitter_id exists
    const [sitterColumn] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Review' 
      AND COLUMN_NAME = 'reviewed_sitter_id'
    `, [dbName]);
    
    let migrationsRun = 0;
    
    // Add reviewed_pet_id if missing
    if (petColumn.length === 0) {
      console.log('📝 Adding reviewed_pet_id column...');
      try {
        await db.query('ALTER TABLE Review ADD COLUMN reviewed_pet_id INT NULL');
        console.log('✅ Added reviewed_pet_id column');
        migrationsRun++;
      } catch (error) {
        console.error('❌ Error adding reviewed_pet_id:', error.message);
      }
    } else {
      console.log('✓ reviewed_pet_id column exists');
    }
    
    // Add reviewed_sitter_id if missing
    if (sitterColumn.length === 0) {
      console.log('📝 Adding reviewed_sitter_id column...');
      try {
        await db.query('ALTER TABLE Review ADD COLUMN reviewed_sitter_id INT NULL');
        console.log('✅ Added reviewed_sitter_id column');
        migrationsRun++;
      } catch (error) {
        console.error('❌ Error adding reviewed_sitter_id:', error.message);
      }
    } else {
      console.log('✓ reviewed_sitter_id column exists');
    }
    
    // Add foreign key constraints if columns were added
    if (migrationsRun > 0) {
      try {
        // Check if foreign key for reviewed_pet_id exists
        const [petFK] = await db.query(`
          SELECT CONSTRAINT_NAME 
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
          WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = 'Review' 
          AND COLUMN_NAME = 'reviewed_pet_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL
        `, [dbName]);
        
        if (petFK.length === 0) {
          console.log('📝 Adding foreign key constraint for reviewed_pet_id...');
          await db.query(`
            ALTER TABLE Review 
            ADD CONSTRAINT FK_Review_Pet 
            FOREIGN KEY (reviewed_pet_id) 
            REFERENCES Pet(pet_id) 
            ON DELETE CASCADE
          `);
          console.log('✅ Added foreign key constraint for reviewed_pet_id');
        }
      } catch (error) {
        console.warn('⚠️ Could not add foreign key for reviewed_pet_id:', error.message);
      }
      
      try {
        // Check if foreign key for reviewed_sitter_id exists
        const [sitterFK] = await db.query(`
          SELECT CONSTRAINT_NAME 
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
          WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = 'Review' 
          AND COLUMN_NAME = 'reviewed_sitter_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL
        `, [dbName]);
        
        if (sitterFK.length === 0) {
          console.log('📝 Adding foreign key constraint for reviewed_sitter_id...');
          await db.query(`
            ALTER TABLE Review 
            ADD CONSTRAINT FK_Review_Sitter 
            FOREIGN KEY (reviewed_sitter_id) 
            REFERENCES User(user_id) 
            ON DELETE CASCADE
          `);
          console.log('✅ Added foreign key constraint for reviewed_sitter_id');
        }
      } catch (error) {
        console.warn('⚠️ Could not add foreign key for reviewed_sitter_id:', error.message);
      }
    }
    
    // Make booking_id nullable if needed
    try {
      const [bookingCol] = await db.query(`
        SELECT IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'Review' 
        AND COLUMN_NAME = 'booking_id'
      `, [dbName]);
      
      if (bookingCol.length > 0 && bookingCol[0].IS_NULLABLE === 'NO') {
        console.log('📝 Making booking_id nullable...');
        await db.query('ALTER TABLE Review MODIFY COLUMN booking_id INT NULL');
        console.log('✅ Made booking_id nullable');
      }
    } catch (error) {
      console.warn('⚠️ Could not modify booking_id:', error.message);
    }
    
    if (migrationsRun === 0) {
      console.log('✅ Review table schema is up to date');
    } else {
      console.log(`✅ Migration completed: ${migrationsRun} column(s) added`);
    }
    
  } catch (error) {
    console.error('❌ Auto-migration error:', error);
    // Don't throw - allow server to start even if migration fails
  }
}

module.exports = autoMigrateReviewTable;

