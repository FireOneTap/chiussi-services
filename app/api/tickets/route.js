import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateCSRFToken } from '../../../lib/csrf.js';
import { error as logError, info as logInfo, warn as logWarn } from '../../../lib/logger.js';
import { checkRateLimit, getClientIP } from '../../../lib/rate-limit.js';

// Validation schemas
const VALIDATION_RULES = {
  full_name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
    message: 'Le nom doit contenir entre 2 et 100 caractères (lettres et espaces)'
  },
  email: {
    required: true,
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Veuillez entrer une adresse email valide'
  },
  phone: {
    required: true,
    minLength: 8,
    maxLength: 20,
    // eslint-disable-next-line no-useless-escape
    pattern: /^[\d\s\-\+()\.]+$/,
    message: 'Le téléphone doit contenir entre 8 et 20 caractères'
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
    message: 'La ville doit contenir entre 2 et 100 caractères'
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 2000,
    message: 'La description doit contenir entre 10 et 2000 caractères'
  },
  service_type: {
    required: true,
    allowedValues: ['Particulier', 'Professionnel', 'Administratif'],
    message: 'Le type de service doit être : Particulier, Professionnel ou Administratif'
  }
};

/**
 * Valide un champ selon ses règles
 * @returns {null|string} Null si valide, sinon message d'erreur
 */
function validateField(fieldName, value, rules) {
  if (!value) {
    if (rules.required) {
      return `${fieldName} est obligatoire`;
    }
    return null;
  }

  const trimmedValue = String(value).trim();

  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return rules.message || `${fieldName} est trop court`;
  }

  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return rules.message || `${fieldName} est trop long`;
  }

  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return rules.message || `${fieldName} contient des caractères invalides`;
  }

  if (rules.allowedValues && !rules.allowedValues.includes(trimmedValue)) {
    return rules.message || `${fieldName} a une valeur invalide`;
  }

  return null;
}

/**
 * Valide tous les champs du formulaire
 * @returns {object} {isValid: boolean, errors: {}, data: {}}
 */
function validateFormData(body) {
  const errors = {};
  const data = {};

  // Mapper les champs source vers les colonnes DB
  const mappedBody = {
    full_name: body.full_name || body.name,
    email: body.email,
    phone: body.phone,
    city: body.city,
    description: body.description || body.message,
    service_type: body.service_type || body.type
  };

  // Valider chaque champ
  Object.entries(VALIDATION_RULES).forEach(([fieldName, rules]) => {
    const error = validateField(fieldName, mappedBody[fieldName], rules);
    if (error) {
      errors[fieldName] = error;
    } else {
      // Nettoyer et normaliser la valeur
      data[fieldName] = String(mappedBody[fieldName]).trim();
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data
  };
}

export async function POST(request) {
  try {
    // Vérifier le rate limiting
    const ip = getClientIP(request);
    const { allowed, resetTime } = checkRateLimit(ip);
    
    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      logWarn('Rate limit exceeded', { ip, retryAfter });
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
            'Retry-After': String(retryAfter),
          }
        }
      );
    }

    // Vérifier le Content-Type

    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type doit être application/json' },
        { status: 400 }
      );
    }

    // Parser le body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Requête invalide : JSON malformé' },
        { status: 400 }
      );
    }

    // Vérifier le token CSRF
    const csrfToken = body.csrfToken;
    const csrfValidation = validateCSRFToken(csrfToken);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: 'Erreur de sécurité. Veuillez recharger la page et réessayer.' },
        { status: 403 }
      );
    }

    // Valider les données
    const validation = validateFormData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Données invalides', errors: validation.errors },
        { status: 400 }
      );
    }

    // Préparer les données pour Supabase
    const ticketData = {
      ...validation.data,
      status: 'nouveau'
    };

    // Initialiser Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logError('Erreur serveur : Configuration Supabase manquante');
      return NextResponse.json(
        { error: 'Erreur serveur. Veuillez réessayer plus tard.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insérer dans Supabase
    const { data, error } = await supabase
      .from('tickets')
      .insert([ticketData])
      .select();

    if (error) {
      // Logger l'erreur réelle côté serveur (ne pas la révéler au client)
      logError('Erreur Supabase lors de l\'insertion de ticket', error, {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      return NextResponse.json(
        { error: 'Impossible de créer le ticket. Veuillez réessayer plus tard.' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      logWarn('Ticket créé mais aucune donnée retournée');
      return NextResponse.json(
        { success: true, message: 'Ticket créé avec succès' },
        { status: 201 }
      );
    }

    logInfo('Ticket créé avec succès', { ticketId: data[0].id });
    return NextResponse.json(
      { success: true, message: 'Ticket créé avec succès', ticketId: data[0].id },
      { status: 201 }
    );

  } catch (err) {
    logError('Erreur interne serveur lors de l\'insertion de ticket', err);
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}
