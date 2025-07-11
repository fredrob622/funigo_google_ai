# Script PowerShell pour convertir un fichier texte de vocabulaire nettoyé en CSV
# Format de sortie : champs entre guillemets, séparés par des points-virgules,
# idéal pour l'importation dans une base de données MySQL.
# Auteur : Gemini

param (
    [Parameter(Mandatory=$true)]
    [string]$InputTxtPath, # Chemin vers le fichier texte nettoyé d'entrée (e.g., VocabulaireN1_cleaned.txt)

    [Parameter(Mandatory=$true)]
    [string]$CsvFilePath # Chemin vers le fichier CSV de sortie (e.g., VocabulaireN1_JLPT.csv)
)

# --- Début du mode débogage ---
$debugMode = $true 

function Write-DebugMessage {
    param (
        [string]$Message
    )
    if ($debugMode) {
        Write-Host "DEBUG: $Message" -ForegroundColor DarkGray
    }
}
# --- Fin du mode débogage ---

# Vérification précoce des paramètres
if ([string]::IsNullOrEmpty($InputTxtPath)) {
    Write-Error "Erreur critique : Le paramètre -InputTxtPath est vide ou non défini."
    exit 1
}
if ([string]::IsNullOrEmpty($CsvFilePath)) {
    Write-Error "Erreur critique : Le paramètre -CsvFilePath est vide ou non défini."
    exit 1
}

Write-DebugMessage "Paramètres reçus et validés: InputTxtPath = '$InputTxtPath', CsvFilePath = '$CsvFilePath'"

# Vérifier si le fichier texte d'entrée existe
if (-not (Test-Path $InputTxtPath)) {
    Write-Error "Erreur : Le fichier texte d'entrée '$InputTxtPath' est introuvable. Veuillez vérifier le chemin."
    exit 1
}

Write-Host "Début de la conversion du fichier texte en CSV pour MySQL..."

# Lire toutes les lignes du fichier texte nettoyé
$lines = Get-Content -Path $InputTxtPath -Encoding UTF8
Write-DebugMessage "Nombre total de lignes lues : $($lines.Count)"

# Filtrer les lignes vides pour un traitement plus propre
$nonEmptyLines = $lines | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
Write-DebugMessage "Nombre de lignes non vides : $($nonEmptyLines.Count)"

# Définir l'en-tête CSV
# Les 4 premières lignes non vides du fichier texte sont les noms des colonnes
if ($nonEmptyLines.Count -lt 4) {
    Write-Error "Erreur : Le fichier d'entrée ne contient pas suffisamment de lignes pour définir l'en-tête et au moins une entrée."
    exit 1
}

# Extraire les noms des colonnes des 4 premières lignes et les mettre entre guillemets
# Utilisation de 'Francais' au lieu de 'Français' pour éviter les problèmes d'encodage dans le script.
$headerNames = @(
    "`"$($nonEmptyLines[0].Trim())`"",
    "`"$($nonEmptyLines[1].Trim())`"",
    "`"$($nonEmptyLines[2].Trim())`"",
    "`"$($nonEmptyLines[3].Trim())`""
)
$csvHeaderLine = $headerNames -join ";"
Write-DebugMessage "En-tête CSV généré: '$csvHeaderLine'"

# Initialiser un tableau pour stocker toutes les lignes de données CSV
$csvDataLines = @()

# Variables d'état pour le parsing
$currentEntry = $null # Va contenir les données de l'entrée en cours
$expectedField = "Niveau" # Peut être "Niveau", "Kanas", "Kanjis", "Francais"

# Expression régulière pour détecter les niveaux JLPT (N1, N2, N3, N4, N5)
$jlptLevelRegex = "^N[1-5]$"

# Parcourir les lignes restantes à partir de l'index 4 (après l'en-tête)
for ($i = 4; $i -lt $nonEmptyLines.Count; $i++) {
    $line = $nonEmptyLines[$i].Trim()

    # Ligne modifiée pour utiliser une interpolation de chaîne plus robuste
    Write-DebugMessage "Traitement de la ligne $($i): '$($line)'. Champ attendu: $($expectedField)"

    switch ($expectedField) {
        "Niveau" {
            if ($line -match $jlptLevelRegex) {
                # C'est un nouveau niveau, donc une nouvelle entrée
                # Si une entrée précédente est en cours, l'ajouter aux lignes CSV
                if ($currentEntry -ne $null) {
                    $csvDataLines += "`"$($currentEntry.Niveau)`";`"$($currentEntry.Kanas)`";`"$($currentEntry.Kanjis)`";`"$($currentEntry.Francais)`""
                    Write-DebugMessage "Entrée complète ajoutée: $($csvDataLines[-1])"
                }
                
                # Initialiser une nouvelle entrée
                $currentEntry = New-Object PSObject -Property @{
                    Niveau = $line
                    Kanas = ""
                    Kanjis = ""
                    Francais = "" # Changé de 'Français' à 'Francais'
                }
                $expectedField = "Kanas"
                Write-DebugMessage "Niveau détecté: '$line'. Prochain: Kanas"
            } else {
                Write-Warning "Avertissement : Ligne inattendue (non JLPT niveau) alors que 'Niveau' était attendu: '$line'. Ligne ignorée."
                # Rester dans l'état "Niveau" jusqu'à ce qu'un niveau JLPT valide soit trouvé.
            }
        }
        "Kanas" {
            if ($currentEntry -ne $null) {
                $currentEntry.Kanas = $line
                $expectedField = "Kanjis" # Ensuite, attendre Kanji (ou Francais si Kanji est manquant)
                Write-DebugMessage "Kanas ajouté: '$line'. Prochain: Kanjis"
            } else {
                Write-Warning "Avertissement : Kanas détecté sans entrée courante. Ligne ignorée: '$line'."
                $expectedField = "Niveau" # Réinitialiser à Niveau pour trouver le début d'une nouvelle entrée
            }
        }
        "Kanjis" {
            if ($currentEntry -ne $null) {
                # Examiner la ligne suivante pour décider si la ligne actuelle est Kanji ou Francais
                $peekNextLine = ""
                if (($i + 1) -lt $nonEmptyLines.Count) {
                    $peekNextLine = $nonEmptyLines[$i + 1].Trim()
                }

                if ($peekNextLine -match $jlptLevelRegex) {
                    # La ligne suivante est un nouveau niveau, donc la ligne actuelle doit être le Francais (Kanji est manquant)
                    $currentEntry.Francais = $line # Changé de 'Français' à 'Francais'
                    $currentEntry.Kanjis = "" # S'assurer que Kanji est vide
                    $expectedField = "Niveau" # Prêt pour la prochaine entrée
                    Write-DebugMessage "Francais ajouté (Kanji manquant): '$line'. Prochain: Niveau"
                } else {
                    # La ligne suivante n'est PAS un niveau, donc la ligne actuelle est Kanji
                    $currentEntry.Kanjis = $line
                    $expectedField = "Francais" # Ensuite, attendre Francais
                    Write-DebugMessage "Kanjis ajouté: '$line'. Prochain: Francais"
                }
            } else {
                Write-Warning "Avertissement : Kanjis détecté sans entrée courante. Ligne ignorée: '$line'."
                $expectedField = "Niveau" # Réinitialiser à Niveau pour trouver le début d'une nouvelle entrée
            }
        }
        "Francais" { # Changé de 'Français' à 'Francais'
            if ($currentEntry -ne $null) {
                $currentEntry.Francais = $line # Changé de 'Français' à 'Francais'
                # Entrée complète, ajouter aux lignes CSV
                $csvDataLines += "`"$($currentEntry.Niveau)`";`"$($currentEntry.Kanas)`";`"$($currentEntry.Kanjis)`";`"$($currentEntry.Francais)`""
                Write-DebugMessage "Entrée complète ajoutée: $($csvDataLines[-1])"
                $currentEntry = $null # Effacer l'entrée courante
                $expectedField = "Niveau" # Prêt pour la prochaine entrée
            } else {
                Write-Warning "Avertissement : Francais détecté sans entrée courante. Ligne ignorée: '$line'."
                $expectedField = "Niveau" # Réinitialiser à Niveau pour trouver le début d'une nouvelle entrée
            }
        }
    }
}

# Ajouter la dernière entrée si elle existe et n'a pas encore été ajoutée
if ($currentEntry -ne $null -and -not [string]::IsNullOrWhiteSpace($currentEntry.Niveau)) {
    $csvDataLines += "`"$($currentEntry.Niveau)`";`"$($currentEntry.Kanas)`";`"$($currentEntry.Kanjis)`";`"$($currentEntry.Francais)`""
    Write-DebugMessage "Dernière entrée ajoutée après la boucle: $($csvDataLines[-1])"
}

Write-DebugMessage "Nombre total de lignes de données CSV générées : $($csvDataLines.Count)"

# Assurez-vous que le répertoire de sortie existe
$outputDir = Split-Path $CsvFilePath -Parent
Write-DebugMessage "Vérification du répertoire de sortie : '$outputDir'"
if (-not (Test-Path $outputDir)) {
    Write-DebugMessage "Répertoire de sortie non trouvé. Création de '$outputDir'..."
    New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
    Write-DebugMessage "Répertoire de sortie créé."
} else {
    Write-DebugMessage "Répertoire de sortie '$outputDir' existe déjà."
}

# Écrire l'en-tête et les données dans le fichier CSV
try {
    # Écrire l'en-tête
    Set-Content -Path $CsvFilePath -Value $csvHeaderLine -Encoding UTF8

    # Ajouter les lignes de données
    Add-Content -Path $CsvFilePath -Value $csvDataLines -Encoding UTF8

    Write-Host "Conversion terminée. Les données ont été sauvegardées dans '$CsvFilePath'."
    Write-Host "Nombre d'entrées de vocabulaire exportées : $($csvDataLines.Count)"
} catch {
    Write-Error "Erreur lors de l'écriture du fichier CSV de sortie '$CsvFilePath': $($_.Exception.Message)"
    exit 1
}
