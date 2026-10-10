import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("autoglow_token");

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("API REQUEST:", `${config.baseURL}${config.url}`);

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    console.log(
      "API RESPONSE:",
      response.status,
      `${response.config.baseURL}${response.config.url}`,
    );

    return response;
  },
  (error) => {
    console.error(
      "API ERROR:",
      error.response?.status,
      error.response?.data || error.message,
    );

    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("autoglow_token");
      localStorage.removeItem("autoglow_role");
    }

    return Promise.reject(error);
  },
);

export default api;