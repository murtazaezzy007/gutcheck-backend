const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Generate a JSON Web Token for a given user id.  Tokens embed the user id
 * and expire after 7 days.  The secret used to sign the token comes from
 * the environment.  JWT allows stateless authentication across requests.
 *
 * @param {string} userId
 * @returns {string} signed JWT
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Handle user registration.  Validates that the email is not already
 * registered, creates a new user document and returns a signed JWT.  If the
 * email is taken, responds with 400 status.
 */
async function register(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = new User({ email, password });
    await user.save();
    const token = generateToken(user._id);
    return res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Handle user login.  Validates that the email exists and the password
 * matches, then returns a signed JWT.  If authentication fails, responds
 * with 401 status.
 */
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login };