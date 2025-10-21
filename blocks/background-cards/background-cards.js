import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Helper function to identify configuration values
function isConfigurationValue(text) {
  const configValues = ['dark', 'light', 'compact', 'centered', 'true', 'false'];
  return configValues.includes(text.toLowerCase());
}

// Extract image card data from XWalk item structure
function extractImageCardData(element, row) {
  const cells = [...row.children];
  const cardData = {
    image: null,
    imageAlt: '',
    heading: '',
    description: '',
  };

  // For XWalk items, fields are typically in separate cells
  // Order: cardImage, cardImageAlt, cardHeading, cardDescription
  let textCellIndex = 0; // Track text cells separately from image cells

  cells.forEach((cell) => {
    const content = cell.textContent.trim();
    const innerHTML = cell.innerHTML.trim();
    const img = cell.querySelector('img');

    // Skip empty cells
    if (!content && !img) return;

    if (img && img.src) {
      // This cell contains the card image
      cardData.image = img;
      cardData.imageAlt = img.alt || '';
    } else if (content) {
      // Check for Universal Editor property hints in data attributes
      const hasHeadingProp = cell.hasAttribute('data-aue-prop')
                            && cell.getAttribute('data-aue-prop').includes('Heading');
      const hasDescProp = cell.hasAttribute('data-aue-prop')
                         && cell.getAttribute('data-aue-prop').includes('Description');
      const hasImageAltProp = cell.hasAttribute('data-aue-prop')
                             && cell.getAttribute('data-aue-prop').includes('ImageAlt');

      if (hasImageAltProp && !cardData.imageAlt) {
        // Alt text for image
        cardData.imageAlt = content;
      } else if (hasHeadingProp) {
        // Explicit heading property
        cardData.heading = innerHTML;
      } else if (hasDescProp) {
        // Explicit description property
        cardData.description = innerHTML;
      } else {
        // Fallback based on order: first text cell is heading, second is description
        if (textCellIndex === 0 && !cardData.heading) {
          // First text cell should be heading
          cardData.heading = innerHTML;
        } else if (textCellIndex === 1 && !cardData.description) {
          // Second text cell should be description
          cardData.description = innerHTML;
        } else if (!cardData.heading) {
          // If we still don't have a heading, use this content
          cardData.heading = innerHTML;
        } else if (!cardData.description) {
          // If we have heading but no description, use this content
          cardData.description = innerHTML;
        }
        textCellIndex += 1;
      }
    }
  }); return cardData;
}

// Create image card element
function createImageCardElement(cardData, index, originalRow = null) {
  const cardContainer = document.createElement('div');
  cardContainer.className = `container-${index + 1}`;

  // Move Universal Editor instrumentation from original row if available
  if (originalRow) {
    moveInstrumentation(originalRow, cardContainer);
  }

  // Handle case where cardData might be null or empty
  const safeCardData = cardData || {
    image: null,
    imageAlt: '',
    heading: '',
    description: '',
  };

  const imageCard = document.createElement('div');
  imageCard.className = 'image-card';

  // Create image container
  if (safeCardData.image && safeCardData.image.src) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    // Create optimized picture element
    const optimizedPic = createOptimizedPicture(
      safeCardData.image.src,
      safeCardData.imageAlt || safeCardData.heading || 'Card image',
      false,
      [{ width: '600' }],
    );

    // Move instrumentation from original image to optimized image
    moveInstrumentation(safeCardData.image, optimizedPic.querySelector('img'));
    imageContainer.appendChild(optimizedPic);
    imageCard.appendChild(imageContainer);
  } else {
    // Placeholder for empty image (for Universal Editor)
    const imagePlaceholder = document.createElement('div');
    imagePlaceholder.className = 'image-placeholder';
    imagePlaceholder.textContent = 'Add image...';
    imagePlaceholder.setAttribute('data-placeholder', 'true');
    imageCard.appendChild(imagePlaceholder);
  }

  // Create text content
  const textContent = document.createElement('div');
  textContent.className = 'card-text-content';

  // Heading - create placeholder if empty for Universal Editor
  const headingElement = document.createElement('h6');
  if (safeCardData.heading) {
    headingElement.innerHTML = safeCardData.heading;
  } else {
    headingElement.innerHTML = '';
    headingElement.setAttribute('data-placeholder', 'Add heading...');
  }
  textContent.appendChild(headingElement);

  // Description - create placeholder if empty for Universal Editor
  const descElement = document.createElement('p');
  if (safeCardData.description) {
    descElement.innerHTML = safeCardData.description;
  } else {
    descElement.innerHTML = '';
    descElement.setAttribute('data-placeholder', 'Add description...');
  }
  textContent.appendChild(descElement);

  imageCard.appendChild(textContent);
  cardContainer.appendChild(imageCard);

  return cardContainer;
}

export default async function decorate(block) {
  const blockChildren = [...block.children];

  // Check for background image in first row (teaser-hero pattern)
  if (blockChildren.length > 0) {
    const firstRow = blockChildren[0];
    const firstCell = firstRow.children[0];

    if (firstCell) {
      const img = firstCell.querySelector('img');
      if (img && img.src && img.src !== '') {
        // Set background image on the block
        block.style.backgroundImage = `url('${img.src}')`;
        // Remove the original image element since we're using it as background
        firstRow.remove();
      }
    }
  }

  // Get remaining rows after background image removal
  const rows = [...block.children];

  // Create the main content container
  const content = document.createElement('div');
  content.className = 'background-cards-content';

  // Create container for the image cards
  const containerWrap = document.createElement('div');
  containerWrap.className = 'container-wrap';

  const configurationValues = [];

  // Process rows following cards-enhanced pattern
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

    // Check if this is specifically a background-card item (Universal Editor)
    const isBackgroundCardItem = cell.hasAttribute('data-aue-filter')
                                && cell.getAttribute('data-aue-filter') === 'background-card';

    const hasCardUEMarkers = cell.querySelector('[data-aue-filter="background-card"]')
                           || isBackgroundCardItem;

    // Check for Universal Editor component markers
    const hasUEMarkers = cell.querySelector('[data-aue-type="component"]')
                        || cell.hasAttribute('data-aue-type');

    // Check for content that indicates this is a card item
    const hasContent = textContent.length > 0;
    const hasImage = cells.some((cellEl) => cellEl.querySelector('img'));
    const hasMultipleCells = cells.length > 1;

    // Process as card if it has UE markers OR content that looks like a card
    if (hasCardUEMarkers || hasUEMarkers || hasImage || hasMultipleCells || hasContent) {
      // This is an image card - process it
      const cardData = extractImageCardData(cell, row);
      const cardContainer = createImageCardElement(cardData, index, row);
      containerWrap.appendChild(cardContainer);
    }
  });

  // If no cards were processed, create an empty placeholder card (for Universal Editor)
  if (containerWrap.children.length === 0) {
    const emptyCardData = {
      image: null,
      imageAlt: '',
      heading: '',
      description: '',
    };
    const emptyCardContainer = createImageCardElement(emptyCardData, 0);
    containerWrap.appendChild(emptyCardContainer);
  }

  // Apply configuration values
  configurationValues.forEach(({ value, row }) => {
    if (['dark', 'light', 'compact', 'centered'].includes(value)) {
      block.classList.add(value);
    }
    row.remove();
  });

  // Assemble the final structure
  content.appendChild(containerWrap);

  // Clear original content and add processed content
  block.innerHTML = '';
  block.appendChild(content);
}
