import re
import csv
import os

# 📁 Dossier contenant le fichier d'entrée/sortie
base_dir = r"C:\\Fichiers_Users\\jplt grammaire"
input_file = os.path.join(base_dir, "GrammaireN4_extrait.txt")
output_file = os.path.join(base_dir, "Grammaire_JLPT_N4.csv")

def format_text(text):
    return re.sub(r"(?<=[。\.])\s*", "\n", text)

# 📖 Lecture du fichier texte
with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

# 🧹 Nettoyage
text = text.replace("Grammaire du JLPT N4\nGo-I 語彙 : www.go-i.fr\n", "")
text = re.sub(r"Page \d+ sur \d+\n", "", text)

# ✂️ Séparation des blocs
entries = re.split(r"\n(?=\S[^\n]*\nNom\n)", text)

data = []
for entry in entries:
    lines = entry.strip().split("\n")
    try:
        titre = lines[0].strip()
        nom_idx = lines.index("Nom")
        desc_idx = lines.index("Description")
        constr_idx = lines.index("Construction")
        ex_idx = lines.index("Exemples")

        nom = " ".join(lines[nom_idx+1:desc_idx]).strip()
        description = format_text(" ".join(lines[desc_idx+1:constr_idx]).strip())
        construction = format_text(" ".join(lines[constr_idx+1:ex_idx]).strip())
        exemples = format_text(" ".join(lines[ex_idx+1:]).strip())

        data.append({
            "Titre": titre,
            "Nom": nom,
            "Description": description,
            "Construction": construction,
            "Exemples": exemples
        })
    except ValueError:
        continue

# 💾 Écriture du CSV
with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["Titre", "Nom", "Description", "Construction", "Exemples"], quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(data)

print("✅ Conversion terminée ! Fichier créé :", output_file)
