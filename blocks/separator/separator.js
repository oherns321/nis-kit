/**
 * Separator Block - Creates a gradient horizontal line separator
 * Works with Universal Editor for content authoring
 */
export default async function decorate(block) {
  // Create the separator structure
  const separatorContent = document.createElement('div');
  separatorContent.className = 'separator-content';

  const separatorLine = document.createElement('div');
  separatorLine.className = 'separator-line';
  separatorLine.setAttribute('role', 'separator');
  separatorLine.setAttribute('aria-label', 'Content separator');

  separatorContent.appendChild(separatorLine);

  // Clear any existing content and add the separator structure
  block.innerHTML = '';
  block.appendChild(separatorContent);
}
