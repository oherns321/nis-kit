import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Extract slide data from table row
function extractSlideData(row) {
  const cells = [...row.children];
  const slideData = {
    image: null,
    imageAlt: '',
    super: '',
    title: '',
    copy: '',
    ctaText: '',
    cta: '',
    // Store original elements for instrumentation
    originalElements: {
      superCell: null,
      titleCell: null,
      copyCell: null,
      ctaTextCell: null,
      ctaCell: null,
    },
  };

  // Process cells based on Universal Editor attributes or column position
  cells.forEach((cell, index) => {
    const img = cell.querySelector('img');
    const link = cell.querySelector('a');
    const textContent = cell.textContent.trim();

    // Check for Universal Editor property hints
    const aueProps = cell.getAttribute('data-aue-prop') || '';

    if (img && img.src) {
      slideData.image = img;
      slideData.imageAlt = img.alt || '';
    } else if (aueProps.includes('super')) {
      slideData.super = textContent;
      slideData.originalElements.superCell = cell;
    } else if (aueProps.includes('title')) {
      slideData.title = textContent;
      slideData.originalElements.titleCell = cell;
    } else if (aueProps.includes('copy')) {
      slideData.copy = cell.innerHTML;
      slideData.originalElements.copyCell = cell;
    } else if (aueProps.includes('ctaText')) {
      slideData.ctaText = textContent;
      slideData.originalElements.ctaTextCell = cell;
    } else if (aueProps.includes('cta')) {
      slideData.cta = textContent;
      slideData.originalElements.ctaCell = cell;
    } else if (link) {
      // Extract link information
      if (!slideData.cta) slideData.cta = link.href;
      if (!slideData.ctaText) slideData.ctaText = link.textContent.trim();
    } else if (textContent) {
      // Fallback: assign based on column position
      // Expected order: Image | Super | Title | Copy | CTA Text | CTA URL
      if (index === 1 && !slideData.super) {
        slideData.super = textContent;
        slideData.originalElements.superCell = cell;
      } else if (index === 2 && !slideData.title) {
        slideData.title = textContent;
        slideData.originalElements.titleCell = cell;
      } else if (index === 3 && !slideData.copy) {
        slideData.copy = cell.innerHTML;
        slideData.originalElements.copyCell = cell;
      } else if (index === 4 && !slideData.ctaText) {
        slideData.ctaText = textContent;
        slideData.originalElements.ctaTextCell = cell;
      } else if (index === 5 && !slideData.cta) {
        slideData.cta = textContent;
        slideData.originalElements.ctaCell = cell;
      } else if (!slideData.title) {
        // Final fallback: first available text becomes title
        slideData.title = textContent;
        slideData.originalElements.titleCell = cell;
      }
    }
  });

  return slideData;
}

// Create individual slide element
function createSlideElement(slideData) {
  const slide = document.createElement('li');
  slide.className = 'slideshow-slide';

  const promotion = document.createElement('div');
  promotion.className = 'promotion';

  // Image container
  if (slideData.image && slideData.image.src) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'promotion__image';
    imageContainer.setAttribute('aria-hidden', 'true');

    const optimizedPic = createOptimizedPicture(
      slideData.image.src,
      slideData.imageAlt || slideData.title || 'Slideshow image',
      false,
      [{ width: '800' }],
    );

    moveInstrumentation(slideData.image, optimizedPic.querySelector('img'));
    imageContainer.appendChild(optimizedPic);
    promotion.appendChild(imageContainer);
  }

  // Content container
  const content = document.createElement('div');
  content.className = 'promotion__content';

  // Super text
  if (slideData.super) {
    const superText = document.createElement('span');
    superText.className = 'promotion__super';
    superText.textContent = slideData.super;

    // Move instrumentation from original cell
    if (slideData.originalElements.superCell) {
      moveInstrumentation(slideData.originalElements.superCell, superText);
    }

    content.appendChild(superText);
  }

  // Title
  if (slideData.title) {
    const title = document.createElement('h6');
    title.className = 'promotion__title';
    title.textContent = slideData.title;

    // Move instrumentation from original cell
    if (slideData.originalElements.titleCell) {
      moveInstrumentation(slideData.originalElements.titleCell, title);
    }

    content.appendChild(title);
  }

  // Copy
  if (slideData.copy) {
    const copy = document.createElement('div');
    copy.className = 'promotion__copy';
    copy.innerHTML = slideData.copy;

    // Move instrumentation from original cell
    if (slideData.originalElements.copyCell) {
      moveInstrumentation(slideData.originalElements.copyCell, copy);
    }

    content.appendChild(copy);
  }

  // CTA Button
  if (slideData.cta && slideData.ctaText) {
    const ctaButton = document.createElement('a');
    ctaButton.className = 'btn btn--primary';
    ctaButton.href = slideData.cta;
    ctaButton.textContent = slideData.ctaText;

    // Move instrumentation from original cells
    // Prefer ctaTextCell for the button text, fallback to ctaCell
    if (slideData.originalElements.ctaTextCell) {
      moveInstrumentation(slideData.originalElements.ctaTextCell, ctaButton);
    } else if (slideData.originalElements.ctaCell) {
      moveInstrumentation(slideData.originalElements.ctaCell, ctaButton);
    }

    content.appendChild(ctaButton);
  }

  promotion.appendChild(content);
  slide.appendChild(promotion);

  return slide;
}

export default function decorate(block) {
  // Create main slideshow structure
  const slideshow = document.createElement('section');
  slideshow.className = 'slideshow';
  slideshow.setAttribute('aria-labelledby', 'slideshow-label');

  // Hidden label for accessibility
  const label = document.createElement('h3');
  label.className = 'a11y-hide';
  label.id = 'slideshow-label';
  label.textContent = 'Promoted Content Inside of a Slideshow';
  slideshow.appendChild(label);

  // Create slides container
  const ul = document.createElement('ul');
  ul.className = 'slideshow-slides';

  const slides = [];

  // Process each row as a slide
  [...block.children].forEach((row, index) => {
    const slideData = extractSlideData(row);
    const slideElement = createSlideElement(slideData);

    // Add active class to first slide
    if (index === 0) {
      slideElement.classList.add('active');
    }

    // Move Universal Editor instrumentation
    moveInstrumentation(row, slideElement);

    slides.push(slideElement);
    ul.appendChild(slideElement);
  });

  slideshow.appendChild(ul);

  // Create navigation controls matching Columbia Gas design
  if (slides.length > 1) {
    const controls = document.createElement('div');
    controls.className = 'js-slideshow-buttons';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'slideshow-buttons__previous ui-none';
    prevButton.setAttribute('aria-label', 'previous');
    prevButton.innerHTML = '<span class="arrow arrow--left">‹</span>';

    // Counter
    const counter = document.createElement('div');
    counter.className = 'slideshow-counter';
    counter.setAttribute('aria-hidden', 'true');
    counter.innerHTML = `
      <span class="slideshow-counter__current">1</span>
      <span class="slideshow-counter__separator">/</span>
      <span class="slideshow-counter__total">${slides.length}</span>
    `;

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'slideshow-buttons__next ui-none';
    nextButton.setAttribute('aria-label', 'next');
    nextButton.innerHTML = '<span class="arrow arrow--right">›</span>';

    controls.appendChild(prevButton);
    controls.appendChild(counter);
    controls.appendChild(nextButton);
    slideshow.appendChild(controls);

    // Slideshow functionality
    let currentSlide = 0;
    let autoSlideInterval;

    const updateSlide = (newIndex) => {
      // Remove active from current slide
      slides[currentSlide].classList.remove('active');

      // Update current slide index
      currentSlide = newIndex;

      // Add active to new slide
      slides[currentSlide].classList.add('active');

      // Update counter
      counter.querySelector('.slideshow-counter__current').textContent = currentSlide + 1;
    };

    const nextSlide = () => {
      const newIndex = (currentSlide + 1) % slides.length;
      updateSlide(newIndex);
    };

    const prevSlide = () => {
      const newIndex = (currentSlide - 1 + slides.length) % slides.length;
      updateSlide(newIndex);
    };

    const stopAutoSlide = () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    };

    const startAutoSlide = () => {
      // Ensure any existing interval is cleared before starting a new one
      stopAutoSlide();
      autoSlideInterval = setInterval(nextSlide, 10000); // 10 seconds
    };

    // Event listeners
    nextButton.addEventListener('click', () => {
      stopAutoSlide();
      nextSlide();
      // Reset timer completely by starting a fresh auto-slide cycle
      startAutoSlide();
    });

    prevButton.addEventListener('click', () => {
      stopAutoSlide();
      prevSlide();
      // Reset timer completely by starting a fresh auto-slide cycle
      startAutoSlide();
    });

    // Pause auto-slide on hover
    slideshow.addEventListener('mouseenter', stopAutoSlide);
    slideshow.addEventListener('mouseleave', startAutoSlide);

    // Start auto-slide
    startAutoSlide();
  }

  // Replace block content
  block.textContent = '';
  block.appendChild(slideshow);
}
