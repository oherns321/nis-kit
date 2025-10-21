import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Helper function to identify configuration values
 */
function isConfigurationValue(text) {
  const configValues = ['dark', 'light', 'compact', 'centered', 'true', 'false'];
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
 * Helper function to identify card item rows
 */
function isCardItemRow(cell) {
  // Check for Universal Editor component markers
  if (cell.querySelector('[data-aue-filter="super-card"]')
      || (cell.hasAttribute('data-aue-filter') && cell.getAttribute('data-aue-filter') === 'super-card')) {
    return true;
  }

  if (cell.querySelector('[data-aue-type="component"]')
      || cell.hasAttribute('data-aue-type')) {
    const parent = cell.parentElement;
    const isInContainer = parent && parent.classList.contains('super-cards');
    const hasMultipleSiblings = parent && parent.children.length > 2;
    return isInContainer && hasMultipleSiblings;
  }

  // Card items might have multiple cells or specific structure
  const parent = cell.parentElement;
  const cellsInRow = parent ? parent.children.length : 1;

  return cellsInRow > 1
         || cell.querySelector('a')
         || (cell.textContent.trim()
             && cell.previousElementSibling
             && cell.previousElementSibling.textContent.trim());
}

/**
 * Extract card data from a row
 */
function extractCardData(row) {
  const cells = [...row.children];
  const cardData = {
    heading: '',
    body: '',
    primaryCta: null,
    primaryCtaText: '',
    secondaryCta: null,
    secondaryCtaText: '',
    originalRow: row,
  };

  // Process cells to extract content
  cells.forEach((cell, cellIndex) => {
    const textContent = cell.textContent.trim();
    const link = cell.querySelector('a');

    if (!textContent && !link) return;

    // First cell is typically the heading
    if (cellIndex === 0 && textContent && !link) {
      cardData.heading = cell.innerHTML.trim();
    } else if (cellIndex === 1 && textContent && !link) {
      // Second cell is typically the body text
      cardData.body = cell.innerHTML.trim();
    } else if (link) {
      // Links are CTAs
      const linkText = link.textContent.trim();
      const linkUrl = link.getAttribute('href') || '#';

      if (!cardData.primaryCta) {
        cardData.primaryCta = linkUrl;
        cardData.primaryCtaText = linkText;
      } else if (!cardData.secondaryCta) {
        cardData.secondaryCta = linkUrl;
        cardData.secondaryCtaText = linkText;
      }
    } else if (textContent && cardData.heading && !cardData.body) {
      // Fallback: treat remaining text content as body if heading exists
      cardData.body = cell.innerHTML.trim();
    } else if (textContent && !cardData.heading) {
      // Fallback: treat as heading if no heading exists yet
      cardData.heading = cell.innerHTML.trim();
    }
  });

  return cardData;
}

/**
 * Create a card element from card data
 */
function createCardElement(cardData, originalRow = null) {
  const cardContainer = document.createElement('div');
  cardContainer.className = 'card';

  // Move Universal Editor instrumentation
  if (originalRow) {
    moveInstrumentation(originalRow, cardContainer);
  }

  // Ensure cardData is valid
  const safeCardData = cardData || {
    heading: '',
    body: '',
    primaryCta: null,
    primaryCtaText: '',
    secondaryCta: null,
    secondaryCtaText: '',
  };

  // Create heading
  const headingElement = document.createElement('h3');
  headingElement.className = 'card-heading';
  if (safeCardData.heading) {
    headingElement.innerHTML = safeCardData.heading;
  } else {
    headingElement.innerHTML = '';
    headingElement.setAttribute('data-placeholder', 'Add card heading...');
  }

  // Create body text
  const bodyElement = document.createElement('div');
  bodyElement.className = 'card-body';
  if (safeCardData.body) {
    bodyElement.innerHTML = safeCardData.body;
  } else {
    bodyElement.innerHTML = '';
    bodyElement.setAttribute('data-placeholder', 'Add card body text...');
  }

  // Create CTA buttons container
  const ctasContainer = document.createElement('div');
  ctasContainer.className = 'card-ctas';

  // Primary CTA
  if (safeCardData.primaryCta && safeCardData.primaryCtaText) {
    const primaryButton = document.createElement('a');
    primaryButton.className = 'button button-primary';
    primaryButton.href = safeCardData.primaryCta;
    primaryButton.textContent = safeCardData.primaryCtaText;
    ctasContainer.appendChild(primaryButton);
  } else {
    // Empty placeholder for primary CTA
    const placeholderPrimary = document.createElement('a');
    placeholderPrimary.className = 'button button-primary empty-cta';
    placeholderPrimary.textContent = 'Add Primary CTA';
    placeholderPrimary.href = '#';
    placeholderPrimary.setAttribute('data-placeholder', 'true');
    ctasContainer.appendChild(placeholderPrimary);
  }

  // Secondary CTA
  if (safeCardData.secondaryCta && safeCardData.secondaryCtaText) {
    const secondaryButton = document.createElement('a');
    secondaryButton.className = 'button button-secondary';
    secondaryButton.href = safeCardData.secondaryCta;
    secondaryButton.textContent = safeCardData.secondaryCtaText;
    ctasContainer.appendChild(secondaryButton);
  } else {
    // Empty placeholder for secondary CTA
    const placeholderSecondary = document.createElement('a');
    placeholderSecondary.className = 'button button-secondary empty-cta';
    placeholderSecondary.textContent = 'Add Secondary CTA';
    placeholderSecondary.href = '#';
    placeholderSecondary.setAttribute('data-placeholder', 'true');
    ctasContainer.appendChild(placeholderSecondary);
  }

  // Assemble card
  cardContainer.appendChild(headingElement);
  cardContainer.appendChild(bodyElement);
  cardContainer.appendChild(ctasContainer);

  return cardContainer;
}

/**
 * Decorates the super-cards block
 * @param {Element} block The super-cards block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const content = document.createElement('div');
  content.className = 'cards-container';

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
    if (isCardItemRow(cell)) {
      cardItems.push(extractCardData(row, index));
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
    if (textContent) {
      cardItems.push(extractCardData(row, index));
    }
  });

  // Create container heading if it exists
  if (containerHeading) {
    const headingElement = document.createElement('h2');
    headingElement.className = 'container-heading';
    headingElement.innerHTML = containerHeading.content;
    block.insertBefore(headingElement, block.firstChild);
    containerHeading.row.remove();
  }

  // Create cards
  cardItems.forEach((cardData) => {
    if (cardData) {
      const cardElement = createCardElement(cardData, cardData.originalRow);
      content.appendChild(cardElement);
    }
  });

  // Apply configuration values
  configurationValues.forEach(({ value, row }) => {
    if (['dark', 'light', 'compact', 'centered'].includes(value)) {
      block.classList.add(value);
    }
    row.remove();
  });

  // Clear original content and add new structure
  block.innerHTML = '';
  if (containerHeading) {
    const headingElement = document.createElement('h2');
    headingElement.className = 'container-heading';
    headingElement.innerHTML = containerHeading.content;
    block.appendChild(headingElement);
  }
  block.appendChild(content);
}
