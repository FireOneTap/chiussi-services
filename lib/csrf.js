import crypto from 'crypto';

/**
 * Génère un token CSRF cryptographiquement sécurisé
 * Format: base64(random_32_bytes + timestamp)
 * Utilisé pour protéger contre les attaques CSRF
 */
export function generateCSRFToken() {
  const randomBytes = crypto.randomBytes(32);
  const timestamp = Math.floor(Date.now() / 1000);
  const buffer = Buffer.alloc(36);
  
  randomBytes.copy(buffer, 0);
  buffer.writeUInt32BE(timestamp, 32);
  
  return buffer.toString('base64');
}

/**
 * Valide un token CSRF
 * @param {string} token - Token à valider
 * @param {number} maxAge - Âge maximum du token en secondes (défaut: 24h)
 * @returns {boolean}
 */
export function validateCSRFToken(token, maxAge = 86400) {
  try {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Décoder le token
    const buffer = Buffer.from(token, 'base64');
    if (buffer.length !== 36) {
      return false;
    }

    // Extraire le timestamp (4 derniers bytes)
    const timestamp = buffer.readUInt32BE(32);
    const now = Math.floor(Date.now() / 1000);
    const age = now - timestamp;

    // Vérifier que le token n'est pas expiré
    if (age > maxAge) {
      return false;
    }

    if (age < 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
