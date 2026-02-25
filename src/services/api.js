import axios from "axios";

/**
 * @module api
 * @description Instancia de Axios configurada con la URL base de la API y los interceptores
 * de autenticación JWT. Agrega automáticamente el token Bearer en cada petición y redirige
 * al login cuando el servidor devuelve un error 401 (no autorizado).
 */
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5230",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Solo redirigir si NO estamos en la página de login
            if (!window.location.pathname.includes("/login")) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;