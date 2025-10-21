export async function getConfigFromSession() {
  const configURL = `${window.location.origin}/aem-code-kit-config.json`;

  try {
    const configJSON = window.sessionStorage.getItem('aem-code-kit-config');
    if (!configJSON) {
      throw new Error('No config in session storage');
    }

    const parsedConfig = JSON.parse(configJSON);
    if (
      !parsedConfig[':expiry']
      || parsedConfig[':expiry'] < Math.round(Date.now() / 1000)
    ) {
      throw new Error('Config expired');
    }
    return parsedConfig;
  } catch (error) {
    let configJSON = {};

    try {
      const response = await fetch(configURL);

      if (response && response.ok) {
        configJSON = await response.json();
      }
    } catch (err) {
      configJSON = {};
    }

    configJSON[':expiry'] = Math.round(Date.now() / 1000) + 7200;
    window.sessionStorage.setItem('aem-code-kit-config', JSON.stringify(configJSON));
    return configJSON;
  }
}

export async function getConfigValue(key) {
  const config = await getConfigFromSession();
  for (let i = 0; i < config.data.length; i += 1) {
    if (config.data[i].Name.toLowerCase() === key.toLowerCase()) {
      return config.data[i].Value;
    }
  }
  return null;
}

export async function initializeCodeKit() {
  return getConfigFromSession();
}
