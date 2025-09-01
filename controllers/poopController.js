const Poop = require('../models/poop');

/**
 * Create a new poop entry.  Requires the description field in the body and
 * attaches the authenticated user's id to the entry.  Returns the created
 * poop document.
 */
async function createPoop(req, res) {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    const poop = new Poop({ user: req.user.id, description });
    await poop.save();
    return res.status(201).json(poop);
  } catch (err) {
    console.error('Create poop error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get all poop entries for the authenticated user sorted by most recent.
 */
async function getPoops(req, res) {
  try {
    const poops = await Poop.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(poops);
  } catch (err) {
    console.error('Get poops error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get a specific poop entry by id for the authenticated user.
 */
async function getPoop(req, res) {
  try {
    const { id } = req.params;
    const poop = await Poop.findOne({ _id: id, user: req.user.id });
    if (!poop) {
      return res.status(404).json({ message: 'Poop entry not found' });
    }
    return res.json(poop);
  } catch (err) {
    console.error('Get poop error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Update a poop entry's description.
 */
async function updatePoop(req, res) {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const poop = await Poop.findOne({ _id: id, user: req.user.id });
    if (!poop) {
      return res.status(404).json({ message: 'Poop entry not found' });
    }
    if (description) {
      poop.description = description;
    }
    await poop.save();
    return res.json(poop);
  } catch (err) {
    console.error('Update poop error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Delete a poop entry.
 */
async function deletePoop(req, res) {
  try {
    const { id } = req.params;
    const poop = await Poop.findOne({ _id: id, user: req.user.id });
    if (!poop) {
      return res.status(404).json({ message: 'Poop entry not found' });
    }
    await poop.deleteOne();
    return res.json({ message: 'Poop entry deleted' });
  } catch (err) {
    console.error('Delete poop error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createPoop, getPoops, getPoop, updatePoop, deletePoop };