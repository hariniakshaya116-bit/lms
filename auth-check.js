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

  // --- Step 3: Get code from local storage ---
  const storedCode = localStorage.getItem("auth_code");

  // --- Step 4: Handle login protection ---
  const isMainPage =
    window.location.pathname.includes("index-1.html") ||
    window.location.pathname.includes("index-2.html") ||
    window.location.pathname === "/" ||
    window.location.pathname === "/index.html";

  if (!storedCode) {
    // 🚫 No auth_code → block access to inner pages
    if (!isMainPage) {
      const redirectUrl = isEducator
        ? "https://main.dijffme8w1boe.amplifyapp.com/index-2.html"
        : "https://main.dijffme8w1boe.amplifyapp.com/index-1.html";
      window.location.href = redirectUrl;
      return;
    }
  } else {
    // ✅ Already logged in → prevent being sent back to login page
    if (isMainPage) {
      // Example: redirect logged-in users away from login screen
      const homeUrl = isEducator
        ? "https://main.dijffme8w1boe.amplifyapp.com/educator-dashboard.html"
        : "https://main.dijffme8w1boe.amplifyapp.com/student-dashboard.html";
      window.location.href = homeUrl;
      return;
    }
  }

  // --- Step 5: Prevent back button after logout ---
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
    history.go(1);
  };
})();
