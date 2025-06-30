

// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// ✅ Allow cross-origin requests from your frontend
app.use(cors());

// ✅ Connect to MongoDB
const mongoURI = 'mongodb+srv://pragatimore543:Pragati123%21@cluster0.l20m1ma.mongodb.net/cafes?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ Mongoose model - use exact 'locations' collection
const Cafe = mongoose.model('Cafe', {
  name: String,
  address: String,
  location: {
    lat: Number,
    lng: Number
  },
  best_dishes: [String],
  rating: Number
}, 'locations');  // 👈 Important! Use 'locations' collection

// ✅ API route to get cafes
app.get('/cafes', async (req, res) => {
  try {
    const cafes = await Cafe.find();
    res.json(cafes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route to test API home
app.get('/', (req, res) => {
  res.send('👋 Welcome to the Cafe Finder API!');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
