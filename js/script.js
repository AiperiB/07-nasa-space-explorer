// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const button = document.querySelector('button');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeButton = document.querySelector('.close-button');
const spaceFact = document.getElementById('spaceFact');
const apiKey = 'DEMO_KEY';
const facts = [
  'The Moon is slowly drifting away from Earth by about 3.8 centimeters each year.',
  'Jupiter’s Great Red Spot is a storm so large that Earth could fit inside it.',
  'A day on Venus is longer than a year on Venus.',
  'The Milky Way galaxy contains hundreds of billions of stars.',
  'Mars has the tallest volcano in the solar system: Olympus Mons.',
  'Neptune was discovered because Uranus was wobbling slightly in its orbit.',
  'The Sun is so massive that about 1.3 million Earths could fit inside it.'
];

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function openModal(photo) {
  modalImage.src = photo.url;
  modalImage.alt = photo.title;
  modalTitle.textContent = photo.title;
  modalDate.textContent = photo.date;
  modalExplanation.textContent = photo.explanation;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function showRandomFact() {
  const randomIndex = Math.floor(Math.random() * facts.length);
  spaceFact.textContent = facts[randomIndex];
}

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
showRandomFact();

closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// Listen for the button click and fetch APOD images for the selected date range.
button.addEventListener('click', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    return;
    console.log('Please select both start and end dates.');
  }

  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">�</div>
      <p>Loading space photos...</p>
    </div>
  `;

  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch APOD data');
    }

    const photos = await response.json();
    const imagePhotos = photos.filter((photo) => photo.media_type === 'image');

    if (imagePhotos.length === 0) {
      gallery.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">🔭</div>
          <p>No images were found for this date range.</p>
        </div>
      `;
      return;
    }

    gallery.innerHTML = imagePhotos
      .map(
        (photo) => {
          const mediaElement = photo.media_type === 'video'
            ? `<iframe src="${escapeHtml(photo.url)}" title="${escapeHtml(photo.title)}" frameborder="0" allowfullscreen></iframe>`
            : `<img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.title)}" />`;

          return `
            <article class="gallery-item" data-title="${escapeHtml(photo.title)}" 
                     data-date="${escapeHtml(photo.date)}" data-url="${escapeHtml(photo.url)}" 
                     data-explanation="${escapeHtml(photo.explanation)}" data-media-type="${escapeHtml(photo.media_type || 'image')}">
              ${mediaElement}
              <h2>${escapeHtml(photo.title)}</h2>
              <p class="date">${escapeHtml(photo.date)}</p>
              <p>${escapeHtml(photo.explanation)}</p>
            </article>
          `;
        }
      )
      .join('');

    gallery.querySelectorAll('.gallery-item').forEach((item) => {
      item.addEventListener('click', () => {
        openModal({
          title: item.dataset.title,
          date: item.dataset.date,
          url: item.dataset.url,
          explanation: item.dataset.explanation,
        });
      });
    });
  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Unable to load space images right now. Please try again later.</p>
      </div>
    `;
  }
});





