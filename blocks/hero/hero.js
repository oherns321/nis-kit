import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const blockChildren = [...block.children];

  // Extract content from the original block structure
  let backgroundImage = '';
  let backgroundImageElement = null;
  let title = '';
  let summary = '';
  let ctaText = 'Learn More';
  let ctaLink = '#';

  // Parse the block content
  if (blockChildren.length > 0) {
    blockChildren.forEach((row, index) => {
      const cells = [...row.children];

      if (index === 0 && cells[0]) {
        // First row - check for background image
        const img = cells[0].querySelector('img');
        if (img && img.src) {
          backgroundImage = img.src;
          backgroundImageElement = img;
        }

        // Also check for text content in first row
        const textContent = cells[0].textContent.trim();
        if (textContent && !img) {
          title = textContent;
        }
      } else if (index === 1 && cells[0]) {
        // Second row - title or summary
        const content = cells[0].textContent.trim();
        if (!title) {
          title = content;
        } else {
          summary = content;
        }
      } else if (index === 2 && cells[0]) {
        // Third row - summary if not set
        if (!summary) {
          summary = cells[0].textContent.trim();
        }
      }

      // Look for links in any row
      const link = row.querySelector('a');
      if (link) {
        ctaText = link.textContent.trim() || ctaText;
        ctaLink = link.href || ctaLink;
      }
    });
  }

  // Default content if none provided
  if (!title) {
    title = 'BREAK FREE FROM THE MAILBOX – YOUR BILL IS GOING PLACES';
  }
  if (!summary) {
    summary = 'With our Paperless Billing program, you\'re free to explore without being tied to a mailbox. Take your bill on the go and give your mailbox a break.';
  }
  if (!backgroundImage) {
    backgroundImage = '/icons/placeholder-bg.jpg'; // You can replace with actual default image
  }

  // Clear the block content
  block.innerHTML = '';

  // Create mobile banner
  const mobileBanner = document.createElement('div');
  mobileBanner.className = 'login-banner-mobile';

  // Create desktop banner
  const desktopBanner = document.createElement('div');
  desktopBanner.className = 'login-banner-desktop';

  // Add optimized background images if available
  if (backgroundImage) {
    // Create optimized picture elements for both banners
    const mobileOptimizedPic = createOptimizedPicture(
      backgroundImage,
      'Hero background image',
      true, // eager loading for hero images
      [{ width: '750' }], // mobile breakpoint
    );
    mobileOptimizedPic.className = 'hero-background-image';

    const desktopOptimizedPic = createOptimizedPicture(
      backgroundImage,
      'Hero background image',
      true, // eager loading for hero images
      [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }], // responsive breakpoints
    );
    desktopOptimizedPic.className = 'hero-background-image';

    // Move instrumentation from original image if available
    if (backgroundImageElement) {
      moveInstrumentation(backgroundImageElement, mobileOptimizedPic.querySelector('img'));
      moveInstrumentation(backgroundImageElement, desktopOptimizedPic.querySelector('img'));
    }

    mobileBanner.appendChild(mobileOptimizedPic);
    desktopBanner.appendChild(desktopOptimizedPic);
  }

  // Create mobile content
  const mobileContent = document.createElement('div');
  mobileContent.className = 'chatnow__content';
  mobileContent.innerHTML = `
    <div class="banner-title">${title}</div>
    <div class="banner-summary">${summary}</div>
    <a href="${ctaLink}" aria-label="${ctaText}" class="btn m-t-10 btn-banner-cta">${ctaText}</a>
  `;
  mobileBanner.appendChild(mobileContent);

  // Create desktop content
  const desktopContainer = document.createElement('div');
  desktopContainer.className = 'login-banner__container';
  desktopContainer.innerHTML = `
    <div class="login-banner__left">
      <div class="login-banner__left-banner chatnow__content">
        <div class="banner-title">${title}</div>
        <div class="banner-summary">${summary}</div>
        <a href="${ctaLink}" aria-label="${ctaText}" class="btn m-t-10 btn-banner-cta">${ctaText}</a>
      </div>
    </div>
    <div class="login-banner__right login-banner-container bg-white">
      <div class="login-banner__form">
        <div class="form-headline p-b-0">
          <h1 class="form-headline__title">Manage Your Account</h1>
        </div>
        <div data-vue-app="logged-in-user">
        <!----> <div>
          <div class="login-banner__welcome">
            <div class="test m-t-30 m-b-100">
            <p class="text-700 text-sm m-b-0 m-t-10">Email</p>
            <p>Zoey <a href="https://myaccount.columbiagasohio.com/logout" class="text-xs text-300 text-gray m-l-md-5"> Sign Out</a></p> 
            <a href="https://myaccount.columbiagasohio.com/dashboard" class="btn btn--primary m-t-10 m-b-10">Access My Account</a></div></div></div></div>
      </div>
    </div>
  `;
  desktopBanner.appendChild(desktopContainer);

  // Add both banners to the block
  block.appendChild(mobileBanner);
  block.appendChild(desktopBanner);
}
