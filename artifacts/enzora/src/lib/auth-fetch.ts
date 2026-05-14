import { setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY = "enzora_admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

setAuthTokenGetter(getAdminToken);

// Global 401 interceptor: clear the token and bounce to /admin/login
// whenever any admin request comes back unauthorized.
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const response = await originalFetch(input, init);
  if (response.status === 401) {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    if (url.includes("/api/admin/") && getAdminToken()) {
      clearAdminToken();
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      if (!window.location.pathname.endsWith("/admin/login")) {
        window.location.href = `${base}/admin/login`;
      }
    }
  }
  return response;
};
