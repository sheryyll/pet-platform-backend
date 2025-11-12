const db = require('../config/database');

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return null;
  // If it's already in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.split('T')[0]; // Extract date part if it includes time
  }
  // If it's a Date object, format it
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return null;
};

// Get all sitting requests
exports.getAllSittingRequests = async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT sr.*, p.pet_name, p.species, 
             u1.name as owner_name, u1.email as owner_email,
             u2.name as sitter_name, u2.email as sitter_email
      FROM SittingRequest sr
      LEFT JOIN Pet p ON sr.pet_id = p.pet_id
      LEFT JOIN User u1 ON sr.owner_id = u1.user_id
      LEFT JOIN User u2 ON sr.sitter_id = u2.user_id
    `);
    res.json(requests);
  } catch (error) {
    console.error('Get all sitting requests error:', error);
    res.status(500).json({ message: 'Error fetching sitting requests', error: error.message });
  }
};

// Get sitting request by ID
exports.getSittingRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const [requests] = await db.query(`
      SELECT sr.*, p.pet_name, p.species, 
             u1.name as owner_name, u1.email as owner_email,
             u2.name as sitter_name, u2.email as sitter_email
      FROM SittingRequest sr
      LEFT JOIN Pet p ON sr.pet_id = p.pet_id
      LEFT JOIN User u1 ON sr.owner_id = u1.user_id
      LEFT JOIN User u2 ON sr.sitter_id = u2.user_id
      WHERE sr.sitting_id = ?
    `, [id]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Sitting request not found' });
    }
    
    res.json(requests[0]);
  } catch (error) {
    console.error('Get sitting request by ID error:', error);
    res.status(500).json({ message: 'Error fetching sitting request', error: error.message });
  }
};

// Create sitting request
exports.createSittingRequest = async (req, res) => {
  try {
    const { owner_id, sitter_id, pet_id, start_date, end_date, total_cost, status } = req.body;

    // Validate required fields
    if (!owner_id || !sitter_id || !pet_id) {
      return res.status(400).json({ 
        message: 'Missing required fields: owner_id, sitter_id, and pet_id are required' 
      });
    }

    // Validate and format dates
    const formattedStartDate = formatDate(start_date);
    const formattedEndDate = formatDate(end_date);

    if (!formattedStartDate || !formattedEndDate) {
      return res.status(400).json({ 
        message: 'start_date and end_date are required and must be valid dates (YYYY-MM-DD format)' 
      });
    }

    // Validate that end_date is after start_date
    if (new Date(formattedEndDate) < new Date(formattedStartDate)) {
      return res.status(400).json({ 
        message: 'end_date must be after start_date' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO SittingRequest (owner_id, sitter_id, pet_id, start_date, end_date, total_cost, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [owner_id, sitter_id, pet_id, formattedStartDate, formattedEndDate, total_cost || null, status || 'Pending']
    );

    res.status(201).json({
      message: 'Sitting request created successfully',
      sitting_id: result.insertId
    });
  } catch (error) {
    console.error('Create sitting request error:', error);
    res.status(500).json({ message: 'Error creating sitting request', error: error.message });
  }
};

// Update sitting request
exports.updateSittingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, total_cost, status } = req.body;

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];

    if (start_date !== undefined) {
      const formattedStartDate = formatDate(start_date);
      if (!formattedStartDate) {
        return res.status(400).json({ 
          message: 'start_date must be a valid date (YYYY-MM-DD format)' 
        });
      }
      updates.push('start_date = ?');
      values.push(formattedStartDate);
    }

    if (end_date !== undefined) {
      const formattedEndDate = formatDate(end_date);
      if (!formattedEndDate) {
        return res.status(400).json({ 
          message: 'end_date must be a valid date (YYYY-MM-DD format)' 
        });
      }
      updates.push('end_date = ?');
      values.push(formattedEndDate);
    }

    // Validate date order if both dates are being updated
    if (start_date !== undefined && end_date !== undefined) {
      const formattedStartDate = formatDate(start_date);
      const formattedEndDate = formatDate(end_date);
      if (new Date(formattedEndDate) < new Date(formattedStartDate)) {
        return res.status(400).json({ 
          message: 'end_date must be after start_date' 
        });
      }
    } else if (start_date !== undefined || end_date !== undefined) {
      // If only one date is being updated, check against existing dates
      const [existing] = await db.query(
        'SELECT start_date, end_date FROM SittingRequest WHERE sitting_id = ?',
        [id]
      );
      if (existing.length > 0) {
        const existingStart = existing[0].start_date;
        const existingEnd = existing[0].end_date;
        const newStart = start_date !== undefined ? formatDate(start_date) : existingStart;
        const newEnd = end_date !== undefined ? formatDate(end_date) : existingEnd;
        if (newStart && newEnd && new Date(newEnd) < new Date(newStart)) {
          return res.status(400).json({ 
            message: 'end_date must be after start_date' 
          });
        }
      }
    }

    if (total_cost !== undefined) {
      updates.push('total_cost = ?');
      values.push(total_cost);
    }

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    await db.query(
      `UPDATE SittingRequest SET ${updates.join(', ')} WHERE sitting_id = ?`,
      values
    );

    // Update pet status based on sitting request status
    if (status === 'Accepted') {
      const [reqData] = await db.query('SELECT pet_id FROM SittingRequest WHERE sitting_id = ?', [id]);
      if (reqData.length > 0) {
        await db.query('UPDATE Pet SET status = ? WHERE pet_id = ?', ['Being_Sat', reqData[0].pet_id]);
      }
    } else if (status === 'Completed' || status === 'Cancelled') {
      const [reqData] = await db.query('SELECT pet_id FROM SittingRequest WHERE sitting_id = ?', [id]);
      if (reqData.length > 0) {
        await db.query('UPDATE Pet SET status = ? WHERE pet_id = ?', ['Available', reqData[0].pet_id]);
      }
    }

    res.json({ message: 'Sitting request updated successfully' });
  } catch (error) {
    console.error('Update sitting request error:', error);
    res.status(500).json({ message: 'Error updating sitting request', error: error.message });
  }
};

// Delete sitting request
exports.deleteSittingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM SittingRequest WHERE sitting_id = ?', [id]);
    res.json({ message: 'Sitting request deleted successfully' });
  } catch (error) {
    console.error('Delete sitting request error:', error);
    res.status(500).json({ message: 'Error deleting sitting request', error: error.message });
  }
};

// Fix records with null dates - sets reasonable default dates based on status
exports.fixNullDates = async (req, res) => {
  try {
    // Get all records with null dates
    const [records] = await db.query(
      'SELECT sitting_id, status FROM SittingRequest WHERE start_date IS NULL OR end_date IS NULL'
    );

    if (records.length === 0) {
      return res.json({ message: 'No records with null dates found', fixed: 0 });
    }

    const today = new Date();
    let fixedCount = 0;

    for (const record of records) {
      let startDate, endDate;

      // Set dates based on status
      if (record.status === 'Completed' || record.status === 'Cancelled') {
        // For completed/cancelled, set dates in the past (7-10 days ago)
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 10);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() - 7);
      } else {
        // For pending/accepted, set dates in the near future (today to 3 days from now)
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 3);
      }

      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      await db.query(
        'UPDATE SittingRequest SET start_date = ?, end_date = ? WHERE sitting_id = ?',
        [formattedStartDate, formattedEndDate, record.sitting_id]
      );

      fixedCount++;
    }

    res.json({
      message: `Fixed ${fixedCount} record(s) with null dates`,
      fixed: fixedCount,
      records: records.map(r => r.sitting_id)
    });
  } catch (error) {
    console.error('Fix null dates error:', error);
    res.status(500).json({ message: 'Error fixing null dates', error: error.message });
  }
};
