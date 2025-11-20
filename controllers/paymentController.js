const db = require('../config/database');

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT p.*, b.request_type, b.status as booking_status
      FROM Payment p
      LEFT JOIN Booking b ON p.booking_id = b.booking_id
      ORDER BY p.payment_date DESC
    `);
    res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [payments] = await db.query(`
      SELECT p.*, b.request_type, b.status as booking_status
      FROM Payment p
      LEFT JOIN Booking b ON p.booking_id = b.booking_id
      WHERE p.payment_id = ?
    `, [id]);
    
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payments[0]);
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { booking_id, amount, payment_method, payment_status, sitting_id } = req.body;

    let finalBookingId = booking_id;
    let bookingRequestType = null;
    let bookingRequestId = null;

    // If booking_id is not provided but sitting_id is, create or find booking
    if (!booking_id && sitting_id) {
      // Check if booking already exists for this sitting
      const [existingBookings] = await db.query(
        'SELECT booking_id, request_type, request_id FROM Booking WHERE request_type = ? AND request_id = ?',
        ['Sitting', sitting_id]
      );

      if (existingBookings.length > 0) {
        finalBookingId = existingBookings[0].booking_id;
        bookingRequestType = existingBookings[0].request_type;
        bookingRequestId = existingBookings[0].request_id;
      } else {
        // Create new booking for the sitting request
        const [bookingResult] = await db.query(
          'INSERT INTO Booking (request_type, request_id, status) VALUES (?, ?, ?)',
          ['Sitting', sitting_id, 'Confirmed']
        );
        finalBookingId = bookingResult.insertId;
        bookingRequestType = 'Sitting';
        bookingRequestId = sitting_id;
      }
    } else if (booking_id) {
      // Get booking details to check if it's a sitting booking
      const [bookings] = await db.query(
        'SELECT request_type, request_id FROM Booking WHERE booking_id = ?',
        [booking_id]
      );
      if (bookings.length > 0) {
        bookingRequestType = bookings[0].request_type;
        bookingRequestId = bookings[0].request_id;
      }
    }

    // Create the payment
    const [result] = await db.query(
      'INSERT INTO Payment (booking_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)',
      [finalBookingId, amount, payment_method, payment_status || 'Paid']
    );

    // If payment is successful (Paid) and it's for a Sitting booking, update sitting request and booking status
    if ((payment_status === 'Paid' || !payment_status) && bookingRequestType === 'Sitting' && bookingRequestId) {
      // Update sitting request status to Accepted (confirmed/approved)
      await db.query(
        'UPDATE SittingRequest SET status = ? WHERE sitting_id = ?',
        ['Accepted', bookingRequestId]
      );

      // Update booking status to Confirmed
      await db.query(
        'UPDATE Booking SET status = ? WHERE booking_id = ?',
        ['Confirmed', finalBookingId]
      );

      // Update pet status to Being_Sat
      const [sittingData] = await db.query('SELECT pet_id FROM SittingRequest WHERE sitting_id = ?', [bookingRequestId]);
      if (sittingData.length > 0) {
        await db.query(
          'UPDATE Pet SET status = ? WHERE pet_id = ?',
          ['Being_Sat', sittingData[0].pet_id]
        );
      }
    }

    res.status(201).json({
      message: 'Payment created successfully',
      payment_id: result.insertId,
      booking_id: finalBookingId
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method, payment_status } = req.body;

    // Get current payment to check booking details
    const [payments] = await db.query(
      'SELECT booking_id FROM Payment WHERE payment_id = ?',
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const bookingId = payments[0].booking_id;

    // Get booking details
    const [bookings] = await db.query(
      'SELECT request_type, request_id FROM Booking WHERE booking_id = ?',
      [bookingId]
    );

    // Update payment
    await db.query(
      'UPDATE Payment SET amount = ?, payment_method = ?, payment_status = ? WHERE payment_id = ?',
      [amount, payment_method, payment_status, id]
    );

    // If payment status is updated to 'Paid' and it's for a Sitting booking, update sitting request
    if (payment_status === 'Paid' && bookings.length > 0 && bookings[0].request_type === 'Sitting') {
      const sittingId = bookings[0].request_id;

      // Update sitting request status to Accepted (Confirmed equivalent)
      await db.query(
        'UPDATE SittingRequest SET status = ? WHERE sitting_id = ?',
        ['Accepted', sittingId]
      );

      // Update booking status to Confirmed
      await db.query(
        'UPDATE Booking SET status = ? WHERE booking_id = ?',
        ['Confirmed', bookingId]
      );

      // Update pet status to Being_Sat
      const [sittingData] = await db.query('SELECT pet_id FROM SittingRequest WHERE sitting_id = ?', [sittingId]);
      if (sittingData.length > 0) {
        await db.query(
          'UPDATE Pet SET status = ? WHERE pet_id = ?',
          ['Being_Sat', sittingData[0].pet_id]
        );
      }
    }

    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Payment WHERE payment_id = ?', [id]);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};
