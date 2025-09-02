const Meal = require('../models/meal');
const imagekit = require('../lib/imagekit');

/**
 * Helper: upload one file buffer to ImageKit
 */
async function uploadToImageKit({ buffer, originalname, userId }) {
  const fileName = originalname || `meal_${Date.now()}.jpg`;
  const folder = `/gutcheck/meals/${userId}`;

  // ImageKit accepts base64 or buffer; buffer is fine
  const res = await imagekit.upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: true,
    // You can add tags, isPrivateFile, etc.
  });

  // res has: fileId, name, url, thumbnailUrl, filePath, etc.
  return {
    url: res.url,
    key: res.fileId,         // we'll store fileId as "key"
    name: res.name,
    path: res.filePath,      // useful if you want to build transformed URLs later
    size: res.size,
    mime: res.mime || res.fileType,
  };
}

/**
 * Create a new meal with images uploaded to ImageKit
 */
async function createMeal(req, res) {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: 'Description is required' });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'At least one image is required' });

    const uploads = await Promise.all(
      req.files.map(f =>
        uploadToImageKit({
          buffer: f.buffer,
          originalname: f.originalname,
          userId: req.user.id,
        })
      )
    );

    const meal = new Meal({
      user: req.user.id,
      images: uploads.map(u => ({ url: u.url, key: u.key })),
      description,
      // keep legacy single-image field if you need it
      image: uploads[0] ? { url: uploads[0].url, key: uploads[0].key } : undefined,
    });

    await meal.save();
    return res.status(201).json(meal);
  } catch (err) {
    console.error('Create meal error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get all meals for the authenticated user
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
 * Get a single meal
 */
async function getMeal(req, res) {
  try {
    const { id } = req.params;
    const meal = await Meal.findOne({ _id: id, user: req.user.id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    return res.json(meal);
  } catch (err) {
    console.error('Get meal error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Update a meal; if new images are provided, delete old ImageKit files and replace
 */
async function updateMeal(req, res) {
  try {
    const { id } = req.params;
    const meal = await Meal.findOne({ _id: id, user: req.user.id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });

    const { description } = req.body;
    if (description) meal.description = description;

    if (req.files && req.files.length > 0) {
      // Delete all existing images from ImageKit (ignore errors)
      const keysToDelete = [];
      if (meal.images?.length) {
        meal.images.forEach(img => img?.key && keysToDelete.push(img.key));
      }
      if (meal.image?.key) {
        keysToDelete.push(meal.image.key);
      }

      await Promise.all(
        keysToDelete.map(key =>
          imagekit.deleteFile(key).catch(err => {
            console.error('ImageKit delete error (ignored):', err?.message || err);
          })
        )
      );

      // Upload new images
      const newUploads = await Promise.all(
        req.files.map(f =>
          uploadToImageKit({
            buffer: f.buffer,
            originalname: f.originalname,
            userId: req.user.id,
          })
        )
      );

      meal.images = newUploads.map(u => ({ url: u.url, key: u.key }));
      if (newUploads[0]) {
        meal.image = { url: newUploads[0].url, key: newUploads[0].key };
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
 * Delete a meal and remove associated images from ImageKit
 */
async function deleteMeal(req, res) {
  try {
    const { id } = req.params;
    const meal = await Meal.findOne({ _id: id, user: req.user.id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });

    // Collect all fileIds to delete
    const keysToDelete = [];
    if (meal.images?.length) {
      meal.images.forEach(img => img?.key && keysToDelete.push(img.key));
    }
    if (meal.image?.key) {
      keysToDelete.push(meal.image.key);
    }

    await Promise.all(
      keysToDelete.map(key =>
        imagekit.deleteFile(key).catch(err => {
          console.error('ImageKit delete error (ignored):', err?.message || err);
        })
      )
    );

    await meal.deleteOne();
    return res.json({ message: 'Meal deleted' });
  } catch (err) {
    console.error('Delete meal error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createMeal, getMeals, getMeal, updateMeal, deleteMeal };
