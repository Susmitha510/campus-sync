const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['hackathon', 'project'],
    required: true
  },
  skillsRequired: {
    type: [String]
  },
  membersRequired: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);