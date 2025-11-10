/* auth-check.js
   OAuth2 Authorization Code + PKCE client for Amazon Cognito Hosted UI
   - Stores tokens in localStorage: access_token, id_token, refresh_token, expires_at
   - Automatically refreshes access_token when expired (using refresh_token)
   - Provides login(), logout(), getAccessToken(), ensureAuth(), isAuthenticated()
   - Use ensureAuth() on pages that require login (redirects to login if not authenticated)
   - Add Authorization: Bearer <access_token> to your API requests
*/

/* ---------- CONFIG: update these values for your environment ---------- */
const cognitoConfig = {
  // choose student vs educator by setting isEducator flag in your pages (or detect by path)
  student: {
    domain: "https://us-east-1tj9jinyqx.auth.us-east-1.amazoncognito.com",
    clientId: "7cdmtqipvq30pdoe17hv7h6n0s",
    redirectUri: "https://main.dijffme8w1boe.amplifyapp.com/index-1.html",
    scope: "openid profile email", // adjust scopes as needed
  },
  educator: {
    domain: "https://us-east-1dddy9g5oo.auth.us-east-1.amazoncognito.com",
    clientId: "1umutsnskbkrdl23mk6jun0kdv",
    redirectUri: "https://main.dijffme8w1boe.amplifyapp.com/index-2.html",
    scope: "openid profile email",
  },
};
/* ---------------------------------------------------------------------- */

(function () {
  // detect which config to use
  const isEducator =
    window.location.pathname.includes("index-2") ||
    window.location.pathname.includes("educator") ||
    window.location.href.includes("teacher");
  const CONFIG = isEducator ? cognitoConfig.educator : cognitoConfig.student;

  // Storage keys
  const LS_KEYS = {
    CODE_VERIFIER: "pkce_code_verifier",
    AUTH_STATE: "pkce_auth_state",
    TOKENS: "auth_tokens_v1",
  };

  // Utility: base64url encode
  function base64urlEncode(buffer) {
    let s = btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return s;
  }

  // Generate a random string (code verifier)
  function generateCodeVerifier(length = 128) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    // map bytes -> ascii letters/digits to be friendly (not required)
    return base64urlEncode(array).slice(0, 128);
  }

  // Generate code challenge from verifier (SHA-256)
  async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return base64urlEncode(digest);
  }

  // Generate random state
  function generateState() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return base64urlEncode(array);
  }

  // Save tokens to localStorage
  function saveTokens(tokenObj) {
    // tokenObj should contain access_token, id_token, refresh_token (optional), expires_in (seconds)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = tokenObj.expires_in ? now + Number(tokenObj.expires_in) : now + 3600;
    const stored = {
      access_token: tokenObj.access_token,
      id_token: tokenObj.id_token,
      refresh_token: tokenObj.refresh_token, // may be undefined if response didn't include
      expires_at: expiresAt,
    };
    localStorage.setItem(LS_KEYS.TOKENS, JSON.stringify(stored));
  }

  function getStoredTokens() {
    const raw = localStorage.getItem(LS_KEYS.TOKENS);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function clearStoredTokens() {
    localStorage.removeItem(LS_KEYS.TOKENS);
  }

  // Start login: redirect to Cognito Hosted UI authorize endpoint with PKCE
  async function login() {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    localStorage.setItem(LS_KEYS.CODE_VERIFIER, codeVerifier);
    localStorage.setItem(LS_KEYS.AUTH_STATE, state);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CONFIG.clientId,
      redirect_uri: CONFIG.redirectUri,
      scope: CONFIG.scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const authUrl = `${CONFIG.domain}/oauth2/authorize?${params.toString()}`;
    window.location.href = authUrl;
  }

  // Called on redirect back to your app with ?code=...&state=...
  async function handleRedirectCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const returnedState = urlParams.get("state");
    if (!code) return false;

    const savedState = localStorage.getItem(LS_KEYS.AUTH_STATE);
    const codeVerifier = localStorage.getItem(LS_KEYS.CODE_VERIFIER);

    // Basic validation
    if (!savedState || !codeVerifier || savedState !== returnedState) {
      console.error("Invalid PKCE state or missing code verifier");
      return false;
    }

    // Clean up state in URL
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
      // Exchange code for tokens
      const tokenUrl = `${CONFIG.domain}/oauth2/token`;
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CONFIG.clientId,
        code: code,
        redirect_uri: CONFIG.redirectUri,
        code_verifier: codeVerifier,
      });

      const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Token exchange failed: ${res.status} ${text}`);
      }

      const tokenData = await res.json();
      saveTokens(tokenData);

      // remove verifier and state
      localStorage.removeItem(LS_KEYS.CODE_VERIFIER);
      localStorage.removeItem(LS_KEYS.AUTH_STATE);

      return true;
    } catch (err) {
      console.error("handleRedirectCallback error:", err);
      return false;
    }
  }

  // Refresh tokens using refresh_token
  async function refreshAccessToken() {
    const tokens = getStoredTokens();
    if (!tokens || !tokens.refresh_token) return false;
    try {
      const tokenUrl = `${CONFIG.domain}/oauth2/token`;
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: CONFIG.clientId,
        refresh_token: tokens.refresh_token,
      });

      const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!res.ok) {
        console.warn("Failed to refresh token, clearing stored tokens");
        clearStoredTokens();
        return false;
      }

      const tokenData = await res.json();
      // tokenData may or may not return a new refresh_token; preserve old if not returned
      if (!tokenData.refresh_token) tokenData.refresh_token = tokens.refresh_token;
      saveTokens(tokenData);
      return true;
    } catch (err) {
      console.error("refreshAccessToken error:", err);
      clearStoredTokens();
      return false;
    }
  }

  // Return a valid access token (refreshes automatically if expired)
  async function getAccessToken() {
    const tokens = getStoredTokens();
    const now = Math.floor(Date.now() / 1000);
    if (!tokens) return null;

    // If token expires in <60 seconds, try refresh
    if (tokens.expires_at - now < 60) {
      const ok = await refreshAccessToken();
      if (!ok) return null;
      return getStoredTokens().access_token;
    }

    return tokens.access_token;
  }

  // Check if user is currently authenticated
  function isAuthenticated() {
    const tokens = getStoredTokens();
    if (!tokens || !tokens.access_token) return false;
    const now = Math.floor(Date.now() / 1000);
    return tokens.expires_at > now;
  }

  // Ensure auth: if not logged-in -> start login flow
  async function ensureAuth() {
    // If we just returned from Cognito with a code, handle it first
    await handleRedirectCallback();

    if (!isAuthenticated()) {
      await login();
      return false; // we redirected
    }
    return true;
  }

  // Logout: clear local tokens and redirect to Cognito logout endpoint to invalidate session
  function logout() {
    clearStoredTokens();
    // build logout url
    const params = new URLSearchParams({
      client_id: CONFIG.clientId,
      logout_uri: CONFIG.redirectUri,
    });
    const logoutUrl = `${CONFIG.domain}/logout?${params.toString()}`;
    window.location.href = logoutUrl;
  }

  // Helper to add Authorization header to fetch
  async function authFetch(url, options = {}) {
    const token = await getAccessToken();
    if (!options.headers) options.headers = {};
    if (token) options.headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, options);
  }

  // Expose functions globally under window.Auth
  window.Auth = {
    login,
    logout,
    getAccessToken,
    authFetch,
    ensureAuth,
    isAuthenticated,
    handleRedirectCallback, // useful to call manually if needed
  };

  // --- OPTIONAL: Prevent back navigation only on login pages (do not block app pages) ---
  try {
    if (
      window.location.pathname.includes("login") ||
      window.location.pathname.includes("index-1.html") ||
      window.location.pathname.includes("index-2.html")
    ) {
      history.pushState(null, null, location.href);
      window.onpopstate = function () {
        history.go(1);
      };
    }
  } catch (e) {
    console.warn("Back prevention not applied:", e);
  }

  // If this page is the redirect URI, handle tokens immediately
  (async () => {
    await handleRedirectCallback();
    // If tokens exist after callback, you can redirect to a safe page (e.g. courses list)
    const tokens = getStoredTokens();
    if (tokens && window.location.pathname === new URL(CONFIG.redirectUri).pathname) {
      // example: after successful login send to courses page
      // window.location.href = "/courses.html";
    }
  })();
})();
