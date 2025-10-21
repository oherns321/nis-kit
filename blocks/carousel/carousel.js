import { fetchPlaceholders } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  // Update active class for visual styling
  slides.forEach((aSlide, idx) => {
    if (idx === slideIndex) {
      aSlide.classList.add('active');
      aSlide.setAttribute('aria-hidden', 'false');
    } else {
      aSlide.classList.remove('active');
      aSlide.setAttribute('aria-hidden', 'true');
    }

    // Update tabindex for accessibility
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  if (!slides.length) return;

  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  if (!activeSlide) return;

  // Update active slide
  updateActiveSlide(activeSlide);

  // Scroll to center the active slide in view
  const slidesContainer = block.querySelector('.carousel-slides');
  if (!slidesContainer) return;

  const containerWidth = slidesContainer.clientWidth;
  const slideWidth = activeSlide.offsetWidth;
  const scrollLeft = activeSlide.offsetLeft - (containerWidth / 2) + (slideWidth / 2);

  slidesContainer.scrollTo({
    top: 0,
    left: Math.max(0, scrollLeft),
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  // Navigation button events
  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    });
  }

  // Click events on slides to make them active
  block.querySelectorAll('.carousel-slide').forEach((slide, index) => {
    slide.addEventListener('click', () => {
      showSlide(block, index);
    });
  });

  // Intersection observer to update active slide based on scroll position
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        updateActiveSlide(entry.target);
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: '0px -25% 0px -25%', // Only trigger when slide is more centered
  });

  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  // Set first slide as active by default
  if (slideIndex === 0) {
    slide.classList.add('active');
  }

  const rows = row.querySelectorAll(':scope > div');

  rows.forEach((column, colIdx) => {
    if (colIdx === 0) {
      column.classList.add('carousel-slide-image');
    }

    if (colIdx === 1) {
      column.classList.add('carousel-slide-content');

      // Handle background color styles (keeping existing functionality)
      if (rows[2] && rows[2].getElementsByTagName('p')[0]) {
        column.classList.add(rows[2].getElementsByTagName('p')[0].innerHTML);
      }

      // Check if a fourth column exists with URL information
      if (rows[3] && rows[3].getElementsByTagName('p')[0]) {
        const urlContent = rows[3].getElementsByTagName('p')[0].innerHTML.trim();

        let url = urlContent;
        // If the content contains an <a> tag, extract the href attribute
        if (urlContent.includes('<a href="')) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = urlContent;
          const anchorElement = tempDiv.querySelector('a');
          if (anchorElement && anchorElement.href) {
            url = anchorElement.href;
          }
        }

        if (url) {
          // Create a link element
          const link = document.createElement('a');
          link.href = url;

          // Move the content inside the link
          while (column.firstChild) {
            link.appendChild(column.firstChild);
          }

          // Add the link to the column
          column.appendChild(link);
        }
      }
    }

    // only add first 2 columns to slide
    if (colIdx < 2) {
      slide.append(column);
    }
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  try {
    carouselId += 1;
    block.setAttribute('id', `carousel-${carouselId}`);
    const rows = block.querySelectorAll(':scope > div');

    // Handle empty carousel blocks
    if (rows.length === 0) {
      return;
    }

    const isSingleSlide = rows.length < 2;
    const placeholders = await fetchPlaceholders();

    block.setAttribute('role', 'region');
    block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

    const container = document.createElement('div');
    container.classList.add('carousel-slides-container');

    const slidesWrapper = document.createElement('ul');
    slidesWrapper.classList.add('carousel-slides');

    // Always add navigation buttons for the horizontal gallery design
    if (!isSingleSlide) {
      const slideNavButtons = document.createElement('div');
      slideNavButtons.classList.add('carousel-navigation-buttons');
      slideNavButtons.innerHTML = `
        <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
        <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
      `;

      container.append(slideNavButtons);
    }

    rows.forEach((row, idx) => {
      const slide = createSlide(row, idx, carouselId);
      moveInstrumentation(row, slide);
      slidesWrapper.append(slide);
      row.remove();
    });

    container.append(slidesWrapper);
    block.prepend(container);

    // Set initial active slide
    block.dataset.activeSlide = '0';

    if (!isSingleSlide) {
      bindEvents(block);
    }
  } catch (error) {
    // Silent error handling to prevent breaking the page
  }
}
