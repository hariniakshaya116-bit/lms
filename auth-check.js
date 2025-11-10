(function () {
  // --- Detect if current page belongs to Educator or Student ---
  const isEducator =
    window.location.pathname.includes("index-2") ||
    window.location.pathname.includes("educator") ||
    window.location.href.includes("teacher");

  // --- Cognito config for both sides ---
  const cognitoConfig = {
    student: {
      domain: "https://us-east-1tj9jinyqx.auth.us-east-1.amazoncognito.com",
      clientId: "7cdmtqipvq30pdoe17hv7h6n0s",
      redirectUri: "https://main.dijffme8w1boe.amplifyapp.com/index-1.html",
    },
    educator: {
      domain: "https://us-east-1dddy9g5oo.auth.us-east-1.amazoncognito.com",
      clientId: "1umutsnskbkrdl23mk6jun0kdv",
      redirectUri: "https://main.dijffme8w1boe.amplifyapp.com/index-2.html",
    },
  };

  const config = isEducator ? cognitoConfig.educator : cognitoConfig.student;

  // --- Step 1: Check if code is in URL ---
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  // --- Step 2: If code exists, store it and clean URL ---
  if (code) {
    localStorage.setItem("auth_code", code);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // --- Step 3: Get code from local storage (if already logged in) ---
  const storedCode = localStorage.getItem("auth_code");

  // --- Step 4: If no code, redirect to Cognito Hosted UI login ---
  if (!storedCode) {
    const loginUrl = https://main.dijffme8w1boe.amplifyapp.com;
    window.location.href = loginUrl;
    return;
  }

  // --- Step 5: Prevent back button after logout ---
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
    history.go(1);
  };
})();
