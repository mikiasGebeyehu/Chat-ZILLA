import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? 'https://chat-zilla.onrender.com/' : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // if you need to send cookies
});

// Optional: Add interceptors for requests
api.interceptors.request.use(
    (config) => {
        // Example: Attach token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Optional: Add interceptors for responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally
        return Promise.reject(error);
    }
);

export default api;