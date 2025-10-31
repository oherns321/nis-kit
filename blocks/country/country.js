import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  gql,
// eslint-disable-next-line import/no-unresolved
} from 'https://esm.sh/@apollo/client/core';

async function getCountryData(code = 'US') {
  const client = new ApolloClient({
    link: new HttpLink({ uri: 'https://countries.trevorblades.com/graphql' }),
    cache: new InMemoryCache(),
  });

  const query = gql`
    query GetCountry($code: ID!) {
      country(code: $code) {
        name
        native
        capital
        emoji
        currency
        languages {
          code
          name
        }
      }
    }
  `;

  const { data } = await client.query({
    query,
    variables: { code },
  });

  const { country } = data;

  return {
    name: country.name,
    native: country.native,
    currency: country.currency,
    flag: country.emoji,
    capital: country.capital,
    languages: country.languages.map((lang) => ({
      code: lang.code,
      name: lang.name,
    })),
  };
}

function createCountryHTML(countryData) {
  const languagesHTML = countryData.languages
    .map((lang) => `<li>${lang.name} (${lang.code})</li>`)
    .join('');

  return `
    <div class="country">
      <div class="country-header">
        <span class="country-emoji">${countryData.flag}</span>
        <h2 class="country-name">${countryData.name}</h2>
        <span class="country-native">(${countryData.native})</span>
      </div>

      <div class="country-info">
        <p><strong>Capital:</strong> ${countryData.capital}</p>
        <p><strong>Currency:</strong> ${countryData.currency}</p>
      </div>

      <div class="country-languages">
        <strong>Languages:</strong>
        <ul>
          ${languagesHTML}
        </ul>
      </div>
    </div>
  `;
}

function createLoadingHTML() {
  return `
    <div class="country">
      <div class="country-header">
        <span class="country-emoji">🔄</span>
        <h2 class="country-name">Loading country data...</h2>
      </div>
      <div class="country-info">
        <p>Please wait while we fetch the latest information.</p>
      </div>
    </div>
  `;
}

function createErrorHTML() {
  return `
    <div class="country">
      <div class="country-header">
        <span class="country-emoji">⚠️</span>
        <h2 class="country-name">Error loading country data</h2>
      </div>
      <div class="country-info">
        <p>Failed to fetch country information. Please try again later.</p>
      </div>
    </div>
  `;
}
/**
 * Decorates the country block with country data
 * @param {Element} block - The country block element
 */
export default async function decorate(block) {
  // Extract country code from block content
  let countryCode = 'US'; // Default
  try {
    const countryDiv = block.querySelector('.country.block p');
    if (countryDiv && countryDiv.textContent.trim()) {
      countryCode = countryDiv.textContent.trim();
    }
  } catch (error) {
    // Use default country code if extraction fails
  }

  // Show loading state immediately
  block.innerHTML = createLoadingHTML();

  // Fetch and display country data
  try {
    const countryData = await getCountryData(countryCode);
    block.innerHTML = createCountryHTML(countryData);
  } catch (error) {
    block.innerHTML = createErrorHTML();
  }
}
