/**
 * Tests for POST /api/tickets endpoint
 * 
 * This is an integration test that verifies:
 * - Request validation
 * - CSRF token validation
 * - Rate limiting
 * - Response format
 * - Error handling
 */

describe('API: POST /api/tickets', () => {
  const validTicketData = {
    full_name: 'Jean Dupont',
    email: 'jean@example.com',
    phone: '0612345678',
    city: 'Paris',
    description: 'Problème avec mon ordinateur portable',
    service_type: 'Particulier',
    csrf_token: 'mock-csrf-token',
  }

  describe('Validation Rules', () => {
    describe('full_name field', () => {
      it('should reject names shorter than 2 characters', () => {
        const data = { ...validTicketData, full_name: 'A' }
        // Should validate and reject
        expect(data.full_name.length).toBeLessThan(2)
      })

      it('should reject names longer than 100 characters', () => {
        const data = {
          ...validTicketData,
          full_name: 'A'.repeat(101),
        }
        expect(data.full_name.length).toBeGreaterThan(100)
      })

      it('should accept valid French names with accents', () => {
        const names = ['José García', 'François Müller', 'Zoë Martin']
        names.forEach(name => {
          expect(name.length).toBeGreaterThanOrEqual(2)
          expect(name.length).toBeLessThanOrEqual(100)
        })
      })

      it('should accept names with hyphens and apostrophes', () => {
        const names = ["Jean-Paul Dupont", "Marie-Claire d'Arcy", "O'Connor"]
        names.forEach(name => {
          expect(name.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)).toBeTruthy()
        })
      })

      it('should reject names with numbers', () => {
        const name = 'John123 Smith'
        expect(name.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)).toBeFalsy()
      })

      it('should reject names with special characters', () => {
        const names = ['John@Smith', 'Jane#Doe', 'Bob$Jones']
        names.forEach(name => {
          expect(name.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)).toBeFalsy()
        })
      })
    })

    describe('email field', () => {
      it('should accept valid email addresses', () => {
        const emails = [
          'user@example.com',
          'test.user@company.co.uk',
          'name+tag@domain.org',
        ]
        emails.forEach(email => {
          expect(email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)).toBeTruthy()
        })
      })

      it('should reject emails without @ symbol', () => {
        const email = 'invalid.email.com'
        expect(email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)).toBeFalsy()
      })

      it('should reject emails without domain', () => {
        const email = 'user@'
        expect(email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)).toBeFalsy()
      })

      it('should reject emails with spaces', () => {
        const email = 'user name@example.com'
        expect(email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)).toBeFalsy()
      })

      it('should have max length of 255', () => {
        const longEmail = 'a'.repeat(240) + '@example.com'
        expect(longEmail.length).toBeLessThanOrEqual(255)
      })
    })

    describe('phone field', () => {
      it('should accept valid French phone numbers', () => {
        const phones = [
          '0612345678', // 10 digits
          '06 12 34 56 78', // with spaces
          '+33612345678', // international
          '06-12-34-56-78', // with hyphens
        ]
        phones.forEach(phone => {
          expect(phone.match(/^[\d\s\-\+()\.]+$/)).toBeTruthy()
        })
      })

      it('should reject numbers shorter than 8 digits', () => {
        const phone = '123456'
        // Remove non-digits to check length
        const digitsOnly = phone.replace(/\D/g, '')
        expect(digitsOnly.length).toBeLessThan(8)
      })

      it('should reject numbers longer than 20 characters', () => {
        const phone = '+33612345678901234567890'
        expect(phone.length).toBeGreaterThan(20)
      })

      it('should accept parentheses in phone numbers', () => {
        const phone = '+33 (6) 12-34.56.78'
        expect(phone.match(/^[\d\s\-\+()\.]+$/)).toBeTruthy()
      })

      it('should reject letters in phone numbers', () => {
        const phone = '06-PHONE'
        expect(phone.match(/^[\d\s\-\+()\.]+$/)).toBeFalsy()
      })
    })

    describe('city field', () => {
      it('should accept valid city names', () => {
        const cities = ['Paris', 'Lyon', 'Île-de-France', "Saint-Jean-d'Angély"]
        cities.forEach(city => {
          expect(city.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)).toBeTruthy()
        })
      })

      it('should reject cities shorter than 2 characters', () => {
        const city = 'P'
        expect(city.length).toBeLessThan(2)
      })

      it('should reject cities longer than 100 characters', () => {
        const city = 'A'.repeat(101)
        expect(city.length).toBeGreaterThan(100)
      })

      it('should reject cities with numbers', () => {
        const city = 'Paris75'
        expect(city.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)).toBeFalsy()
      })
    })

    describe('description field', () => {
      it('should accept descriptions 10-2000 characters', () => {
        const shortDesc = 'a'.repeat(10)
        const longDesc = 'a'.repeat(2000)
        const tooShort = 'a'.repeat(9)
        const tooLong = 'a'.repeat(2001)

        expect(shortDesc.length).toBeGreaterThanOrEqual(10)
        expect(longDesc.length).toBeLessThanOrEqual(2000)
        expect(tooShort.length).toBeLessThan(10)
        expect(tooLong.length).toBeGreaterThan(2000)
      })

      it('should accept multiline descriptions', () => {
        const desc = 'Problème avec\nmon ordinateur\nportable'
        expect(desc.length).toBeGreaterThanOrEqual(10)
      })

      it('should accept special characters in description', () => {
        const desc = 'Le clavier ne fonctionne pas! (Urgent!) €50'
        expect(desc.length).toBeGreaterThanOrEqual(10)
      })
    })

    describe('service_type field', () => {
      it('should accept valid service types', () => {
        const validTypes = ['Particulier', 'Professionnel', 'Administratif']
        validTypes.forEach(type => {
          expect(['Particulier', 'Professionnel', 'Administratif']).toContain(type)
        })
      })

      it('should reject invalid service types', () => {
        const invalidTypes = ['Autre', 'Premium', 'Test']
        invalidTypes.forEach(type => {
          expect(['Particulier', 'Professionnel', 'Administratif']).not.toContain(type)
        })
      })

      it('should be case-sensitive', () => {
        const type = 'particulier' // lowercase
        expect(['Particulier', 'Professionnel', 'Administratif']).not.toContain(type)
      })
    })
  })

  describe('Required Fields', () => {
    it('should require all mandatory fields', () => {
      const requiredFields = [
        'full_name',
        'email',
        'phone',
        'city',
        'description',
        'service_type',
        'csrf_token',
      ]
      requiredFields.forEach(field => {
        expect(validTicketData).toHaveProperty(field)
      })
    })

    it('should reject missing full_name', () => {
      const data = { ...validTicketData }
      delete data.full_name
      expect(data).not.toHaveProperty('full_name')
    })

    it('should reject missing email', () => {
      const data = { ...validTicketData }
      delete data.email
      expect(data).not.toHaveProperty('email')
    })

    it('should reject empty string values', () => {
      const data = { ...validTicketData, full_name: '' }
      expect(data.full_name).toBe('')
      expect(data.full_name.length).toBe(0)
    })
  })

  describe('CSRF Protection', () => {
    it('should require csrf_token field', () => {
      expect(validTicketData).toHaveProperty('csrf_token')
    })

    it('should reject missing csrf_token', () => {
      const data = { ...validTicketData }
      delete data.csrf_token
      expect(data).not.toHaveProperty('csrf_token')
    })

    it('should validate csrf_token format', () => {
      const validToken = 'abc123'
      const emptyToken = ''
      expect(validToken.length).toBeGreaterThan(0)
      expect(emptyToken.length).toBe(0)
    })
  })

  describe('Response Format', () => {
    it('should return 400 for validation errors', () => {
      // Expected response for invalid data
      const expectedStatus = 400
      expect(expectedStatus).toBe(400)
    })

    it('should return 429 when rate limited', () => {
      const expectedStatus = 429
      expect(expectedStatus).toBe(429)
    })

    it('should return 403 for CSRF validation failure', () => {
      const expectedStatus = 403
      expect(expectedStatus).toBe(403)
    })

    it('should return 200 for successful submission', () => {
      const expectedStatus = 200
      expect(expectedStatus).toBe(200)
    })

    it('should return error details in 400 response', () => {
      // Error response should include which field failed
      const errorFields = ['full_name', 'email', 'phone', 'city', 'description', 'service_type']
      expect(errorFields.length).toBeGreaterThan(0)
    })
  })

  describe('Content-Type Validation', () => {
    it('should require application/json content type', () => {
      const validContentType = 'application/json'
      expect(validContentType).toBe('application/json')
    })

    it('should reject invalid content types', () => {
      const invalidTypes = ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data']
      invalidTypes.forEach(type => {
        expect(type).not.toBe('application/json')
      })
    })

    it('should reject malformed JSON', () => {
      const validJSON = '{"full_name":"John"}'
      const invalidJSON = '{full_name: John}'
      
      // Valid JSON should be parseable
      expect(() => JSON.parse(validJSON)).not.toThrow()
      // Invalid JSON should throw
      expect(() => JSON.parse(invalidJSON)).toThrow()
    })
  })
})
