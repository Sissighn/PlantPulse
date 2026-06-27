const CSRF_COOKIE_NAMES = ["__Host-plantpulse_csrf", "plantpulse_csrf"];
const UNSAFE_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);

function readCookie(name) {
  const cookies = document.cookie ? document.cookie.split(";") : [];
  const prefix = `${name}=`;
  const cookie = cookies
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function readCsrfToken() {
  for (const name of CSRF_COOKIE_NAMES) {
    const token = readCookie(name);
    if (token) return token;
  }

  return null;
}

export function apiFetch(input, init = {}) {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (UNSAFE_METHODS.has(method) && !headers.has("X-CSRF-Token")) {
    const csrfToken = readCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  return fetch(input, {
    ...init,
    credentials: init.credentials || "include",
    headers,
  });
}
