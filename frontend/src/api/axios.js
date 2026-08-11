import axios from "axios";

const baseURL = "https://crm-ce6l.vercel.app";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let queue = [];

const processQueue = (error) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/me");

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // No hard redirect here — that caused the reload loop.
        // AuthContext already sets user to null on failure, and
        // ProtectedRoute redirects to /login based on that state.
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
