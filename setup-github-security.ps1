# Guide pour obtenir votre GitHub Personal Access Token (PAT)
# Et configurer automatiquement les règles de branche

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Configuration Automatique - Protection Branche GitHub        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Créer le token
Write-Host "📝 ÉTAPE 1: Créer un Personal Access Token (PAT)" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Allez sur: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "  2. Cliquez 'Generate new token' → 'Generate new token (classic)'" -ForegroundColor Gray
Write-Host "  3. Remplissez:" -ForegroundColor Gray
Write-Host "     • Note: 'Chiussi Services - Branch Protection'" -ForegroundColor Gray
Write-Host "     • Expiration: '7 days'" -ForegroundColor Gray
Write-Host "  4. Cochez les permissions:" -ForegroundColor Gray
Write-Host "     ☑ repo (accès complet aux dépôts privés/publics)" -ForegroundColor Gray
Write-Host "     ☑ admin:repo_hook (hooks et déploiement)" -ForegroundColor Gray
Write-Host "  5. Cliquez 'Generate token'" -ForegroundColor Gray
Write-Host "  6. 📌 COPIER LE TOKEN (n'apparaîtra qu'une fois!)" -ForegroundColor Green
Write-Host ""
Write-Host "⏸️  Appuyez sur Entrée quand vous avez copié le token..." -ForegroundColor Magenta
Read-Host

# Étape 2: Coller le token
Write-Host ""
Write-Host "🔑 ÉTAPE 2: Entrer le token" -ForegroundColor Yellow
$gitHubToken = Read-Host "Collez votre Personal Access Token"

if ([string]::IsNullOrWhiteSpace($gitHubToken)) {
    Write-Host "❌ Token vide!" -ForegroundColor Red
    exit 1
}

# Étape 3: Valider le token
Write-Host ""
Write-Host "🔍 ÉTAPE 3: Validation du token..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "token $gitHubToken"
    "Accept" = "application/vnd.github+json"
}

try {
    $userInfo = Invoke-RestMethod `
        -Uri "https://api.github.com/user" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ Token valide!" -ForegroundColor Green
    Write-Host "👤 Utilisateur: $($userInfo.login)" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "❌ Token invalide ou expiré!" -ForegroundColor Red
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Étape 4: Exécuter le script de configuration
Write-Host "⚙️  ÉTAPE 4: Configuration des règles de branche..." -ForegroundColor Yellow
Write-Host ""

$scriptPath = Join-Path $PSScriptRoot "setup-github-branch-protection.ps1"

if (Test-Path $scriptPath) {
    & $scriptPath `
        -Token $gitHubToken `
        -Owner "FireOneTap" `
        -Repo "chiussi-services" `
        -Branch "main"
    
    Write-Host ""
    Write-Host "✨ Configuration terminée!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Vérifiez la configuration sur GitHub:" -ForegroundColor Cyan
    Write-Host "   https://github.com/FireOneTap/chiussi-services/settings/branches" -ForegroundColor Blue
    Write-Host ""
    
} else {
    Write-Host "❌ Fichier setup-github-branch-protection.ps1 non trouvé!" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le bon répertoire." -ForegroundColor Red
    exit 1
}

# Sécurité: Nettoyer le token de la mémoire
$gitHubToken = $null
[System.GC]::Collect()

Write-Host "🔒 Le token a été supprimé de la mémoire pour la sécurité." -ForegroundColor Cyan
Write-Host ""
Write-Host "Conseil de sécurité: Changez le token dans GitHub si vous le trouvez compromis!" -ForegroundColor Yellow
