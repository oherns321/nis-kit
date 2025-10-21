import { moveInstrumentation } from '../../scripts/scripts.js';

// Helper function to identify configuration values
function isConfigurationValue(text) {
  const configValues = ['dark', 'light', 'compact', 'centered', 'true', 'false'];
  return configValues.includes(text.toLowerCase());
}

// Helper function to identify if this is the first content row (expect main heading)
function isFirstContentRow(currentIndex, allRows) {
  // Find the first row that has actual content (not config values)
  for (let i = 0; i < allRows.length; i += 1) {
    const row = allRows[i];
    const cells = [...row.children];
    if (cells.length > 0) {
      const cellText = cells[0].textContent.trim();
      if (cellText && !isConfigurationValue(cellText)) {
        return i === currentIndex; // This is the first content row
      }
    }
  }
  return false;
}

// Helper function to identify card item rows
function isCardItemRow(cell) {
  // Check for Universal Editor component markers that specifically indicate card items
  if (cell.querySelector('[data-aue-filter="card-enhanced"]')
      || (cell.hasAttribute('data-aue-filter') && cell.getAttribute('data-aue-filter') === 'card-enhanced')) {
    return true;
  }

  // Check for generic component markers (but be more cautious)
  if (cell.querySelector('[data-aue-type="component"]')
      || cell.hasAttribute('data-aue-type')) {
    // Additional check: make sure it's not just a main heading with UE attrs
    const parent = cell.parentElement;
    const isInContainer = parent && parent.classList.contains('cards-enhanced');
    const hasMultipleSiblings = parent && parent.children.length > 2; // More than heading + item
    return isInContainer && hasMultipleSiblings;
  }

  // Card items might have multiple cells or specific structure
  const parent = cell.parentElement;
  const cellsInRow = parent ? parent.children.length : 1;

  // Card items typically have multiple fields (heading, body, CTA)
  // Or contain specific patterns that indicate it's a card
  return cellsInRow > 1
         || cell.querySelector('a') // Has CTA link
         || (cell.textContent.trim()
          && cell.previousElementSibling
          && cell.previousElementSibling.textContent.trim()); // Part of a multi-field item
}

// Extract card data from XWalk item structure
function extractCardData(element, row) {
  const cells = [...row.children];
  const cardData = {
    heading: '',
    body: '',
    cta: null,
    ctaText: '',
  };

  // For XWalk items, fields are typically in separate cells
  // Order: cardHeading, cardBody, cardCta, cardCtaText
  cells.forEach((cell, index) => {
    const content = cell.textContent.trim();
    const innerHTML = cell.innerHTML.trim();
    const link = cell.querySelector('a');

    // Skip empty cells
    if (!content && !link) return;

    if (link) {
      // This cell contains a CTA link
      cardData.cta = link.cloneNode(true);
      cardData.ctaText = link.textContent.trim();
    } else if (content) {
      // Check for Universal Editor property hints in data attributes
      const hasHeadingProp = cell.hasAttribute('data-aue-prop')
                            && cell.getAttribute('data-aue-prop').includes('Heading');
      const hasBodyProp = cell.hasAttribute('data-aue-prop')
                         && cell.getAttribute('data-aue-prop').includes('Body');
      const hasCtaProp = cell.hasAttribute('data-aue-prop')
                        && cell.getAttribute('data-aue-prop').includes('Cta');

      if (hasHeadingProp || (index === 0 && !cardData.heading)) {
        // First cell or explicitly marked as heading
        cardData.heading = innerHTML;
      } else if (hasBodyProp || (!cardData.body && content.length > cardData.heading.length)) {
        // Body content (usually longer) or explicitly marked
        cardData.body = innerHTML;
      } else if (hasCtaProp || (!cardData.ctaText && content.length < 50)) {
        // Short content for CTA text or explicitly marked
        cardData.ctaText = content;
      } else if (!cardData.heading && content.length < 100) {
        // Fallback: short content as heading
        cardData.heading = innerHTML;
      } else if (!cardData.body) {
        // Fallback: remaining content as body
        cardData.body = innerHTML;
      }
    }
  });

  // If we only have one piece of content and it's substantial, treat as heading + body
  if (!cardData.heading && !cardData.body && cells.length === 1) {
    const singleContent = cells[0].innerHTML.trim();
    if (singleContent.length > 20) {
      // Split long content or use as heading
      const sentences = singleContent.split('. ');
      if (sentences.length > 1) {
        cardData.heading = `${sentences[0]}.`;
        cardData.body = sentences.slice(1).join('. ');
      } else {
        cardData.heading = singleContent;
      }
    } else {
      cardData.heading = singleContent;
    }
  }

  // Always return cardData object, even if empty (for Universal Editor compatibility)
  // Empty cards are needed for newly added items that haven't been filled with content yet
  return cardData;
}

// Create card element from card data
function createCardElement(cardData, index, originalRow = null) {
  const cardContainer = document.createElement('div');
  cardContainer.className = `container-${index + 1}`;

  // Move Universal Editor instrumentation from original row if available
  if (originalRow) {
    moveInstrumentation(originalRow, cardContainer);
  }

  const cardDiv = document.createElement('div');
  cardDiv.className = 'card-type-default';

  const cardContent = document.createElement('div');
  cardContent.className = 'card-content';

  // Handle case where cardData might be null or empty
  const safeCardData = cardData || {
    heading: '',
    body: '',
    cta: null,
    ctaText: '',
  };

  // Card heading - create placeholder if empty for Universal Editor
  const headingDiv = document.createElement('div');
  headingDiv.className = 'card-title';
  const headingElement = document.createElement('h3');

  if (safeCardData.heading) {
    headingElement.innerHTML = safeCardData.heading;
  } else {
    // Empty placeholder for Universal Editor
    headingElement.innerHTML = '';
    headingElement.setAttribute('data-placeholder', 'Add heading...');
  }

  headingDiv.appendChild(headingElement);
  cardContent.appendChild(headingDiv);

  // Card body text - create placeholder if empty for Universal Editor
  const textDiv = document.createElement('div');
  textDiv.className = 'card-text';
  const textElement = document.createElement('div');
  textElement.className = 'card-body';

  if (safeCardData.body) {
    textElement.innerHTML = safeCardData.body;
  } else {
    // Empty placeholder for Universal Editor
    textElement.innerHTML = '';
    textElement.setAttribute('data-placeholder', 'Add body text...');
  }

  textDiv.appendChild(textElement);
  cardContent.appendChild(textDiv);

  // Card button/CTA - always create container for Universal Editor
  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'card-buttons';

  if (safeCardData.cta || safeCardData.ctaText) {
    let button;
    if (safeCardData.cta) {
      // Use existing link
      button = safeCardData.cta;
      button.className = 'button button-secondary';
      if (safeCardData.ctaText && safeCardData.ctaText !== button.textContent.trim()) {
        button.textContent = safeCardData.ctaText;
      }
    } else if (safeCardData.ctaText) {
      // Create new button element
      button = document.createElement('a');
      button.className = 'button button-secondary';
      button.textContent = safeCardData.ctaText;
      button.href = '#';
    }

    if (button) {
      buttonDiv.appendChild(button);
    }
  } else {
    // Create placeholder button for empty cards
    const placeholderButton = document.createElement('a');
    placeholderButton.className = 'button button-secondary empty-cta';
    placeholderButton.textContent = 'Add CTA';
    placeholderButton.href = '#';
    placeholderButton.setAttribute('data-placeholder', 'true');
    buttonDiv.appendChild(placeholderButton);
  }

  cardContent.appendChild(buttonDiv);

  cardDiv.appendChild(cardContent);
  cardContainer.appendChild(cardDiv);
  return cardContainer;
}

// Fallback: Process legacy structure for backward compatibility
function processLegacyCardStructure(containerContent, containerWrap) {
  // Skip container content (already processed) and parse remaining as card pairs
  const remainingContent = containerContent.slice(1); // Skip main heading

  // Group remaining content into card pairs (heading, body)
  for (let i = 0; i < remainingContent.length; i += 2) {
    if (i + 1 < remainingContent.length) {
      const cardData = {
        heading: remainingContent[i].content,
        body: remainingContent[i + 1].content,
        cta: null,
        ctaText: '',
      };

      const cardContainer = createCardElement(cardData, Math.floor(i / 2), remainingContent[i].row);
      containerWrap.appendChild(cardContainer);
    }
  }
}

// Process XWalk container + items structure
function processXWalkContent(containerContent, cardItems, content) {
  // Create container header with main heading
  const containerHeader = document.createElement('div');
  containerHeader.className = 'container-header';

  // Process container content (main heading)
  if (containerContent.length > 0) {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'header-body';

    // Move instrumentation from original row to preserve Universal Editor attributes
    if (containerContent[0].row) {
      moveInstrumentation(containerContent[0].row, headerDiv);
    }

    const headerElement = document.createElement('div');
    headerElement.className = 'header';

    const h1 = document.createElement('h1');
    h1.innerHTML = containerContent[0].content;
    headerElement.appendChild(h1);

    headerDiv.appendChild(headerElement);
    containerHeader.appendChild(headerDiv);
  }

  // Create container wrap for the cards
  const containerWrap = document.createElement('div');
  containerWrap.className = 'container-wrap';

  // Process card items
  cardItems.forEach((cardItem, index) => {
    const cardData = extractCardData(cardItem.element, cardItem.row);

    // Always create a card container, even if empty (for Universal Editor compatibility)
    const cardContainer = createCardElement(cardData, index, cardItem.row);
    containerWrap.appendChild(cardContainer);
  });

  // If no card items found, fallback to legacy parsing for backward compatibility
  if (cardItems.length === 0) {
    processLegacyCardStructure(containerContent, containerWrap);
  }

  // Assemble the final structure
  content.appendChild(containerHeader);
  content.appendChild(containerWrap);
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Create the main content container
  const content = document.createElement('div');
  content.className = 'cards-enhanced-content';

  // For XWalk container + item structure, we need different parsing
  // The block now contains:
  // 1. Container content (main heading)
  // 2. Multiple card-enhanced items (each with heading, body, CTA)
  // 3. Optional configuration values

  const containerContent = [];
  const cardItems = [];
  const configurationValues = [];

  // Parse rows to identify content types
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

    // Check if this is specifically a card-enhanced item
    const isCardEnhancedItem = cell.hasAttribute('data-aue-filter')
                               && cell.getAttribute('data-aue-filter') === 'card-enhanced';

    const hasCardUEMarkers = cell.querySelector('[data-aue-filter="card-enhanced"]')
                            || isCardEnhancedItem;

    // Check if this row contains a card item structure
    // Card items will have nested div structure from XWalk or Universal Editor markers
    const cardElement = hasCardUEMarkers
                       || cell.querySelector('[data-aue-type="component"]')
                       || (cells.length > 1 && cell); // Fallback for simple structure

    if (cardElement || (isCardItemRow(cell) && !isFirstContentRow(index, rows))) {
      // This is a card item (but not if it's the first content row, likely main heading)
      cardItems.push({ element: cell, row, index });
    } else if (textContent && !isConfigurationValue(textContent)) {
      // This is container content (main heading) - make sure it's not a config value
      containerContent.push({
        type: 'text',
        content: cell.innerHTML.trim(),
        textContent,
        row,
        index,
      });
    }
  });

  // Process container content and card items
  processXWalkContent(containerContent, cardItems, content);

  // Apply configuration values
  configurationValues.forEach(({ value, row }) => {
    if (['dark', 'light', 'compact', 'centered'].includes(value)) {
      block.classList.add(value);
    }
    row.remove();
  });

  // Clear original content and add processed content
  block.innerHTML = '';
  block.appendChild(content);
}
