import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Helper function to identify configuration values
 */
function isConfigurationValue(text) {
  const configValues = ["light","dark"];
  return configValues.includes(text.toLowerCase());
}

/**
 * Decorates the feature-carousel block
 * @param {Element} block The feature-carousel block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const content = document.createElement('div');
  content.className = 'content';

  const configurationValues = [];

  // Process rows
  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const cell = cells[0];
    const textContent = cell.textContent.trim();

    // Check if this is a configuration value
    if (isConfigurationValue(textContent)) {
      configurationValues.push({ value: textContent.toLowerCase(), row });
      return;
    }

    // Process content based on type
    const img = cell.querySelector('img');
    const link = cell.querySelector('a');

    if (img) {
      // Handle images
      content.appendChild(img.cloneNode(true));
    } else if (link) {
      // Handle buttons/links
      const button = document.createElement('a');
      button.className = 'button button-primary';
      button.href = link.href;
      button.textContent = link.textContent;
      content.appendChild(button);
    } else if (textContent) {
      // Handle text content
      const textElement = document.createElement('div');
      textElement.className = 'text-content';
      textElement.innerHTML = cell.innerHTML;
      content.appendChild(textElement);
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
  block.appendChild(content);
}