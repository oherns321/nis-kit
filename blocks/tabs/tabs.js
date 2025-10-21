// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  // Create container wrapper for proper styling
  const container = document.createElement('div');
  container.className = 'tabs-container';

  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and get tab content
  const tabs = [...block.children].map((child) => child.firstElementChild);

  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;

    button.innerHTML = tab.innerHTML;

    // Move instrumentation if available
    if (typeof moveInstrumentation === 'function') {
      moveInstrumentation(tab.parentElement, button);
    }

    button.setAttribute('aria-controls', `tabcards-${id}`);
    button.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    button.setAttribute('tabindex', i === 0 ? '0' : '-1');
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    button.addEventListener('click', () => {
      // Update tab states
      tablist.querySelectorAll('button').forEach((btn, btnIndex) => {
        btn.setAttribute('aria-selected', btnIndex === i ? 'true' : 'false');
        btn.setAttribute('tabindex', btnIndex === i ? '0' : '-1');
      });

      // Show/hide corresponding tab-content sections using classes
      document.querySelectorAll('.section.tab-content').forEach((section, sectionIndex) => {
        if (sectionIndex === i) {
          section.classList.remove('hidden');
          section.setAttribute('aria-hidden', 'false');
        } else {
          section.classList.add('hidden');
          section.setAttribute('aria-hidden', 'true');
        }
      });
    });

    tablist.append(button);
    tab.remove();

    // Move instrumentation if available
    if (typeof moveInstrumentation === 'function' && button.querySelector('p')) {
      moveInstrumentation(button.querySelector('p'), null);
    }
  });

  // Wrap everything in the container
  container.append(tablist);

  // Initialize: Show first tab-content section, hide others
  document.querySelectorAll('.section.tab-content').forEach((section, index) => {
    if (index === 0) {
      section.classList.remove('hidden');
      section.setAttribute('aria-hidden', 'false');
    } else {
      section.classList.add('hidden');
      section.setAttribute('aria-hidden', 'true');
    }
  });

  // Clear block content and add container
  block.textContent = '';
  block.append(container);
}
