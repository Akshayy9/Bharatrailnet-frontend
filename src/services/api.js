// api.js - Production API service for BharatRailNet

class ApiService {
  constructor() {
    // Production backend URL
    this.baseURL = 'http://localhost:8000';
    this.token = null;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('brn_token', token);
    } else {
      localStorage.removeItem('brn_token');
    }
  }

  /**
   * Get stored token
   */
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('brn_token');
    }
    return this.token;
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Handle API errors
   */
  async handleResponse(response) {
    if (!response.ok) {
      const text = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const data = JSON.parse(text);
        errorMessage = data.detail || data.message || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  /**
   * Login with OAuth2 form-encoded credentials
   */
  async login(credentials) {
    try {
      // OAuth2PasswordRequestForm expects form-encoded data
      const body = new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
        // Note: section is not part of standard OAuth2; backend ignores extra fields
      });

      const response = await fetch(`${this.baseURL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await this.handleResponse(response);
      
      // Store token
      this.setToken(data.access_token);
      
      // Fetch user details
      const user = await this.getCurrentUser();
      
      return {
        success: true,
        access_token: data.access_token,
        user: {
          name: user.name,
          section: user.section,
          sectionName: user.sectionName,
          employeeId: user.id,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Logout
   */
  logout() {
    this.setToken(null);
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/api/user/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Get dashboard KPIs
   */
  async getDashboardKPIs() {
    const response = await fetch(`${this.baseURL}/api/dashboard/kpis`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Get live trains for user's section
   */
  async getTrains() {
    const response = await fetch(`${this.baseURL}/api/dashboard/trains`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Get section map data
   */
  async getSectionMap(sectionId) {
    const response = await fetch(`${this.baseURL}/api/section_map/${sectionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Get geographical section map for Leaflet
   */
  async getSectionMapGeo(sectionId) {
    const response = await fetch(`${this.baseURL}/api/section_map/${sectionId}/geo`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Get audit trail logs
   */
  async getAuditTrail() {
    const response = await fetch(`${this.baseURL}/api/audit_trail`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  /**
   * Create WebSocket connection
   */
  createWebSocket(sectionId) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    // WebSocket URL with token as query parameter
    const wsURL = `${this.baseURL.replace('https://', 'wss://').replace('http://', 'ws://')}/ws/${sectionId}?token=${encodeURIComponent(token)}`;
    
    return new WebSocket(wsURL);
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
