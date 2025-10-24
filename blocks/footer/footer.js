/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Create footer structure matching Columbia Gas design
  block.textContent = '';

  // Create main container matching the Columbia Gas structure
  const container = document.createElement('div');
  container.className = 'sf_cols container';

  // Create main footer row
  const footerRow = document.createElement('div');
  footerRow.className = 'sf_colsOut md-flex';
  footerRow.setAttribute('data-sf-element', 'Row');

  // Column 1: Our Company
  const ourCompanyColumn = document.createElement('div');
  ourCompanyColumn.className = 'sf_colsIn footer__column';
  ourCompanyColumn.setAttribute('data-sf-element', 'AboutUsColumn');
  ourCompanyColumn.setAttribute('data-placeholder-label', 'About Us Column');

  const ourCompanyContent = document.createElement('div');
  ourCompanyContent.className = 'body-content';

  const ourCompanyList = document.createElement('ul');
  ourCompanyList.className = 'menu menu--footer';

  const ourCompanyLinks = [
    { text: 'Our Company', href: 'footer-menu/our-company.html', isTopLevel: true },
    { text: 'About Us', href: 'our-company/about-us.html' },
    { text: 'Giving Back', href: 'our-company/about-us/giving-back.html' },
    { text: 'Rates and Tariffs', href: 'our-company/about-us/regulatory-information.html' },
    { text: 'Our Environment', href: 'our-company/about-us/our-environment.html' },
    { text: 'News Room', href: 'our-company/news-room.html' },
    { text: 'Careers', href: 'https://www.nisource.com/careers' },
  ];

  ourCompanyLinks.forEach((link) => {
    const li = document.createElement('li');
    if (link.isTopLevel) li.className = 'top-level';

    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    a.style.textDecoration = 'none';
    if (!link.isTopLevel) a.className = 'linkhover';

    li.appendChild(a);
    ourCompanyList.appendChild(li);
  });

  ourCompanyContent.appendChild(ourCompanyList);
  ourCompanyColumn.appendChild(ourCompanyContent);

  // Column 2: Partner with Us
  const partnerColumn = document.createElement('div');
  partnerColumn.className = 'sf_colsIn footer__column';
  partnerColumn.setAttribute('data-sf-element', 'ContactWithUsColumn');
  partnerColumn.setAttribute('data-placeholder-label', 'Contact With Us Column');

  const partnerContent = document.createElement('div');
  partnerContent.className = 'body-content';

  const partnerList = document.createElement('ul');
  partnerList.className = 'menu menu--footer';

  const partnerLinks = [
    { text: 'Partner with Us', href: 'footer-menu/partner-with-us.html', isTopLevel: true },
    { text: 'Builders and Developers', href: 'partner-with-us/builders-and-developers.html' },
    { text: 'Contractors and Plumbers', href: 'partner-with-us/contractors-and-plumbers.html' },
    { text: 'Economic Development', href: 'partner-with-us/economic-development.html' },
    { text: 'Emergency Responders', href: 'partner-with-us/emergency-responders.html' },
    { text: 'Excavators', href: 'safety/excavators.html' },
  ];

  partnerLinks.forEach((link) => {
    const li = document.createElement('li');
    if (link.isTopLevel) li.className = 'top-level';

    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    a.style.textDecoration = 'none';
    if (!link.isTopLevel) a.className = 'linkhover';

    li.appendChild(a);
    partnerList.appendChild(li);
  });

  partnerContent.appendChild(partnerList);
  partnerColumn.appendChild(partnerContent);

  // Column 3: Quick Links
  const quickLinksColumn = document.createElement('div');
  quickLinksColumn.className = 'sf_colsIn footer__column';
  quickLinksColumn.setAttribute('data-sf-element', 'EmergencyColumn');
  quickLinksColumn.setAttribute('data-placeholder-label', 'Emergency Column');

  const quickLinksContent = document.createElement('div');
  quickLinksContent.className = 'body-content';

  const quickLinksList = document.createElement('ul');
  quickLinksList.className = 'menu menu--footer';

  const quickLinks = [
    { text: 'Quick Links', href: 'https://myaccount.columbiagasky.com/', isTopLevel: true },
    { text: 'Sign In', href: 'https://myaccount.columbiagasky.com/login' },
    { text: 'Outages', href: 'services/alert-center.html' },
    { text: 'Ways to Pay', href: 'bills-and-payments/payment-options.html' },
    { text: 'Get Help Paying', href: 'bills-and-payments/financial-support.html' },
    { text: 'Mobile App', href: 'campaigns/mobile-app.html' },
  ];

  quickLinks.forEach((link) => {
    const li = document.createElement('li');
    if (link.isTopLevel) li.className = 'top-level';

    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    a.style.textDecoration = 'none';
    if (!link.isTopLevel) a.className = 'linkhover';

    li.appendChild(a);
    quickLinksList.appendChild(li);
  });

  quickLinksContent.appendChild(quickLinksList);
  quickLinksColumn.appendChild(quickLinksContent);

  // Column 4: Need Help?
  const helpColumn = document.createElement('div');
  helpColumn.className = 'sf_colsIn footer__column';
  helpColumn.setAttribute('data-sf-element', 'QuickLinksColumn');
  helpColumn.setAttribute('data-placeholder-label', 'Quick Links Column');

  const helpContent = document.createElement('div');
  helpContent.className = 'body-content';

  const helpList = document.createElement('ul');
  helpList.className = 'menu menu--footer';

  const helpLinks = [
    { text: 'Need Help?', href: 'footer-menu/you-need-help.html', isTopLevel: true },
    { text: 'FAQs', href: 'help/help-center.html' },
    { text: 'Cookie Preferences', href: '#', onClick: 'TrackingConsentManager.askForUserConsent();' },
    { text: 'Contact Us', href: 'help/help-center/contact-us.html' },
    { text: 'Call 1-800-432-9345', href: 'tel:18004329345' },
  ];

  helpLinks.forEach((link) => {
    const li = document.createElement('li');
    if (link.isTopLevel) li.className = 'top-level';

    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    a.style.textDecoration = 'none';
    if (link.onClick) a.setAttribute('onclick', link.onClick);
    if (!link.isTopLevel) a.className = 'linkhover';

    li.appendChild(a);
    helpList.appendChild(li);
  });

  helpContent.appendChild(helpList);
  helpColumn.appendChild(helpContent);

  // Column 5: Social/Connect with Us
  const socialColumn = document.createElement('div');
  socialColumn.className = 'sf_colsIn footer__column';
  socialColumn.setAttribute('data-sf-element', 'LogoColumn');
  socialColumn.setAttribute('data-placeholder-label', 'Logo Column');

  const socialContent = document.createElement('div');
  socialContent.className = 'body-content';

  const socialList = document.createElement('ul');
  socialList.className = 'menu menu--footer';

  const socialTopLevelLi = document.createElement('li');
  socialTopLevelLi.className = 'top-level';

  const socialTopLevelLink = document.createElement('a');
  socialTopLevelLink.href = 'https://www.facebook.com/columbiagasofkentucky/';
  socialTopLevelLink.target = 'new';
  socialTopLevelLink.setAttribute('aria-label', 'connect with us');
  socialTopLevelLink.style.textDecoration = 'none';
  socialTopLevelLink.textContent = 'Connect with Us';

  socialTopLevelLi.appendChild(socialTopLevelLink);
  socialList.appendChild(socialTopLevelLi);

  socialContent.appendChild(socialList);

  // Add social media icons
  const socialIcons = document.createElement('div');
  socialIcons.className = 'social-icons-container';

  const socialPlatforms = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/columbiagasofkentucky',
      ariaLabel: 'Facebook',
      imgSrc: '/icons/nisource-fb-icon.gif',
      alt: 'facebook logo',
      width: '30',
    },
    {
      name: 'Twitter/X',
      href: 'https://twitter.com/ColumbiaGasKY',
      ariaLabel: 'Twitter',
      imgSrc: '/icons/nisource-logo-x.gif',
      alt: 'twitter logo',
      width: '24',
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/4023922/',
      ariaLabel: 'LinkedIn',
      imgSrc: '/icons/nisource-logo-linkedin.gif',
      alt: 'linkedin logo',
      width: '30',
    },
  ];

  socialPlatforms.forEach((platform, index) => {
    const link = document.createElement('a');
    link.href = platform.href;
    link.target = 'new';
    link.setAttribute('aria-label', platform.ariaLabel);

    const img = document.createElement('img');
    img.src = platform.imgSrc;
    img.alt = platform.alt;
    img.width = platform.width;
    img.style.paddingBottom = '15px';
    if (index === 0) img.style.paddingTop = '7px';

    link.appendChild(img);
    socialIcons.appendChild(link);

    if (index < socialPlatforms.length - 1) {
      socialIcons.appendChild(document.createElement('br'));
    }
  });

  socialContent.appendChild(socialIcons);
  socialColumn.appendChild(socialContent);

  // Add all columns to the row
  footerRow.appendChild(ourCompanyColumn);
  footerRow.appendChild(partnerColumn);
  footerRow.appendChild(quickLinksColumn);
  footerRow.appendChild(helpColumn);
  footerRow.appendChild(socialColumn);

  // Create copyright row
  const copyrightRow = document.createElement('div');
  copyrightRow.className = 'sf_colsOut text-sm text-gray m-t-30 text-xs';

  const copyrightColumn = document.createElement('div');
  copyrightColumn.className = 'sf_colsIn';
  copyrightColumn.setAttribute('data-sf-element', 'Copyright menu');
  copyrightColumn.setAttribute('data-placeholder-label', 'Copyright Column');

  copyrightColumn.innerHTML = `
    © 2025 Columbia Gas of Kentucky Inc.&nbsp;&nbsp;&nbsp;
    <a href="our-site/terms-of-use.html" class="linkhover">Terms of Use</a>&nbsp;&nbsp;&nbsp;
    <a href="our-site/privacy-notice.html" class="linkhover">Privacy Notice</a>&nbsp;&nbsp;&nbsp;
    <a href="our-site/accessibility-statement.html" class="linkhover">Accessibility Statement</a>&nbsp;&nbsp;&nbsp;
  `;

  copyrightRow.appendChild(copyrightColumn);

  // Add everything to the container
  container.appendChild(footerRow);
  container.appendChild(copyrightRow);

  // Add container to the block
  block.appendChild(container);
}
