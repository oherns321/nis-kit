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
 * Create a feature card element from card data matching Columbia Gas structure
 */
function createFeatureCardElement(cardData, originalRow = null) {
  // Main card container (sf_colsIn col-md-3 equivalent)
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

  // Create container-fluid equivalent
  const containerFluid = document.createElement('div');
  containerFluid.className = 'feature-card-inner';

  // Create row equivalent
  const row = document.createElement('div');
  row.className = 'feature-card-row';

  // Create col-sm-12 equivalent
  const col = document.createElement('div');
  col.className = 'feature-card-col';

  // Create l-content-block-grid m-t-40 equivalent
  const contentBlockGrid = document.createElement('div');
  contentBlockGrid.className = 'feature-card-content-wrapper l-content-block-grid m-t-40';

  // Create c-content-block equivalent
  const contentBlock = document.createElement('div');
  contentBlock.className = 'feature-card-content-block c-content-block';

  // Create article
  const article = document.createElement('article');

  // Create image container (c-content-block__image)
  if (safeCardData.image) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'feature-card-image c-content-block__image';

    // Create optimized picture with img-responsive class
    const optimizedPic = createOptimizedPicture(
      safeCardData.image,
      safeCardData.imageAlt || safeCardData.heading || '',
      false,
      [{ width: '750' }],
    );

    const img = optimizedPic.querySelector('img');
    if (img) {
      img.classList.add('img-responsive');
      if (originalRow) {
        moveInstrumentation(originalRow, img);
      }
    }

    imageContainer.appendChild(optimizedPic);
    article.appendChild(imageContainer);
  }

  // Create heading (titling-medium m-t-10 m-b-0)
  const headingElement = document.createElement('h2');
  headingElement.className = 'feature-card-heading titling-medium m-t-10 m-b-0';
  if (safeCardData.heading) {
    headingElement.innerHTML = safeCardData.heading;
  } else {
    headingElement.innerHTML = '';
    headingElement.setAttribute('data-placeholder', 'Add feature heading...');
  }
  article.appendChild(headingElement);

  // Create description (c-content-block__copy)
  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'feature-card-description c-content-block__copy';
  if (safeCardData.description) {
    descriptionElement.innerHTML = safeCardData.description;
  } else {
    descriptionElement.innerHTML = '';
    descriptionElement.setAttribute('data-placeholder', 'Add feature description...');
  }
  article.appendChild(descriptionElement);

  // Create CTA paragraph
  const ctaParagraph = document.createElement('p');
  if (safeCardData.cta && safeCardData.ctaText) {
    const ctaButton = document.createElement('a');
    ctaButton.className = 'btn btn-primary btn--small m-t-5 btn--ghosted feature-card-cta';
    ctaButton.href = safeCardData.cta;
    ctaButton.textContent = safeCardData.ctaText;
    ctaButton.setAttribute('target', '_self');
    ctaParagraph.appendChild(ctaButton);
  } else {
    // Empty placeholder for CTA
    const placeholderCta = document.createElement('a');
    placeholderCta.className = 'btn btn-primary btn--small m-t-5 btn--ghosted feature-card-cta empty-cta';
    placeholderCta.textContent = 'Add CTA';
    placeholderCta.href = '#';
    placeholderCta.setAttribute('target', '_self');
    placeholderCta.setAttribute('data-placeholder', 'true');
    ctaParagraph.appendChild(placeholderCta);
  }
  article.appendChild(ctaParagraph);

  // Assemble the structure
  contentBlock.appendChild(article);
  contentBlockGrid.appendChild(contentBlock);
  col.appendChild(contentBlockGrid);
  row.appendChild(col);
  containerFluid.appendChild(row);
  cardContainer.appendChild(containerFluid);

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
