// /scripts/auth.js
// eslint-disable-next-line func-names
(function () {
  const cfg = window.EDS_AUTH || {};
  const clientId = cfg?.clientId; // fixed: no bad destructure
  // eslint-disable-next-line no-console
  if (!clientId) console.warn('[auth] Missing EDS_AUTH.clientId');

  // --- state must be declared before anything that might touch it ---
  let state = null; // { token, name, email, picture, domain, sub } | null

  // simple (optional) client-only session
  const persist = !!cfg.persistSession;
  const key = 'eds_auth_token';
  const save = (token) => persist && sessionStorage.setItem(key, token);
  const load = () => (persist ? sessionStorage.getItem(key) : null);
  const clear = () => persist && sessionStorage.removeItem(key);

  // decode JWT payload (no signature verification here)
  const decode = (token) => JSON.parse(atob(token.split('.')[1]));

  // cross-tab sync
  const channel = new BroadcastChannel('eds-auth');
  const emit = (detail) => {
    document.dispatchEvent(new CustomEvent('eds-auth:change', { detail }));
    // BroadcastChannel does not echo to the same context
    channel.postMessage(detail);
  };
  channel.onmessage = (e) => {
    state = e.data || null;
    document.dispatchEvent(new CustomEvent('eds-auth:change', { detail: state }));
  };

  // global callback for Google Identity Services
  window.handleCredentialResponse = (response) => {
    try {
      const token = response.credential;
      const p = decode(token);
      state = {
        token,
        name: p.name,
        email: p.email,
        picture: p.picture,
        domain: p.hd || null,
        sub: p.sub,
      };
      save(token);
      emit(state);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[auth] Failed to parse ID token', e);
    }
  };

  // Wait for GSI to be ready before initializing/rendering
  const gsiReady = new Promise((resolve) => {
    if (window.google?.accounts?.id) {
      resolve();
      return; // early exit, still fine
    }

    let timeout; // declare first so it's visible inside the interval
    const iv = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(iv);
        clearTimeout(timeout);
        resolve();
      }
    }, 50);

    // optional: timeout guard
    timeout = setTimeout(() => {
      clearInterval(iv);
    }, 10000);
  });

  function renderButton(container, options = {}) {
    gsiReady.then(() => {
      try {
        const gsi = window.google?.accounts?.id; // avoid undeclared global
        if (!gsi) {
          // eslint-disable-next-line no-console
          console.warn('[auth] GIS not available');
          return;
        }

        gsi.initialize({
          client_id: clientId,
          callback: window.handleCredentialResponse,
        });

        gsi.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          ...options,
        });

        if (options.oneTap) gsi.prompt();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[auth] renderButton error', e);
      }
    });
  }

  function signOut() {
    state = null;
    clear();
    emit(null);
  }

  function getUser() {
    if (state) return state;
    const token = load();
    if (!token) return null;
    try {
      const p = decode(token);
      state = {
        token,
        name: p.name,
        email: p.email,
        picture: p.picture,
        domain: p.hd || null,
        sub: p.sub,
      };
      return state;
    } catch {
      clear();
      return null;
    }
  }

  function onChange(fn) {
    // fire immediately
    try {
      fn(getUser());
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[auth] onChange immediate call failed', err);
    }
    const handler = (e) => fn(e.detail);
    document.addEventListener('eds-auth:change', handler);
    return () => document.removeEventListener('eds-auth:change', handler);
  }

  // Expose minimal API
  window.Auth = {
    renderButton,
    signOut,
    getUser,
    onChange,
  };

  // hydrate once on load
  getUser();
}());
