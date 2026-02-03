/**
 * Logger client-side sécurisé sans exposition de PII
 * Version simplifiée pour utilisation dans les composants React
 */

// Patterns pour détecter les données sensibles
const SENSITIVE_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?\d{1,3}[-.\s]?)?\d{6,14}\b/g,
  address: /\d+\s+(?:[a-zA-Z]+\s+)*(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Parkway|Pkwy)/gi,
  token: /bearer\s+[\w.-]+|token["\']?\s*:\s*["\'][\w.-]+["\']|access_token["\']?\s*:\s*["\'][\w.-]+["\']/gi,
};

/**
 * Masque les données sensibles dans un string
 */
function maskSensitiveData(str: string): string {
  if (typeof str !== 'string') return str;
  
  let masked = str;
  masked = masked.replace(SENSITIVE_PATTERNS.email, '[EMAIL]');
  masked = masked.replace(SENSITIVE_PATTERNS.phone, '[PHONE]');
  masked = masked.replace(SENSITIVE_PATTERNS.address, '[ADDRESS]');
  masked = masked.replace(SENSITIVE_PATTERNS.token, '[TOKEN]');
  
  return masked;
}

/**
 * Récursivement masque les données sensibles dans les objets
 */
function sanitizeObject(obj: any, depth: number = 0): any {
  if (depth > 5) return '[DEEP_OBJECT]';
  
  if (typeof obj === 'string') {
    return maskSensitiveData(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'].includes(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string') {
        sanitized[key] = maskSensitiveData(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value, depth + 1);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Log d'erreur côté client
 */
export function error(message: string, err: any = null, context: any = null): void {
  const errorStr = err instanceof Error ? err.message : String(err);
  const combinedContext = {
    ...context,
    error: errorStr,
  };
  console.error(`[ERROR] ${message}`, sanitizeObject(combinedContext));
}

/**
 * Log d'avertissement côté client
 */
export function warn(message: string, context: any = null): void {
  console.warn(`[WARN] ${message}`, context ? sanitizeObject(context) : '');
}

/**
 * Log d'information côté client
 */
export function info(message: string, context: any = null): void {
  console.log(`[INFO] ${message}`, context ? sanitizeObject(context) : '');
}
