const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createPoop, getPoops, getPoop, updatePoop, deletePoop } = require('../controllers/poopController');

// Protect all routes below with authentication
router.use(authenticate);

// Create a poop entry
router.post('/', createPoop);

// Get all poop entries for the logged in user
router.get('/', getPoops);

// Get a single poop entry by id
router.get('/:id', getPoop);

// Update a poop entry
router.put('/:id', updatePoop);

// Delete a poop entry
router.delete('/:id', deletePoop);

module.exports = router;