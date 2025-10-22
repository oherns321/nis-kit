// media query match that indicates mobile/tablet width
const isMobile = window.matchMedia('(max-width: 882px)');

// Force close all dropdowns function
function forceCloseAllDropdowns() {
  const megaMenus = document.querySelectorAll('.js-megamenu');
  const submenuElements = document.querySelectorAll('.js-mega-submenu');

  megaMenus.forEach((menu) => {
    menu.classList.remove('is-open');
  });

  submenuElements.forEach((submenu) => {
    submenu.style.display = 'none';
    submenu.style.visibility = 'hidden';
    submenu.style.opacity = '0';
  });
}

/**
 * Toggles the mobile navigation menu
 * @param {Element} mobileHeader The mobile header element
 */
function toggleMobileMenu(mobileHeader) {
  const isOpen = mobileHeader.classList.contains('is-open');

  if (isOpen) {
    mobileHeader.classList.remove('is-open');
    document.body.style.overflowY = '';
  } else {
    mobileHeader.classList.add('is-open');
    document.body.style.overflowY = 'hidden';
  }
}

/**
 * Opens the search modal
 */
function openSearchModal() {
  const searchModal = document.querySelector('.SearchModal');
  if (searchModal) {
    searchModal.classList.add('is-open');
    const searchInput = searchModal.querySelector('#modal-search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }
}

/**
 * Closes the search modal
 */
function closeSearchModal() {
  const searchModal = document.querySelector('.SearchModal');
  if (searchModal) {
    searchModal.classList.remove('is-open');
  }
}

/**
 * Toggles a dropdown menu
 * @param {Element} menuItem The menu item to toggle
 */
function toggleDropdown(menuItem) {
  const isOpen = menuItem.classList.contains('is-open');

  // Close all other dropdowns
  document.querySelectorAll('.js-megamenu.is-open').forEach((menu) => {
    if (menu !== menuItem) {
      menu.classList.remove('is-open');
    }
  });

  // Toggle this dropdown
  if (isOpen) {
    menuItem.classList.remove('is-open');
  } else {
    menuItem.classList.add('is-open');
  }
}

/**
 * Closes all dropdowns
 */
function closeAllDropdowns() {
  document.querySelectorAll('.js-megamenu.is-open').forEach((menu) => {
    menu.classList.remove('is-open');
  });
}

/**
 * Handles keyboard events for accessibility
 */
function handleKeyboardEvents(e) {
  if (e.code === 'Escape') {
    const searchModal = document.querySelector('.SearchModal');
    if (searchModal && searchModal.classList.contains('is-open')) {
      closeSearchModal();
    }

    const mobileHeader = document.querySelector('.SiteHeader--mobile.is-open');
    if (mobileHeader) {
      toggleMobileMenu(mobileHeader);
    }

    // Close all dropdowns
    closeAllDropdowns();
  }
}

/**
 * Creates the search modal structure
 */
function createSearchModal() {
  const searchModal = document.createElement('div');
  searchModal.className = 'SearchModal';
  searchModal.innerHTML = `
    <div class="form-field text-center">
      <input type="text" name="modal-search" id="modal-search-input" placeholder="Search" autocomplete="off">
      <button class="btn btn-primary btnSearch" id="modal-search">
        <span class="text">Search</span>
        <span class="glyphicon glyphicon-search"></span>
      </button>
    </div>
  `;

  // Close modal when clicking outside
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) {
      closeSearchModal();
    }
  });

  // Handle search button click
  const searchButton = searchModal.querySelector('#modal-search');
  searchButton.addEventListener('click', () => {
    const searchTerm = searchModal.querySelector('#modal-search-input').value;
    if (searchTerm.trim()) {
      // Implement search functionality here
      // TODO: Replace with actual search implementation
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
      closeSearchModal();
    }
  });

  return searchModal;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Create header structure matching Columbia Gas SiteHeader design
  block.textContent = '';

  // Create search modal
  const searchModal = createSearchModal();
  document.body.appendChild(searchModal);

  // Desktop Header
  const desktopHeader = document.createElement('div');
  desktopHeader.className = 'SiteHeader SiteHeader--desktop';

  const desktopContainer = document.createElement('div');
  desktopContainer.className = 'container';

  // Desktop Logo
  const desktopLogo = document.createElement('a');
  desktopLogo.className = 'image logo';
  desktopLogo.href = '/';

  const desktopLogoImg = document.createElement('img');
  desktopLogoImg.src = 'https://nieus2prodazstg01.blob.core.windows.net/cdr-prod/images/librariesprovider3/design-elements/logos/columbia-gas-of-ohio-logo.png';
  desktopLogoImg.alt = 'Columbia Gas Logo';
  desktopLogo.appendChild(desktopLogoImg);

  // Desktop Main Navigation
  const mainNavigation = document.createElement('div');
  mainNavigation.id = 'main-navigation';
  mainNavigation.className = 'MainNav MainNav--desktop';
  mainNavigation.setAttribute('tabindex', '-1');

  // Auxiliary navigation
  const auxNav = document.createElement('div');
  auxNav.className = 'MainNav__auxiliary';
  const auxList = document.createElement('ul');

  const auxItems = [
    { text: 'Our Company', href: '/our-company' },
    { text: 'Partner with Us', href: '/partner-with-us' },
    { text: 'Emergency Contact', href: 'tel:+18001234567', isEmergency: true },
  ];

  auxItems.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'menu-item';

    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.text;
    link.target = '_self';

    if (item.isEmergency) {
      link.className = 'color-red';
      const icon = document.createElement('img');
      icon.src = '/icons/warning.svg';
      icon.alt = 'Warning';
      icon.className = 'icon icon-warning-2';
      icon.style.width = '16px';
      icon.style.height = '16px';
      link.prepend(icon);
    }

    li.appendChild(link);
    auxList.appendChild(li);
  });

  // Add search trigger to auxiliary nav
  const searchLi = document.createElement('li');
  const searchTrigger = document.createElement('div');
  searchTrigger.className = 'SearchModalDesktopTrigger';

  const searchIcon = document.createElement('img');
  searchIcon.src = '/icons/search.svg';
  searchIcon.alt = 'Search';
  searchIcon.className = 'icon search-icon';
  searchIcon.style.width = '18px';
  searchIcon.style.height = '18px';
  searchTrigger.appendChild(searchIcon);

  searchTrigger.addEventListener('click', openSearchModal);
  searchLi.appendChild(searchTrigger);
  auxList.appendChild(searchLi);

  auxNav.appendChild(auxList);

  // Main navigation
  const mainNav = document.createElement('div');
  mainNav.className = 'MainNav__main';
  const mainList = document.createElement('ul');

  // My Account dropdown
  const myAccountLi = document.createElement('li');
  myAccountLi.className = 'js-megamenu js-expandable';

  const myAccountLink = document.createElement('a');
  myAccountLink.className = 'cursor-pointer';
  myAccountLink.textContent = 'My Account';

  const myAccountButton = document.createElement('button');
  myAccountButton.className = 'js-submenu-expand';
  myAccountButton.type = 'button';
  myAccountButton.innerHTML = '<span class="a11y-hide">Click to expand My Account</span>';

  const myAccountSubmenu = document.createElement('ul');
  myAccountSubmenu.className = 'js-mega-submenu js-submenu';

  const myAccountSubmenuLi = document.createElement('li');
  const myAccountRow = document.createElement('div');
  myAccountRow.className = 'row';

  // First column
  const col1 = document.createElement('div');
  col1.className = 'col-md-3 js-megamenu-column';
  col1.innerHTML = `
    <a href="https://www.columbiagasohio.com/my-account/sign-in-register">Sign In / Register</a>
    <ul></ul>
    <a href="https://www.columbiagasohio.com/my-account/program-enrollments">Program Enrollments</a>
    <ul>
      <li><a href="https://myaccount.columbiagasohio.com/autopay" class="text-dark">AutoPay</a></li>
      <li><a href="https://myaccount.columbiagasohio.com/ebill" class="text-dark">Paperless Billing</a></li>
      <li><a href="https://myaccount.columbiagasohio.com/budget" class="text-dark">Budget Plan</a></li>
    </ul>
  `;

  // Second column
  const col2 = document.createElement('div');
  col2.className = 'col-md-3 js-megamenu-column';
  col2.innerHTML = `
    <a href="https://myaccount.columbiagasohio.com/dashboard">Account Dashboard</a>
    <ul></ul>
    <a href="https://myaccount.columbiagasohio.com/alerts">Alerts & Notifications</a>
    <ul>
      <li><a href="https://myaccount.columbiagasohio.com/alerts" class="text-dark">Outage Alerts</a></li>
      <li><a href="https://myaccount.columbiagasohio.com/alerts" class="text-dark">Billing Alerts</a></li>
      <li><a href="https://myaccount.columbiagasohio.com/subscriptions" class="text-dark">Email Subscriptions</a></li>
    </ul>
  `;

  myAccountRow.appendChild(col1);
  myAccountRow.appendChild(col2);
  myAccountSubmenuLi.appendChild(myAccountRow);
  myAccountSubmenu.appendChild(myAccountSubmenuLi);

  myAccountLi.appendChild(myAccountLink);
  myAccountLi.appendChild(myAccountButton);
  myAccountLi.appendChild(myAccountSubmenu);

  // Add event listeners for My Account dropdown (both link and button)
  myAccountButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(myAccountLi);
  });

  myAccountLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(myAccountLi);
  });

  // Bills & Payments dropdown
  const billsLi = document.createElement('li');
  billsLi.className = 'js-megamenu js-expandable';

  const billsLink = document.createElement('a');
  billsLink.className = 'cursor-pointer';
  billsLink.textContent = 'Bills & Payments';

  const billsButton = document.createElement('button');
  billsButton.className = 'js-submenu-expand';
  billsButton.type = 'button';
  billsButton.innerHTML = '<span class="a11y-hide">Click to expand Bills & Payments</span>';

  const billsSubmenu = document.createElement('ul');
  billsSubmenu.className = 'js-mega-submenu js-submenu';

  const billsSubmenuLi = document.createElement('li');
  const billsRow = document.createElement('div');
  billsRow.className = 'row';

  const billsCol = document.createElement('div');
  billsCol.className = 'col-md-3 js-megamenu-column';
  billsCol.innerHTML = `
    <a href="https://myaccount.columbiagasohio.com/bills">Bills & Payments</a>
    <ul>
      <li><a href="https://myaccount.columbiagasohio.com/payment/paynow" class="text-dark">Pay My Bill</a></li>
      <li><a href="https://myaccount.columbiagasohio.com/payment" class="text-dark">Pay with a Card</a></li>
      <li><a href="https://myaccount.columbiagasohio.com/bills" class="text-dark">View Bills</a></li>
      <li><a href="https://myaccount.columbiagasohio.com/paymentHistory" class="text-dark">Payment History</a></li>
      <li><a href="https://myaccount.columbiagasohio.com/usage" class="text-dark">My Usage</a></li>
      <li><a href="https://www.columbiagasohio.com/bills-and-payments/understanding-your-bill" class="text-dark">Understanding Your Bill</a></li>
    </ul>
  `;

  billsRow.appendChild(billsCol);
  billsSubmenuLi.appendChild(billsRow);
  billsSubmenu.appendChild(billsSubmenuLi);

  billsLi.appendChild(billsLink);
  billsLi.appendChild(billsButton);
  billsLi.appendChild(billsSubmenu);

  // Add event listeners for Bills & Payments dropdown (both link and button)
  billsButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(billsLi);
  });

  billsLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(billsLi);
  });

  // Products & Services dropdown
  const servicesLi = document.createElement('li');
  servicesLi.className = 'js-megamenu js-expandable';

  const servicesLink = document.createElement('a');
  servicesLink.className = 'cursor-pointer';
  servicesLink.textContent = 'Products & Services';

  const servicesButton = document.createElement('button');
  servicesButton.className = 'js-submenu-expand';
  servicesButton.type = 'button';
  servicesButton.innerHTML = '<span class="a11y-hide">Click to expand Products & Services</span>';

  const servicesSubmenu = document.createElement('ul');
  servicesSubmenu.className = 'js-mega-submenu js-submenu';

  const servicesSubmenuLi = document.createElement('li');
  const servicesRow = document.createElement('div');
  servicesRow.className = 'row';

  const servicesCol = document.createElement('div');
  servicesCol.className = 'col-md-3 js-megamenu-column';
  servicesCol.innerHTML = `
    <a href="/products-and-services">Products & Services</a>
    <ul>
      <li><a href="/products-and-services/residential" class="text-dark">Residential Services</a></li>
      <li><a href="/products-and-services/business" class="text-dark">Business Services</a></li>
      <li><a href="/products-and-services/energy-efficiency" class="text-dark">Energy Efficiency</a></li>
    </ul>
  `;

  servicesRow.appendChild(servicesCol);
  servicesSubmenuLi.appendChild(servicesRow);
  servicesSubmenu.appendChild(servicesSubmenuLi);

  servicesLi.appendChild(servicesLink);
  servicesLi.appendChild(servicesButton);
  servicesLi.appendChild(servicesSubmenu);

  // Add event listeners for Products & Services dropdown (both link and button)
  servicesButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(servicesLi);
  });

  servicesLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(servicesLi);
  });

  // Energy Efficiency dropdown
  const energyLi = document.createElement('li');
  energyLi.className = 'js-megamenu js-expandable';

  const energyLink = document.createElement('a');
  energyLink.className = 'cursor-pointer';
  energyLink.textContent = 'Energy Efficiency';

  const energyButton = document.createElement('button');
  energyButton.className = 'js-submenu-expand';
  energyButton.type = 'button';
  energyButton.innerHTML = '<span class="a11y-hide">Click to expand Energy Efficiency</span>';

  const energySubmenu = document.createElement('ul');
  energySubmenu.className = 'js-mega-submenu js-submenu';

  const energySubmenuLi = document.createElement('li');
  const energyRow = document.createElement('div');
  energyRow.className = 'row';

  const energyCol = document.createElement('div');
  energyCol.className = 'col-md-3 js-megamenu-column';
  energyCol.innerHTML = `
    <a href="https://www.columbiagasohio.com/energy-efficiency">Energy Efficiency</a>
    <ul>
      <li><a href="https://www.columbiagasohio.com/energy-efficiency/for-your-home/home-energy-tips" class="text-dark">Home Energy Tips</a></li>
      <li><a href="https://www.columbiagasohio.com/energy-efficiency/for-your-home/rebates-and-programs" class="text-dark">Rebates & Programs</a></li>
      <li><a href="https://www.columbiagasohio.com/energy-efficiency/for-your-home/home-energy-audit" class="text-dark">Home Energy Audit</a></li>
      <li><a href="https://www.columbiagasohio.com/energy-efficiency/for-your-business" class="text-dark">For Your Business</a></li>
    </ul>
  `;

  energyRow.appendChild(energyCol);
  energySubmenuLi.appendChild(energyRow);
  energySubmenu.appendChild(energySubmenuLi);

  energyLi.appendChild(energyLink);
  energyLi.appendChild(energyButton);
  energyLi.appendChild(energySubmenu);

  // Add event listeners for Energy Efficiency dropdown
  energyButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(energyLi);
  });

  energyLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(energyLi);
  });

  // Safety (simple link)
  const safetyLi = document.createElement('li');
  const safetyLink = document.createElement('a');
  safetyLink.href = 'https://www.columbiagasohio.com/safety';
  safetyLink.textContent = 'Safety';
  safetyLi.appendChild(safetyLink);

  // Help dropdown
  const helpLi = document.createElement('li');
  helpLi.className = 'js-megamenu js-expandable';

  const helpLink = document.createElement('a');
  helpLink.className = 'cursor-pointer';
  helpLink.textContent = 'Help';

  const helpButton = document.createElement('button');
  helpButton.className = 'js-submenu-expand';
  helpButton.type = 'button';
  helpButton.innerHTML = '<span class="a11y-hide">Click to expand Help</span>';

  const helpSubmenu = document.createElement('ul');
  helpSubmenu.className = 'js-mega-submenu js-submenu';

  const helpSubmenuLi = document.createElement('li');
  const helpRow = document.createElement('div');
  helpRow.className = 'row';

  const helpCol = document.createElement('div');
  helpCol.className = 'col-md-3 js-megamenu-column';
  helpCol.innerHTML = `
    <a href="https://www.columbiagasohio.com/help/help-center">Help Center</a>
    <ul>
      <li><a href="https://www.columbiagasohio.com/help/help-center/contact-us" class="text-dark">Contact Us</a></li>
      <li><a href="https://www.columbiagasohio.com/help/help-center/faqs" class="text-dark">FAQs</a></li>
      <li><a href="https://www.columbiagasohio.com/services/alert-center" class="text-dark">Outages</a></li>
      <li><a href="https://www.columbiagasohio.com/campaigns/mobile-app" class="text-dark">Mobile App</a></li>
    </ul>
  `;

  helpRow.appendChild(helpCol);
  helpSubmenuLi.appendChild(helpRow);
  helpSubmenu.appendChild(helpSubmenuLi);

  helpLi.appendChild(helpLink);
  helpLi.appendChild(helpButton);
  helpLi.appendChild(helpSubmenu);

  // Add event listeners for Help dropdown
  helpButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(helpLi);
  });

  helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(helpLi);
  });

  mainList.appendChild(myAccountLi);
  mainList.appendChild(billsLi);
  mainList.appendChild(servicesLi);
  mainList.appendChild(energyLi);
  mainList.appendChild(safetyLi);
  mainList.appendChild(helpLi);

  mainNav.appendChild(mainList);
  mainNavigation.appendChild(auxNav);
  mainNavigation.appendChild(mainNav);

  // Create user login section (separate from main navigation)
  const userSection = document.createElement('div');
  userSection.className = 'UserSection';

  const userComponent = document.createElement('div');
  userComponent.setAttribute('data-vue-app', 'logged-in-user');
  userComponent.className = 'Login';

  userComponent.innerHTML = `
    <div class="PortalLink loginModalTrigger">
      <div tabindex="-1" aria-hidden="true" class="PortalLink__ready">
        <div class="PortalLink__avatar">
          <a href="https://myaccount.columbiagasohio.com/account/profile">
            ZD
          </a>
        </div> 
        <div class="PortalLink__right">
          <a href="https://myaccount.columbiagasohio.com/account/profile">
            <span class="text-700">My Account</span> 
            <div class="text-gray">Zoey</div>
          </a> 
          <a href="https://myaccount.columbiagasohio.com/logout" class="text-gray PortalLink__logout">Sign Out</a>
        </div>
      </div>
    </div> 
    <div class="LoginButton loginModalTrigger">
      <a href="https://myaccount.columbiagasohio.com/login" class="btn btn--primary m-t-0 LoginButton__text">
        Sign In / Register
      </a> 
      <div class="LoginButton__arrow">
        <svg aria-hidden="true" role="img" class="icon icon-arrow-down">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-arrow-down"></use>
        </svg>
      </div>
    </div> 
    <div class="LoginModal">
      <div class="LoginModal__content">
        <div>
          <p class="text-700 text-sm m-b-0 m-t-10">Email</p> 
          <p>Tyler Schleich <a href="https://myaccount.columbiagasohio.com/logout" class="text-xs text-gray m-l-md-5"> Sign Out</a></p> 
          <a href="https://myaccount.columbiagasohio.com/dashboard" class="btn btn--primary m-t-10 m-b-10">Access My Account</a>
        </div>
      </div>
    </div>
  `;

  userSection.appendChild(userComponent);

  desktopContainer.appendChild(desktopLogo);
  desktopContainer.appendChild(mainNavigation);
  desktopContainer.appendChild(userSection);
  desktopHeader.appendChild(desktopContainer);

  // Mobile Header
  const mobileHeader = document.createElement('div');
  mobileHeader.className = 'SiteHeader SiteHeader--mobile';

  // Mobile always visible section
  const mobileAlwaysVisible = document.createElement('div');
  mobileAlwaysVisible.className = 'SiteHeader__mobile-always-visible';

  // Mobile Logo
  const mobileLogo = document.createElement('a');
  mobileLogo.className = 'image logo';
  mobileLogo.href = '/';

  const mobileLogoImg = document.createElement('img');
  mobileLogoImg.src = 'https://nieus2prodazstg01.blob.core.windows.net/cdr-prod/images/librariesprovider3/design-elements/logos/columbia-gas-of-ohio-logo.png';
  mobileLogoImg.alt = 'Logo';
  mobileLogo.appendChild(mobileLogoImg);

  // Mobile controls (search + menu toggle)
  const mobileControls = document.createElement('div');
  mobileControls.className = 'flex';

  const mobileSearchTrigger = document.createElement('div');
  mobileSearchTrigger.className = 'SearchModalMobileTrigger';

  const mobileSearchIcon = document.createElement('span');
  mobileSearchIcon.className = 'glyphicon glyphicon-search';
  mobileSearchTrigger.appendChild(mobileSearchIcon);

  mobileSearchTrigger.addEventListener('click', openSearchModal);

  const toggleNavigation = document.createElement('div');
  toggleNavigation.className = 'toggle-navigation';

  const openIcon = document.createElement('svg');
  openIcon.setAttribute('aria-hidden', 'true');
  openIcon.className = 'icon icon-open-menu';
  openIcon.setAttribute('role', 'img');
  openIcon.innerHTML = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-open-menu"></use>';

  const openSpan = document.createElement('span');
  openSpan.className = 'icon-open-menu';
  openSpan.textContent = 'menu';

  const closeIcon = document.createElement('svg');
  closeIcon.setAttribute('aria-hidden', 'true');
  closeIcon.className = 'icon icon-close-menu';
  closeIcon.setAttribute('role', 'img');
  closeIcon.innerHTML = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-close-menu"></use>';

  const closeSpan = document.createElement('span');
  closeSpan.className = 'icon-close-menu';
  closeSpan.textContent = 'close';

  toggleNavigation.appendChild(openIcon);
  toggleNavigation.appendChild(openSpan);
  toggleNavigation.appendChild(closeIcon);
  toggleNavigation.appendChild(closeSpan);

  toggleNavigation.addEventListener('click', () => toggleMobileMenu(mobileHeader));

  mobileControls.appendChild(mobileSearchTrigger);
  mobileControls.appendChild(toggleNavigation);

  mobileAlwaysVisible.appendChild(mobileLogo);
  mobileAlwaysVisible.appendChild(mobileControls);

  // Mobile navigation menu
  const mobileNav = document.createElement('div');
  mobileNav.className = 'MobileNav';

  const mobileNavMain = document.createElement('div');
  mobileNavMain.className = 'MobileNav__main';

  const mobileNavList = document.createElement('ul');

  const mobileNavItems = [
    { text: 'My Account', href: 'https://myaccount.columbiagasohio.com/login' },
    { text: 'Bills & Payments', href: 'https://myaccount.columbiagasohio.com/bills' },
    { text: 'Products & Services', href: '/products-and-services' },
    { text: 'Safety', href: '/safety' },
    { text: 'Our Company', href: '/our-company' },
    { text: 'Partner with Us', href: '/partner-with-us' },
    { text: 'Emergency Contact', href: 'tel:+18001234567' },
  ];

  mobileNavItems.forEach((item) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.text;
    li.appendChild(link);
    mobileNavList.appendChild(li);
  });

  mobileNavMain.appendChild(mobileNavList);
  mobileNav.appendChild(mobileNavMain);

  mobileHeader.appendChild(mobileAlwaysVisible);
  mobileHeader.appendChild(mobileNav);

  // Assemble the complete header
  block.appendChild(desktopHeader);
  block.appendChild(mobileHeader);

  // Force close all dropdowns immediately and debug

  // Call our force close function immediately
  forceCloseAllDropdowns();

  // Debug after a short delay
  setTimeout(() => {
    const submenuElements = document.querySelectorAll('.js-mega-submenu');

    submenuElements.forEach((submenu) => {
      window.getComputedStyle(submenu);
    });
  }, 100);

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.js-megamenu')) {
      closeAllDropdowns();
    }
  });

  // Add keyboard event listeners
  window.addEventListener('keydown', handleKeyboardEvents);

  // Handle responsive behavior
  isMobile.addEventListener('change', () => {
    if (!isMobile.matches) {
      // Switching to desktop - close mobile menu
      mobileHeader.classList.remove('is-open');
      document.body.style.overflowY = '';
      // Close dropdowns when switching to desktop
      closeAllDropdowns();
    }
  });
}
