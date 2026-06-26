import axios from "axios";

const baseURL = `${process.env.REACT_APP_BACKEND_URL}/api/management`;
export const managementApi = axios.create({ baseURL, timeout: 20000 });

managementApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("lumi.management.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

managementApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes("auth/login") && 
      !originalRequest.url?.includes("auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return managementApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem("lumi.management.refreshToken");

      try {
        const res = await axios.post(`${baseURL}/auth/refresh`, {
          refresh_token: storedRefreshToken,
        });

        const { accessToken, refreshToken, user } = res.data;

        localStorage.setItem("lumi.management.token", accessToken);
        if (refreshToken) {
          localStorage.setItem("lumi.management.refreshToken", refreshToken);
        }
        localStorage.setItem("lumi.management.user", JSON.stringify(user));

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        isRefreshing = false;

        return managementApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem("lumi.management.token");
        localStorage.removeItem("lumi.management.refreshToken");
        localStorage.removeItem("lumi.management.user");
        window.dispatchEvent(new Event("management-auth-expired"));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const apiError = (error) => {
  const detail = error.response?.data?.detail;
  if (!detail) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map(d => d.msg || d).join(", ");
  }
  if (typeof detail === "object") {
    return JSON.stringify(detail);
  }
  return "Something went wrong. Please try again.";
};
