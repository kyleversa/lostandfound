
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// === MODELS ===
const mediaSchema = new mongoose.Schema({
  title: String,
  creator: String,
  type: String,
  date: String,
  website: String,
  tags: [String],
  location: String,
  posterUrl: String
});
const Media = mongoose.model('Media', mediaSchema);

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  publisher: String,
  date: String,
  website: String,
  tags: [String],
  location: String
});
const Book = mongoose.model('Book', bookSchema);

// === ROUTES ===

// Static Pages
app.get('/', (req, res) => res.redirect('/found'));
app.get('/found', (req, res) => res.sendFile(path.join(__dirname, 'found.html')));
app.get('/lost', (req, res) => res.sendFile(path.join(__dirname, 'lost.html')));

// Media Library Routes
app.get('/medialibrary/list', async (req, res) => {
  try {
    const mediaItems = await Media.find();
    // Rendered HTML content here...
    res.send(/* long HTML string or extracted template */);
  } catch (err) {
    res.status(500).send('Error fetching media');
  }
});
app.get('/medialibrary/add', (req, res) => {
  res.send(/* HTML form for adding media */);
});
app.post('/medialibrary/add', async (req, res) => {
  try {
    const { title, creator, type, date, website, location, tags } = req.body;
    const tmdbApiKey = process.env.TMDB_API_KEY;
    const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}`;

    let posterUrl = '';
    try {
      const tmdbResponse = await fetch(tmdbUrl);
      const tmdbData = await tmdbResponse.json();
      const match = tmdbData.results?.find(item =>
        (item.title && item.title.toLowerCase() === title.toLowerCase()) ||
        (item.name && item.name.toLowerCase() === title.toLowerCase())
      ) || tmdbData.results?.[0];
      posterUrl = match?.poster_path
        ? `https://image.tmdb.org/t/p/w300${match.poster_path}`
        : '';
    } catch (err) {
      console.error('TMDB fetch error:', err);
    }

    const media = new Media({
      title, creator, type, date, website, location, posterUrl,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    await media.save();
    res.redirect('/medialibrary/success');
  } catch (err) {
    res.status(500).send('Error saving media');
  }
});
app.get('/medialibrary/success', (req, res) => {
  res.send(/* success message HTML */);
});
app.delete('/medialibrary/delete/:id', async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send('Delete failed');
  }
});

// Book Library Routes
app.get('/bookinventory/list', async (req, res) => {
  try {
    const books = await Book.find();
    res.send(/* HTML list of books */);
  } catch (err) {
    res.status(500).json({ error: "Error fetching books" });
  }
});
app.get('/bookinventory/add', (req, res) => {
  res.send(/* HTML form to add a book */);
});
app.post('/bookinventory/add', async (req, res) => {
  try {
    const { title, author, publisher, date, website, location, tags } = req.body;
    const newBook = new Book({
      title, author, publisher, date, website, location,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    await newBook.save();
    res.redirect('/bookinventory/success');
  } catch (err) {
    res.status(500).json({ error: "Error adding book" });
  }
});
app.get('/bookinventory/success', (req, res) => {
  res.send(/* success message HTML */);
});
app.delete('/bookinventory/delete/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    await Book.findByIdAndDelete(bookId);
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting book" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
