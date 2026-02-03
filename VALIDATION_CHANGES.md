# Changements de Validation - API /api/tickets

## Résumé des modifications

### ✅ Avant
- ❌ Pas de validation server-side
- ❌ Données vides acceptées (fallback à '')
- ❌ Erreurs trop verboses (révèlent infrastructure)
- ❌ Pas de protection MIME type
- ❌ Appel direct à Supabase depuis le client

### ✅ Après
- ✅ Validation stricte server-side pour tous les champs
- ✅ Vérification format email, téléphone, ville
- ✅ Longueurs min/max pour chaque champ
- ✅ Messages d'erreur génériques en prod (protection)
- ✅ Vérification Content-Type
- ✅ Utilisation API endpoint au lieu de client Supabase direct

---

## Champs validés

| Champ | Min | Max | Format | Requis |
|-------|-----|-----|--------|--------|
| `full_name` | 2 | 100 | Lettres, espaces, tirets, apostrophes | ✅ |
| `email` | - | 255 | Format email valide | ✅ |
| `phone` | 8 | 20 | Chiffres, espaces, tirets, parenthèses, +, . | ✅ |
| `city` | 2 | 100 | Lettres, espaces, tirets, apostrophes | ✅ |
| `description` | 10 | 2000 | Texte libre | ✅ |
| `service_type` | - | - | Particulier \| Professionnel \| Administratif | ✅ |

---

## Exemples de réponses

### ✅ Succès (201)
```json
{
  "success": true,
  "message": "Ticket créé avec succès",
  "ticketId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### ❌ Validation échouée (400)
```json
{
  "error": "Données invalides",
  "errors": {
    "email": "Veuillez entrer une adresse email valide",
    "phone": "Le téléphone doit contenir entre 8 et 20 caractères"
  }
}
```

### ❌ Erreur serveur (500)
```json
{
  "error": "Erreur serveur. Veuillez réessayer plus tard."
}
```

---

## Migration de la page /tickets

### Avant
```javascript
const { error: sbError } = await supabase
  .from('tickets')
  .insert([...])
```

### Après
```javascript
const response = await fetch('/api/tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...})
})

const result = await response.json()
if (!response.ok) {
  if (result.errors) {
    // Afficher les erreurs de validation
    setError(Object.values(result.errors).join('\n'))
  }
}
```

---

## Tests locaux

### Test 1 : Soumission valide
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+33662043891",
    "city": "La Garde-Freinet",
    "service_type": "Particulier",
    "description": "Mon ordinateur est très lent depuis plusieurs jours"
  }'
```

**Réponse attendue:** `201 { "success": true }`

---

### Test 2 : Email invalide
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jean Dupont",
    "email": "invalid-email",
    "phone": "+33662043891",
    "city": "La Garde-Freinet",
    "service_type": "Particulier",
    "description": "Mon ordinateur est très lent depuis plusieurs jours"
  }'
```

**Réponse attendue:** `400 { "error": "Données invalides", "errors": { "email": "Veuillez entrer une adresse email valide" } }`

---

### Test 3 : Description trop courte
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+33662043891",
    "city": "La Garde-Freinet",
    "service_type": "Particulier",
    "description": "Lent"
  }'
```

**Réponse attendue:** `400 { "errors": { "description": "La description doit contenir entre 10 et 2000 caractères" } }`

---

### Test 4 : Content-Type invalide
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: text/plain" \
  -d '{"full_name":"Jean"}'
```

**Réponse attendue:** `400 { "error": "Content-Type doit être application/json" }`

---

## Logging serveur

Toutes les erreurs sont loggées côté serveur (visible dans les logs Vercel/Node), mais **jamais exposées au client** pour des raisons de sécurité.

Exemples dans les logs :
```
✅ Ticket créé avec succès. ID: 550e8400-e29b-41d4-a716-446655440000
Erreur Supabase: { code: 'PGRST200', message: 'RLS violation', details: '...' }
Erreur interne serveur: SyntaxError: Unexpected token...
```

---

## Notes de sécurité

1. **Validation client + serveur** : Le client valide pour UX, le serveur pour sécurité
2. **Pas de révélation d'infrastructure** : Les erreurs Supabase ne sont jamais exposées
3. **Protection MIME** : Seul `application/json` est accepté
4. **Injection évitée** : Utilisation de l'ORM Supabase (pas de raw SQL)
5. **Rate limiting** : À implémenter en production (voir priorité IMPORTANT)

---

## Backward compatibility

✅ Complètement compatible. Les anciens clients continuent de fonctionner.

Les champs `body.name` et `body.message` sont toujours acceptés comme aliases :
```javascript
full_name: body.full_name || body.name,
description: body.description || body.message
```
