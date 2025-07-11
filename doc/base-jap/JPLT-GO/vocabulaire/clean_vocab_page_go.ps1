param (
    [string]$InputTxtPath,
    [string]$OutputTxtPath
)

Write-Debug "Paramètres reçus et validés: InputTxtPath = '$InputTxtPath', OutputTxtPath = '$OutputTxtPath'"
Write-Host "Début du nettoyage du fichier texte '$InputTxtPath'..."

# Lire toutes les lignes
$lines = Get-Content -Path $InputTxtPath -Encoding UTF8
$total = $lines.Count

# Filtrer les lignes à supprimer
$filtered = $lines | Where-Object {
    # Nettoyage des espaces et caractères invisibles
    $trimmed = $_.Trim()
    # On ignore si la ligne est vide
    if ($trimmed -eq "") { return $true }
    # Supprimer les lignes exactes (insensible à la casse et aux espaces)
    if ($trimmed -eq "Grammaire du JLPT N3") { return $false }
    if ($trimmed -eq "Go-I 語彙 : www.go-i.fr") { return $false }
    # Supprimer les lignes commençant par "Page" (avec ou sans espaces)
    if ($trimmed -match "^Page\b") { return $false }
    return $true
}

$removed = $total - $filtered.Count

Write-Debug "Nombre total de lignes lues : $total"
Write-Debug "Nombre de lignes supprimées : $removed"
Write-Debug "Vérification du répertoire de sortie : '$(Split-Path $OutputTxtPath)'"
if (!(Test-Path -Path (Split-Path $OutputTxtPath))) {
    New-Item -ItemType Directory -Path (Split-Path $OutputTxtPath) | Out-Null
    Write-Debug "Répertoire créé."
} else {
    Write-Debug "Répertoire de sortie '$(Split-Path $OutputTxtPath)' existe déjà."
}

# Écrire le résultat
$filtered | Set-Content -Path $OutputTxtPath -Encoding UTF8

Write-Host "Nettoyage terminé. Les données nettoyées ont été sauvegardées dans '$OutputTxtPath'."
Write-Host "Nombre de lignes avant nettoyage : $total"
Write-Host "Nombre de lignes après nettoyage : $($filtered.Count)"
