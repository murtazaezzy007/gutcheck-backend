const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI provided in the environment.  The MongoDB
 * connection is established once at startup.  If the connection fails the
 * error is thrown to prevent the server from continuing to run with no
 * database.  Mongoose will automatically handle reconnecting if the
 * connection drops unexpectedly.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    throw err;
  }
}

module.exports = connectDB;