import axios from 'axios';
import logger from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Axios instance dengan konfigurasi default untuk API
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor - menambahkan token Authorization ke setiap request
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor - handle errors globally dengan logging dan transformation
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Global error logging untuk debugging (hanya di development)
        if (error.response) {
            logger.error('[API Error]', {
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                status: error.response?.status,
                message: error.response?.data?.message || 'Unknown error'
            });
        } else if (error.request) {
            logger.error('[Network Error]', 'No response received from server');
        } else {
            logger.error('[Request Error]', error.message);
        }

        // Transform error untuk consistency di seluruh aplikasi
        const transformedError = {
            message: error.response?.data?.message || error.message || 'Terjadi kesalahan',
            status: error.response?.status,
            errors: error.response?.data?.errors || {},
            originalError: error
        };

        return Promise.reject(transformedError);
    }
);

export default apiClient;
