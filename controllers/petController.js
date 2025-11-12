const db = require('../config/database');

// Get all pets
exports.getAllPets = async (req, res) => {
  try {
    const [pets] = await db.query(`
      SELECT p.*, u.name as owner_name, u.email as owner_email 
      FROM Pet p 
      LEFT JOIN User u ON p.owner_id = u.user_id
    `);
    res.json(pets);
  } catch (error) {
    console.error('Get all pets error:', error);
    res.status(500).json({ message: 'Error fetching pets', error: error.message });
  }
};

// Get pet by ID
exports.getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const [pets] = await db.query(`
      SELECT p.*, u.name as owner_name, u.email as owner_email 
      FROM Pet p 
      LEFT JOIN User u ON p.owner_id = u.user_id
      WHERE p.pet_id = ?
    `, [id]);
    
    if (pets.length === 0) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    res.json(pets[0]);
  } catch (error) {
    console.error('Get pet by ID error:', error);
    res.status(500).json({ message: 'Error fetching pet', error: error.message });
  }
};

// Create pet
exports.createPet = async (req, res) => {
  try {
    const { owner_id, pet_name, species, breed, age, gender, vaccinated, status } = req.body;

    const [result] = await db.query(
      'INSERT INTO Pet (owner_id, pet_name, species, breed, age, gender, vaccinated, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [owner_id, pet_name, species, breed, age, gender, vaccinated, status]
    );

    res.status(201).json({
      message: 'Pet created successfully',
      pet_id: result.insertId
    });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ message: 'Error creating pet', error: error.message });
  }
};

// Update pet
exports.updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { pet_name, species, breed, age, gender, vaccinated, status } = req.body;

    await db.query(
      'UPDATE Pet SET pet_name = ?, species = ?, breed = ?, age = ?, gender = ?, vaccinated = ?, status = ? WHERE pet_id = ?',
      [pet_name, species, breed, age, gender, vaccinated, status, id]
    );

    res.json({ message: 'Pet updated successfully' });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ message: 'Error updating pet', error: error.message });
  }
};

// Delete pet
exports.deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Pet WHERE pet_id = ?', [id]);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ message: 'Error deleting pet', error: error.message });
  }
};

// Get pets by owner
exports.getPetsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const [pets] = await db.query('SELECT * FROM Pet WHERE owner_id = ?', [ownerId]);
    res.json(pets);
  } catch (error) {
    console.error('Get pets by owner error:', error);
    res.status(500).json({ message: 'Error fetching pets', error: error.message });
  }
};
