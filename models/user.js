const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema defines login credentials for the GutCheck application.  Each
 * document stores the user's email, a hashed password and the date the
 * account was created.  Passwords are automatically hashed before the
 * document is saved.  Mongoose schemas map directly to MongoDB collections
 *【102660772855801†L69-L71】 and define the shape of the documents within that collection.
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// Pre-save hook to hash password before storing in DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Compare a plaintext password with the hashed password stored in the user
 * document.  Returns a promise that resolves to true if they match, false
 * otherwise.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;