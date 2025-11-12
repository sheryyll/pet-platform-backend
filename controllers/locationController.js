const db = require('../config/database');

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const [locations] = await db.query('SELECT * FROM Location');
    res.json(locations);
  } catch (error) {
    console.error('Get all locations error:', error);
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
};

// Get location by ID
exports.getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [locations] = await db.query('SELECT * FROM Location WHERE location_id = ?', [id]);
    
    if (locations.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json(locations[0]);
  } catch (error) {
    console.error('Get location by ID error:', error);
    res.status(500).json({ message: 'Error fetching location', error: error.message });
  }
};

// Create location
exports.createLocation = async (req, res) => {
  try {
    const { area, city, pincode } = req.body;

    // Validate required fields
    if (!area || !city || !pincode) {
      return res.status(400).json({ message: 'Area, city, and pincode are required' });
    }

    const [result] = await db.query(
      'INSERT INTO Location (area, city, pincode) VALUES (?, ?, ?)',
      [area, city, pincode]
    );

    // Return the full location object
    const [locations] = await db.query('SELECT * FROM Location WHERE location_id = ?', [result.insertId]);
    
    res.status(201).json(locations[0]);
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Error creating location', error: error.message });
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { area, city, pincode } = req.body;

    await db.query(
      'UPDATE Location SET area = ?, city = ?, pincode = ? WHERE location_id = ?',
      [area, city, pincode, id]
    );

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
};

// Delete location
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Location WHERE location_id = ?', [id]);
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ message: 'Error deleting location', error: error.message });
  }
};
