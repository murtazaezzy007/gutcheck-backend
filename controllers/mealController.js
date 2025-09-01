const Meal = require('../models/meal');
const fs = require('fs');
const path = require('path');

/**
 * Create a new meal entry.  Expects the request to be authenticated and
 * `req.user.id` populated by the auth middleware.  The request must include
 * a description in the body and an image file processed by multer.  When
 * using the local disk storage adapter, `req.file.filename` is the name
 * of the uploaded file on disk.  The image URL is constructed
 * relative to the `/uploads/meals` static directory exposed by Express.
 */
async function createMeal(req, res) {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: 'Description is required' });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'At least one image is required' });

    const imageUrls = req.files.map(file => ({
      url: `${req.protocol}://${req.get('host')}/uploads/meals/${file.filename}`,
      key: file.filename,
    }));

    const meal = new Meal({
      user: req.user.id,
      images: imageUrls,
      description,
    });

    await meal.save();
    return res.status(201).json(meal);
  } catch (err) {
    console.error('Create meal error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get a list of all meals for the authenticated user.  Meals are sorted
 * descending by creation date so that the most recent meals appear first.
 */
async function getMeals(req, res) {
  try {
    const meals = await Meal.find({ user: req.user.id }).sort({ createdAt: -1 });

    return res.json(meals);
  } catch (err) {
    console.error('Get meals error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get a single meal by id for the authenticated user.
 */
async function getMeal(req, res) {
  try {
    const { id } = req.params;
    const meal = await Meal.findOne({ _id: id, user: req.user.id });
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    return res.json(meal);
  } catch (err) {
    console.error('Get meal error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Update a meal.  Allows updating the description and optionally replacing
 * the associated image.  If a new image is provided, the old image is
 * deleted from the file system before storing the new one.
 */
async function updateMeal(req, res) {
  try {
    const { id } = req.params;
    const meal = await Meal.findOne({ _id: id, user: req.user.id });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    const { description } = req.body;
    if (description) {
      meal.description = description;
    }

    // If multiple images are uploaded
    if (req.files && req.files.length > 0) {
      // Delete existing images from the filesystem
      if (meal.images && meal.images.length > 0) {
        meal.images.forEach((img) => {
          if (img.key) {
            const oldPath = path.join(__dirname, '..', 'uploads', 'meals', img.key);
            fs.unlink(oldPath, (err) => {
              if (err) {
                console.error('Error deleting old image:', err);
              }
            });
          }
        });
      }

      // Build new images array
      const newImages = req.files.map((file) => ({
        url: `${req.protocol}://${req.get('host')}/uploads/meals/${file.filename}`,
        key: file.filename,
      }));

      meal.images = newImages;

      // Also update legacy single-image field for backward compatibility
      if (newImages.length > 0) {
        meal.image = newImages[0];
      }
    }

    await meal.save();
    return res.json(meal);
  } catch (err) {
    console.error('Update meal error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Delete a meal and its associated image from the local file system.
 */
async function deleteMeal(req, res) {
  try {
    const { id } = req.params;
    const meal = await Meal.findOne({ _id: id, user: req.user.id });
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    // Delete image from the file system if present
    if (meal.image && meal.image.key) {
      const filePath = path.join(__dirname, '..', 'uploads', 'meals', meal.image.key);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }
    await meal.deleteOne();
    return res.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error('Delete meal error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createMeal, getMeals, getMeal, updateMeal, deleteMeal };