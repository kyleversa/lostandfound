// lost_script.js

// Book Inventory Feature (for /bookinventory/list)
function fetchBooks() {
    fetch("/bookinventory/list")
        .then(response => response.json())
        .then(books => displayBooks(books))
        .catch(error => console.error("Error fetching books:", error));
}

function displayBooks(books) {
    const bookContainer = document.getElementById("book-list");
    if (!bookContainer) return;

    bookContainer.innerHTML = "";

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
            </div>`;
        bookContainer.appendChild(bookCard);
    });
}

function deleteBook(bookId) {
    fetch(`/bookinventory/delete/${bookId}`, { method: "DELETE" })
        .then(response => response.json())
        .then(result => {
            console.log("Book deleted:", result);
            fetchBooks();
        })
        .catch(error => console.error("Error deleting book:", error));
}

// Hero Carousel
const carouselContent = [
    { image: '/images/tokyo.webp', descriptionFile: 'descriptions/tokyo_desc.txt' },
    { image: '/images/sydney.webp', descriptionFile: 'descriptions/sydney_desc.txt' },
    { image: '/images/bangkok.webp', descriptionFile: 'descriptions/bangkok_desc.txt' },
    { image: '/images/santorini.webp', descriptionFile: 'descriptions/santorini_desc.txt' },
    { image: '/images/istanbul.webp', descriptionFile: 'descriptions/istanbul_desc.txt' }
];

let currentIndex = 0;

function loadDescription(descriptionFile) {
    $.ajax({
        url: descriptionFile,
        success: function(description) {
            $('#ajax-description').text(description);
        },
        error: function() {
            $('#ajax-description').text('Description unavailable');
        }
    });
}

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

function updateDestinationText(destinationId, text) {
    document.getElementById(`${destinationId}-text`).innerText = text;
}

function toggleBucketItem(destinationId) {
    const item = document.getElementById(`${destinationId}-bucket`);
    item.style.display = "block";
}

function navigateToFoundPage() {
    window.location.href = "found.html";
}

function smoothScroll(target) {
    const element = document.querySelector(target);
    if (!element) return;
    const navHeight = document.querySelector('.nav-bar').offsetHeight;
    const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    element.classList.add('scroll-highlight');
    setTimeout(() => { element.classList.remove('scroll-highlight'); }, 1000);
}

function updateActiveStates() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const dots = document.querySelectorAll('.progress-dot');
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 60;
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === currentSection) {
            link.classList.add('active');
        }
    });
    dots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.dataset.section === currentSection) {
            dot.classList.add('active');
        }
    });
}

function setupPageTransition() {
    const transitionOverlay = document.createElement('div');
    transitionOverlay.classList.add('page-transition-overlay');
    document.body.appendChild(transitionOverlay);
    const originalNavigateToFoundPage = navigateToFoundPage;
    navigateToFoundPage = function() {
        document.body.classList.add('fade-out');
        transitionOverlay.style.opacity = '1';
        setTimeout(() => { window.location.href = "found.html"; }, 300);
    };
    document.body.style.opacity = '0';
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });
}

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
    }, { threshold: 0.1 });
    images.forEach(image => {
        image.style.opacity = '0';
        imageObserver.observe(image);
    });
}

function updateTokyoText() {
  updateDestinationText('tokyo', 'Tokyo is a dream destination with its blend of ancient temples and futuristic technology!');
}

function updateSydneyText() {
  updateDestinationText('sydney', 'Sydney\'s iconic Opera House and Bondi Beach make it a must-visit location!');
}

function updateBangkokText() {
  updateDestinationText('bangkok', 'Bangkok’s temples shine with beauty and spirituality, from sunrise to sunset.');
}

function updateSantoriniText() {
  updateDestinationText('santorini', 'Santorini’s charm lies in its endless blue, stunning caldera views, and the peaceful rhythm of island life.');
}

function updateIstanbulText() {
  updateDestinationText('istanbul', 'Istanbul is a city shaped by centuries of empires, where grand mosques and ancient markets whisper stories of its legendary past.');
}


document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM fully loaded");
    if (window.location.pathname === "/bookinventory/list") {
        fetchBooks();
    }
    setupPageTransition();
    setupImageFadeIn();
    updateCarousel();
    setInterval(updateCarousel, 4000);

    const titleInput = document.getElementById('title');
    const previewCover = document.getElementById('preview-cover');
    if (titleInput && previewCover) {
        titleInput.addEventListener('input', function () {
            const title = this.value.trim();
            const coverImage = `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-M.jpg`;
            const img = new Image();
            img.src = coverImage;
            img.onload = () => previewCover.innerHTML = `<img src="${coverImage}" class="book-cover-image" alt="Book Cover">`;
            img.onerror = () => previewCover.innerHTML = `<div class='book-cover'><div class='book-spine'></div><div class='book-title-on-cover'>${title}</div></div>`;
        });
    }
    const authorInput = document.getElementById('author');
    if (authorInput && titleInput) {
        authorInput.addEventListener('input', () => {
            titleInput.dispatchEvent(new Event('input'));
        });
    }

   // Lost Memory Cards Loader
        fetch('/desired_destinations.json')
        .then(response => response.json())
        .then(data => {
            const destinationGrid = document.getElementById("destinationGrid");
            if (!destinationGrid) return;
            destinationGrid.innerHTML = '';
            data.destinations.forEach(dest => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";
            card.innerHTML = `
                <div class="card h-100">
                <div class="card-img-container">
                    <img src="${dest.imageUrl}" class="card-img-top" alt="${dest.city}">
                </div>
                <div class="card-body">
                    <h5 class="card-title">${dest.city}, ${dest.country}</h5>
                    <div class="planning">
                    <p><strong>Ideal Best Time to Visit:</strong> ${dest.planning.bestTime}</p>
                    <p><strong>What Draws Me To It:</strong> ${dest.planning.inspiration}</p>
                    </div>
                    <div class="ratings mt-3">
                    <p>📍🗺️ <strong>Popular Travel Spot:</strong> <span class="stars">${'⭐'.repeat(dest.ratings.popularity)}</span></p>
                    <p>📸🎨 <strong>Postcard-Worthy Views:</strong> <span class="stars">${'⭐'.repeat(dest.ratings.views)}</span></p>
                    <p>💰💵 <strong>Budget Friendly:</strong> <span class="stars">${'⭐'.repeat(dest.ratings.budget)}</span></p>
                    </div>
                </div>
                </div>
            `;
            destinationGrid.appendChild(card);
            });
        })

        .catch(err => console.error("❌ Error loading destinations:", err));
});
