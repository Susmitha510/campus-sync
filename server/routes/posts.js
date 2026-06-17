const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Create a post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, type, skillsRequired, membersRequired } = req.body;

    const post = new Post({
      title,
      description,
      type,
      skillsRequired,
      membersRequired: membersRequired || 1,
      createdBy: req.user.userId
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all posts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('createdBy', 'name branch year')
      .populate('applicants.user', 'name branch year skills email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get my posts
router.get('/myposts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user.userId })
      .populate('createdBy', 'name branch year')
      .populate('applicants.user', 'name branch year skills email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Apply to join a post
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.status === 'closed') {
      return res.status(400).json({ message: 'This post is closed. Team is already formed.' });
    }

    const alreadyApplied = post.applicants.find(
      a => a.user.toString() === req.user.userId
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied' });
    }

    post.applicants.push({ user: req.user.userId });
    await post.save();

    res.json({ message: 'Applied successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Accept or reject applicant
router.put('/:id/applicants/:userId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applicant = post.applicants.find(
      a => a.user.toString() === req.params.userId
    );

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    applicant.status = status;
    await post.save();

    res.json({ message: `Applicant ${status}` });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Edit post
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, type, skillsRequired, membersRequired } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.title = title || post.title;
    post.description = description || post.description;
    post.type = type || post.type;
    post.skillsRequired = skillsRequired || post.skillsRequired;
    post.membersRequired = membersRequired || post.membersRequired;
    post.isEdited = true;

    await post.save();
    res.json({ message: 'Post updated', post });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Close post
router.put('/:id/close', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.status = 'closed';
    await post.save();

    res.json({ message: 'Post closed' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;