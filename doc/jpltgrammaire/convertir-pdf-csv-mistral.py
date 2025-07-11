import PyPDF2
import pandas as pd
import re

# Fonction pour extraire le texte du PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
    return text

# Fonction pour analyser le texte et extraire les données
def parse_text_to_data(text):
    # Utiliser une expression régulière pour extraire les données
    pattern = r'\| (N\d+) \| ([\w\・\sー]+) \| ([\w\・\sー]+) \| ([\w\・\sー]+) \|'
    matches = re.findall(pattern, text)

    # Créer une liste de dictionnaires pour chaque ligne de données
    data = []
    for match in matches:
        data.append({
            "Niveau": match[0],
            "Kanas": match[1],
            "Kanjis": match[2],
            "Français": match[3]
        })
    return data

# Chemin vers le fichier PDF
pdf_path = 'VocabulaireN1.pdf'

# Extraire le texte du PDF
text = extract_text_from_pdf(pdf_path)

# Analyser le texte et obtenir les données
data = parse_text_to_data(text)

# Créer un DataFrame pandas
df = pd.DataFrame(data)

# Sauvegarder le DataFrame en fichier CSV
csv_path = 'vocabulaire_n1.csv'
df.to_csv(csv_path, index=False)

print(f"Le fichier CSV a été sauvegardé sous le nom {csv_path}")
