const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const postRoutes = require('./routes/posts');
const assignmentRoutes = require('./routes/assignments');
const experienceRoutes = require('./routes/experiences');
const careerRoutes = require('./routes/career');
const resetPasswordRoutes = require('./routes/resetPassword');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/password', resetPasswordRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('CampusSync Server is Running');
});



// Connect to MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => {
    console.log('MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Connection failed', err);
  });