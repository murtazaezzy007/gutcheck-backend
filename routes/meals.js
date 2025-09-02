const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createMeal, getMeals, getMeal, updateMeal, deleteMeal } = require('../controllers/mealController');
const multer = require('multer');

// In-memory storage for multipart files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 10MB per file (tweak as needed)
  fileFilter: (req, file, cb) => {
    // basic guard; allow images only
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    return cb(new Error('Only image uploads are allowed'));
  },
});

// Protect all routes
router.use(authenticate);

// Create a meal (up to 10 images)
router.post('/', upload.array('images', 10), createMeal);

// Get all meals for the logged in user
router.get('/', getMeals);

// Get a single meal by id
router.get('/:id', getMeal);

// Update a meal (replace images if provided)
router.post('/:id', upload.array('images', 10), updateMeal);

// Delete a meal
router.delete('/:id', deleteMeal);

module.exports = router;