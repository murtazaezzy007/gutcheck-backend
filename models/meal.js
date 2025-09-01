const mongoose = require('mongoose');

/**
 * Meal schema stores information about a single meal.
 * Supports multiple images while maintaining backward compatibility.
 * Each image stores both the URL for display and the key used for deletion.
 */
const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ✅ New: Multiple images supported
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        key: {
          type: String,
          required: true,
        },
      },
    ],

    // ✅ Legacy field: Single image (kept for backward compatibility)
    image: {
      url: String,
      key: String,
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

const Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;
