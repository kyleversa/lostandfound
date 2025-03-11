document.addEventListener("DOMContentLoaded", function() {
    console.log("lost_script.js is loaded and running!");

    if (window.location.pathname === "/bookinventory/list") { 
        fetchBooks(); // Load books only if on the Travel Books page
    }
});

function fetchBooks() {
    fetch("/bookinventory/list")  // Calls the backend to get books from MongoDB
        .then(response => response.json())
        .then(books => {
            displayBooks(books);
        })
        .catch(error => console.error("Error fetching books:", error));
}

function displayBooks(books) {
    const bookContainer = document.getElementById("book-list");
    if (!bookContainer) return; // Ensure the book section exists

    bookContainer.innerHTML = ""; // Clear existing content

    books.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("destination-card", "book-card");

        bookCard.innerHTML = `
            <div class="book-cover-container">
                <div class="book-cover">
                    <img src="https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-M.jpg" 
                        alt="${book.title} cover" class="book-cover-image" 
                        onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\'book-cover\'><div class=\'book-spine\'></div><div class=\'book-title-on-cover\'>${book.title.replace(/'/g, "\\'")}</div></div>';">
                    <div class="book-spine"></div>
                </div>
            </div>
            <div class="destination-content book-details-container">
                <h3 class="destination-name book-title">${book.title}</h3>
                <p class="destination-description book-author">by ${book.author}</p>
                <div class="interactive-container book-info">
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
                    <button class="delete-button" onclick="deleteBook('${book._id}')">Delete</button>
                </div>
            </div>
        `;
        bookContainer.appendChild(bookCard);
    });
}

// Function to delete a book from MongoDB
function deleteBook(bookId) {
    fetch(`/bookinventory/delete/${bookId}`, { method: "DELETE" })
        .then(response => response.json())
        .then(result => {
            console.log("Book deleted:", result);
            fetchBooks(); // Reload books after deletion
        })
        .catch(error => console.error("Error deleting book:", error));
}

// Fetch and preview book cover dynamically while typing
document.addEventListener("DOMContentLoaded", function() {
    const titleInput = document.getElementById('title');
    const previewCover = document.getElementById('preview-cover');

    if (!previewCover) {
        console.warn("⚠ Warning: #preview-cover not found, skipping preview update.");
        return;
    }
    
    if (titleInput && previewCover) {
        titleInput.addEventListener('input', function() {
            const title = this.value.trim();
            if (title) {
                const coverImage = `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-M.jpg`;

                // Create a new image element
                const img = new Image();
                img.src = coverImage;
                
                img.onload = function() {
                    console.log("Book cover found:", coverImage);
                    previewCover.innerHTML = `<img src="${coverImage}" class="book-cover-image" alt="Book Cover">`;
                };

                img.onerror = function() {
                    console.log("No book cover found for:", title);
                    previewCover.innerHTML = `
                        <div class='book-cover'>
                            <div class='book-spine'></div>
                            <div class='book-title-on-cover'>${title}</div>
                        </div>`;
                };
            } else {
                console.log("⚠ No title entered, using default preview.");
                previewCover.innerHTML = `
                    <div class='book-cover'>
                        <div class='book-spine'></div>
                        <div class='book-title-on-cover'>Book Title</div>
                    </div>`;
            }
        });
    } else {
        console.error("Title input or preview cover not found.");
    }
});


// Array of image objects with their corresponding description files
const carouselContent = [
    {
        image: '/images/tokyo.webp',
        descriptionFile: 'descriptions/tokyo_desc.txt'
    },
    {
        image: '/images/sydney.webp',
        descriptionFile: 'descriptions/sydney_desc.txt'
    },
    {
        image: '/images/bangkok.webp',
        descriptionFile: 'descriptions/bangkok_desc.txt'
    },
    {
        image: '/images/santorini.webp',
        descriptionFile: 'descriptions/santorini_desc.txt'
    },
    {
        image: '/images/istanbul.webp',
        descriptionFile: 'descriptions/istanbul_desc.txt'
    }
];

let currentIndex = 0;

// Function to load description via AJAX
function loadDescription(descriptionFile) {
    $.ajax({
        url: descriptionFile,
        success: function(description) {
            $('#ajax-description').text(description);
        },
        error: function() {
            console.log('Error loading description');
            $('#ajax-description').text('Description unavailable');
        }
    });
}

// Function to update carousel
function updateCarousel() {
    const currentContent = carouselContent[currentIndex];
    
    $('#ajax-image').fadeOut(500, function() {
        $(this).attr('src', currentContent.image).fadeIn(500);
    });
    
    $('#ajax-description').fadeOut(500, function() {
        loadDescription(currentContent.descriptionFile);
        $(this).fadeIn(500);
    });
    
    currentIndex = (currentIndex + 1) % carouselContent.length;
}

// Start carousel when document is ready
$(document).ready(function() {
    updateCarousel(); // Initial load
    setInterval(updateCarousel, 4000); // Update every 4 seconds to allow for fade transitions I added
});

// Generic function to toggle destination text
function updateDestinationText(destinationId, text) {
    document.getElementById(`${destinationId}-text`).innerText = text;
}

// Generic function to toggle bucket list items
function toggleBucketItem(destinationId) {
    const item = document.getElementById(`${destinationId}-bucket`);
    item.style.display = "block";
}

// City-specific text update functions
function updateTokyoText() {
    updateDestinationText('tokyo', 'Tokyo is a dream destination with its blend of ancient temples and futuristic technology!');
}

function updateSydneyText() {
    updateDestinationText('sydney', 'Sydney\'s iconic Opera House and Bondi Beach make it a must-visit location!');
}

function updateBangkokText() {
    updateDestinationText('bangkok', 'Bangkok\’s temples shine with beauty and spirituality, from sunrise to sunset.');
}

function updateSantoriniText() {
    updateDestinationText('santorini', 'Santorini\’s charm lies in its endless blue, stunning caldera views, and the peaceful rhythm of island life.');
}

function updateIstanbulText() {
    updateDestinationText('istanbul', 'Istanbul is a city shaped by centuries of empires, where grand mosques and ancient markets whisper stories of its legendary past.');
}

// Navigation function
function navigateToFoundPage() {
    window.location.href = "found.html";
}

// Smooth Scroll Function
function smoothScroll(target) {
    const element = document.querySelector(target);
    
    if (!element) return;

    const navHeight = document.querySelector('.nav-bar').offsetHeight;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20; 

    // Scroll animation with easing
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });

    // Highlights the section temporarily
    element.classList.add('scroll-highlight');
    setTimeout(() => {
        element.classList.remove('scroll-highlight');
    }, 1000);
}

// Update active states
function updateActiveStates() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const dots = document.querySelectorAll('.progress-dot');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop - 60) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === currentSection) {
            link.classList.add('active');
        }
    });
    
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (dot.dataset.section === currentSection) {
            dot.classList.add('active');
        }
    });
}

// Smooth Page Transition Function
function setupPageTransition() {
    
    // Add transition overlay to the body
    const transitionOverlay = document.createElement('div');
    transitionOverlay.classList.add('page-transition-overlay');
    document.body.appendChild(transitionOverlay);

    // Enhance navigation function
    const originalNavigateToFoundPage = navigateToFoundPage;
    navigateToFoundPage = function() {
        document.body.classList.add('fade-out');
        transitionOverlay.style.opacity = '1';
        setTimeout(() => {
            window.location.href = "found.html";
        }, 300);
    };

    // Fade in body on page load
    document.body.style.opacity = '0';
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });
}

// Image Fade-In Effect
function setupImageFadeIn() {
    const images = document.querySelectorAll('.destination-image');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    images.forEach(image => {
        image.style.opacity = '0';
        imageObserver.observe(image);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupPageTransition();
    setupImageFadeIn();
});

// Event listeners
document.addEventListener('scroll', updateActiveStates);
window.addEventListener('load', updateActiveStates);

document.getElementById('title').addEventListener('input', function() {
    const title = this.value.trim();
    const previewCover = document.getElementById('preview-cover');
  
    if (title) {
        const coverImage = `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-M.jpg`;
  
        // Try loading the cover image dynamically
        const img = new Image();
        img.src = coverImage;
        img.onload = function() {
            previewCover.innerHTML = `<img src="${coverImage}" class="book-cover-image" alt="Book Cover">`;
        };
        img.onerror = function() {
            previewCover.innerHTML = `<div class='book-cover'><div class='book-spine'></div><div class='book-title-on-cover'>${title}</div></div>`;
        };
    } else {
        previewCover.innerHTML = `<div class='book-cover'><div class='book-spine'></div><div class='book-title-on-cover'>Book Title</div></div>`;
    }
  });
  
  document.getElementById('author').addEventListener('input', function() {
    document.getElementById('title').dispatchEvent(new Event('input')); 
  });
  
  function addTag(tag) {
    let tagsInput = document.getElementById('tags');
    let currentTags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t !== '');
    if (!currentTags.includes(tag)) {
        tagsInput.value = currentTags.length > 0 ? currentTags.join(', ') + ', ' + tag : tag;
    }
  }

  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('title').addEventListener('input', function() {
        const title = this.value.trim();
        const previewCover = document.getElementById('preview-cover');

        if (title) {
            const coverImage = `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-M.jpg`;

            // Create a new image element to check if the cover exists
            const img = new Image();
            img.src = coverImage;
            img.onload = function() {
                previewCover.innerHTML = `<img src="${coverImage}" class="book-cover-image" alt="Book Cover">`;
            };
            img.onerror = function() {
                previewCover.innerHTML = `
                    <div class='book-cover'>
                        <div class='book-spine'></div>
                        <div class='book-title-on-cover'>${title}</div>
                    </div>`;
            };
        } else {
            previewCover.innerHTML = `
                <div class='book-cover'>
                    <div class='book-spine'></div>
                    <div class='book-title-on-cover'>Book Title</div>
                </div>`;
        }
    });

    document.getElementById('author').addEventListener('input', function() {
        document.getElementById('title').dispatchEvent(new Event('input')); 
    });
});

  