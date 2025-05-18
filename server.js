
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// === Homepage Routing ===
app.get('/', (req, res) => {
  res.redirect('/found');
});

app.get('/found', (req, res) => {
  res.sendFile(path.join(__dirname, 'found.html'));
});

app.get('/lost', (req, res) => {
  res.sendFile(path.join(__dirname, 'lost.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// === Mongoose Schemas ===
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

// Open Library cover URL helper
function getOpenLibraryImageUrl(title, author) {
  return `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-M.jpg`;
}







// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;



// Media Schema




// === ROUTES ===



// === Media Routes ===

// Media List Page
app.get('/medialibrary/list', async (req, res) => {
  try {
    const mediaItems = await Media.find();
    let html = `
      <html><head>
      <title>Found - Media Library</title>
      <link rel="stylesheet" href="/found_style.css">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      </head><body class="book-inventory-page">
      <nav class="navbar navbar-expand-lg bg-warm">
        <div class="container">
          <ul class="navbar-nav nav-links-found">
            <li class="nav-item">
              <a class="nav-link" href="/">Back to Homepage</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/medialibrary/add">Add Another Media</a>
            </li>
          </ul>
        </div>
      </nav>


      <header class="page-header">
        <h1 class="page-title">Found - Media Library</h1>
        <p class="page-subtitle">Kyle Versa</p>
      </header>

      <main><section class="destination-section">
        <h2 class="destination-title">Films & Shows That Remind Me of Places</h2>
        <div class="destination-divider"></div>`;

    mediaItems.forEach(media => {
      const domain = media.website ? new URL(media.website).hostname : 'Link';

      html += `
        <div class="destination-card book-card fade-in-card">
          <div class="book-cover-container">
            <div class="book-cover animated-book">
              ${
                media.posterUrl
                  ? `<img src="${media.posterUrl}" alt="${media.title} Poster" class="book-cover-image" style="width: 150px; border-radius: 5px;">`
                  : `<div class="book-title-on-cover">${media.title}</div>`
              }
            </div>
          </div>

          <div class="destination-content book-details-container">
            <h3 class="destination-name book-title">${media.title}</h3>
            <p class="destination-description book-author">by ${media.creator}</p>
            <p><strong>Type:</strong> ${media.type}</p>
            <p><strong>Release:</strong> ${media.date}</p>
            <p><strong>Location:</strong> ${media.location || 'Not specified'}</p>
            <p><strong>Website:</strong> <a href="${media.website}" class="book-link" target="_blank">${domain}</a></p>
            <div class="book-tags-container">
              <p><strong>Tags:</strong></p>
              <div class="book-tags">
                ${media.tags.map(tag => `<span class="book-tag">${tag}</span>`).join(" ")}
              </div>
            </div>
            <button class="delete-button" onclick="deleteMedia('${media._id}')">Delete</button>
          </div>


          </div>
        </div>
        <div class="book-divider"></div>`;

        
    });


    html += `
      </section></main>
        <script>
          function deleteMedia(id) {
            fetch('/medialibrary/delete/' + id, { method: 'DELETE' })
              .then(() => window.location.reload())
              .catch(err => console.error("Delete failed:", err));
          }
        </script>

                <!-- Back to Top Button -->
        <button id="backToTopBtn" onclick="scrollToTop()">Back to Top</button>

        <script>
          // Show button on scroll
          window.onscroll = function () {
            const btn = document.getElementById("backToTopBtn");
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
              btn.style.display = "block";
            } else {
              btn.style.display = "none";
            }
          };

          // Scroll to top
          function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        </script>

      </body></html>`;

    res.send(html);
  } catch (err) {
    res.status(500).send('Error fetching books');
  }
});

// Add Media Page
app.get('/medialibrary/add', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Add Media – Found</title>
      <link rel="stylesheet" href="/found_style.css" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        .book-preview-container {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .form-section, .preview-section {
          flex: 1;
          min-width: 250px;
          margin: 10px;
        }

        #preview-cover {
          width: 150px;
          height: 220px;
          background-color: #FFD59A;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(138, 78, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-weight: bold;
          padding: 10px;
          color: #8A4E00;
        }

        .suggested-tags button {
          background-color: #FFD59A;
          color: #4A2E00;
          margin: 4px;
          border: 1px solid #D4A76E;
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 0.9em;
          cursor: pointer;
        }

        .suggested-tags button:hover {
          background-color: #FFC373;
        }

        input, textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #D4A76E;
          border-radius: 6px;
          background-color: #FFF3E0;
          color: #4A2E00;
        }
      </style>
    </head>
    <body>
      <nav class="navbar navbar-expand-lg bg-warm">
        <div class="container">
          <ul class="navbar-nav nav-links-found">
            <li class="nav-item">
              <a class="nav-link" href="/">Back to Homepage</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/medialibrary/list">View Media Library</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/medialibrary/add">Add Another</a>
            </li>
          </ul>
        </div>
      </nav>

      <header class="page-header">
        <h1 class="page-title">Found - Media Library</h1>
        <p class="page-subtitle">Kyle Versa</p>
      </header>

      <main class="container">
        <section class="destination-section">
          <h2 class="destination-title">Add a New Film or Show</h2>
          <div class="interactive-container" style="max-width: 800px; margin: auto;">
            <form action="/medialibrary/add" method="POST" class="book-preview-container">
              <div class="form-section">
                <label>Title:</label><br>
                <input type="text" name="title" id="title" required><br><br>

                <label>Creator (Director/Artist):</label><br>
                <input type="text" name="creator" required><br><br>

                <label>Type (Film, Show, Doc):</label><br>
                <input type="text" name="type" required><br><br>

                <label>Release Year:</label><br>
                <input type="text" name="date"><br><br>

                <label>Website:</label><br>
                <input type="url" name="website"><br><br>

                <label>Location:</label><br>
                <input type="text" name="location"><br><br>

                <label>Tags (comma-separated):</label><br>
                <input type="text" name="tags" id="tags"><br><br>

                <div class="suggested-tags">
                  <strong>Suggested tags (click to add):</strong><br>
                  <button type="button" onclick="addTag('Visually Stunning')">Visually Stunning</button>
                  <button type="button" onclick="addTag('Local Perspective')">Local Perspective</button>
                  <button type="button" onclick="addTag('Travel Nostalgia')">Travel Nostalgia</button>
                  <button type="button" onclick="addTag('Culture & History')">Culture & History</button>
                  <button type="button" onclick="addTag('Watched While Traveling')">Watched While Traveling</button>
                </div><br>

                <button type="submit" class="action-button">Add Media</button>
              </div>

              <div class="preview-section" style="text-align: center;">
                <p><strong>Title Preview</strong></p>
                <div id="preview-cover" style="margin: 0 auto;"></div>
                <p style="font-size: 0.8em; margin-top: 10px;">Preview updates as you type</p>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer class="page-footer">
        <p class="copyright-text">&copy; 2025 Kyle Versa. All Rights Reserved.</p>
      </footer>

      <script>
        function addTag(tag) {
          const tagsInput = document.getElementById('tags');
          const currentTags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t !== '');
          if (!currentTags.includes(tag)) {
            currentTags.push(tag);
            tagsInput.value = currentTags.join(', ');
          }
        }

        document.getElementById('title').addEventListener('input', function () {
          const title = this.value.trim();
          const preview = document.getElementById('preview-cover');
          if (!title) {
            preview.innerHTML = 'Media Title';
            return;
          }

          const apiKey = 'cd0fa2acc4843b8d419fb897f5903f86';
          const url = "https://api.themoviedb.org/3/search/multi?api_key=" + apiKey + "&query=" + encodeURIComponent(title);

          fetch(url)
            .then(function(response) {
              return response.json();
            })
            .then(function(data) {
              let match = null;
              if (data.results && data.results.length > 0) {
                match = data.results.find(function(item) {
                  return (item.title && item.title.toLowerCase() === title.toLowerCase()) ||
                        (item.name && item.name.toLowerCase() === title.toLowerCase());
                }) || data.results[0];
              }

              if (match && match.poster_path) {
                const posterUrl = "https://image.tmdb.org/t/p/w300" + match.poster_path;
                preview.innerHTML = "<img src='" + posterUrl + "' class='book-cover-image' alt='" + title + " Poster' style='width: 150px; border-radius: 5px;'>";

                let input = document.getElementById('posterUrl');
                if (!input) {
                  input = document.createElement('input');
                  input.type = 'hidden';
                  input.name = 'posterUrl';
                  input.id = 'posterUrl';
                  document.querySelector('form').appendChild(input);
                }
                input.value = posterUrl;
              } else {
                preview.innerHTML = "<div class='book-cover'><div class='book-spine'></div><div class='book-title-on-cover'>" + title + "</div></div>";
              }
            })
            .catch(function(error) {
              console.error("TMDb fetch error:", error);
              preview.innerHTML = "<div class='book-cover'><div class='book-spine'></div><div class='book-title-on-cover'>" + title + "</div></div>";
            });
        });
      </script>
    </body>
    </html>
        <!-- Back to Top Button -->
    <button id="backToTopBtn" onclick="scrollToTop()">Back to Top</button>

    <script>
      // Show button on scroll
      window.onscroll = function () {
        const btn = document.getElementById("backToTopBtn");
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
          btn.style.display = "block";
        } else {
          btn.style.display = "none";
        }
      };

      // Scroll to top
      function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    </script>

    </body>
    </html>
    
        <!-- Back to Top Button -->
    <button id="backToTopBtn" onclick="scrollToTop()">Back to Top</button>

    <script>
      // Show button on scroll
      window.onscroll = function () {
        const btn = document.getElementById("backToTopBtn");
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
          btn.style.display = "block";
        } else {
          btn.style.display = "none";
        }
      };

      // Scroll to top
      function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    </script>

    </body>
    </html>


  `);
});



app.get('/medialibrary/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Media Added – Found</title>
      <link rel="stylesheet" href="/found_style.css" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        .success-box {
          background-color: #FFF3E0;
          border: 2px solid #D4A76E;
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          margin: 50px auto;
          box-shadow: 0 0 15px rgba(138, 78, 0, 0.2);
          text-align: center;
        }

        .success-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }

        .success-buttons a {
          background-color: #FFD59A;
          color: #4A2E00;
          padding: 10px 20px;
          font-weight: bold;
          border-radius: 6px;
          border: 2px solid #8A4E00;
          text-decoration: none;
          transition: all 0.3s ease-in-out;
        }

        .success-buttons a:hover {
          background-color: #FFC373;
          color: #1B1B2F;
        }

        .page-subtitle {
          color: #FFA053;
        }

        .destination-title {
          font-size: 32px;
          color: #A65E28;
          margin-bottom: 10px;
        }

        .success-box {
          margin-top: 20px;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body class="book-inventory-page">
      <nav class="navbar navbar-expand-lg bg-warm">
        <div class="container">
          <ul class="navbar-nav nav-links-found">
            <li class="nav-item"><a class="nav-link" href="/">Back to Homepage</a></li>
            <li class="nav-item"><a class="nav-link" href="/medialibrary/list">View Media Library</a></li>
            <li class="nav-item"><a class="nav-link" href="/medialibrary/add">Add Another Media</a></li>
          </ul>
        </div>
      </nav>

      <header class="page-header">
        <h1 class="page-title">Found - Media Library</h1>
        <p class="page-subtitle">Kyle Versa</p>
      </header>

      <main class="container">
        <section class="destination-section">
          <h2 class="destination-title">Media Entry Added!</h2>
          <div class="success-box">
            <p>Your entry has been added to the library.</p>
            <div class="success-buttons">
              <a href="/medialibrary/list">View Library</a>
              <a href="/medialibrary/add">Add Another</a>
            </div>
          </div>
        </section>
      </main>

      <footer class="page-footer">
        <p class="copyright-text">&copy; 2025 Kyle Versa. All Rights Reserved.</p>
      </footer>
    </body>
    </html>
  `);
});





// Handle Media Submission
app.post('/medialibrary/add', async (req, res) => {
  try {
    const { title, creator, type, date, website, location, tags } = req.body;

    // TMDB API request
  const tmdbApiKey = process.env.TMDB_API_KEY;
    const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}`;

    let posterUrl = '';
    try {
      const tmdbResponse = await fetch(tmdbUrl);
      const tmdbData = await tmdbResponse.json();

      let match = null;
      if (tmdbData.results && tmdbData.results.length > 0) {
        match = tmdbData.results.find(item =>
          (item.title && item.title.toLowerCase() === title.toLowerCase()) ||
          (item.name && item.name.toLowerCase() === title.toLowerCase())
        ) || tmdbData.results[0]; // fallback to first result
      }

      posterUrl = match && match.poster_path
        ? `https://image.tmdb.org/t/p/w300${match.poster_path}`
        : '';

    } catch (err) {
      console.error('TMDB fetch error:', err);
    }



    console.log("Saving media with poster URL:", posterUrl);

    const media = new Media({
      title,
      creator,
      type,
      date,
      website,
      location,
      posterUrl, // Save the poster!
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    await media.save();
    res.redirect('/medialibrary/success');
  } catch (err) {
    res.status(500).send('Error saving media');
  }
});


// Delete Book
app.delete('/medialibrary/delete/:id', async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send('Delete failed');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Found server running on http://localhost:${PORT}`);
});
  // Load environment variables

// Function to get Open Library image URL
function getOpenLibraryImageUrl(title, author) {
  // Convert the title and author to a format suitable for an API query
  return `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-M.jpg`;
}








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
                <p class="page-subtitle">Kyle Versa</p>
            </div>
        </header>

        <main><section class="destination-section">
            <h2 class="destination-title" style="color: #EAEAEA;">Books That Inspire Me To Travel</h2>
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
            <p class="copyright-text">&copy; 2025 Kyle Versa. All Rights Reserved.</p>
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

                <!-- Back to Top Button -->
        <button id="backToTopBtn" onclick="scrollToTop()">Back to Top</button>

        <script>
        // Show button on scroll
        window.onscroll = function () {
            const btn = document.getElementById("backToTopBtn");
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            btn.style.display = "block";
            } else {
            btn.style.display = "none";
            }
        };

        // Scroll to top
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <p class="page-subtitle">Kyle Versa</p>
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
      <p class="copyright-text">&copy; 2025 Kyle Versa. All Rights Reserved.</p>
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
    <!-- Back to Top Button -->
    <button id="backToTopBtn" onclick="scrollToTop()">Back to Top</button>

    <script>
    // Show button on scroll
    window.onscroll = function () {
        const btn = document.getElementById("backToTopBtn");
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btn.style.display = "block";
        } else {
        btn.style.display = "none";
        }
    };

    // Scroll to top
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <p class="page-subtitle">Kyle Versa</p>
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
      <p class="copyright-text">&copy; 2025 Kyle Versa. All Rights Reserved.</p>
  </footer>

        <!-- Back to Top Button -->
        <button id="backToTopBtn" onclick="scrollToTop()">Back to Top</button>

        <script>
        // Show button on scroll
        window.onscroll = function () {
            const btn = document.getElementById("backToTopBtn");
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            btn.style.display = "block";
            } else {
            btn.style.display = "none";
            }
        };

        // Scroll to top
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        </script>


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


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});





app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
