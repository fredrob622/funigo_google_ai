import re
import os
import sys
import datetime # Importation pour horodatage du fichier log

# Variable globale pour le fichier log
log_file_handle = None

def convert_vocab_to_csv_python(input_txt_path, csv_file_path):
    """
    Convertit un fichier texte de vocabulaire nettoyé en un fichier CSV.
    Le script détecte les entrées de vocabulaire en se basant sur les niveaux JLPT (N1-N5),
    gère les champs manquants (notamment le Kanji), et formate la sortie en CSV
    avec des champs entre guillemets et séparés par des points-virgules.

    Args:
        input_txt_path (str): Chemin complet vers le fichier texte d'entrée nettoyé.
        csv_file_path (str): Chemin complet vers le fichier CSV de sortie.
    """
    global log_file_handle

    # Définir le chemin du fichier log dans le même répertoire que le CSV de sortie
    log_dir = os.path.dirname(csv_file_path)
    if not log_dir: # Si csv_file_path est juste un nom de fichier, utiliser le répertoire courant
        log_dir = os.getcwd()
    
    # Assurez-vous que le répertoire du log existe
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    log_filename = os.path.join(log_dir, f"conversion_log_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log")

    try:
        log_file_handle = open(log_filename, 'w', encoding='utf-8')
        print(f"Les messages de débogage sont également écrits dans : '{log_filename}'")
    except Exception as e:
        print(f"Erreur : Impossible d'ouvrir le fichier log '{log_filename}': {e}")
        log_file_handle = None # S'assurer qu'il est None pour éviter les erreurs d'écriture

    # Fonction auxiliaire pour nettoyer les champs (supprimer les guillemets et les espaces blancs)
    def clean_field(field):
        return field.strip().strip('"')

    # Fonction auxiliaire pour les messages de log (débogage, avertissement, erreur)
    def write_log_message(message, level="DEBUG", original_line_num=None):
        # console_debug_mode: Mettez à False pour désactiver les messages DEBUG en console.
        # Les WARNING/ERROR seront toujours affichés en console.
        console_debug_mode = True 
        
        prefix = f"{level}: "
        if original_line_num is not None:
            prefix += f"Ligne {original_line_num}: "

        # Affichage en console
        if console_debug_mode or level in ["AVERTISSEMENT", "ERREUR"]:
            print(f"{prefix}{message}") 
        
        # Écriture dans le fichier log: Seulement les messages d'AVERTISSEMENT et d'ERREUR
        if log_file_handle and level in ["AVERTISSEMENT", "ERREUR"]:
            try:
                log_file_handle.write(f"{prefix}{message}\n")
            except Exception as e:
                print(f"Erreur lors de l'écriture dans le fichier log : {e}")

    write_log_message(f"Démarrage de la conversion pour l'entrée : '{input_txt_path}', sortie : '{csv_file_path}'")

    # Vérifier si le fichier d'entrée existe
    if not os.path.exists(input_txt_path):
        print(f"Erreur : Le fichier d'entrée '{input_txt_path}' est introuvable. Veuillez vérifier le chemin.")
        if log_file_handle:
            log_file_handle.close()
        return

    try:
        # Lire toutes les lignes du fichier et filtrer les lignes vides
        with open(input_txt_path, 'r', encoding='utf-8') as f:
            raw_lines = [line.strip() for line in f if line.strip()]
        write_log_message(f"Nombre total de lignes non vides lues : {len(raw_lines)}")
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier d'entrée : {e}")
        if log_file_handle:
            log_file_handle.close()
        return

    # Définir l'en-tête CSV fixe
    csv_header_line = '"Niveau";"Kanas";"Kanjis";"Francais"'
    write_log_message(f"Ligne d'en-tête CSV générée : {csv_header_line}")

    vocab_entries = [] # Liste pour stocker les entrées de vocabulaire analysées
    jlpt_level_regex = re.compile(r"^N[1-5]$")

    # Déterminer si la première ligne est un en-tête et la sauter
    lines_to_process = []
    start_index = 0 # Index de départ dans raw_lines (pour calculer le numéro de ligne original)
    if len(raw_lines) > 0 and raw_lines[0].lower().startswith('"niveau";"kanas";"kanjis";"français"'):
        write_log_message(f"Saut de la ligne d'en-tête dans l'entrée : {raw_lines[0]}")
        lines_to_process = raw_lines[1:]
        start_index = 1
    else:
        lines_to_process = raw_lines

    # Buffer pour accumuler les parties d'une seule entrée logique
    current_entry_parts = []
    current_entry_start_line_num = None # Pour suivre le numéro de ligne de début de l'entrée logique

    # Helper function to finalize and add an entry from collected parts
    def finalize_and_add_entry(vocab_entries_list, parts_buffer, debug_logger, line_num_for_warning=None):
        entry = {"Niveau": "", "Kanas": "", "Kanjis": "", "Francais": ""}
        
        if not parts_buffer:
            debug_logger("  Buffer empty, no entry to finalize.", level="DEBUG", original_line_num=line_num_for_warning)
            return

        # Assign parts based on their expected position
        if len(parts_buffer) >= 1:
            entry["Niveau"] = parts_buffer[0]
        if len(parts_buffer) >= 2:
            entry["Kanas"] = parts_buffer[1]
        if len(parts_buffer) >= 3:
            entry["Kanjis"] = parts_buffer[2]
        if len(parts_buffer) >= 4:
            entry["Francais"] = parts_buffer[3]
        
        # If there are more than 4 parts, it's an anomaly, log a warning
        if len(parts_buffer) > 4:
            debug_logger(f"  Plus de 4 champs pour une entrée. Les champs supplémentaires sont ignorés: {parts_buffer[4:]}. Buffer complet: {parts_buffer}", level="AVERTISSEMENT", original_line_num=line_num_for_warning)
        
        # Check for common malformed entries that might slip through
        # Example: "N3";"アイロン";"N5";"あう" -> N3, アイロン, "", N5
        # If Kanji field contains a JLPT level, it's likely a misparse.
        if jlpt_level_regex.match(entry["Kanjis"]):
            debug_logger(f"  Décalage de champs détecté: Le champ 'Kanjis' contient un niveau JLPT ('{entry['Kanjis']}'). L'entrée sera corrigée.", level="AVERTISSEMENT", original_line_num=line_num_for_warning)
            entry["Francais"] = entry["Kanjis"] # Move the misparsed Kanji (which is actually French) to Francais
            entry["Kanjis"] = "" # Clear Kanji field
            # Further logic might be needed if the French field also contains another JLPT level

        vocab_entries_list.append(entry)
        debug_logger(f"  Entrée finalisée et ajoutée: {entry}", level="DEBUG", original_line_num=line_num_for_warning)


    for i, line in enumerate(lines_to_process):
        # Le numéro de ligne original (1-indexé) dans le fichier source
        original_line_num = (i + start_index) + 1 
        write_log_message(f"Traitement de la ligne brute {i} (originale: {original_line_num}): '{line}'", level="DEBUG", original_line_num=original_line_num)
        
        # Split the line by semicolon, and clean each part
        parts_from_line = [clean_field(p) for p in line.split(';')]
        write_log_message(f"  Ligne divisée en parties: {parts_from_line}", level="DEBUG", original_line_num=original_line_num)

        # Iterate through the parts obtained from the current line
        for j, part in enumerate(parts_from_line):
            # If we encounter a JLPT level, and it's not the very first part of a new logical entry,
            # it signals the start of a new entry.
            if jlpt_level_regex.match(part) and (len(current_entry_parts) > 0 or j > 0):
                # If we have accumulated parts for a previous entry, finalize it
                if current_entry_parts:
                    finalize_and_add_entry(vocab_entries, current_entry_parts, write_log_message, current_entry_start_line_num)
                
                current_entry_parts = [part] # Start a new entry with this JLPT level
                current_entry_start_line_num = original_line_num # Store the line number for this new entry
                write_log_message(f"  Nouvelle entrée commencée avec le niveau JLPT: '{part}'", level="DEBUG", original_line_num=original_line_num)
            else:
                current_entry_parts.append(part)
                write_log_message(f"  Partie ajoutée au buffer de l'entrée courante: '{part}' (buffer: {current_entry_parts})", level="DEBUG", original_line_num=original_line_num)
        
    # Finalize any remaining entry in the buffer after processing all lines
    if current_entry_parts:
        finalize_and_add_entry(vocab_entries, current_entry_parts, write_log_message, current_entry_start_line_num)

    write_log_message(f"Nombre total d'entrées de vocabulaire extraites : {len(vocab_entries)}")

    # Assurez-vous que le répertoire de sortie existe
    output_dir = os.path.dirname(csv_file_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
        write_log_message(f"Répertoire de sortie créé : '{output_dir}'")

    try:
        with open(csv_file_path, 'w', encoding='utf-8', newline='') as outfile:
            outfile.write(csv_header_line + "\n") # Écrire l'en-tête
            for entry in vocab_entries:
                # Formater chaque champ avec des guillemets et joindre avec des points-virgules
                formatted_line = (
                    f'"{entry["Niveau"]}";'
                    f'"{entry["Kanas"]}";'
                    f'"{entry["Kanjis"]}";'
                    f'"{entry["Francais"]}"'
                )
                outfile.write(formatted_line + "\n")
        print(f"Conversion réussie. Les données ont été sauvegardées dans '{csv_file_path}'.")
        print(f"Nombre d'entrées de vocabulaire exportées : {len(vocab_entries)}")
    except Exception as e:
        print(f"Erreur lors de l'écriture du fichier CSV : {e}")
    finally:
        # Fermer le fichier log à la fin de l'exécution, qu'il y ait eu une erreur ou non
        if log_file_handle:
            log_file_handle.close()
            print(f"Fichier log '{log_filename}' fermé.")


# --- Bloc d'exécution principal ---
if __name__ == "__main__":
    # Vérifier si les arguments nécessaires sont fournis
    if len(sys.argv) != 3:
        print("Utilisation : python convertion_vocab_txt_vers_csv.py <chemin_fichier_entree.txt> <chemin_fichier_sortie.csv>")
        print("Exemple : python convertion_vocab_txt_vers_csv.py \"C:\\input.txt\" \"C:\\output.csv\"")
        sys.exit(1) # Quitter avec un code d'erreur

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    convert_vocab_to_csv_python(input_file, output_file)
