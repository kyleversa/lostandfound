// found_script.js

const carouselContent = [
  {
    image: '/images/paris.webp',
    descriptionFile: 'descriptions/paris_desc.txt'
  },
  {
    image: '/images/new_york_city.webp',
    descriptionFile: 'descriptions/new_york_city_desc.txt'
  },
  {
    image: '/images/tuscany.webp',
    descriptionFile: 'descriptions/tuscany_desc.txt'
  },
  {
    image: '/images/london.webp',
    descriptionFile: 'descriptions/london_desc.txt'
  },
  {
    image: '/images/barcelona.webp',
    descriptionFile: 'descriptions/barcelona_desc.txt'
  }
];

let currentIndex = 0;

function loadDescription(descriptionFile) {
  $.ajax({
    url: descriptionFile,
    success: function (description) {
      $('#ajax-description').text(description);
    },
    error: function () {
      $('#ajax-description').text('Description unavailable');
    }
  });
}

function updateCarousel() {
  const current = carouselContent[currentIndex];

  $('#ajax-image').fadeOut(500, function () {
    $(this).attr('src', current.image).fadeIn(500);
  });

  $('#ajax-description').fadeOut(500, function () {
    loadDescription(current.descriptionFile);
    $(this).fadeIn(500);
  });

  currentIndex = (currentIndex + 1) % carouselContent.length;
}

function navigateToLostPage() {
  window.location.href = 'lost.html';
}

function smoothScroll(target) {
  const el = document.querySelector(target);
  if (!el) return;

  const navHeight = document.querySelector('.nav-bar')?.offsetHeight || 0;
  const offset = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

  window.scrollTo({ top: offset, behavior: 'smooth' });
  el.classList.add('scroll-highlight');
  setTimeout(() => el.classList.remove('scroll-highlight'), 1000);
}

document.addEventListener("DOMContentLoaded", function () {
  updateCarousel();
  setInterval(updateCarousel, 4000);

  fetch('/visited_destinations.json')
    .then(response => response.json())
    .then(data => {
      const grid = document.getElementById('destinationGrid');
      if (!grid) return;

      grid.innerHTML = '';

      data.destinations.forEach(dest => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-img-container">
                <img src="${dest.imageUrl}" class="card-img-top" alt="${dest.city}">
                </div>
                <div class="card-body">
                <h5 class="card-title">${dest.city}, ${dest.country}</h5>
                <p><strong>Most Unexpected Moment:</strong> ${dest.experiences.unexpected}</p>
                <p><strong>Vibe & Atmosphere 🎨:</strong> ${dest.experiences.vibe}</p>
                <div class="ratings">
                    <p>Local People & Hospitality 🤝: <span class="stars">${'⭐'.repeat(dest.ratings.hospitality)}</span></p>
                    <p>Walkability & Transportation 🚶‍♂️🚆: <span class="stars">${'⭐'.repeat(dest.ratings.walkability)}</span></p>
                    <p>Relaxation vs. Adventure 🏝🏄‍♂️: <span class="stars">${'⭐'.repeat(dest.ratings.adventure)}</span></p>
                </div>
                </div>
            </div>
            `;
        grid.appendChild(card);
      });
    })
    .catch(err => console.error('Error loading visited destinations:', err));
});

function updateDestinationText(id, text) {
  const el = document.getElementById(`${id}-text`);
  if (el) el.innerText = text;
}

function toggleBucketItem(id) {
  const item = document.getElementById(`${id}-bucket`);
  if (item) {
    item.style.display = 'block';
    item.classList.add('visible');
  }
}

