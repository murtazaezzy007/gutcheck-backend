const mongoose = require('mongoose');

/**
 * Poop schema stores a single poop entry, which includes only a textual
 * description and a timestamp.  Each poop entry belongs to a user.  This
 * collection is separate from meals, allowing users to record digestive
 * symptoms separately.
 */
const poopSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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

const Poop = mongoose.model('Poop', poopSchema);
module.exports = Poop;