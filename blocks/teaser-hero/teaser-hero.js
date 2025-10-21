import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const blockChildren = [...block.children];

  // Create main content container
  const content = document.createElement('div');
  content.className = 'teaser-hero-content';

  // Extract content from Universal Editor structure
  let backgroundImageRow = null;
  let headlineRow = null;
  let subheaderRow = null;
  let bodyRow = null;
  const buttonRows = [];
  const configRows = [];

  // Categorize rows by content type
  blockChildren.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const cell = cells[0];
    const img = cell.querySelector('img');
    const link = cell.querySelector('a');
    const textContent = cell.textContent.trim();

    if (img && img.src) {
      // Background image row
      backgroundImageRow = { row, img };
    } else if (link) {
      // Button row
      buttonRows.push({ row, link, textContent });
    } else if (textContent) {
      // Configuration values
      const configValues = ['dark', 'light', 'true', 'false', 'bg-top', 'bg-bottom', 'bg-left', 'bg-right', 'bg-top-left', 'bg-top-right', 'bg-bottom-left', 'bg-bottom-right', 'bg-center', 'height-full-page', 'height-fit-content', 'height-fixed', 'primary', 'secondary'];

      if (configValues.includes(textContent.toLowerCase())) {
        configRows.push({ row, value: textContent.toLowerCase() });
      } else if (!headlineRow) {
        // Content rows - assign based on order
        headlineRow = { row, content: cell.innerHTML.trim() };
      } else if (!subheaderRow) {
        subheaderRow = { row, content: cell.innerHTML.trim() };
      } else if (!bodyRow) {
        bodyRow = { row, content: cell.innerHTML.trim() };
      }
    }
  });

  // Process background image
  if (backgroundImageRow) {
    block.style.backgroundImage = `url('${backgroundImageRow.img.src}')`;
    backgroundImageRow.row.remove();
  }

  // Process headline
  if (headlineRow && headlineRow.content) {
    const headerContent = document.createElement('div');
    headerContent.className = 'header-content';

    const h1 = document.createElement('h1');
    h1.innerHTML = headlineRow.content;
    headerContent.appendChild(h1);

    // Move Universal Editor instrumentation
    moveInstrumentation(headlineRow.row, headerContent);
    content.appendChild(headerContent);
    headlineRow.row.remove();
  }

  // Process subheader
  if (subheaderRow && subheaderRow.content) {
    let headerContent = content.querySelector('.header-content');
    if (!headerContent) {
      headerContent = document.createElement('div');
      headerContent.className = 'header-content';
      content.appendChild(headerContent);
    }

    const subheader = document.createElement('div');
    subheader.className = 'subheader';
    subheader.innerHTML = subheaderRow.content;

    // Move Universal Editor instrumentation
    moveInstrumentation(subheaderRow.row, subheader);
    headerContent.appendChild(subheader);
    subheaderRow.row.remove();
  }

  // Process body text
  if (bodyRow && bodyRow.content) {
    const bodyText = document.createElement('div');
    bodyText.className = 'body-text';
    bodyText.innerHTML = bodyRow.content;

    // Move Universal Editor instrumentation
    moveInstrumentation(bodyRow.row, bodyText);
    content.appendChild(bodyText);
    bodyRow.row.remove();
  }

  // Process buttons
  if (buttonRows.length > 0) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    buttonRows.forEach((buttonData, index) => {
      const { row, link } = buttonData;

      // Create button with proper styling
      const button = document.createElement('a');
      button.href = link.href || '#';
      button.textContent = link.textContent.trim();

      // Apply button type based on index (primary first, secondary second)
      const buttonClass = index === 0 ? 'primary' : 'secondary';
      button.className = `button ${buttonClass}`;

      // Move Universal Editor instrumentation
      moveInstrumentation(row, button);
      buttonContainer.appendChild(button);
      row.remove();
    });

    content.appendChild(buttonContainer);
  }

  // Process configuration values
  let themeValue = 'dark'; // default
  let overlayValue = true; // default
  let backgroundPosition = null;
  let heightVariant = null;

  configRows.forEach(({ row, value }) => {
    if (value === 'dark' || value === 'light') {
      themeValue = value;
    } else if (value === 'true' || value === 'false') {
      overlayValue = value === 'true';
    } else if (value.startsWith('bg-')) {
      backgroundPosition = value;
    } else if (value.startsWith('height-')) {
      heightVariant = value;
    }
    row.remove();
  });

  // Add processed content to block
  block.appendChild(content);

  // Apply theme variant
  block.classList.add(themeValue);

  // Handle overlay setting
  if (!overlayValue) {
    block.classList.add('no-overlay');
  }

  // Apply background position variant
  if (backgroundPosition) {
    block.classList.add(backgroundPosition);
  }

  // Apply height variant
  if (heightVariant) {
    block.classList.add(heightVariant);
  }
}
