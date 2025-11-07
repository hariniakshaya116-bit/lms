// auth-check.js

(function () {
  // --- Identify if current page belongs to educator or student ---
  const isEducator =
    window.location.pathname.includes("index-2") ||
    window.location.pathname.includes("educator") ||
    window.location.href.includes("teacher");

  // --- Cognito Configuration for both user pools ---
  const cognitoConfig = {
    student: {
      domain: "https://us-east-1tj9jinyqx.auth.us-east-1.amazoncognito.com",
      clientId: "7cdmtqipvq30pdoe17hv7h6n0s",
      redirectUri: "https://main.dijffme8w1boe.amplifyapp.com/index.html",
      
    },
    educator: {
      domain: "https://us-east-1dddy9g5oo.auth.us-east-1.amazoncognito.com",
      clientId: "1umutsnskbkrdl23mk6jun0kdv",
      redirectUri: "https://main.dijffme8w1boe.amplifyapp.com/index.html",
    },
  };

  // --- Choose the right configuration based on user type ---
  const config = isEducator ? cognitoConfig.educator : cognitoConfig.student;

  // --- Get ID Token from local storage ---
  const token = localStorage.getItem("id_token");

  // --- If token not found, redirect to Cognito Hosted UI ---
  if (!token) {
    const loginUrl = 'https://main.dijffme8w1boe.amplifyapp.com/index.html';
    window.location.href = loginUrl;
    return;
  }

  // --- Prevent browser back after logout ---
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
    history.go(1);
  };
})();
