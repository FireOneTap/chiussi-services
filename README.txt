RÉSUMÉ TECHNIQUE DU PROJET : CHIUSSI SERVICES
1. Concept & Stack Technologique
Activité : Dépannage informatique, installation Wi-Fi et aide administrative dans le Golfe de Saint-Tropez.

Stack : Next.js (App Router), Tailwind CSS, Lucide React (icônes).

Base de données & Auth : Supabase (PostgreSQL + Supabase Auth).

Design System :

Couleurs : Fond Bleu Nuit (#1A2E44), accents Bleu Néon (#00D4FF), textes Gris/Blanc.

Style : Brutaliste moderne, polices en Black Italic (majuscules), arrondis massifs (2.5rem / 3xl), effets de Glassmorphism (bg-white/5 + backdrop-blur).

2. Structure de la Base de Données (Supabase)
La table unique s'appelle tickets avec la structure suivante :

id : uuid (généré automatiquement).

created_at : timestamp (date d'envoi).

service_type : text (Particulier, Professionnel, Administratif).

full_name : text (Nom complet).

email : text.

phone : text.

city : text.

description : text.

status : text (Valeurs : 'nouveau' ou 'terminé').

Sécurité (RLS) configurée :

INSERT : Autorisé pour les utilisateurs anonymes (public).

SELECT/ALL : Réservé aux utilisateurs authentifiés (admin).

3. Architecture des Pages
/ (Home) : Présentation des services avec le style visuel fort.

/tickets : Formulaire client dynamique (DarkMode, sélection de service, envoi vers Supabase).

/(admin)/login : Page de connexion sécurisée utilisant Supabase Auth, stylisée comme le reste du site.

/(admin)/dashboard : Console de gestion protégée. Permet de :

Visualiser les tickets (triés du plus récent au plus ancien).

Changer le statut (Nouveau ↔ Terminé).

Supprimer des tickets.

Se déconnecter.

4. Historique des Corrections Majeures
Permissions SQL : Nous avons dû forcer les GRANT ALL sur la table tickets pour le rôle anon afin d'éviter les erreurs RLS lors de l'envoi public.

Routing Admin : Utilisation des parenthèses (admin) pour regrouper les routes protégées sans impacter l'URL, avec une redirection systématique vers /login si aucune session n'est active.

Synchronisation des colonnes : Le Dashboard et le Formulaire ont été synchronisés pour utiliser exactement les mêmes noms de colonnes (full_name, city, service_type).

5. Ce qu'il reste à savoir pour la suite
Variables d'environnement : Le projet utilise NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.

Déploiement : Le projet est prêt pour Vercel ou tout autre hébergeur supportant Next.js.

Extension future : La base est prête pour l'ajout d'une gestion de calendrier ou de facturation simple.

Note pour l'IA suivante : "Le projet privilégie l'impact visuel (italique, majuscules, contrastes forts). Lors de toute modification, conserve impérativement l'arrondi 2.5rem pour les cartes et la couleur #00D4FF pour les actions principales."