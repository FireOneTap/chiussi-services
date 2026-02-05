/**
 * Rate limiting middleware
 * Implémentation in-memory pour limiter les requêtes par IP
 * Utilise un Token Bucket algorithm simplifié
 */

// Map pour stocker les tentatives par IP
// Format: { ip: { count: number, resetTime: number } }
const requestCounts = new Map();

/**
 * Configuration de rate limiting
 * 5 requêtes par minute (300 secondes)
 */
const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowSeconds: 60,
  cleanupIntervalSeconds: 600, // Cleanup every 10 minutes
  maxAgeSeconds: 3600, // Remove IPs not seen in 1 hour
};

// Cleanup interval to prevent memory leak
let cleanupInterval = null;

/**
 * Nettoie les entrées anciennes de la Map pour éviter les memory leaks
 * Supprime les IPs qui n'ont pas été vues depuis MAX_AGE_SECONDS
 */
function cleanupOldEntries() {
  const now = Date.now();
  const maxAgeMs = RATE_LIMIT_CONFIG.maxAgeSeconds * 1000;
  let removed = 0;
  
  for (const [ip, record] of requestCounts) {
    // Supprimer si pas accédée depuis plus de 1 heure
    if (now - record.resetTime > maxAgeMs) {
      requestCounts.delete(ip);
      removed++;
    }
  }
  
  // Log cleanup (utile pour monitoring)
  if (removed > 0) {
    console.log(`[RATE_LIMIT_CLEANUP] Removed ${removed} old IP entries. Current size: ${requestCounts.size}`);
  }
}

/**
 * Initialise le nettoyage périodique (à appeler au démarrage du serveur)
 */
export function initializeRateLimitCleanup() {
  if (cleanupInterval === null) {
    const intervalMs = RATE_LIMIT_CONFIG.cleanupIntervalSeconds * 1000;
    cleanupInterval = setInterval(cleanupOldEntries, intervalMs);
    console.log(`[RATE_LIMIT] Cleanup initialized every ${RATE_LIMIT_CONFIG.cleanupIntervalSeconds}s`);
  }
}

/**
 * Arrête le nettoyage périodique (pour tests/shutdown)
 */
export function stopRateLimitCleanup() {
  if (cleanupInterval !== null) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Extrait l'IP client d'une requête Next.js
 */
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const clientIP = request.headers.get('x-client-ip');
  if (clientIP) return clientIP;
  
  // Fallback: utiliser une IP générique pour le développement
  return 'unknown-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Vérifie et met à jour les limites de taux pour une IP
 * @returns {{ allowed: boolean, remaining: number, resetTime: number }}
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record) {
    // Première requête de cette IP
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowSeconds * 1000,
    };
  }
  
  // Vérifier si la fenêtre est expirée
  if (now >= record.resetTime) {
    // Réinitialiser la fenêtre
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowSeconds * 1000,
    };
  }
  
  // Fenêtre active : incrémenter le compteur
  record.count++;
  const remaining = RATE_LIMIT_CONFIG.maxRequests - record.count;
  const allowed = record.count <= RATE_LIMIT_CONFIG.maxRequests;
  
  const response = {
    allowed,
    remaining: Math.max(0, remaining),
    resetTime: record.resetTime,
  };
  
  // Ajouter retryAfter si rate limited
  if (!allowed) {
    response.retryAfter = Math.ceil((record.resetTime - Date.now()) / 1000);
  }
  
  return response;
}

/**
 * Middleware de rate limiting pour Next.js
 * À utiliser au début de chaque handler API
 */
export function withRateLimit(handler) {
  return async (request) => {
    const ip = getClientIP(request);
    const { allowed, remaining, resetTime } = checkRateLimit(ip);
    
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.maxRequests),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
          },
        }
      );
    }
    
    // Ajouter les headers de rate limit à la réponse
    const response = await handler(request);
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_CONFIG.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));
    
    return response;
  };
}

/**
 * Fonction directe pour vérifier le rate limit (alternative à withRateLimit)
 */
export { checkRateLimit, getClientIP };
