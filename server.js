const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const petRoutes = require('./routes/pets');
const adoptionRoutes = require('./routes/adoptions');
const sittingRoutes = require('./routes/sittings');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const locationRoutes = require('./routes/locations');
const availabilityRoutes = require('./routes/availability');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/sittings', sittingRoutes);
// Aliases for potential frontend paths
app.use('/api/pet-sittings', sittingRoutes);
app.use('/api/sitting', sittingRoutes);
app.use('/api/pet-sitting', sittingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/availability', availabilityRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pet Platform API is running!',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use!`);
    console.error(`\nTo fix this, you can:`);
    console.error(`1. Find and kill the process using port ${PORT}:`);
    console.error(`   - On Windows: netstat -ano | findstr :${PORT}`);
    console.error(`   - Then kill the process: taskkill /PID <PID> /F`);
    console.error(`2. Or use a different port by setting PORT environment variable:`);
    console.error(`   - Windows: set PORT=3001 && node server.js`);
    console.error(`   - Or create a .env file with: PORT=3001`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
