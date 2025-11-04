const { cache } = require('./cache');

class CacheInvalidation {
  constructor() {
    this.cache = cache;
  }

  // Clear all job-related caches
  clearJobCaches() {
    // Get all cache keys
    const keys = Array.from(this.cache.cache.keys());
    
    // Clear job-related caches
    const jobRelatedPatterns = [
      'jobs_',
      'job_',
      'employers_',
      'recruiters_'
    ];
    
    keys.forEach(key => {
      if (jobRelatedPatterns.some(pattern => key.includes(pattern))) {
        this.cache.delete(key);
      }
    });
    
    console.log(`Cleared ${keys.length} job-related cache entries`);
  }

  // Clear specific job cache
  clearJobCache(jobId) {
    const keys = Array.from(this.cache.cache.keys());
    keys.forEach(key => {
      if (key.includes(`job_${jobId}`)) {
        this.cache.delete(key);
      }
    });
  }

  // Clear employer-specific caches
  clearEmployerCaches(employerId) {
    const keys = Array.from(this.cache.cache.keys());
    keys.forEach(key => {
      if (key.includes(`employerId=${employerId}`) || key.includes(`employer_${employerId}`)) {
        this.cache.delete(key);
      }
    });
  }

  // Clear all caches (nuclear option)
  clearAllCaches() {
    this.cache.clear();
    console.log('All caches cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      totalEntries: this.cache.cache.size,
      ttlEntries: this.cache.ttl.size
    };
  }
}

const cacheInvalidation = new CacheInvalidation();

module.exports = { cacheInvalidation };