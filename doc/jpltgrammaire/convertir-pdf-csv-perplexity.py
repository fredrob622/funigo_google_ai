import csv
import re

# Lire le PDF en texte (ici, on suppose que vous avez déjà extrait le texte dans 'input.txt')
with open('VocabulaireN1.pdf', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Nettoyer les lignes indésirables
lines = [line for line in lines if "Vocabulaire du JLPT N1" not in line and "Go-I 語彙 : www.go-i.fr" not in line]

# Préparer le CSV
with open('output.csv', 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    # Écrire l'en-tête
    writer.writerow(['Niveau', 'Kanas', 'Kanjis', 'Français'])
    
    for line in lines:
        # Supposons que les champs sont séparés par des tabulations ou espaces multiples
        # Adaptez la regex selon la structure exacte du texte
        parts = re.split(r'\t+|\s{2,}', line.strip())
        if len(parts) >= 4:
            # Prendre les 4 premiers éléments
            writer.writerow(parts[:4])
