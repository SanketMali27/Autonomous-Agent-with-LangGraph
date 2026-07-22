import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Let the browser add the multipart boundary for file uploads.
        // The instance default is JSON, which prevents FastAPI from reading
        // UploadFile fields when it is left on a FormData request.
        if (typeof FormData !== "undefined" && config.data instanceof FormData) {
            config.headers.delete("Content-Type");
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = error.config?.url ?? "";
        const isAuthRequest = requestUrl.startsWith("/auth/");

        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem("token");
            if (window.location.pathname !== "/login") {
                window.location.assign("/login");
            }
        }

        return Promise.reject(error);
    }
);

export default api;
