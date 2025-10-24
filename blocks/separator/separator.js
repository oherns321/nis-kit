/**
 * Separator Block - Creates a horizontal rule separator matching Columbia Gas design
 * Matches: <div class="nisource-custom-hr"><hr class="m-t-40 m-b-40"></div>
 */
export default async function decorate(block) {
  // Create the separator structure matching Columbia Gas design
  const customHrContainer = document.createElement('div');
  customHrContainer.className = 'nisource-custom-hr';

  const hr = document.createElement('hr');
  hr.className = 'm-t-40 m-b-40';

  customHrContainer.appendChild(hr);

  // Clear any existing content and add the separator structure
  block.innerHTML = '';
  block.appendChild(customHrContainer);
}
