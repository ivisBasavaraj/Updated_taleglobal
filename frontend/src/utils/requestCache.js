// Simple request cache and deduplication utility
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  async get(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options);
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    // Make new request
    const requestPromise = this.makeRequest(url, options)
      .then(data => {
        // Cache the result
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: options.ttl || 300000 // 5 minutes default
        });
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        
        return data;
      })
      .catch(error => {
        // Remove from pending requests on error
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  async makeRequest(url, options) {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  getCacheKey(url, options) {
    return `${url}_${JSON.stringify(options.headers || {})}_${options.method || 'GET'}`;
  }

  isExpired(cached) {
    return Date.now() - cached.timestamp > cached.ttl;
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  delete(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options);
    this.cache.delete(cacheKey);
    this.pendingRequests.delete(cacheKey);
  }
}

export const requestCache = new RequestCache();