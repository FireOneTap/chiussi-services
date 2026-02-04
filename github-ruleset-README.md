# GitHub Branch Protection Configuration
# Fichier JSON simplifié pour la documentation

Le JSON valide est dans `github-ruleset.json`

Voici ce qu'il configure:
- ✅ Exige les tests CI/CD (test (22.x))
- ✅ Exige 1 approbation de PR
- ✅ Ignore les approbations périmées
- ✅ Empêche les force-push
- ✅ Empêche les suppressions directes
- ✅ Exige que la branche soit à jour avant merge

Pour l'utiliser directement avec l'API GitHub:

Utilisez le script PowerShell à la place:
  .\setup-github-security.ps1

Ou directement:
  .\setup-github-branch-protection.ps1 -Token "votre_token" -Owner "FireOneTap" -Repo "chiussi-services"
