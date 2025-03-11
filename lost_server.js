require('dotenv').config();  // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Function to get Open Library image URL
function getOpenLibraryImageUrl(title, author) {
  // Convert the title and author to a format suitable for an API query
  return `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-M.jpg`;
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("MongoDB connection error:", err));

// Define Book Schema
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

// Main route - Serve Lost Page
app.get('/', function(req, res){
   res.sendFile(path.join(__dirname, 'lost.html'));
});

// Travel Books Page (Book List)
app.get('/bookinventory/list', async (req, res) => {
    try {
        const books = await Book.find(); // Fetch books from MongoDB

        let html = `
        <html>
        <head>
            <title>Lost - Travel Book Library</title>
            <link rel="stylesheet" href="/lost_style.css">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="lost-theme book-inventory-page">

        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link book-nav-link" href="/">Back to Homepage</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link book-nav-link" href="/bookinventory/add">Add New Book</a>
                    </li>
                </ul>
                </div>
            </div>
        </nav>

        <header class="page-header">
            <div class="header-container">
                <h1 class="page-title">Lost - Travel Book Library</h1>
                <p class="page-subtitle">Kyle Purves</p>
            </div>
        </header>

        <main><section class="destination-section">
            <h2 class="destination-title" style="color: #EAEAEA;">Travel Book Inventory</h2>
            <div class="destination-divider"></div>`;

        // Generate book list
        books.forEach((book, index) => {
          html += `<div class="destination-card book-card">
              <div class="book-cover-container">
                  <div class="book-cover">
                      <img src="${getOpenLibraryImageUrl(book.title, book.author)}"
                          alt="${book.title} cover" class="book-cover-image"
                          onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\'book-cover\'><div class=\'book-spine\'></div><div class=\'book-title-on-cover\'>${book.title.replace(/'/g, "\\'")}</div></div>';">
                      <div class="book-spine"></div>
                  </div>
              </div>
              <div class="destination-content book-details-container">
                  <h3 class="destination-name book-title">${book.title}</h3>
                  <p class="destination-description book-author">by ${book.author}</p>
                  
                  <div class="book-info-box">
                      <p><strong>Publisher:</strong> ${book.publisher}</p>
                      <p><strong>Published:</strong> ${book.date}</p>
                      <p><strong>Location:</strong> ${book.location || 'Not specified'}</p>
                      <p><strong>Website:</strong> <a href="${book.website}" target="_blank" class="book-link">${book.publisher} Website</a></p>
                      
                      <div class="book-tags-container">
                          <p><strong>Tags:</strong></p>
                          <div class="book-tags">
                              ${book.tags.map(tag => `<span class="book-tag">${tag}</span>`).join(" ")}
                          </div>
                      </div>
                  </div>
                  
                  <button class="delete-button" onclick="deleteBook('${book._id}')">Delete Book</button>
              </div>
          </div>`;

          if (index < books.length - 1) {
            html += `<div class="book-divider"></div>`;
        }

          
        });


        html += `</section></main>
        <footer class="page-footer">
            <p class="copyright-text">&copy; 2025 Kyle Purves. All Rights Reserved.</p>
        </footer>

        <script>
        function deleteBook(bookId) {
            fetch("/bookinventory/delete/" + bookId, { method: "DELETE" })
                .then(response => response.json())
                .then(result => {
                    console.log("Book deleted:", result);
                    window.location.reload();
                })
                .catch(error => console.error("Error deleting book:", error));
        }
        </script>

        <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
        </body></html>`;

        res.send(html);
    } catch (err) {
        res.status(500).json({ error: "Error fetching books" });
    }
});

// Add New Book Page (Dynamically Rendered)
app.get('/bookinventory/add', function(req, res){
  let html = `
  <html>
  <head>
      <title>Add Book - Lost Travel Library</title>
      <link rel="stylesheet" href="/lost_style.css">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body class="lost-theme book-inventory-page">

  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
              <li class="nav-item">
                  <a class="nav-link book-nav-link" href="/">Back to Homepage</a>
              </li>
              <li class="nav-item">
                  <a class="nav-link book-nav-link" href="/bookinventory/list">View Book Inventory</a>
              </li>
          </ul>
          </div>
      </div>
  </nav>

  <header class="page-header">
      <div class="header-container">
          <h1 class="page-title">Lost - Travel Book Library</h1>
          <p class="page-subtitle">Kyle Purves</p>
      </div>
  </header>

  <main><section class="destination-section">
      <h2 class="destination-title">Add a New Travel Book</h2>

      <div class="interactive-container" style="max-width: 600px; margin: 0 auto; padding: 25px;">
          <div class="row">
              <!-- Left column - form -->
              <div class="col-md-8">
                  <form action="/bookinventory/add" method="post">
                      <div class="mb-3">
                          <label for="title" class="form-label">Title:</label>
                          <input type="text" class="form-control" id="title" name="title" required>
                      </div>

                      <div class="mb-3">
                          <label for="author" class="form-label">Author:</label>
                          <input type="text" class="form-control" id="author" name="author" required>
                      </div>

                      <div class="mb-3">
                          <label for="publisher" class="form-label">Publisher:</label>
                          <input type="text" class="form-control" id="publisher" name="publisher" required>
                      </div>

                      <div class="mb-3">
                          <label for="date" class="form-label">Publication Date:</label>
                          <input type="text" class="form-control" id="date" name="date" required>
                      </div>

                      <div class="mb-3">
                          <label for="website" class="form-label">Website:</label>
                          <input type="url" class="form-control" id="website" name="website" required>
                      </div>

                      <div class="mb-3">
                          <label for="location" class="form-label">Location/Destination:</label>
                          <input type="text" class="form-control" id="location" name="location" required>
                      </div>

                      <div class="mb-3">
                          <label for="tags" class="form-label">Tags (comma-separated):</label>
                          <input type="text" class="form-control" id="tags" name="tags" placeholder="Pre-Trip Inspiration, Local Read, etc.">
                      </div>

                      <div class="tag-options">
                          <p>Suggested tags (click to add):</p>
                          <div>
                              <span class="tag" onclick="addTag('Pre-Trip Inspiration')">Pre-Trip Inspiration</span>
                              <span class="tag" onclick="addTag('Local Read')">Local Read</span>
                              <span class="tag" onclick="addTag('Travel Memoir')">Travel Memoir</span>
                              <span class="tag" onclick="addTag('Read While Traveling')">Read While Traveling</span>
                              <span class="tag" onclick="addTag('Deep Dive Into Culture')">Deep Dive Into Culture</span>
                          </div>
                      </div>

                      <button type="submit" class="action-button">Add Book</button>
                  </form>
              </div>

              <!-- Right column - book cover preview -->
              <div class="col-md-4">
                  <div style="text-align: center;">
                      <p>Book Cover Preview</p>
                      <div class="book-cover-container" style="margin: 0 auto;">
                          <div class="book-cover" id="preview-cover">
                              <div class="book-spine"></div>
                              <div class="book-title-on-cover" id="preview-title">Book Title</div>
                          </div>
                      </div>
                      <p>Preview updates as you type</p>
                  </div>
              </div>
          </div>
      </div>

  </section></main>

  <footer class="page-footer">
      <p class="copyright-text">&copy; 2025 Kyle Purves. All Rights Reserved.</p>
  </footer>

  <script>
      document.getElementById('title').addEventListener('input', function() {
          document.getElementById('preview-title').textContent = this.value || 'Book Title';
      });

      function addTag(tag) {
          let tagsInput = document.getElementById('tags');
          let currentTags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t !== '');
          if (!currentTags.includes(tag)) {
              tagsInput.value = currentTags.length > 0 ? currentTags.join(', ') + ', ' + tag : tag;
          }
      }
  </script>

  <script src="/lost_script.js"></script>

  <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  </body></html>`;

  res.send(html);
});

// Book Add Success
app.get('/bookinventory/success', (req, res) => {
  let html = `
  <html>
  <head>
      <title>Book Added - Lost Travel Library</title>
      <link rel="stylesheet" href="/lost_style.css">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>
  <body class="lost-theme book-inventory-page">

  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
              <li class="nav-item">
                  <a class="nav-link book-nav-link" href="/">Back to Homepage</a>
              </li>
              <li class="nav-item">
                  <a class="nav-link book-nav-link" href="/bookinventory/list">View Book Inventory</a>
              </li>
              <li class="nav-item">
                  <a class="nav-link book-nav-link" href="/bookinventory/add">Add Another Book</a>
              </li>
          </ul>
          </div>
      </div>
  </nav>

  <header class="page-header">
      <div class="header-container">
          <h1 class="page-title">Lost - Travel Book Library</h1>
          <p class="page-subtitle">Kyle Purves</p>
      </div>
  </header>

  <main><section class="destination-section">
      <h2 class="destination-title">Book Added Successfully!</h2>
      <div class="interactive-container" style="max-width: 600px; margin: 0 auto;">
          <p style="color: #00FFFF; font-size: 1.2em;">Your book has been added to the library.</p>

          <div style="display: flex; gap: 10px; justify-content: center;">
              <button class="action-button" onclick="window.location.href='/bookinventory/list'">View Book Inventory</button>
              <button class="action-button" onclick="window.location.href='/bookinventory/add'">Add Another Book</button>
          </div>
      </div>
  </section></main>

  <footer class="page-footer">
      <p class="copyright-text">&copy; 2025 Kyle Purves. All Rights Reserved.</p>
  </footer>

  <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  </body></html>`;

  res.send(html);
});



// Store books in MongoDB
app.post('/bookinventory/add', async (req, res) => {
  try {
      const { title, author, publisher, date, website, location, tags } = req.body;
      const newBook = new Book({
          title,
          author,
          publisher,
          date,
          website,
          location,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      });

      await newBook.save();
      res.redirect('/bookinventory/success'); // Redirect after book is added
  } catch (err) {
      res.status(500).json({ error: "Error adding book" });
  }
});


// Delete a book
app.delete('/bookinventory/delete/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        await Book.findByIdAndDelete(bookId);
        res.json({ message: "Book deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting book" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


