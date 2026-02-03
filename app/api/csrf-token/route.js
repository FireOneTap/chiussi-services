import { NextResponse } from 'next/server';
import { generateCSRFToken, validateCSRFToken } from '../../../lib/csrf.js';
import { error as logError } from '../../../lib/logger.js';

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
    logError('Erreur génération CSRF token', err);
    return NextResponse.json(
      { error: 'Impossible de générer le token de sécurité' },
      { status: 500 }
    );
  }
}
