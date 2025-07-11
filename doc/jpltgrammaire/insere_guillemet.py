import csv

# Fichier d'entrée et de sortie
input_file = 'Grammaire_JLPT_N5.csv'
output_file = 'Grammaire_JLPT_N5_quoted.csv'

with open(input_file, 'r', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:

    reader = csv.reader(infile)
    writer = csv.writer(outfile, quoting=csv.QUOTE_MINIMAL)

    header = next(reader)
    writer.writerow(header)  # réécrit l'en-tête

    for row in reader:
        if len(row) == 6:
            # Ajouter des guillemets autour de la dernière colonne
            row[-1] = row[-1].replace('\n', '\\n')  # éviter les sauts de ligne réels
            row[-1] = f'"{row[-1]}"' if not (row[-1].startswith('"') and row[-1].endswith('"')) else row[-1]
        writer.writerow(row)