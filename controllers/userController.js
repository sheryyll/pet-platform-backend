const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.*, l.area, l.city, l.pincode 
      FROM User u 
      LEFT JOIN Location l ON u.location_id = l.location_id
    `);
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get users with their pets and sitter info for discover page
exports.getUsersWithDetails = async (req, res) => {
  try {
    const { type } = req.query; // 'owners', 'sitters', or undefined for all
    
    let userTypeFilter = '';
    if (type === 'owners') {
      userTypeFilter = "AND u.user_type IN ('Owner', 'Both')";
    } else if (type === 'sitters') {
      userTypeFilter = "AND u.user_type IN ('Sitter', 'Both')";
    }
    
    // Get users with location
    const [users] = await db.query(`
      SELECT u.*, l.area, l.city, l.pincode 
      FROM User u 
      LEFT JOIN Location l ON u.location_id = l.location_id
      WHERE 1=1 ${userTypeFilter}
      ORDER BY u.rating DESC, u.name ASC
    `);
    
    // Get pets for each user (only available pets)
    const userIds = users.map(u => u.user_id);
    let petsByOwner = {};
    
    if (userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(',');
      const [pets] = await db.query(`
        SELECT p.*, u.name as owner_name
        FROM Pet p
        LEFT JOIN User u ON p.owner_id = u.user_id
        WHERE p.owner_id IN (${placeholders}) AND p.status = 'Available'
      `, userIds);
      
      // Group pets by owner_id
      pets.forEach(pet => {
        if (!petsByOwner[pet.owner_id]) {
          petsByOwner[pet.owner_id] = [];
        }
        petsByOwner[pet.owner_id].push(pet);
      });
    }
    
    // Attach pets to users
    const usersWithPets = users.map(user => ({
      ...user,
      available_pets: petsByOwner[user.user_id] || [],
      pet_count: (petsByOwner[user.user_id] || []).length
    }));
    
    res.json(usersWithPets);
  } catch (error) {
    console.error('Get users with details error:', error);
    res.status(500).json({ message: 'Error fetching users with details', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query(`
      SELECT u.*, l.area, l.city, l.pincode 
      FROM User u 
      LEFT JOIN Location l ON u.location_id = l.location_id
      WHERE u.user_id = ?
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, location_id, user_type } = req.body;

    await db.query(
      'UPDATE User SET name = ?, email = ?, phone = ?, address = ?, location_id = ?, user_type = ? WHERE user_id = ?',
      [name, email, phone, address, location_id, user_type, id]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM User WHERE user_id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
