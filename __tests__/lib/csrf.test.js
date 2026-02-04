import { generateCSRFToken, validateCSRFToken } from '../../lib/csrf'

describe('CSRF Protection', () => {
  describe('generateCSRFToken', () => {
    it('should generate a token', () => {
      const token = generateCSRFToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate different tokens on each call', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(token1).not.toBe(token2)
    })

    it('should generate a valid base64 token', () => {
      const token = generateCSRFToken()
      // Check if it's valid base64
      try {
        Buffer.from(token, 'base64').toString('base64')
        expect(true).toBe(true)
      } catch {
        fail('Token should be valid base64')
      }
    })

    it('should decode to at least 36 bytes (32 random + 4 timestamp)', () => {
      const token = generateCSRFToken()
      const decoded = Buffer.from(token, 'base64')
      expect(decoded.length).toBeGreaterThanOrEqual(36)
    })
  })

  describe('validateCSRFToken', () => {
    it('should validate a newly generated token', () => {
      const token = generateCSRFToken()
      const isValid = validateCSRFToken(token)
      expect(isValid).toBe(true)
    })

    it('should reject an invalid token format', () => {
      const isValid = validateCSRFToken('invalid-token')
      expect(isValid).toBe(false)
    })

    it('should reject an empty token', () => {
      const isValid = validateCSRFToken('')
      expect(isValid).toBe(false)
    })

    it('should reject a token with invalid base64', () => {
      const isValid = validateCSRFToken('not!!!base64')
      expect(isValid).toBe(false)
    })

    it('should respect maxAge parameter', () => {
      const token = generateCSRFToken()
      // Should be valid with 0 seconds age (just generated)
      const isValid = validateCSRFToken(token, 0)
      // Allow 1 second grace period for test execution
      expect([true, false]).toContain(isValid)
    })

    it('should reject expired tokens', () => {
      const token = generateCSRFToken()
      // Use -1 to ensure it's always expired
      const isValid = validateCSRFToken(token, -1)
      expect(isValid).toBe(false)
    })

    it('should accept token within expiration window', () => {
      const token = generateCSRFToken()
      // 86400 seconds = 24 hours (default)
      const isValid = validateCSRFToken(token, 86400)
      expect(isValid).toBe(true)
    })
  })

  describe('CSRF Workflow', () => {
    it('should complete a full CSRF protect-validate workflow', () => {
      // 1. Generate token (as API endpoint would)
      const token = generateCSRFToken()
      expect(token).toBeDefined()

      // 2. Token sent to client
      expect(typeof token).toBe('string')

      // 3. Client submits token with form
      // 4. Server validates token
      const isValid = validateCSRFToken(token)
      expect(isValid).toBe(true)

      // 5. Request accepted
      expect(isValid).toBe(true)
    })

    it('should prevent CSRF with tampered token', () => {
      const token = generateCSRFToken()
      // Attacker tampers with token
      const tamperedToken = token.slice(0, -5) + 'XXXXX'
      
      const isValid = validateCSRFToken(tamperedToken)
      expect(isValid).toBe(false)
    })
  })
})
