const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const authMiddleware = require('../middleware/authMiddleware');

// Add assignment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, subject, dueDate } = req.body;

    const assignment = new Assignment({
      title,
      subject,
      dueDate,
      createdBy: req.user.userId
    });

    await assignment.save();
    res.status(201).json({ message: 'Assignment added successfully', assignment });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all assignments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user.userId })
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Toggle complete / undo complete
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.completed = req.body.completed !== undefined ? req.body.completed : true;
    await assignment.save();

    res.json({ message: 'Assignment updated', assignment });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit assignment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, subject, dueDate } = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      { title, subject, dueDate },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ message: 'Assignment updated', assignment });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete assignment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;