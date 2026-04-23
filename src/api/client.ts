import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.kaizoku.clev.studio/api';

/**
 * Axios instance pre-configured with the Kaizoku API base URL.
 * Mirrors the web client's client.ts.
 */
const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Response interceptor for consistent error handling ──
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isLogo404 =
      error.response?.status === 404 &&
      error.config?.url?.match(/\/anime\/.*\/logo/);

    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'An unexpected error occurred';

    if (!isLogo404) {
      console.error('[API Error]', message);
    }

    return Promise.reject(new Error(message));
  },
);

export { API_URL };
export default client;
