export default async function decorate(block) {
  const blockChildren = [...block.children];

  // Extract content from the original block structure
  let backgroundImage = '';
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

  // Create the Columbia Gas banner structure
  const bannerHTML = `
    <!-- Mobile Banner -->
    <div class="login-banner-mobile" style="background-image: url('${backgroundImage}');">
      <div class="chatnow__content">
        <div class="banner-title">${title}</div>
        <div class="banner-summary">${summary}</div>
        <a href="${ctaLink}" aria-label="${ctaText}" class="btn m-t-10 btn-banner-cta">${ctaText}</a>
      </div>
    </div>

    <!-- Desktop Banner -->
    <div class="login-banner-desktop" style="background-image: url('${backgroundImage}');">
      <div class="login-banner__container">
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
            <form id="banner-login" action="#" method="post">
              <div class="form-field">
                <label for="username">
                  Email
                  <input type="email" name="username" id="username" placeholder="Email" class="w-100">
                </label>
                <a href="#" class="form-field__help-link form-field__help-link--top-right">Forgot email?</a>
              </div>
              <div class="form-field form-field--password">
                <label for="password">
                  Password
                  <span class="relative">
                    <input type="password" name="password" id="password" placeholder="Password" class="w-100">
                    <button title="Show Password" type="button" class="show-password">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                  </span>
                </label>
                <a href="#" class="form-field__help-link form-field__help-link--top-right">Forgot password?</a>
              </div>
              <div class="form-field">
                <label for="rememberme">
                  <input type="checkbox" name="rememberme" id="rememberme" value="true" checked>
                  <span class="text-400 color-blue">Remember my email</span>
                </label>
              </div>
              <div class="form-field">
                <input type="submit" value="Sign In" class="btn btn-primary w-100 m-t-0">
              </div>
              <div class="form-field text-sm text-center">
                <br>
                <div class="text-medium color-grey m0">Don't have an online account?</div>
                <div class="text-sm">
                  <a href="#" class="color-blue">Register an account</a>
                  or
                  <a href="#" class="color-blue">Pay without signing in</a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  block.innerHTML = bannerHTML;

  // Add password show/hide functionality
  const showPasswordBtn = block.querySelector('.show-password');
  const passwordInput = block.querySelector('#password');

  if (showPasswordBtn && passwordInput) {
    showPasswordBtn.addEventListener('click', function passwordToggle(e) {
      e.preventDefault();
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);

      // Update icon (optional - you could swap the SVG here)
      const icon = this.querySelector('svg path');
      if (type === 'text') {
        // Show "hide" icon
        icon.setAttribute('d', 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92 1.41-1.41L3.51 2.3 2.1 3.71l2.8 2.8C3.9 8.26 2.73 9.89 2 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l2.92 2.92 1.41-1.41L12 7z');
      } else {
        // Show "show" icon
        icon.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
      }
    });
  }
}
