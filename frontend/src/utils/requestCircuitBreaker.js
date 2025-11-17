/**
 * Circuit Breaker for API Requests
 * Prevents infinite loops by limiting request frequency
 */

class RequestCircuitBreaker {
  constructor(maxRequests = 3, timeWindow = 2000) { // More aggressive: 3 requests per 2 seconds
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
    this.isOpen = false;
    this.lastBlockTime = 0;
    this.blockDuration = 5000; // Block for 5 seconds when circuit opens
  }

  canMakeRequest(endpoint) {
    const now = Date.now();
    
    // Clean up old requests
    this.requests = this.requests.filter(req => 
      now - req.timestamp < this.timeWindow && req.endpoint === endpoint
    );

    // Check if circuit is open
    if (this.isOpen) {
      // Reset circuit after block duration
      if (now - this.lastBlockTime > this.blockDuration) {
        this.isOpen = false;
        this.requests = [];
        console.log('🔄 Circuit breaker reset after timeout for:', endpoint);
      } else {
        const remaining = Math.ceil((this.blockDuration - (now - this.lastBlockTime)) / 1000);
        console.warn(`🚫 Circuit breaker OPEN - blocking ${endpoint} for ${remaining}s more`);
        return false;
      }
    }

    // Check request frequency
    const recentRequests = this.requests.filter(req => req.endpoint === endpoint);
    if (recentRequests.length >= this.maxRequests) {
      this.isOpen = true;
      this.lastBlockTime = now;
      console.error('🔥 TOO MANY REQUESTS DETECTED! Circuit breaker activated for:', endpoint);
      console.error('📊 Request history:', recentRequests.map(r => new Date(r.timestamp).toISOString()));
      console.error('⏰ Blocked for:', this.blockDuration / 1000, 'seconds');
      return false;
    }

    // Record this request
    this.requests.push({
      endpoint,
      timestamp: now
    });

    return true;
  }

  reset(endpoint) {
    if (endpoint) {
      this.requests = this.requests.filter(req => req.endpoint !== endpoint);
    } else {
      this.requests = [];
    }
    this.isOpen = false;
  }

  getStats(endpoint) {
    const now = Date.now();
    const recentRequests = this.requests.filter(req => 
      now - req.timestamp < this.timeWindow && 
      (endpoint ? req.endpoint === endpoint : true)
    );

    return {
      recentRequests: recentRequests.length,
      maxRequests: this.maxRequests,
      timeWindow: this.timeWindow,
      isOpen: this.isOpen,
      requests: recentRequests
    };
  }
}

// Global circuit breaker instance - Very aggressive for development
const circuitBreaker = new RequestCircuitBreaker(2, 1000); // Only 2 requests per second max

export default circuitBreaker;