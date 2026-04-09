
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999/api';

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
    const config = {
      ...options,
      headers: {
        ...options.headers,
      },
    };

    
    if (!(config.body instanceof FormData) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log('[api] Making request:', {
        url,
        method: config.method || 'GET',
        hasBody: !!config.body,
        bodyType: config.body instanceof FormData ? 'FormData' : typeof config.body,
        headers: config.headers,
        hasAuth: !!config.headers.Authorization
      });
      
      const response = await fetch(url, config);
      
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Request failed' };
        }
        
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      const data = await response.json();

      
      if (response.status === 401 && data.message?.includes('token')) {
        console.log('[api] 401 token-related, attempting refresh', {
          endpoint,
          message: data?.message,
          hasRefreshToken: !!this.refreshToken,
        });
        await this.refreshAccessToken();
        
        config.headers.Authorization = `Bearer ${this.token}`;
        const retryResponse = await fetch(url, config);
        return await retryResponse.json();
      }

      if (!response.ok) {
        console.log('[api] request failed', { endpoint, status: response.status, message: data?.message });
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        
        const networkError = new Error('Network error - please check your connection and ensure the server is running');
        networkError.originalError = error;
        networkError.isNetworkError = true;
        networkError.endpoint = endpoint;
        throw networkError;
      }
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timed out');
        timeoutError.originalError = error;
        timeoutError.isTimeoutError = true;
        throw timeoutError;
      }
      
      
      error.endpoint = endpoint;
      error.isApiError = true;
      throw error;
    }
  }

  
  async refreshAccessToken() {
    if (!this.refreshToken) {
      console.log('[api] refreshAccessToken: missing refreshToken');
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('[api] refreshAccessToken: success');
        this.setTokens(data.data.token, this.refreshToken);
      } else {
        console.log('[api] refreshAccessToken: failed', { status: response.status, message: data?.message });
        this.clearTokens();
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.log('[api] refreshAccessToken: error', error);
      this.clearTokens();
      throw error;
    }
  }

  
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, {
      method: 'POST',
      body,
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const config = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    return await response.json();
  }
}


const apiClient = new ApiClient();

export default apiClient;
