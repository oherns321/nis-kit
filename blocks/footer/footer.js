/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Create footer structure matching Figma design
  block.textContent = '';

  // Create main footer container
  const footerContent = document.createElement('div');
  footerContent.className = 'footer-content';

  // Create grid container for all footer columns
  const footerGrid = document.createElement('div');
  footerGrid.className = 'footer-grid';

  // Social column
  const socialColumn = document.createElement('div');
  socialColumn.className = 'footer-column social-column';

  const socialTitle = document.createElement('h6');
  socialTitle.textContent = 'Social';
  socialColumn.appendChild(socialTitle);

  const socialIcons = document.createElement('div');
  socialIcons.className = 'social-icons';

  // Create social media icons
  const socialPlatforms = [
    { name: 'Facebook', icon: 'facebook' },
    { name: 'LinkedIn', icon: 'linkedin' },
    { name: 'Twitter', icon: 'twitter' },
    { name: 'YouTube', icon: 'youtube' },
  ];

  socialPlatforms.forEach((platform) => {
    const iconButton = document.createElement('button');
    iconButton.className = 'social-icon';
    iconButton.setAttribute('aria-label', platform.name);

    // Create SVG icon
    const iconImg = document.createElement('img');
    iconImg.src = `/content/adobe-code-kit.resource/icons/${platform.icon}.svg`;
    iconImg.alt = platform.name;
    iconImg.width = 20;
    iconImg.height = 20;

    iconButton.appendChild(iconImg);
    socialIcons.appendChild(iconButton);
  });

  socialColumn.appendChild(socialIcons);
  footerGrid.appendChild(socialColumn);

  // Create three placeholder columns
  for (let i = 0; i < 3; i += 1) {
    const column = document.createElement('div');
    column.className = 'footer-column';

    const title = document.createElement('h6');
    title.textContent = 'Placeholder';
    column.appendChild(title);

    const linkList = document.createElement('div');
    linkList.className = 'footer-links';

    // Add placeholder links
    for (let j = 0; j < 3; j += 1) {
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = 'Placeholder';
      linkList.appendChild(link);
    }

    column.appendChild(linkList);
    footerGrid.appendChild(column);
  }

  footerContent.appendChild(footerGrid);

  // Create bottom section with logo and legal content
  const bottomSection = document.createElement('div');
  bottomSection.className = 'footer-bottom';

  // Logo section
  const logoSection = document.createElement('div');
  logoSection.className = 'footer-logo';

  // Create SVG logo
  const logoImg = document.createElement('img');
  logoImg.src = '/content/adobe-code-kit.resource/icons/wordmark.svg';
  logoImg.alt = 'logo';
  logoImg.width = 354;
  logoSection.appendChild(logoImg);

  // Legal content
  const legalContent = document.createElement('div');
  legalContent.className = 'footer-legal';
  legalContent.innerHTML = `
    <p>Copyright © 2025 EY. All rights reserved.</p>
    <p>Privacy / Terms of Use / Cookie preferences / Do not sell my personal information / AdChoices</p>
  `;

  bottomSection.appendChild(logoSection);
  bottomSection.appendChild(legalContent);
  footerContent.appendChild(bottomSection);

  block.appendChild(footerContent);
}
