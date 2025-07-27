// src/api/ApiService.js
// A clean, centralized, and robust service for all API requests.

import Constants from 'expo-constants';

// --- CONFIGURATION ---
// This automatically determines the correct IP address for your backend.
// It uses your computer's LAN IP address when running in development via Expo Go
// and falls back to a production URL.
const { manifest } = Constants;
const localApiUrl = `http://${manifest?.debuggerHost?.split(':').shift()}:3000`;
const PRODUCTION_API_URL = 'https://your-production-backend-url.com'; // TODO: Replace this later

// Use the local URL in development, otherwise use the production URL.
const API_BASE_URL = (manifest?.releaseChannel) ? PRODUCTION_API_URL : localApiUrl;

console.log(`🌐 API Base URL configured to: ${API_BASE_URL}`);

/**
 * A wrapper around the fetch API to handle common tasks like setting headers,
 * managing timeouts, and parsing responses.
 *
 * @param {string} endpoint - The API endpoint to call (e.g., '/api/health').
 * @param {object} options - The options object for the fetch call (method, body, etc.).
 * @param {number} timeout - The request timeout in milliseconds.
 * @returns {Promise<any>} The JSON response from the API.
 */
const request = async (endpoint, options = {}, timeout = 15000) => { // 15-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If we get an error response, try to parse it for more info
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorBody.message || `API request failed with status ${response.status}`);
    }

    // If the response is successful but has no content (e.g., a 204 response)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }
    
    return response.json();

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`API Error: Request to ${endpoint} timed out after ${timeout}ms`);
      throw new Error('NETWORK_TIMEOUT');
    }
    console.error(`API Error for ${endpoint}:`, error.message);
    throw new Error('NETWORK_UNAVAILABLE');
  }
};

// --- NAMED EXPORTS ---
// We use named exports to be explicit about which functions are available.
export const get = (endpoint, options) => request(endpoint, { method: 'GET', ...options });
export const post = (endpoint, body, options) => request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options });
export const put = (endpoint, body, options) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options });
// Add other methods like DEL etc. as needed.