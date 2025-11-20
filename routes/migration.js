const express = require('express');
const router = express.Router();
const autoMigrate = require('../scripts/autoMigrate');

// Manual migration endpoint - can be called via HTTP
router.post('/reviews', async (req, res) => {
  try {
    console.log('🔄 Manual migration triggered via API');
    await autoMigrate();
    res.json({ 
      message: 'Migration completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      message: 'Migration failed', 
      error: error.message 
    });
  }
});

module.exports = router;

