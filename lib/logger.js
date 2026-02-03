/**
 * Logger sécurisé sans exposition de PII (Personally Identifiable Information)
 * - Filtre les emails, téléphones, adresses
 * - Masque les tokens d'authentification
 * - Utilisé pour tous les logs applicatifs (GDPR compliant)
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
function maskSensitiveData(str) {
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
function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return '[DEEP_OBJECT]'; // Limite la profondeur
  
  if (typeof obj === 'string') {
    return maskSensitiveData(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Ne pas logger les champs sensibles
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
 * Formate un message de log avec timestamp et niveau
 */
function formatLog(level, message, context) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(sanitizeObject(context))}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Log d'information (utilisé pour les opérations normales)
 */
export function info(message, context = null) {
  console.log(formatLog('info', message, context));
}

/**
 * Log d'erreur (utilisé pour les erreurs applicatives)
 */
export function error(message, err = null, context = null) {
  const errorStr = err instanceof Error ? `${err.message}` : String(err);
  const combinedContext = {
    ...context,
    error: errorStr,
  };
  console.error(formatLog('error', message, combinedContext));
}

/**
 * Log d'avertissement (utilisé pour les situations anormales)
 */
export function warn(message, context = null) {
  console.warn(formatLog('warn', message, context));
}

/**
 * Log de débogage (utilisé pour le développement)
 * Désactivé en production
 */
export function debug(message, context = null) {
  if (process.env.NODE_ENV === 'development') {
    console.debug(formatLog('debug', message, context));
  }
}
