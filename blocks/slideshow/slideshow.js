import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Helper function to create slideshow controls
function createSlideshowControls(slideshow, slides) {
  const controls = document.createElement('div');
  controls.className = 'slideshow-controls';

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'slideshow-control slideshow-prev';
  prevBtn.innerHTML = '&#8249;';
  prevBtn.setAttribute('aria-label', 'Previous slide');

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'slideshow-control slideshow-next';
  nextBtn.innerHTML = '&#8250;';
  nextBtn.setAttribute('aria-label', 'Next slide');

  // Dots indicators
  const dots = document.createElement('div');
  dots.className = 'slideshow-dots';

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'slideshow-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    if (index === 0) dot.classList.add('active');
    dots.appendChild(dot);
  });

  controls.appendChild(prevBtn);
  controls.appendChild(dots);
  controls.appendChild(nextBtn);

  return {
    controls, prevBtn, nextBtn, dots,
  };
}

// Helper function to initialize slideshow functionality
function initializeSlideshow(slideshow, slides, controls) {
  let currentSlide = 0;
  const { prevBtn, nextBtn, dots } = controls;
  const dotButtons = dots.querySelectorAll('.slideshow-dot');

  function showSlide(index) {
    // Hide all slides
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.setAttribute('aria-hidden', i !== index);
    });

    // Update dots
    dotButtons.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  // Event listeners
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  dotButtons.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  // Keyboard navigation
  slideshow.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  });

  // Auto-play (optional - can be enabled via configuration)
  if (slideshow.classList.contains('autoplay')) {
    setInterval(nextSlide, 5000); // 5 seconds
  }

  // Initialize first slide
  showSlide(0);
}

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
  };

  cells.forEach((cell) => {
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
    } else if (aueProps.includes('title')) {
      slideData.title = textContent;
    } else if (aueProps.includes('copy')) {
      slideData.copy = cell.innerHTML;
    } else if (aueProps.includes('ctaText')) {
      slideData.ctaText = textContent;
    } else if (aueProps.includes('cta')) {
      slideData.cta = textContent;
    } else if (link) {
      // Extract link information
      if (!slideData.cta) slideData.cta = link.href;
      if (!slideData.ctaText) slideData.ctaText = link.textContent.trim();
    } else if (textContent && !slideData.title) {
      // Fallback: first text content becomes title
      slideData.title = textContent;
    }
  });

  return slideData;
}

// Create individual slide element
function createSlideElement(slideData, index) {
  const slide = document.createElement('li');
  slide.className = 'slideshow-slide';
  slide.setAttribute('aria-hidden', index !== 0);

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
    content.appendChild(superText);
  }

  // Title
  if (slideData.title) {
    const title = document.createElement('h6');
    title.className = 'promotion__title';
    title.textContent = slideData.title;
    content.appendChild(title);
  }

  // Copy
  if (slideData.copy) {
    const copy = document.createElement('div');
    copy.className = 'promotion__copy';
    copy.innerHTML = slideData.copy;
    content.appendChild(copy);
  }

  // CTA Button
  if (slideData.cta && slideData.ctaText) {
    const ctaButton = document.createElement('a');
    ctaButton.className = 'btn btn--small btn--dark';
    ctaButton.href = slideData.cta;
    ctaButton.textContent = slideData.ctaText;
    ctaButton.setAttribute('tabindex', '-1'); // Navigation handled by slideshow controls
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
  const slides = [];

  // Process each row as a slide
  [...block.children].forEach((row, index) => {
    const slideData = extractSlideData(row);
    const slideElement = createSlideElement(slideData, index);

    // Move Universal Editor instrumentation
    moveInstrumentation(row, slideElement);

    slides.push(slideElement);
    ul.appendChild(slideElement);
  });

  slideshow.appendChild(ul);

  // Create and add controls
  if (slides.length > 1) {
    const controlsData = createSlideshowControls(slideshow, slides);
    slideshow.appendChild(controlsData.controls);

    // Initialize slideshow functionality
    setTimeout(() => {
      initializeSlideshow(slideshow, slides, controlsData);
    }, 100);
  }

  // Replace block content
  block.textContent = '';
  block.appendChild(slideshow);
}
