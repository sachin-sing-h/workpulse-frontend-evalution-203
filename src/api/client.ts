import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor to add the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wp_token');
    if (token) {
      const logMsg = `🔑 JWT Token: ${token}`;
      if ((window as any).electron?.log) {
        (window as any).electron.log(logMsg);
      } else {
        console.log(logMsg);
      }
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const logMsg = '⚠️  No JWT token found in localStorage';
      if ((window as any).electron?.log) {
        (window as any).electron.log(logMsg);
      } else {
        console.log(logMsg);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is from the login endpoint itself
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('wp_token');
      localStorage.removeItem('wp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
