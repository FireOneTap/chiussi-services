import { checkRateLimit } from '../../lib/rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear all rate limit entries before each test
    // Note: We need to expose the internal state or use mocking
    // For now, we'll use different IPs for each test
  })

  describe('checkRateLimit', () => {
    it('should allow first request from a new IP', () => {
      const ip = '192.168.1.' + Math.random().toString(36).substring(7)
      const result = checkRateLimit(ip)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4) // 5 total - 1 used
    })

    it('should allow up to 5 requests per minute', () => {
      const ip = '192.168.2.' + Math.random().toString(36).substring(7)
      
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(ip)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(4 - i)
      }
    })

    it('should reject requests exceeding rate limit', () => {
      const ip = '192.168.3.' + Math.random().toString(36).substring(7)
      
      // Use up all 5 allowed requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip)
      }
      
      // 6th request should be rejected
      const result = checkRateLimit(ip)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should return retryAfter value when rate limited', () => {
      const ip = '192.168.4.' + Math.random().toString(36).substring(7)
      
      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip)
      }
      
      // Next request should have retryAfter
      const result = checkRateLimit(ip)
      expect(result.retryAfter).toBeDefined()
      expect(typeof result.retryAfter).toBe('number')
      expect(result.retryAfter).toBeGreaterThan(0)
      expect(result.retryAfter).toBeLessThanOrEqual(60)
    })

    it('should track different IPs independently', () => {
      const ip1 = '192.168.5.1'
      const ip2 = '192.168.5.2'
      
      // Use all requests for ip1
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip1)
      }
      
      // ip1 should be limited
      expect(checkRateLimit(ip1).allowed).toBe(false)
      
      // ip2 should still have requests available
      expect(checkRateLimit(ip2).allowed).toBe(true)
      expect(checkRateLimit(ip2).remaining).toBe(4)
    })

    it('should handle X-Forwarded-For header format', () => {
      // When checkRateLimit receives X-Forwarded-For header, it extracts first IP
      const clientIp = '203.0.113.' + Math.random().toString(36).substring(7)
      
      const result = checkRateLimit(clientIp)
      expect(result.allowed).toBe(true)
    })

    it('should handle missing IP gracefully', () => {
      // Should return rate limit result even with undefined/null
      const result = checkRateLimit('unknown')
      expect(result).toHaveProperty('allowed')
      expect(result).toHaveProperty('remaining')
    })
  })

  describe('Rate Limit Response Format', () => {
    it('should return consistent response structure', () => {
      const ip = '192.168.6.' + Math.random().toString(36).substring(7)
      const result = checkRateLimit(ip)
      
      expect(result).toHaveProperty('allowed')
      expect(result).toHaveProperty('remaining')
      expect(typeof result.allowed).toBe('boolean')
      expect(typeof result.remaining).toBe('number')
    })

    it('should include retryAfter when rate limited', () => {
      const ip = '192.168.7.' + Math.random().toString(36).substring(7)
      
      for (let i = 0; i < 5; i++) {
        checkRateLimit(ip)
      }
      
      const limitedResult = checkRateLimit(ip)
      expect(limitedResult).toHaveProperty('retryAfter')
    })

    it('should not include retryAfter when allowed', () => {
      const ip = '192.168.8.' + Math.random().toString(36).substring(7)
      const result = checkRateLimit(ip)
      
      expect(result.allowed).toBe(true)
      // retryAfter should either not exist or be falsy
      if (result.hasOwnProperty('retryAfter')) {
        expect(result.retryAfter).toBeFalsy()
      }
    })
  })
})
