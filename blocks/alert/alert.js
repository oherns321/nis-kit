import { isAuthorEnvironment, moveInstrumentation } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/aem.js';

/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  // Note: Hard-coded for demo purposes
  const aemauthorurl = 'https://author-p7906-e1488805.adobeaemcloud.com';
  const aempublishurl = 'https://publish-p7906-e1488805.adobeaemcloud.com';
  const now = new Date().toISOString();
  const persistedquery = `/graphql/execute.json/NISource/GetLatestAlert;now=${now}`;

  block.innerHTML = '';

  const isAuthor = isAuthorEnvironment();
  const url = window?.location?.origin?.includes('author')
    ? `${aemauthorurl}${persistedquery}`
    : `${aempublishurl}${persistedquery}`;
  const options = { credentials: 'include' };

  const cfReq = await fetch(url, options)
    .then((response) => response.json())
    .then((contentfragment) => {
      let data = '';
      if (contentfragment.data) {
        data = contentfragment?.data?.alertList?.items[0] || [];
      }
      return data;
    });
  // eslint-disable-next-line no-underscore-dangle
  const itemId = `urn:aemconnection:${cfReq?._path}/jcr:content/data/${cfReq?._variation}`;

  block.setAttribute('data-aue-type', 'container');
  block.innerHTML = `
  <div class='block' data-aue-resource=${itemId} data-aue-label='alert' data-aue-type='reference' data-aue-filter='cf'>
    <div class='alert-content'>
      <div class="notification-bar__icon">
        <span class="icon icon-success"></span>
      </div>
      <div class="alert-text-content">
        <h2 data-aue-prop='title' data-aue-label='Title' data-aue-type='text' class='title'>${
  cfReq?.title
}</h2>
        <p data-aue-prop='message' data-aue-label='Message' data-aue-type='richtext' class='message'>${
  cfReq?.message?.html
}</p>
      </div>
    </div>
  </div>
`;

  // Decorate icons to convert span.icon elements to img elements
  decorateIcons(block);

  if (!isAuthor) {
    moveInstrumentation(block, null);
    block.querySelectorAll('*').forEach((elem) => moveInstrumentation(elem, null));
  }
}
