import sys
import os

def extract_malformed_csv_lines(csv_file_path, expected_fields=4):
    """
    Extrait et affiche les lignes d'un fichier CSV qui n'ont pas le nombre attendu de champs.

    Args:
        csv_file_path (str): Chemin complet vers le fichier CSV à analyser.
        expected_fields (int): Le nombre attendu de champs par ligne. Par défaut à 4.
    """
    print(f"Analyse du fichier CSV : '{csv_file_path}' pour les lignes avec un nombre de champs différent de {expected_fields}.")

    # Vérifier si le fichier CSV existe
    if not os.path.exists(csv_file_path):
        print(f"Erreur : Le fichier CSV '{csv_file_path}' est introuvable. Veuillez vérifier le chemin.")
        return

    malformed_lines = []
    line_count = 0

    try:
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line_count += 1
                # Nettoyer la ligne (supprimer les espaces blancs et les retours à la ligne)
                cleaned_line = line.strip()
                
                # Ignorer les lignes vides
                if not cleaned_line:
                    continue

                # Diviser la ligne par le point-virgule
                fields = cleaned_line.split(';')
                
                # Vérifier le nombre de champs
                if len(fields) != expected_fields:
                    malformed_lines.append(f"Ligne {line_count} (champs: {len(fields)}): {cleaned_line}")

        if malformed_lines:
            print("\n--- Lignes avec un nombre de champs inattendu ---")
            for m_line in malformed_lines:
                print(m_line)
            print(f"\nTotal de lignes malformées trouvées : {len(malformed_lines)} sur {line_count} lignes lues.")
        else:
            print(f"\nAucune ligne malformée trouvée dans '{csv_file_path}'. Toutes les {line_count} lignes ont {expected_fields} champs.")

    except Exception as e:
        print(f"Erreur lors de la lecture ou de l'analyse du fichier CSV : {e}")

# --- Bloc d'exécution principal ---
if __name__ == "__main__":
    # Vérifier si l'argument nécessaire est fourni
    if len(sys.argv) != 2:
        print("Utilisation : python extract_malformed_csv_lines.py <chemin_fichier_csv>")
        print("Exemple : python extract_malformed_csv_lines.py \"C:\\Fichiers_Users\\funigo\\doc\\jpltgrammaire\\VocabulaireN1_JLPT.csv\"")
        sys.exit(1) # Quitter avec un code d'erreur

    csv_file = sys.argv[1]
    extract_malformed_csv_lines(csv_file)
