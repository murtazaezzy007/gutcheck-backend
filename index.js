const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors()); // enable CORS for all requests
app.use(express.json()); // parse JSON request bodies

// Serve uploaded files statically from the uploads directory.  For example,
// an image stored at backend/uploads/meals/filename.jpg will be accessible
// via http://localhost:5000/uploads/meals/filename.jpg.  This is suitable
// for development environments but should be replaced or secured for
// production.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to database and ensure local uploads directory exists.  Since we're
// storing images on the file system (not in a cloud service), we need to
// create an uploads directory for meals before handling requests.
async function initialize() {
  try {
    await connectDB();
    const uploadsDir = path.join(__dirname, 'uploads', 'meals');
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Initialization error:', err);
    process.exit(1);
  }
}

initialize();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/poops', require('./routes/poops'));

// Health check route
app.get('/', (req, res) => {
  res.send('GutCheck API is running');
});

// Error handling middleware (catch all)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'An unexpected error occurred' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});