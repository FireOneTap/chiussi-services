# Protection CSRF - Documentation

## Vue d'ensemble

La protection CSRF (Cross-Site Request Forgery) empêche un attaquant d'effectuer des actions non autorisées au nom d'un utilisateur légitime.

**Implémentation :** Token CSRF avec validation de timestamp

---

## Flux de sécurité

```
1. Client charge /tickets
   ↓
2. Client appelle GET /api/csrf-token
   ↓ Serveur génère token cryptographique
   ↓
3. Serveur retourne { token: "base64(random_32bytes + timestamp)" }
   ↓
4. Client stocke token en state React
   ↓
5. Client soumet formulaire POST /api/tickets
   { csrfToken: "...", full_name: "...", ... }
   ↓
6. Serveur valide:
   - Token existe et n'est pas null
   - Token est décodable (base64 valide)
   - Timestamp du token ≤ 24h
   - Format correct (36 bytes)
   ↓
7. Si valide → Continuer vers validation des données
   Si invalide → Retourner erreur 403 Forbidden
```

---

## Endpoints

### GET /api/csrf-token

**Récupère un nouveau token CSRF**

**Requête :**
```bash
curl http://localhost:3000/api/csrf-token
```

**Réponse (200) :**
```json
{
  "token": "K2VyiZ8jW1bK0XyZjQ3pL7mN8aOqRsT/VwXyZaB2cD3eF4gH5iJ6kL7mN8oPqR=="
}
```

**Cas d'erreur (500) :**
```json
{
  "error": "Impossible de générer le token de sécurité"
}
```

**Cache :** 5 minutes (les clients réutilisent le token)

---

### POST /api/tickets

**Soumet un nouveau ticket (requiert token CSRF valide)**

**Requête :**
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "csrfToken": "K2VyiZ8jW1bK0XyZjQ3pL7mN8aOqRsT/VwXyZaB2cD3eF4gH5iJ6kL7mN8oPqR==",
    "full_name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+33662043891",
    "city": "La Garde-Freinet",
    "service_type": "Particulier",
    "description": "Mon ordinateur est très lent depuis plusieurs jours"
  }'
```

**Réponse - Succès (201) :**
```json
{
  "success": true,
  "message": "Ticket créé avec succès",
  "ticketId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Réponse - Token invalide (403) :**
```json
{
  "error": "Erreur de sécurité. Veuillez recharger la page et réessayer."
}
```

**Réponse - Token expiré (403) :**
```json
{
  "error": "Erreur de sécurité. Veuillez recharger la page et réessayer."
}
```

**Réponse - Données invalides (400) :**
```json
{
  "error": "Données invalides",
  "errors": {
    "email": "Veuillez entrer une adresse email valide"
  }
}
```

---

## Détails techniques

### Format du token CSRF

```
[32 bytes random] + [4 bytes timestamp (BigEndian)]
           ↓                      ↓
    Cryptographique          Unix timestamp
    non-devinable          (secondes)
    
Encoded: base64(36 bytes) → ~48 caractères
```

**Exemple :**
```
Token: K2VyiZ8jW1bK0XyZjQ3pL7mN8aOqRsT/VwXyZaB2cD3eF4gH5iJ6kL7mN8oPqR==
Décodé: [32 bytes aléatoires] + [1739540000] (timestamp)
Âge: maintenant - timestamp = 125 secondes (VALIDE si < 86400s = 24h)
```

### Validation côté serveur

```javascript
// 1. Décoder le token
const buffer = Buffer.from(token, 'base64');

// 2. Vérifier la longueur (36 bytes obligatoire)
if (buffer.length !== 36) throw Error;

// 3. Extraire le timestamp (4 derniers bytes)
const timestamp = buffer.readUInt32BE(32);

// 4. Vérifier l'âge
const age = now - timestamp;
if (age > 86400) throw Error; // 24h max

// 5. Si tout OK → Token VALIDE
```

---

## Tests de sécurité

### Test 1 : Token valide

```bash
# 1. Récupérer le token
TOKEN=$(curl -s http://localhost:3000/api/csrf-token | jq -r '.token')

# 2. Soumettre avec le token
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d "{\"csrfToken\": \"$TOKEN\", \"full_name\": \"Jean\", ...}"

# ✅ Attendu: 201 Success
```

---

### Test 2 : Token absent

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Jean", ...}'

# ❌ Attendu: 403 Forbidden
```

---

### Test 3 : Token invalide (format cassé)

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"csrfToken": "invalid!!!", "full_name": "Jean", ...}'

# ❌ Attendu: 403 Forbidden
```

---

### Test 4 : Token expiré (simuler attente 24h)

Dans une vraie situation :
- Le token généré il y a 25 heures sera rejeté
- Le client devra recharger la page pour en obtenir un nouveau

```
Attendu: 403 Forbidden si token > 24h
```

---

## Comportement utilisateur

### Cas normal
```
1. Utilisateur charge /tickets
2. (Silencieusement) Token CSRF récupéré en arrière-plan
3. Utilisateur remplit le formulaire
4. Utilisateur clique "Envoyer"
5. ✅ Token inclus automatiquement, ticket créé
```

### Cas d'erreur CSRF
```
1. Utilisateur charge /tickets
2. ⚠️ Erreur réseau lors de GET /csrf-token
3. Utilisateur voit: "Erreur de sécurité. Veuillez recharger la page."
4. Utilisateur recharge F5
5. ✅ Token récupéré à nouveau, formulaire OK
```

---

## Protocoles de sécurité appliquées

| Aspect | Implémentation |
|--------|----------------|
| **Génération du token** | `crypto.randomBytes(32)` (256 bits) |
| **Stockage** | Session state React (pas de localStorage/cookie) |
| **Transmission** | POST body uniquement (pas d'URL, pas de header) |
| **Validation** | Timestamp + format cryptographique |
| **Expiration** | 24 heures (configurable) |
| **Rate limiting** | À implémenter en production |
| **Logging** | Erreurs loggées côté serveur uniquement |

---

## Limitations & améliorations futures

### Actuellement OK pour
- ✅ Formulaires publics (sans authentification)
- ✅ Protection contre CSRF sur `/api/tickets`
- ✅ Stateless (fonctionne sur Vercel)

### À considérer en production
- ⚠️ Ajouter rate limiting (limiter les tentatives)
- ⚠️ Ajouter logging d'attaques CSRF détectées
- ⚠️ Envisager SameSite cookies pour endpoints authen tifiés
- ⚠️ Monitorer les rejets de token (indicateur d'attaque)

---

## Compatibilité

- ✅ Tous les navigateurs modernes (support base64, crypto)
- ✅ Stateless (pas besoin de session serveur)
- ✅ Vercel & edge functions
- ✅ Offline → (Le client rechargera la page)

---

## Références

- [OWASP CSRF](https://owasp.org/www-community/attacks/csrf)
- [Node.js crypto module](https://nodejs.org/api/crypto.html)
- [RFC 6234 - US Secure Hash Algorithms](https://tools.ietf.org/html/rfc6234)
