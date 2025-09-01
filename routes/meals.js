const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createMeal, getMeals, getMeal, updateMeal, deleteMeal } = require('../controllers/mealController');
const multer = require('multer');
const path = require('path');

// Configure multer with disk storage.  Images are stored in the
// backend/uploads/meals directory on the local file system.  Each file is
// given a unique name based on the current timestamp and a random number.
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '..', 'uploads', 'meals'));
    },
    filename: function (req, file, cb) {
      const fileExt = file.originalname.split('.').pop();
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
      cb(null, filename);
    },
  }),
});

// Protect all routes below with authentication
router.use(authenticate);

// Create a meal
router.post('/', upload.array('images', 10), createMeal);

// Get all meals for the logged in user
router.get('/', getMeals);

// Get a single meal by id
router.get('/:id', getMeal);

// Update a meal (supports replacing the image)
router.post('/:id', upload.array('images', 10), updateMeal);

// Delete a meal
router.delete('/:id', deleteMeal);

module.exports = router;