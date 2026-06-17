const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const authMiddleware = require('../middleware/authMiddleware');

// Post an experience
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { company, role, rounds, questions, result } = req.body;

    const experience = new Experience({
      company,
      role,
      rounds,
      questions,
      result,
      postedBy: req.user.userId
    });

    await experience.save();
    res.status(201).json({ message: 'Experience posted successfully', experience });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all experiences (with optional company search)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { company } = req.query;

    let filter = {};
    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }

    const experiences = await Experience.find(filter)
      .populate('postedBy', 'name branch year')
      .sort({ createdAt: -1 });

    res.json(experiences);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get my experiences  ← THIS WAS MISSING (must come before /:id routes)
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const experiences = await Experience.find({ postedBy: req.user.userId })
      .populate('postedBy', 'name branch year')
      .sort({ createdAt: -1 });

    res.json(experiences);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Upvote or remove upvote
router.put('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    const alreadyUpvoted = experience.upvotedBy.includes(req.user.userId);

    if (alreadyUpvoted) {
      experience.upvotedBy = experience.upvotedBy.filter(
        id => id.toString() !== req.user.userId
      );
    } else {
      experience.upvotedBy.push(req.user.userId);
    }

    await experience.save();
    res.json(experience);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit an experience (only by owner)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    if (experience.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own posts' });
    }

    const { company, role, rounds, questions, result } = req.body;
    experience.company = company;
    experience.role = role;
    experience.rounds = rounds;
    experience.questions = questions;
    experience.result = result;

    await experience.save();
    res.json(experience);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete an experience (only by owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    if (experience.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own posts' });
    }

    await experience.deleteOne();
    res.json({ message: 'Experience deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;