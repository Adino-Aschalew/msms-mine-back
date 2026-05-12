
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    console.log('[api] Constructor - Token loaded:', !!this.token);
  }

  
  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    
    // Synchronous localStorage operations to prevent timing issues
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Force storage event to ensure synchronization
    localStorage.setItem('tokenUpdate', Date.now().toString());
    
    console.log('[api] setTokens', { hasToken: !!token, hasRefreshToken: !!refreshToken });
  }

  
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    console.log('[api] clearTokens');
  }

  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Always get the latest tokens from localStorage before request
    const currentToken = localStorage.getItem('authToken');
    const currentRefreshToken = localStorage.getItem('refreshToken');
    
    const config = {
      ...options,
      headers: {
        ...options.headers,
      },
    };

    if (!(config.body instanceof FormData) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }

    try {
      console.log(`[api] ${config.method || 'GET'} ${endpoint}`, {
        hasAuth: !!config.headers.Authorization
      });
      
      let response = await fetch(url, config);
      
      // Check for 401 and try to refresh
      if (response.status === 401) {
        console.log('[api] 401 detected, attempting refresh');
        try {
          const newAccessToken = await this.refreshAccessToken(currentRefreshToken);
          if (newAccessToken) {
            console.log('[api] Refresh successful, retrying original request');
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            response = await fetch(url, config);
          }
        } catch (refreshError) {
          console.error('[api] Refresh failed during request', refreshError);
          // If refresh fails, we'll continue with the original 401 response
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }
        
        console.error('[api] Request failed:', {
          endpoint,
          status: response.status,
          message: errorData.message
        });
        
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        const networkError = new Error('Network error - please check your connection and ensure the server is running');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  }

  async refreshAccessToken(providedRefreshToken) {
    const refreshToken = providedRefreshToken || localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.log('[api] refreshAccessToken: no token');
      this.clearTokens();
      return null;
    }

    try {
<<<<<<< HEAD
      // Use clean fetch without this.request to avoid recursion
=======
>>>>>>> Fixsetings
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.token) {
        const newToken = data.data.token;
        this.setTokens(newToken, refreshToken);
        return newToken;
      } else {
        console.log('[api] refreshAccessToken failed', data?.message);
        this.clearTokens();
        return null;
      }
    } catch (error) {
      console.error('[api] refreshAccessToken error', error);
      this.clearTokens();
      return null;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

const apiClient = new ApiClient();
export default apiClient;
