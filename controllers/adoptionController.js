const db = require('../config/database');

// Get all adoption requests
exports.getAllAdoptionRequests = async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT ar.*, p.pet_name, p.species, u1.name as adopter_name, u1.email as adopter_email
      FROM AdoptionRequest ar
      LEFT JOIN Pet p ON ar.pet_id = p.pet_id
      LEFT JOIN User u1 ON ar.adopter_id = u1.user_id
    `);
    res.json(requests);
  } catch (error) {
    console.error('Get all adoption requests error:', error);
    res.status(500).json({ message: 'Error fetching adoption requests', error: error.message });
  }
};

// Get adoption request by ID
exports.getAdoptionRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const [requests] = await db.query(`
      SELECT ar.*, p.pet_name, p.species, u1.name as adopter_name, u1.email as adopter_email
      FROM AdoptionRequest ar
      LEFT JOIN Pet p ON ar.pet_id = p.pet_id
      LEFT JOIN User u1 ON ar.adopter_id = u1.user_id
      WHERE ar.adoption_id = ?
    `, [id]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Adoption request not found' });
    }
    
    res.json(requests[0]);
  } catch (error) {
    console.error('Get adoption request by ID error:', error);
    res.status(500).json({ message: 'Error fetching adoption request', error: error.message });
  }
};

// Create adoption request
exports.createAdoptionRequest = async (req, res) => {
  try {
    const { pet_id, adopter_id, request_date, status } = req.body;

    const [result] = await db.query(
      'INSERT INTO AdoptionRequest (pet_id, adopter_id, request_date, status) VALUES (?, ?, ?, ?)',
      [pet_id, adopter_id, request_date, status]
    );

    res.status(201).json({
      message: 'Adoption request created successfully',
      adoption_id: result.insertId
    });
  } catch (error) {
    console.error('Create adoption request error:', error);
    res.status(500).json({ message: 'Error creating adoption request', error: error.message });
  }
};

// Update adoption request status
exports.updateAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      'UPDATE AdoptionRequest SET status = ? WHERE adoption_id = ?',
      [status, id]
    );

    // If approved, update pet status
    if (status === 'Approved') {
      const [reqData] = await db.query('SELECT pet_id FROM AdoptionRequest WHERE adoption_id = ?', [id]);
      if (reqData.length > 0) {
        await db.query('UPDATE Pet SET status = ? WHERE pet_id = ?', ['Adopted', reqData[0].pet_id]);
      }
    }

    res.json({ message: 'Adoption request updated successfully' });
  } catch (error) {
    console.error('Update adoption request error:', error);
    res.status(500).json({ message: 'Error updating adoption request', error: error.message });
  }
};

// Delete adoption request
exports.deleteAdoptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM AdoptionRequest WHERE adoption_id = ?', [id]);
    res.json({ message: 'Adoption request deleted successfully' });
  } catch (error) {
    console.error('Delete adoption request error:', error);
    res.status(500).json({ message: 'Error deleting adoption request', error: error.message });
  }
};
