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
    const { booking_id, amount, payment_method, payment_status } = req.body;

    const [result] = await db.query(
      'INSERT INTO Payment (booking_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)',
      [booking_id, amount, payment_method, payment_status]
    );

    res.status(201).json({
      message: 'Payment created successfully',
      payment_id: result.insertId
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

    await db.query(
      'UPDATE Payment SET amount = ?, payment_method = ?, payment_status = ? WHERE payment_id = ?',
      [amount, payment_method, payment_status, id]
    );

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
