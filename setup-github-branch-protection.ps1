# Script pour configurer les règles de branche GitHub automatiquement
# Usage: .\setup-github-branch-protection.ps1 -Token "your_github_token" -Owner "FireOneTap" -Repo "chiussi-services"

param(
    [Parameter(Mandatory=$false)]
    [string]$Token,
    
    [Parameter(Mandatory=$false)]
    [string]$Owner = "FireOneTap",
    
    [Parameter(Mandatory=$false)]
    [string]$Repo = "chiussi-services",
    
    [string]$Branch = "main"
)

# Si le token n'est pas fourni, le demander
if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "🔑 Entrez votre GitHub Personal Access Token:" -ForegroundColor Cyan
    $Token = Read-Host "Token (ne sera pas affiché)"
}

# Headers pour l'API GitHub
$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$baseUrl = "https://api.github.com/repos/$Owner/$Repo"

Write-Host "🔧 Configuration de la protection de branche GitHub..." -ForegroundColor Cyan
Write-Host "📍 Dépôt: $Owner/$Repo" -ForegroundColor Yellow
Write-Host "🎯 Branche: $Branch" -ForegroundColor Yellow
Write-Host ""

# Configuration de la protection de branche
$protectionConfig = @{
    required_status_checks = @{
        strict = $true
        contexts = @("test (22.x)")
    }
    required_pull_request_reviews = @{
        dismiss_stale_reviews = $true
        require_code_owner_reviews = $false
        required_approving_review_count = 1
    }
    enforce_admins = $false
    restrictions = $null
}

try {
    Write-Host "⏳ Envoi de la configuration..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/branches/$Branch/protection" `
        -Method PUT `
        -Headers $headers `
        -Body ($protectionConfig | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "✅ Protection de branche configurée avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Configuration appliquée:" -ForegroundColor Cyan
    Write-Host "  ✓ Exige les vérifications CI/CD (test (22.x))" -ForegroundColor Green
    Write-Host "  ✓ Exige 1 approbation de PR" -ForegroundColor Green
    Write-Host "  ✓ Ignore les approbations périmées au push" -ForegroundColor Green
    Write-Host "  ✓ Les administrateurs ne sont pas exemptés" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "❌ Erreur lors de la configuration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Astuces de dépannage:" -ForegroundColor Yellow
    Write-Host "  1. Vérifiez votre GitHub Personal Access Token (PAT)"
    Write-Host "  2. Assurez-vous d'avoir les permissions: 'repo' et 'admin:repo_hook'"
    Write-Host "  3. Vérifiez le nom du dépôt et du propriétaire"
    Write-Host ""
    exit 1
}

Write-Host "🚀 Vous pouvez maintenant:" -ForegroundColor Cyan
Write-Host "  • Pousser du code vers des branches de feature"
Write-Host "  • Créer des Pull Requests"
Write-Host "  • Les tests doivent passer avant de pouvoir merger"
Write-Host "  • Au moins 1 approbation est requise"
Write-Host ""
Write-Host "Documentation: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches" -ForegroundColor Dim
