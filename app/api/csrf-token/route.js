import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Génère un token CSRF cryptographiquement sécurisé
 * Format: base64(random_32_bytes + timestamp)
 * Utilisé pour protéger contre les attaques CSRF
 */
function generateCSRFToken() {
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
 * @returns {object} {valid: boolean, error?: string}
 */
function validateCSRFToken(token, maxAge = 86400) {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token CSRF manquant ou invalide' };
    }

    // Décoder le token
    const buffer = Buffer.from(token, 'base64');
    if (buffer.length !== 36) {
      return { valid: false, error: 'Format de token invalide' };
    }

    // Extraire le timestamp (4 derniers bytes)
    const timestamp = buffer.readUInt32BE(32);
    const now = Math.floor(Date.now() / 1000);
    const age = now - timestamp;

    // Vérifier que le token n'est pas expiré
    if (age > maxAge) {
      return { valid: false, error: 'Token CSRF expiré' };
    }

    if (age < 0) {
      return { valid: false, error: 'Token CSRF invalide (timestamp futur)' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Erreur lors de la validation du token' };
  }
}

/**
 * GET /api/csrf-token
 * Génère et retourne un nouveau token CSRF
 * Client: Appeler cet endpoint au chargement de la page
 *         Sauvegarder le token dans un state/localStorage
 */
export async function GET() {
  try {
    const token = generateCSRFToken();
    
    return NextResponse.json(
      { token },
      {
        status: 200,
        headers: {
          // Cache court (5 min) car le client va le réutiliser
          'Cache-Control': 'private, max-age=300',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  } catch (err) {
    console.error('Erreur génération CSRF token:', err);
    return NextResponse.json(
      { error: 'Impossible de générer le token de sécurité' },
      { status: 500 }
    );
  }
}
