import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Helper function to identify configuration values
function isConfigurationValue(text) {
  const configValues = ['dark', 'light', 'compact', 'centered', 'true', 'false'];
  return configValues.includes(text.toLowerCase());
}

// Extract CTA card data following the Universal Editor model structure
function extractCtaCardData(element, row) {
  const cardData = {
    image: null,
    imageAlt: '',
    cta: '',
    ctaText: '',
    'label-variant': '',
    'cta-variant': '',
  };

  const cells = [...row.children];

  // Process cells to match JSON model field sequence
  cells.forEach((cell) => {
    const content = cell.innerHTML.trim();
    const textContent = cell.textContent.trim();
    const img = cell.querySelector('img');
    const link = cell.querySelector('a');

    // Skip empty cells
    if (!content && !img) return;

    // Check for Universal Editor property hints in data attributes
    const aueProps = cell.getAttribute('data-aue-prop') || '';

    if (img && img.src) {
      // This cell contains the card image
      cardData.image = img;
      cardData.imageAlt = img.alt || '';
    } else if (aueProps.includes('imageAlt')) {
      cardData.imageAlt = textContent;
    } else if (aueProps.includes('cta') && !aueProps.includes('ctaText')) {
      cardData.cta = textContent;
    } else if (aueProps.includes('ctaText')) {
      cardData.ctaText = textContent;
    } else if (aueProps.includes('label-variant')) {
      cardData['label-variant'] = textContent;
    } else if (aueProps.includes('cta-variant')) {
      cardData['cta-variant'] = textContent;
    } else if (link) {
      // Extract link information
      if (!cardData.cta) cardData.cta = link.href;
      if (!cardData.ctaText) cardData.ctaText = link.textContent.trim();
    } else if (textContent) {
      // Fallback: assign to first available field
      if (!cardData.ctaText) {
        cardData.ctaText = textContent;
      } else if (!cardData.cta && textContent.includes('http')) {
        cardData.cta = textContent;
      }
    }
  });

  return cardData;
}

// Create CTA card element with Universal Editor support
function createCtaCardElement(cardData, index, originalRow = null) {
  const cardContainer = document.createElement('div');
  cardContainer.className = 'cta-card';

  // Apply cta-variant class if specified
  if (cardData['cta-variant']) {
    cardContainer.classList.add(cardData['cta-variant']);
  }

  // Move Universal Editor instrumentation from original row
  if (originalRow) {
    moveInstrumentation(originalRow, cardContainer);
  }

  // Handle case where cardData might be null or empty
  const safeCardData = cardData || {
    image: null,
    imageAlt: '',
    cta: '',
    ctaText: '',
    'label-variant': '',
    'cta-variant': '',
  };

  // Create card image if available
  if (safeCardData.image && safeCardData.image.src) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'cta-card-image';

    const optimizedPic = createOptimizedPicture(
      safeCardData.image.src,
      safeCardData.imageAlt || safeCardData.ctaText || 'Call to action image',
      false, // lazy loading for CTA cards
      [{ width: '400' }], // CTA card optimized size
    );

    // Move instrumentation from original image
    moveInstrumentation(safeCardData.image, optimizedPic.querySelector('img'));
    imageContainer.appendChild(optimizedPic);
    cardContainer.appendChild(imageContainer);
  } else {
    // Placeholder for empty image (for Universal Editor)
    const imagePlaceholder = document.createElement('div');
    imagePlaceholder.className = 'cta-card-image image-placeholder';
    imagePlaceholder.textContent = 'Add image...';
    imagePlaceholder.setAttribute('data-placeholder', 'true');
    cardContainer.appendChild(imagePlaceholder);
  }

  // Create card content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'cta-card-content';

  // Add call-to-action button
  const ctaButton = document.createElement('a');
  ctaButton.className = 'cta-card-button btn btn-primary';

  // Apply label-variant class if specified
  if (safeCardData['label-variant'] === 'blue-label') {
    ctaButton.classList.add('blue-label');
  }

  if (safeCardData.cta) {
    ctaButton.href = safeCardData.cta;
    ctaButton.textContent = safeCardData.ctaText || 'Learn More';
    ctaButton.setAttribute('aria-label', safeCardData.ctaText || 'Learn More');
  } else {
    ctaButton.href = '#';
    ctaButton.textContent = 'Add CTA Link';
    ctaButton.setAttribute('data-placeholder', 'true');
    ctaButton.setAttribute('aria-label', 'Add CTA Link');
  }
  contentContainer.appendChild(ctaButton);

  cardContainer.appendChild(contentContainer);
  return cardContainer;
}

export default function decorate(block) {
  const rows = [...block.children];
  const ctaContainer = document.createElement('div');
  ctaContainer.className = 'cta-cards-grid';

  const configurationValues = [];
  const cardItems = [];

  // Process each row
  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const cell = cells[0];
    const textContent = cell.textContent.trim();

    // Check for configuration values first
    if (isConfigurationValue(textContent)) {
      configurationValues.push({ value: textContent.toLowerCase(), row });
      return;
    }

    // Process ALL non-configuration rows as CTA card items
    // This includes empty rows created by Universal Editor
    cardItems.push({ element: row, row, index });
  });

  // Process card items
  cardItems.forEach((item, index) => {
    const cardData = extractCtaCardData(item.element, item.row);
    const cardElement = createCtaCardElement(cardData, index, item.row);
    ctaContainer.appendChild(cardElement);
  });

  // If no cards were processed, create an empty placeholder card for Universal Editor
  if (ctaContainer.children.length === 0) {
    const emptyCardData = {
      image: null,
      imageAlt: '',
      cta: '',
      ctaText: '',
      'label-variant': '',
      'cta-variant': '',
    };
    const emptyCardElement = createCtaCardElement(emptyCardData, 0);
    ctaContainer.appendChild(emptyCardElement);
  }

  // Apply configuration values as CSS classes
  configurationValues.forEach(({ value, row }) => {
    if (['dark', 'light', 'compact', 'centered'].includes(value)) {
      block.classList.add(value);
    }
    row.remove();
  });

  // Create wrapper for positioning and styling
  const wrapper = document.createElement('div');
  wrapper.className = 'cta-cards-wrap';
  wrapper.appendChild(ctaContainer);

  // Clear block content and add processed content
  block.innerHTML = '';
  block.appendChild(wrapper);
}
