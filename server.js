
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const { MongoClient } = require('mongodb');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML pages
app.get('/', (req, res) => {
  res.redirect('/found');
});

app.get('/found', (req, res) => {
  res.sendFile(path.join(__dirname, 'found.html'));
});

app.get('/lost', (req, res) => {
  res.sendFile(path.join(__dirname, 'lost.html'));
});

// MongoDB endpoints
MongoClient.connect(MONGO_URI, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB Atlas');
    const db = client.db(); // Defaults to database from URI

    const booksCollection = db.collection('books');
    const mediaCollection = db.collection('media');

    // GET all books (Lost)
    app.get('/api/books', async (req, res) => {
      try {
        const books = await booksCollection.find().toArray();
        res.json(books);
      } catch (err) {
        res.status(500).send('Error retrieving books');
      }
    });

    // ADD a book (Lost)
    app.post('/api/books', async (req, res) => {
      try {
        const newBook = req.body;
        const result = await booksCollection.insertOne(newBook);
        res.status(201).json(result);
      } catch (err) {
        res.status(500).send('Error adding book');
      }
    });

    // DELETE a book (Lost)
    app.delete('/api/books/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await booksCollection.deleteOne({ _id: new MongoClient.ObjectId(id) });
        res.json(result);
      } catch (err) {
        res.status(500).send('Error deleting book');
      }
    });

    // GET all media (Found)
    app.get('/api/media', async (req, res) => {
      try {
        const media = await mediaCollection.find().toArray();
        res.json(media);
      } catch (err) {
        res.status(500).send('Error retrieving media');
      }
    });

    // ADD a media entry (Found)
    app.post('/api/media', async (req, res) => {
      try {
        const newMedia = req.body;
        const result = await mediaCollection.insertOne(newMedia);
        res.status(201).json(result);
      } catch (err) {
        res.status(500).send('Error adding media');
      }
    });

    // DELETE a media entry (Found)
    app.delete('/api/media/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await mediaCollection.deleteOne({ _id: new MongoClient.ObjectId(id) });
        res.json(result);
      } catch (err) {
        res.status(500).send('Error deleting media');
      }
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
