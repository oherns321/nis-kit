import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Helper function to identify configuration values
 */
function isConfigurationValue(text) {
  const configValues = ['dark', 'light', 'compact', 'centered', 'true', 'false', 'two-columns', 'four-columns'];
  return configValues.includes(text.toLowerCase());
}

/**
 * Helper function to identify if this is the first content row
 */
function isFirstContentRow(currentIndex, allRows) {
  for (let i = 0; i < allRows.length; i += 1) {
    const row = allRows[i];
    const cells = [...row.children];
    if (cells.length > 0) {
      const cellText = cells[0].textContent.trim();
      if (cellText && !isConfigurationValue(cellText)) {
        return i === currentIndex;
      }
    }
  }
  return false;
}

/**
 * Helper function to identify feature card item rows
 */
function isFeatureCardRow(cell) {
  // Check for Universal Editor component markers
  if (cell.querySelector('[data-aue-filter="feature-card"]')
      || (cell.hasAttribute('data-aue-filter') && cell.getAttribute('data-aue-filter') === 'feature-card')) {
    return true;
  }

  if (cell.querySelector('[data-aue-type="component"]')
      || cell.hasAttribute('data-aue-type')) {
    const parent = cell.parentElement;
    const isInContainer = parent && parent.classList.contains('feature-cards');
    const hasMultipleSiblings = parent && parent.children.length > 2;
    return isInContainer && hasMultipleSiblings;
  }

  // Feature card items might have multiple cells or specific structure
  const parent = cell.parentElement;
  const cellsInRow = parent ? parent.children.length : 1;

  return cellsInRow > 1
         || cell.querySelector('a')
         || cell.querySelector('img')
         || cell.querySelector('picture')
         || (cell.textContent.trim()
             && cell.previousElementSibling
             && cell.previousElementSibling.textContent.trim());
}

/**
 * Extract feature card data from a row
 */
function extractFeatureCardData(row) {
  const cells = [...row.children];
  const cardData = {
    image: null,
    imageAlt: '',
    heading: '',
    description: '',
    cta: null,
    ctaText: '',
    originalRow: row,
  };

  // Process cells to extract content
  cells.forEach((cell, cellIndex) => {
    const textContent = cell.textContent.trim();
    const link = cell.querySelector('a');
    const img = cell.querySelector('img');
    const picture = cell.querySelector('picture');

    // Check for image content
    if (img || picture) {
      if (img) {
        cardData.image = img.src;
        cardData.imageAlt = img.alt || '';
      } else if (picture && picture.querySelector('img')) {
        const pictureImg = picture.querySelector('img');
        cardData.image = pictureImg.src;
        cardData.imageAlt = pictureImg.alt || '';
      }
      return;
    }

    // Skip empty cells
    if (!textContent && !link) return;

    // First text cell is typically the heading
    if (cellIndex === 0 && textContent && !link) {
      cardData.heading = cell.innerHTML.trim();
    } else if (cellIndex === 1 && textContent && !link) {
      // Second cell is typically the description
      cardData.description = cell.innerHTML.trim();
    } else if (link) {
      // Links are CTAs
      const linkText = link.textContent.trim();
      const linkUrl = link.getAttribute('href') || '#';

      if (!cardData.cta) {
        cardData.cta = linkUrl;
        cardData.ctaText = linkText;
      }
    } else if (textContent && cardData.heading && !cardData.description) {
      // Fallback: treat remaining text content as description if heading exists
      cardData.description = cell.innerHTML.trim();
    } else if (textContent && !cardData.heading) {
      // Fallback: treat as heading if no heading exists yet
      cardData.heading = cell.innerHTML.trim();
    }
  });

  return cardData;
}

/**
 * Create a feature card element from card data
 */
function createFeatureCardElement(cardData, originalRow = null) {
  const cardContainer = document.createElement('li');
  cardContainer.className = 'feature-card';

  // Move Universal Editor instrumentation
  if (originalRow) {
    moveInstrumentation(originalRow, cardContainer);
  }

  // Ensure cardData is valid
  const safeCardData = cardData || {
    image: null,
    imageAlt: '',
    heading: '',
    description: '',
    cta: null,
    ctaText: '',
  };

  // Create image container
  if (safeCardData.image) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'feature-card-image';

    const img = document.createElement('img');
    img.src = safeCardData.image;
    img.alt = safeCardData.imageAlt || safeCardData.heading || '';

    // Create optimized picture
    const optimizedPic = createOptimizedPicture(
      safeCardData.image,
      safeCardData.imageAlt || safeCardData.heading || '',
      false,
      [{ width: '750' }],
    );

    if (originalRow) {
      moveInstrumentation(img, optimizedPic.querySelector('img'));
    }

    imageContainer.appendChild(optimizedPic);
    cardContainer.appendChild(imageContainer);
  } else {
    // Empty placeholder for image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'feature-card-image empty-image';
    imageContainer.setAttribute('data-placeholder', 'Add feature image...');
    cardContainer.appendChild(imageContainer);
  }

  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'feature-card-content';

  // Create heading
  const headingElement = document.createElement('h3');
  headingElement.className = 'feature-card-heading';
  if (safeCardData.heading) {
    headingElement.innerHTML = safeCardData.heading;
  } else {
    headingElement.innerHTML = '';
    headingElement.setAttribute('data-placeholder', 'Add feature heading...');
  }

  // Create description
  const descriptionElement = document.createElement('div');
  descriptionElement.className = 'feature-card-description';
  if (safeCardData.description) {
    descriptionElement.innerHTML = safeCardData.description;
  } else {
    descriptionElement.innerHTML = '';
    descriptionElement.setAttribute('data-placeholder', 'Add feature description...');
  }

  // Create CTA
  if (safeCardData.cta && safeCardData.ctaText) {
    const ctaButton = document.createElement('a');
    ctaButton.className = 'button button-primary feature-card-cta';
    ctaButton.href = safeCardData.cta;
    ctaButton.textContent = safeCardData.ctaText;
    contentContainer.appendChild(ctaButton);
  } else {
    // Empty placeholder for CTA
    const placeholderCta = document.createElement('a');
    placeholderCta.className = 'button button-primary feature-card-cta empty-cta';
    placeholderCta.textContent = 'Add CTA';
    placeholderCta.href = '#';
    placeholderCta.setAttribute('data-placeholder', 'true');
    contentContainer.appendChild(placeholderCta);
  }

  // Assemble content
  contentContainer.appendChild(headingElement);
  contentContainer.appendChild(descriptionElement);
  cardContainer.appendChild(contentContainer);

  return cardContainer;
}

/**
 * Decorates the feature-cards block
 * @param {Element} block The feature-cards block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  let containerHeading = null;
  const cardItems = [];
  const configurationValues = [];

  // Process rows to categorize content
  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const cell = cells[0];
    const textContent = cell.textContent.trim();

    // Check if this is a configuration value
    if (isConfigurationValue(textContent)) {
      configurationValues.push({ value: textContent.toLowerCase(), row });
      return;
    }

    // Check for Universal Editor item markers
    if (isFeatureCardRow(cell)) {
      cardItems.push(extractFeatureCardData(row, index));
      return;
    }

    // First content row is likely the container heading
    if (!containerHeading && isFirstContentRow(index, rows)) {
      containerHeading = {
        content: cell.innerHTML.trim(),
        row,
      };
      return;
    }

    // Fallback: treat as card item if it has meaningful content
    if (textContent || cell.querySelector('img') || cell.querySelector('picture')) {
      cardItems.push(extractFeatureCardData(row, index));
    }
  });

  // Create container heading if it exists
  if (containerHeading) {
    const headingElement = document.createElement('h2');
    headingElement.className = 'container-heading';
    headingElement.innerHTML = containerHeading.content;
    containerHeading.row.remove();
  }

  // Apply configuration values as CSS classes
  configurationValues.forEach(({ value, row }) => {
    if (['dark', 'light', 'compact', 'centered', 'two-columns', 'four-columns'].includes(value)) {
      block.classList.add(value);
    }
    row.remove();
  });

  // Create the cards list
  const ul = document.createElement('ul');
  ul.className = 'feature-cards-list';

  // Create feature cards
  cardItems.forEach((cardData) => {
    if (cardData) {
      const cardElement = createFeatureCardElement(cardData, cardData.originalRow);
      ul.appendChild(cardElement);
    }
  });

  // Clear original content and add new structure
  block.innerHTML = '';

  if (containerHeading) {
    const headingElement = document.createElement('h2');
    headingElement.className = 'container-heading';
    headingElement.innerHTML = containerHeading.content;
    block.appendChild(headingElement);
  }

  block.appendChild(ul);
}
