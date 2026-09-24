import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

let onUnauthorized = null;

export function setOnUnauthorized(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthCheck = url.includes("/auth/me");
      if (!isAuthCheck) {
        if (typeof onUnauthorized === "function") {
          onUnauthorized(error);
        } else if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
