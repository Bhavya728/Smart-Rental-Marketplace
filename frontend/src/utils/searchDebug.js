/**
 * Debug Utilities for Request Monitoring
 * Helps debug infinite loop issues
 */

import circuitBreaker from './requestCircuitBreaker';

// Global debug utilities
window.searchDebug = {
  // Get circuit breaker stats
  getStats: (endpoint) => circuitBreaker.getStats(endpoint),
  
  // Reset circuit breaker
  reset: (endpoint) => {
    circuitBreaker.reset(endpoint);
    console.log('✅ Circuit breaker reset for:', endpoint || 'all endpoints');
  },
  
  // Monitor requests for a specific time
  monitor: (duration = 10000) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const stats = circuitBreaker.getStats();
      console.log('📊 Request Stats:', {
        time: new Date().toISOString(),
        ...stats
      });
      
      if (Date.now() - startTime > duration) {
        clearInterval(interval);
        console.log('🏁 Monitoring complete');
      }
    }, 1000);
    
    console.log('🔍 Starting request monitoring for', duration, 'ms');
    return interval;
  },
  
  // Emergency stop all requests
  emergencyStop: () => {
    circuitBreaker.reset();
    circuitBreaker.isOpen = true;
    console.log('🚨 EMERGENCY STOP: All requests blocked');
  },
  
  // Resume requests
  resume: () => {
    circuitBreaker.reset();
    console.log('▶️ Requests resumed');
  }
};

console.log('🛠️ Debug utilities loaded. Use window.searchDebug for debugging.');
console.log('📋 Available commands:');
console.log('  window.searchDebug.getStats() - Get request statistics');
console.log('  window.searchDebug.reset() - Reset circuit breaker');
console.log('  window.searchDebug.monitor() - Monitor requests for 10 seconds');
console.log('  window.searchDebug.emergencyStop() - Block all requests');
console.log('  window.searchDebug.resume() - Resume requests');

export default window.searchDebug;