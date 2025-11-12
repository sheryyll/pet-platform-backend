const db = require('../config/database');

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, u.name as reviewer_name, u.email as reviewer_email, b.request_type
      FROM Review r
      LEFT JOIN User u ON r.reviewer_id = u.user_id
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
      SELECT r.*, u.name as reviewer_name, u.email as reviewer_email, b.request_type
      FROM Review r
      LEFT JOIN User u ON r.reviewer_id = u.user_id
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

// Create review
exports.createReview = async (req, res) => {
  try {
    const { booking_id, reviewer_id, rating, comment } = req.body;

    const [result] = await db.query(
      'INSERT INTO Review (booking_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [booking_id, reviewer_id, rating, comment]
    );

    res.status(201).json({
      message: 'Review created successfully',
      review_id: result.insertId
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    await db.query(
      'UPDATE Review SET rating = ?, comment = ? WHERE review_id = ?',
      [rating, comment, id]
    );

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
    await db.query('DELETE FROM Review WHERE review_id = ?', [id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

// Get reviews for a specific pet
exports.getReviewsForPet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get reviews through bookings that are linked to this pet
    // For Sitting bookings: Booking -> SittingRequest -> Pet
    // For Adoption bookings: Booking -> AdoptionRequest -> Pet
    const [reviews] = await db.query(`
      SELECT DISTINCT r.*, 
             u.name as reviewer_name, 
             u.email as reviewer_email, 
             b.request_type,
             b.request_id
      FROM Review r
      INNER JOIN Booking b ON r.booking_id = b.booking_id
      LEFT JOIN User u ON r.reviewer_id = u.user_id
      WHERE (
        (b.request_type = 'Sitting' AND b.request_id IN (
          SELECT sitting_id FROM SittingRequest WHERE pet_id = ?
        ))
        OR
        (b.request_type = 'Adoption' AND b.request_id IN (
          SELECT adoption_id FROM AdoptionRequest WHERE pet_id = ?
        ))
      )
      ORDER BY r.review_date DESC
    `, [id, id]);
    
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews for pet error:', error);
    res.status(500).json({ message: 'Error fetching reviews for pet', error: error.message });
  }
};

// Create review for a pet (creates booking if needed)
exports.createReviewForPet = async (req, res) => {
  try {
    const { pet_id, reviewer_id, rating, comment, request_type, request_id } = req.body;

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

    let booking_id = req.body.booking_id;

    // If booking_id is not provided, try to find or create a booking
    if (!booking_id) {
      if (!request_type || !request_id) {
        return res.status(400).json({ 
          message: 'Either booking_id or (request_type and request_id) must be provided' 
        });
      }

      // Check if booking exists for this request
      const [existingBookings] = await db.query(
        'SELECT booking_id FROM Booking WHERE request_type = ? AND request_id = ?',
        [request_type, request_id]
      );

      if (existingBookings.length > 0) {
        booking_id = existingBookings[0].booking_id;
      } else {
        // Create a new booking
        const [bookingResult] = await db.query(
          'INSERT INTO Booking (request_type, request_id, status) VALUES (?, ?, ?)',
          [request_type, request_id, 'Completed']
        );
        booking_id = bookingResult.insertId;
      }
    }

    // Create the review
    const [result] = await db.query(
      'INSERT INTO Review (booking_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [booking_id, reviewer_id, rating, comment || null]
    );

    res.status(201).json({
      message: 'Review created successfully',
      review_id: result.insertId,
      booking_id: booking_id
    });
  } catch (error) {
    console.error('Create review for pet error:', error);
    res.status(500).json({ message: 'Error creating review for pet', error: error.message });
  }
};