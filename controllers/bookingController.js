const db = require('../config/database');

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.query('SELECT * FROM Booking ORDER BY date_created DESC');
    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const [bookings] = await db.query('SELECT * FROM Booking WHERE booking_id = ?', [id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(bookings[0]);
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { request_type, request_id, status } = req.body;

    const [result] = await db.query(
      'INSERT INTO Booking (request_type, request_id, status) VALUES (?, ?, ?)',
      [request_type, request_id, status]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking_id: result.insertId
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      'UPDATE Booking SET status = ? WHERE booking_id = ?',
      [status, id]
    );

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Booking WHERE booking_id = ?', [id]);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
};
