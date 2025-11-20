const db = require('../config/database');

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, 
             u.name as reviewer_name, 
             u.email as reviewer_email,
             p.pet_name,
             p.species,
             s.name as sitter_name,
             b.request_type
      FROM Review r
      LEFT JOIN User u ON r.reviewer_id = u.user_id
      LEFT JOIN Pet p ON r.reviewed_pet_id = p.pet_id
      LEFT JOIN User s ON r.reviewed_sitter_id = s.user_id
      LEFT JOIN Booking b ON r.booking_id = b.booking_id
      ORDER BY r.review_date DESC
    `);
    res.json(reviews);
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Get review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const [reviews] = await db.query(`
      SELECT r.*, 
             u.name as reviewer_name, 
             u.email as reviewer_email,
             p.pet_name,
             p.species,
             s.name as sitter_name,
             b.request_type
      FROM Review r
      LEFT JOIN User u ON r.reviewer_id = u.user_id
      LEFT JOIN Pet p ON r.reviewed_pet_id = p.pet_id
      LEFT JOIN User s ON r.reviewed_sitter_id = s.user_id
      LEFT JOIN Booking b ON r.booking_id = b.booking_id
      WHERE r.review_id = ?
    `, [id]);
    
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(reviews[0]);
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ message: 'Error fetching review', error: error.message });
  }
};

// Get reviews for a specific pet
exports.getReviewsForPet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if the column exists
    const [dbInfo] = await db.query('SELECT DATABASE() as db_name');
    const dbName = dbInfo[0]?.db_name || process.env.DB_NAME || 'PetPlatform';
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Review' 
      AND COLUMN_NAME = 'reviewed_pet_id'
    `, [dbName]);
    
    if (columns.length === 0) {
      // Column doesn't exist, return empty array or migration message
      console.warn('Column reviewed_pet_id does not exist in Review table. Please run migration script.');
      return res.json([]);
    }
    
    const [reviews] = await db.query(`
      SELECT r.*, 
             u.name as reviewer_name, 
             u.email as reviewer_email,
             p.pet_name,
             p.species
      FROM Review r
      LEFT JOIN User u ON r.reviewer_id = u.user_id
      LEFT JOIN Pet p ON r.reviewed_pet_id = p.pet_id
      WHERE r.reviewed_pet_id = ?
      ORDER BY r.review_date DESC
    `, [id]);
    
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews for pet error:', error);
    res.status(500).json({ message: 'Error fetching reviews for pet', error: error.message });
  }
};

// Get reviews for a specific sitter
exports.getReviewsForSitter = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if the column exists
    const [dbInfo] = await db.query('SELECT DATABASE() as db_name');
    const dbName = dbInfo[0]?.db_name || process.env.DB_NAME || 'PetPlatform';
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Review' 
      AND COLUMN_NAME = 'reviewed_sitter_id'
    `, [dbName]);
    
    if (columns.length === 0) {
      // Column doesn't exist, return empty array or migration message
      console.warn('Column reviewed_sitter_id does not exist in Review table. Please run migration script.');
      return res.json([]);
    }
    
    const [reviews] = await db.query(`
      SELECT r.*, 
             u.name as reviewer_name, 
             u.email as reviewer_email,
             s.name as sitter_name,
             p.pet_name,
             p.species
      FROM Review r
      LEFT JOIN User u ON r.reviewer_id = u.user_id
      LEFT JOIN User s ON r.reviewed_sitter_id = s.user_id
      LEFT JOIN Pet p ON r.reviewed_pet_id = p.pet_id
      WHERE r.reviewed_sitter_id = ?
      ORDER BY r.review_date DESC
    `, [id]);
    
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews for sitter error:', error);
    res.status(500).json({ message: 'Error fetching reviews for sitter', error: error.message });
  }
};

// Get reviews that include both pet and sitter (combined reviews)
exports.getCombinedReviews = async (req, res) => {
  try {
    const { petId, sitterId } = req.params;
    const [reviews] = await db.query(`
      SELECT r.*, 
             u.name as reviewer_name, 
             u.email as reviewer_email,
             p.pet_name,
             p.species,
             s.name as sitter_name
      FROM Review r
      LEFT JOIN User u ON r.reviewer_id = u.user_id
      LEFT JOIN Pet p ON r.reviewed_pet_id = p.pet_id
      LEFT JOIN User s ON r.reviewed_sitter_id = s.user_id
      WHERE r.reviewed_pet_id = ? AND r.reviewed_sitter_id = ?
      ORDER BY r.review_date DESC
    `, [petId, sitterId]);
    
    res.json(reviews);
  } catch (error) {
    console.error('Get combined reviews error:', error);
    res.status(500).json({ message: 'Error fetching combined reviews', error: error.message });
  }
};

// Create review for a pet
exports.createPetReview = async (req, res) => {
  try {
    const { pet_id, reviewer_id, rating, comment } = req.body;

    // Validate required fields
    if (!pet_id || !reviewer_id || !rating) {
      return res.status(400).json({ 
        message: 'Missing required fields: pet_id, reviewer_id, and rating are required' 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if the column exists
    const [dbInfo] = await db.query('SELECT DATABASE() as db_name');
    const dbName = dbInfo[0]?.db_name || process.env.DB_NAME || 'PetPlatform';
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Review' 
      AND COLUMN_NAME = 'reviewed_pet_id'
    `, [dbName]);
    
    if (columns.length === 0) {
      return res.status(500).json({ 
        message: 'Database schema not updated. Please run migration script to add reviewed_pet_id column.' 
      });
    }

    // Check if pet exists
    const [pets] = await db.query('SELECT pet_id FROM Pet WHERE pet_id = ?', [pet_id]);
    if (pets.length === 0) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if reviewer exists
    const [users] = await db.query('SELECT user_id FROM User WHERE user_id = ?', [reviewer_id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    // Create the review
    const [result] = await db.query(
      'INSERT INTO Review (reviewed_pet_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [pet_id, reviewer_id, rating, comment || null]
    );

    res.status(201).json({
      message: 'Pet review created successfully',
      review_id: result.insertId
    });
  } catch (error) {
    console.error('Create pet review error:', error);
    res.status(500).json({ message: 'Error creating pet review', error: error.message });
  }
};

// Create review for a sitter
exports.createSitterReview = async (req, res) => {
  try {
    const { sitter_id, reviewer_id, rating, comment } = req.body;

    // Validate required fields
    if (!sitter_id || !reviewer_id || !rating) {
      return res.status(400).json({ 
        message: 'Missing required fields: sitter_id, reviewer_id, and rating are required' 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if the column exists
    const [dbInfo] = await db.query('SELECT DATABASE() as db_name');
    const dbName = dbInfo[0]?.db_name || process.env.DB_NAME || 'PetPlatform';
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Review' 
      AND COLUMN_NAME = 'reviewed_sitter_id'
    `, [dbName]);
    
    if (columns.length === 0) {
      return res.status(500).json({ 
        message: 'Database schema not updated. Please run migration script to add reviewed_sitter_id column.' 
      });
    }

    // Check if sitter exists
    const [sitters] = await db.query('SELECT user_id, user_type FROM User WHERE user_id = ?', [sitter_id]);
    if (sitters.length === 0) {
      return res.status(404).json({ message: 'Sitter not found' });
    }

    if (sitters[0].user_type !== 'Sitter' && sitters[0].user_type !== 'Both') {
      return res.status(400).json({ message: 'User is not a sitter' });
    }

    // Check if reviewer exists
    const [users] = await db.query('SELECT user_id FROM User WHERE user_id = ?', [reviewer_id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    // Create the review
    const [result] = await db.query(
      'INSERT INTO Review (reviewed_sitter_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [sitter_id, reviewer_id, rating, comment || null]
    );

    // Update sitter's average rating
    await updateSitterRating(sitter_id);

    res.status(201).json({
      message: 'Sitter review created successfully',
      review_id: result.insertId
    });
  } catch (error) {
    console.error('Create sitter review error:', error);
    res.status(500).json({ message: 'Error creating sitter review', error: error.message });
  }
};

// Create combined review (for pet and sitter together, e.g., from a sitting booking)
exports.createCombinedReview = async (req, res) => {
  try {
    const { pet_id, sitter_id, reviewer_id, rating, comment, booking_id } = req.body;

    // Validate required fields
    if (!pet_id || !sitter_id || !reviewer_id || !rating) {
      return res.status(400).json({ 
        message: 'Missing required fields: pet_id, sitter_id, reviewer_id, and rating are required' 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if the columns exist
    const [dbInfo] = await db.query('SELECT DATABASE() as db_name');
    const dbName = dbInfo[0]?.db_name || process.env.DB_NAME || 'PetPlatform';
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Review' 
      AND COLUMN_NAME IN ('reviewed_pet_id', 'reviewed_sitter_id')
    `, [dbName]);
    
    const hasPetColumn = columns.some(c => c.COLUMN_NAME === 'reviewed_pet_id');
    const hasSitterColumn = columns.some(c => c.COLUMN_NAME === 'reviewed_sitter_id');
    
    if (!hasPetColumn || !hasSitterColumn) {
      return res.status(500).json({ 
        message: 'Database schema not updated. Please run migration script to add reviewed_pet_id and reviewed_sitter_id columns.' 
      });
    }

    // Check if pet exists
    const [pets] = await db.query('SELECT pet_id FROM Pet WHERE pet_id = ?', [pet_id]);
    if (pets.length === 0) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if sitter exists
    const [sitters] = await db.query('SELECT user_id, user_type FROM User WHERE user_id = ?', [sitter_id]);
    if (sitters.length === 0) {
      return res.status(404).json({ message: 'Sitter not found' });
    }

    // Check if reviewer exists
    const [users] = await db.query('SELECT user_id FROM User WHERE user_id = ?', [reviewer_id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    // Create the review
    const [result] = await db.query(
      'INSERT INTO Review (reviewed_pet_id, reviewed_sitter_id, reviewer_id, rating, comment, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
      [pet_id, sitter_id, reviewer_id, rating, comment || null, booking_id || null]
    );

    // Update sitter's average rating
    await updateSitterRating(sitter_id);

    res.status(201).json({
      message: 'Combined review created successfully',
      review_id: result.insertId
    });
  } catch (error) {
    console.error('Create combined review error:', error);
    res.status(500).json({ message: 'Error creating combined review', error: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    const updates = [];
    const values = [];

    if (rating !== undefined) {
      updates.push('rating = ?');
      values.push(rating);
    }

    if (comment !== undefined) {
      updates.push('comment = ?');
      values.push(comment);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);

    await db.query(
      `UPDATE Review SET ${updates.join(', ')} WHERE review_id = ?`,
      values
    );

    // If rating was updated and it's a sitter review, update sitter rating
    if (rating !== undefined) {
      const [review] = await db.query('SELECT reviewed_sitter_id FROM Review WHERE review_id = ?', [id]);
      if (review.length > 0 && review[0].reviewed_sitter_id) {
        await updateSitterRating(review[0].reviewed_sitter_id);
      }
    }

    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get sitter_id before deleting (to update rating)
    const [review] = await db.query('SELECT reviewed_sitter_id FROM Review WHERE review_id = ?', [id]);
    const sitterId = review.length > 0 ? review[0].reviewed_sitter_id : null;

    await db.query('DELETE FROM Review WHERE review_id = ?', [id]);

    // Update sitter rating if it was a sitter review
    if (sitterId) {
      await updateSitterRating(sitterId);
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

// Helper function to update sitter's average rating
async function updateSitterRating(sitterId) {
  try {
    const [result] = await db.query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
      FROM Review
      WHERE reviewed_sitter_id = ?
    `, [sitterId]);

    if (result.length > 0 && result[0].review_count > 0) {
      const avgRating = parseFloat(result[0].avg_rating).toFixed(1);
      await db.query(
        'UPDATE User SET rating = ? WHERE user_id = ?',
        [avgRating, sitterId]
      );
    }
  } catch (error) {
    console.error('Error updating sitter rating:', error);
    // Don't throw error, just log it
  }
}

