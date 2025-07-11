import sys
import os

def process_csv_for_empty_fields(input_csv_path, output_empty_csv_path, expected_fields=4):
    """
    Extrait les lignes d'un fichier CSV qui contiennent des champs vides
    et les déplace vers un nouveau fichier. Les lignes sans champs vides
    restent dans le fichier original.

    Args:
        input_csv_path (str): Chemin complet vers le fichier CSV d'entrée (e.g., VocabulaireN1_JLPT.csv).
        output_empty_csv_path (str): Chemin complet vers le fichier CSV de sortie pour les lignes avec champs vides.
        expected_fields (int): Le nombre attendu de champs par ligne. Par défaut à 4.
    """
    print(f"Traitement du fichier CSV : '{input_csv_path}' pour identifier et déplacer les lignes avec des champs vides.")

    # Vérifier si le fichier CSV d'entrée existe
    if not os.path.exists(input_csv_path):
        print(f"Erreur : Le fichier CSV d'entrée '{input_csv_path}' est introuvable. Veuillez vérifier le chemin.")
        return

    lines_with_empty_fields = []
    lines_without_empty_fields = []
    line_count = 0
    header = ""

    try:
        with open(input_csv_path, 'r', encoding='utf-8', newline='') as f:
            # Lire l'en-tête (première ligne)
            header = f.readline().strip()
            if header:
                line_count += 1 # Compter la ligne d'en-tête
                # Vérifier si l'en-tête lui-même a le bon nombre de champs
                if len(header.split(';')) != expected_fields:
                    print(f"Avertissement: L'en-tête du CSV n'a pas {expected_fields} champs. Il sera traité comme une ligne normale si ses champs sont vides.")
                
                # Ajouter l'en-tête aux lignes sans champs vides par défaut,
                # sauf si l'en-tête lui-même contient des champs vides (peu probable mais possible)
                # ou si nous voulons le réécrire manuellement plus tard.
                # Pour ce cas, nous allons le gérer séparément pour le fichier de sortie des vides
                # et le conserver pour le fichier original nettoyé.
                lines_without_empty_fields.append(header)
            else:
                print("Avertissement: Le fichier d'entrée est vide.")
                return

            for line in f:
                line_count += 1
                cleaned_line = line.strip()
                
                if not cleaned_line: # Ignorer les lignes complètement vides
                    continue

                fields = cleaned_line.split(';')
                
                # Nettoyer les champs (supprimer les guillemets et les espaces)
                cleaned_fields = [field.strip().strip('"') for field in fields]

                # Vérifier si la ligne a le bon nombre de champs ET si l'un d'entre eux est vide
                has_empty_field = False
                if len(cleaned_fields) == expected_fields:
                    for field in cleaned_fields:
                        if not field: # Si le champ est vide après nettoyage
                            has_empty_field = True
                            break
                else:
                    # Si le nombre de champs n'est pas le bon, nous le considérons comme malformé
                    # et il est probable qu'il contienne aussi des champs "vides" ou mal alignés.
                    # Pour cette requête, nous nous concentrons sur les champs vides,
                    # donc nous allons quand même vérifier si des champs sont vides même si le compte est incorrect.
                    # Cependant, la demande est "lignes qui ont des champs vides", donc on se concentre sur ça.
                    # Si la ligne n'a pas 4 champs, elle est malformée, mais pas nécessairement "vide" au sens strict.
                    # Pour cette tâche, nous allons nous concentrer sur les lignes à 4 champs avec des vides.
                    # Si l'utilisateur veut aussi les lignes à X champs != 4, c'est une autre requête.
                    # Pour l'instant, on se concentre sur les 4 champs avec des vides.
                    pass # On ne traite pas les lignes avec un nombre de champs incorrect comme "vides" ici,
                         # mais le script précédent les aurait déjà identifiées comme malformées.
                         # On se concentre sur la présence de "" dans les 4 champs.

                if has_empty_field:
                    lines_with_empty_fields.append(cleaned_line)
                else:
                    lines_without_empty_fields.append(cleaned_line)

        # Écrire les lignes avec champs vides dans le nouveau fichier CSV
        if lines_with_empty_fields:
            # Assurez-vous que le répertoire de sortie existe
            output_dir = os.path.dirname(output_empty_csv_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)

            with open(output_empty_csv_path, 'w', encoding='utf-8', newline='') as outfile:
                outfile.write(header + "\n") # Inclure l'en-tête dans le fichier des lignes vides
                for line in lines_with_empty_fields:
                    outfile.write(line + "\n")
            print(f"\n{len(lines_with_empty_fields)} lignes avec champs vides ont été enregistrées dans '{output_empty_csv_path}'.")
        else:
            print("\nAucune ligne avec des champs vides n'a été trouvée.")

        # Réécrire le fichier CSV original avec les lignes sans champs vides
        # Nous incluons l'en-tête que nous avons lu au début.
        with open(input_csv_path, 'w', encoding='utf-8', newline='') as outfile:
            # Réécrire l'en-tête
            outfile.write(header + "\n")
            # Écrire les lignes sans champs vides (sauf l'en-tête qui est déjà écrit)
            for line in lines_without_empty_fields[1:]: # Commencer à partir du deuxième élément pour exclure l'en-tête
                outfile.write(line + "\n")
        print(f"{len(lines_without_empty_fields) - 1} lignes (hors en-tête) sans champs vides ont été conservées dans '{input_csv_path}'.")
        print("Opération terminée.")

    except Exception as e:
        print(f"Erreur lors de l'exécution du script : {e}")

# --- Bloc d'exécution principal ---
if __name__ == "__main__":
    # Vérifier si les arguments nécessaires sont fournis
    if len(sys.argv) != 3:
        print("Utilisation : python process_csv_empty_fields.py <chemin_fichier_csv_entree> <chemin_fichier_csv_sortie_vides>")
        print("Exemple : python process_csv_empty_fields.py \"C:\\Fichiers_Users\\funigo\\doc\\jpltgrammaire\\VocabulaireN1_JLPT.csv\" \"C:\\Fichiers_Users\\funigo\\doc\\jpltgrammaire\\VocabulaireN1_JLPT_champs_vides.csv\"")
        sys.exit(1) # Quitter avec un code d'erreur

    input_csv = sys.argv[1]
    output_empty_csv = sys.argv[2]

    process_csv_for_empty_fields(input_csv, output_empty_csv)
