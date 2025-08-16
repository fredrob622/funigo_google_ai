// Importer les modules
require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises; // On utilise la version "promise" pour async/await
const { log } = require('console');

// Initialiser l'application Express
const app = express();

// Cette ligne est un "middleware". Elle dit à votre application Express : "Pour chaque requête qui arrive, 
// vérifie son en-tête Content-Type. S'il est application/json, alors prends le corps de la requête 
// (qui est une chaîne de caractères JSON) et transforme-le en un véritable objet JavaScript. 
// Stocke cet objet dans req.body."

app.use(express.json()); // Pour parser le corps des requêtes JSON

const PORT = process.env.PORT || 5000;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour fichiers statiques (CSS, JS, images, html)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour parser le corps des requêtes POST
app.use(express.urlencoded({ extended: true }));

// Pool de connexions MySQL
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// ************************************************************************************************************************
// --- DÉFINITION DES ROUTES ---

// Accueil
app.get('/', async (req, res) => { // La fonction devient 'async'
    try {
        // 1. Définir le chemin absolu vers le dossier des vidéos
        // path.join est la méthode la plus sûre pour construire des chemins de fichiers
        const videoDirectory = path.join(__dirname, 'public', 'video');
        
        // 2. Lire tous les noms de fichiers dans le dossier
        const allFiles = await fs.readdir(videoDirectory);
        
        // 3. Filtrer pour ne garder que les fichiers .mp4
        const mp4Files = allFiles.filter(file => file.endsWith('.mp4'));
        
        let randomVideo = 'Funari.mp4'; // Une vidéo par défaut au cas où
        
        // 4. S'il y a des vidéos, en choisir une au hasard
        if (mp4Files.length > 0) {
            const randomIndex = Math.floor(Math.random() * mp4Files.length);
            randomVideo = mp4Files[randomIndex];
        }
        
        console.log(`Vidéo choisie pour la page d'accueil : ${randomVideo}`);
        
        // 5. Rendre la page en passant le nom du fichier vidéo au template
        res.render('pages/index', { 
            title: 'Accueil',
            videoFile: randomVideo // On envoie le nom du fichier
        });
        
    } catch (err) {
        console.error("Erreur lors de la lecture du dossier des vidéos :", err);
        // En cas d'erreur (dossier introuvable, etc.), on rend la page avec la vidéo par défaut
        res.render('pages/index', { 
            title: 'Accueil',
            videoFile: 'Funari.mp4' // Valeur de secours
        });
    }
});

// NOUVEAU : Redirection pour l'ancienne URL index.html
app.get('/index.html', (req, res) => {
    // On fait une redirection 301 (redirection permanente) vers la racine du site.
    // C'est la meilleure pratique pour le SEO.
    res.redirect(301, '/');
});

// ------------------------------------------------------------- LANGUE ----------------------------------------------------------//

// *******************************************************************************************************************************//
// Dico Kanji
// *******************************************************************************************************************************//

app.get('/kanji', (req, res) => {
    res.render('pages/kanji_form', { title: 'Dictionnaire Kanji', results: [], searchTerm: '' });
});

// ... à l'intérieur de app.post('/kanji/search', ...)

app.post('/kanji/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    try {
        // --- MODIFICATION DE LA REQUÊTE ---

        // au lieu WHERE kanji LIKE '%日%' on met  WHERE kanji LIKE ?
        const query = `
            SELECT kanji, onyomi, kunyomi, francais, niveau 
            FROM kanji_char 
            WHERE kanji LIKE ? 
               OR onyomi LIKE ? 
               OR kunyomi LIKE ? 
               OR francais LIKE ? 
               OR niveau LIKE ?`; 

        // searchPattern est la donnée à rechercher dans query        
        const searchPattern = `%${searchTerm}%`;

        // Log pour voir la requête SQL et les paramètres
        console.log("--- NOUVELLE RECHERCHE KANJI ---");
        console.log("Requête SQL exécutée :", query);
        console.log("Avec le paramètre de recherche :", searchPattern);

        // --- ON AJOUTE LE PARAMÈTRE UNE FOIS DE PLUS ---
        const [results] = await dbPool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]);

        // Log pour voir le résultat brut de la base de données
        console.log("Résultat brut obtenu de la DB :", results);
        console.log("Nombre de résultats trouvés :", results.length);
        console.log("--------------------------------------");
        
        res.render('pages/kanji_form', { title: 'Résultats Kanji', results: results, searchTerm: searchTerm });
    } catch (err) { 
        console.error("ERREUR lors de la recherche Kanji :", err);
        res.status(500).send("Erreur serveur."); 
    }
});

// *******************************************************************************************************************************//
// Dico Vocab
// *******************************************************************************************************************************//

app.get('/vocab', (req, res) => {
    res.render('pages/vocab_form', { title: 'Dictionnaire Vocabulaire', results: [], searchTerm: '' });
});

// ... à l'intérieur de app.post('/vocab/search', ...)

app.post('/vocab/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    try {
        // --- MODIFICATION DE LA REQUÊTE ---
        const query = `
            SELECT kanji, kana, francais, niveau 
            FROM vocab_char 
            WHERE kanji LIKE ? 
               OR kana LIKE ? 
               OR francais LIKE ? 
               OR niveau LIKE ?`; // <-- ON AJOUTE CETTE LIGNE

        const searchPattern = `%${searchTerm}%`;

        // Log pour voir la requête SQL et les paramètres
        console.log("--- NOUVELLE RECHERCHE Vocabulaire ---");
        console.log("Requête SQL exécutée :", query);
        console.log("Avec le paramètre de recherche :", searchPattern);

        // --- ON AJOUTE LE PARAMÈTRE UNE FOIS DE PLUS ---
        const [results] = await dbPool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern]); // <-- 4 paramètres maintenant

        // Log pour voir le résultat brut de la base de données
        console.log("Résultat brut obtenu de la DB :", results);
        console.log("Nombre de résultats trouvés :", results.length);
        console.log("--------------------------------------");
        
        res.render('pages/vocab_form', { title: 'Résultats Vocab', results: results, searchTerm: searchTerm });
        } catch (err) { 
            console.error("ERREUR lors de la recherche du mot :", err);
            res.status(500).send("Erreur serveur."); 
        }
});

// *******************************************************************************************************************************//
// Dico departements
// *******************************************************************************************************************************//

app.get('/departements', (req, res) => {
    res.render('pages/departements_form', { title: 'Caractèristique d un departements', results: [], searchTerm: '' });
});

app.post('/departements/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    try {
        // REQUÊTE SQL CORRIGÉE : on sélectionne toutes les colonnes nécessaires
        // On cherche dans le numéro, le nom du département et le nom de la préfecture.
        const query = `
            SELECT num_dep, nom_dep, nom_reg, superficie, pop_dep, densite, nom_pref, pop_pref, sous_pref
            FROM dep_fr 
            WHERE num_dep LIKE ?
               OR nom_dep LIKE ? 
               OR nom_pref LIKE ?`;

      
        // searchPattern est la donnée à rechercher dans query        
        const searchPattern = `%${searchTerm}%`.trim();

        console.log("--- NOUVELLE RECHERCHE DÉPARTEMENT ---");
        console.log("Requête SQL exécutée :", query.trim().replace(/\s+/g, ' '));
        console.log("Avec le paramètre de recherche :", searchPattern);
        
        // CORRIGÉ : On fournit bien 3 valeurs pour les 3 '?'
        const [results] = await dbPool.query(query, [searchPattern, searchPattern, searchPattern]);

        console.log("Nombre de résultats trouvés :", results.length);
        console.log("--------------------------------------");

        res.render('pages/departements_form', { 
            title: 'Résultats Départements', 
            results: results, 
            searchTerm: searchTerm 
        });

    } catch (err) { 
        console.error("ERREUR lors de la recherche du Département :", err);
        res.status(500).send("Erreur serveur lors de la recherche du département."); 
    }
});

//*******************************************************************************************************************************//
// Régions (avec liste déroulante et affichage des détails)
//*******************************************************************************************************************************//

app.get('/regions', async (req, res) => {
    try {
        // --- PARTIE 1 : On charge TOUJOURS la liste complète des régions ---
        const queryAllRegions = 'SELECT reg_nom FROM reg_fr ORDER BY reg_nom ASC;';
        const [allRegions] = await dbPool.query(queryAllRegions);
        
        // --- PARTIE 2 : On regarde si l'utilisateur a sélectionné une région ---
        // La région sélectionnée arrivera dans l'URL, comme: /regions?selection=Bretagne
        const selectedRegionName = req.query.selection || '';

        let regionDetails = []; // On initialise un tableau vide pour les détails

        // --- PARTIE 3 : Si une région est sélectionnée, on va chercher ses détails ---
        if (selectedRegionName) {
            console.log(`--- Recherche des détails pour la région : ${selectedRegionName} ---`);
            const queryDetails = `
                SELECT reg_nom, reg_cheflieu, reg_dep, reg_superficie, reg_population
                FROM reg_fr 
                WHERE reg_nom = ?`; // Recherche exacte avec le nom de la région

            const [details] = await dbPool.query(queryDetails, [selectedRegionName]);
            regionDetails = details; // On remplit notre tableau avec le résultat
        }

        // --- PARTIE 4 : On rend la page en lui passant TOUTES les données ---
        res.render('pages/region_form', { 
            title: 'Les Régions Françaises',
            listeRegion: allRegions,      // Pour la liste déroulante
            results: regionDetails,       // Pour le tableau de résultats (contient les détails ou est vide)
            searchTerm: selectedRegionName // Pour savoir quelle région pré-sélectionner dans la liste
        });

    } catch (err) {
        console.error("ERREUR lors du chargement de la page des régions :", err);
        res.status(500).send("Erreur serveur.");
    }
});

//*******************************************************************************************************************************//
// Carte interactive des Régions
//*******************************************************************************************************************************//
app.get('/region_carte', async (req, res) => {
    try {
        // 1. La requête SQL pour récupérer tous les noms de régions
        // J'ajoute ORDER BY pour que la liste déroulante soit triée par ordre alphabétique
        const query = 'SELECT reg_nom FROM reg_fr ORDER BY reg_nom ASC;';
        
        console.log("--- NOUVELLE PAGE CARTE DES RÉGIONS ---");
        console.log("Exécution de la requête :", query);

        // 2. On exécute la requête
        const [regions] = await dbPool.query(query);

        console.log(`${regions.length} régions trouvées.`);
        console.log("---------------------------------------");

        // 3. On rend la nouvelle page EJS en lui passant la liste des régions
        res.render('pages/region_carte_form', { 
            title: 'Carte des Régions',
            // La variable `listeRegion` contient maintenant un tableau d'objets [{ reg_nom: '...' }, ...]
            listeRegion: regions 
        });

    } catch (err) {
        console.error("ERREUR lors du chargement de la page carte des régions :", err);
        res.status(500).send("Erreur serveur.");
    }
});

//*******************************************************************************************************************************//
// Carte interactive des Départements
//*******************************************************************************************************************************//
app.get('/departement_carte', async (req, res) => {
    try {
        // 1. On fait une seule requête pour récupérer les numéros ET les noms
        // On trie par numéro de département pour un ordre logique.
        const query = 'SELECT num_dep, nom_dep FROM dep_fr ORDER BY num_dep ASC;';
        
        console.log("--- NOUVELLE PAGE CARTE DES DÉPARTEMENTS ---");
        console.log("Exécution de la requête :", query);

        const [departements] = await dbPool.query(query);

        console.log(`${departements.length} départements trouvés.`);
        console.log("------------------------------------------");

        // 2. On rend la nouvelle page EJS en lui passant la liste complète
        res.render('pages/departement_carte_form', { 
            title: 'Carte des Départements',
            // La variable `listeDepartement` contient maintenant un tableau d'objets [{ num_dep: '01', nom_dep: 'Ain' }, ...]
            listeDepartement: departements
        });

    } catch (err) {
        console.error("ERREUR lors du chargement de la page carte des départements :", err);
        res.status(500).send("Erreur serveur.");
    }
});

// *******************************************************************************************************************************//
// Dico Kanji_tracer
// *******************************************************************************************************************************//

app.get('/kanji_tracer', (req, res) => {
    res.render('pages/kanji_tracer_form', { title: 'Tracer du Kanji', results: [], searchTerm: '' });
});

// ... à l'intérieur de app.post('/kanji_tracer/search', ...)

app.post('/kanji_tracer/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;  // On récupère la donnée à chercher 
    try {
        // --- MODIFICATION DE LA REQUÊTE ---

        // au lieu WHERE kanji LIKE '%日%' on met  WHERE kanji LIKE ?
        const query = `
            SELECT kanji, onyomi, kunyomi, francais, niveau 
            FROM kanji_char 
            WHERE kanji LIKE ? 
               OR onyomi LIKE ? 
               OR kunyomi LIKE ? 
               OR francais LIKE ? 
               OR niveau LIKE ?`; 

        // searchPattern est la donnée à rechercher dans query        
        const searchPattern = `%${searchTerm}%`.trim();
        // searchPattern = searchPattern.trim();

        // Log pour voir la requête SQL et les paramètres
        console.log("--- NOUVELLE RECHERCHE KANJI ---");
        console.log("Requête SQL exécutée :", query);
        console.log("Avec le paramètre de recherche :", searchPattern);

        // --- ON AJOUTE LE PARAMÈTRE UNE FOIS DE PLUS ---
        const [results] = await dbPool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]);

        // Log pour voir le résultat brut de la base de données
        console.log("Résultat brut obtenu de la DB :", results);
        console.log("Nombre de résultats trouvés :", results.length);
        console.log("--------------------------------------");
        
        res.render('pages/kanji_tracer_form', { title: 'Résultats Kanji', results: results, searchTerm: searchTerm });
    } catch (err) { 
        console.error("ERREUR lors de la recherche Kanji :", err);
        res.status(500).send("Erreur serveur."); 
    }
});

// *******************************************************************************************************************************//
// Dico gram_conjugaison
// *******************************************************************************************************************************//

app.get('/gram_jap_conjugaison', (req, res) => {
    // Cette route sert juste à afficher le formulaire vide au début.
    res.render('pages/gram_jap_conjugaison', { 
        title: 'Conjugaison du verbe', 
        results: null, // On met null pour dire qu'il n'y a pas encore de résultat
        searchTerm: '' 
    });
});

// CORRECTION 1 : On transforme la route de recherche en app.post
app.post('/gram_jap_conjugaison/search', async (req, res) => {
    // CORRECTION 2 : On récupère le terme de recherche depuis req.body
    const searchTerm = req.body.searchTerm.trim();
    
    // On vérifie que le terme n'est pas vide
    if (!searchTerm) {
        // Si vide, on redirige vers le formulaire de base
        return res.redirect('/gram_jap_conjugaison');
    }

    try {
        // On encode le terme pour l'URL
        const encodedPart = encodeURIComponent(searchTerm);
        const url = `https://fr.wiktionary.org/wiki/Conjugaison:japonais/${encodedPart}`;

        console.log(`--- RECHERCHE CONJUGAISON JAPONAISE ---`);
        console.log(`Verbe recherché : ${searchTerm}`);
        console.log(`URL cible : ${url}`);
        
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

         // 1. On sélectionne un conteneur plus fiable sur la page du Wiktionnaire.
        const contentContainer = $('div.mw-parser-output');

        // 2. On nettoie les styles et attributs inutiles qui peuvent casser notre layout.
        contentContainer.find('[style]').removeAttr('style'); // Supprime tous les attributs "style"
        contentContainer.find('[class*="thumb"]').remove(); // Supprime les miniatures et légendes
        contentContainer.find('script').remove(); // Supprime les balises <script>
        
        // 3. On récupère le HTML nettoyé.
        const content = contentContainer.html();

        if (!content) {
            console.log("Aucun contenu de conjugaison trouvé sur la page.");
        }

        // CORRECTION 3 : On n'envoie qu'une seule réponse, avec res.render
        res.render('pages/gram_jap_conjugaison', { 
            title: `Conjugaison de ${searchTerm}`, 
            results: content, // On passe le HTML scrappé
            searchTerm: searchTerm 
        });

    } catch (err) { 
        console.error("ERREUR lors de la recherche du verbe :", err.message);
        // On peut rendre la même page avec un message d'erreur pour l'utilisateur
        res.render('pages/gram_jap_conjugaison', {
            title: 'Erreur',
            results: `<p style="color: red;">Impossible de trouver la conjugaison pour "${searchTerm}". Vérifiez que le verbe est correct et existe sur le Wiktionnaire.</p>`,
            searchTerm: searchTerm
        });
    }
});

// *******************************************************************************************************************************//
// Quiz
// *******************************************************************************************************************************//

// Route pour afficher le formulaire du quiz
app.get('/quiz', (req, res) => {
    res.render('pages/quiz_form', { title: 'Le Quiz', results: [], searchTerm: '' });
});

// Route pour traiter la recherche de quiz
app.post('/quiz/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    try {
        const viewName = `vue_quiz_${searchTerm}`;
        const searchPattern = `%${searchTerm}%`;

        console.log("--- Recherche dans Quiz ---");

        // 1. Supprimer la vue si elle existe déjà
        // **************************************
        const dropViewQuery = `DROP VIEW IF EXISTS ${viewName};`;
        console.log("Exécution de la requête SQL :", dropViewQuery);
        await dbPool.query(dropViewQuery);
        console.log(`Vue '${viewName}' supprimée si elle existait.`);

        // 2. Créer la vue avec les questions sélectionées par niveau
        // *************************************************************
        const createViewQuery = `
            CREATE VIEW ${viewName} AS
            SELECT ANNEE, NIVEAU, TEXTE, REP_OK, QUESTION, REP1, REP2, REP3, REP4
            FROM quiz
            WHERE NIVEAU LIKE ?
            ORDER BY RAND()
            LIMIT 1000;`;
        console.log("Exécution de la requête SQL (CREATE VIEW) :", createViewQuery.trim().replace(/\s+/g, ' '));
        console.log("Avec le paramètre de recherche :", searchPattern);
        await dbPool.query(createViewQuery, [searchPattern]);
        console.log(`Vue '${viewName}' créée avec succès.`);

        // 3. Initialiser la variable utilisateur pour l'indexation
        // Note: Cette requête doit être exécutée séparément pour s'assurer que @i est réinitialisé
        const setIndexQuery = `SET @i := 0;`;
        console.log("Exécution de la requête SQL :", setIndexQuery);
        await dbPool.query(setIndexQuery);
        console.log("Variable @i initialisée.");

        // 4. Sélectionner les données de la vue avec l'index
        // Cette requête est exécutée APRÈS que la vue soit créée et @i initialisée
        const selectFromViewQuery = `
            SELECT @i := @i + 1 AS index_quiz, v.*
            FROM ${viewName} v;`;
        console.log("Exécution de la requête SQL (SELECT FROM VIEW) :", selectFromViewQuery.trim().replace(/\s+/g, ' '));
        const [results] = await dbPool.query(selectFromViewQuery);

        console.log("Nombre de résultats trouvés :", results.length);
        console.log("--------------------------------------");

        res.render('pages/quiz_form', {
            title: 'Les questions du quiz',
            results: results, // Maintenant 'results' contiendra les données de la vue
            searchTerm: searchTerm
        });

    } catch (err) {
        console.error("ERREUR lors de la recherche du Quiz :", err);
        res.status(500).send("Erreur serveur lors de la recherche du Quiz.");
    }
});

// *******************************************************************************************************************************//
// Grammaire japonaise les règles
// *******************************************************************************************************************************//

app.get('/gram_jap_regles', async (req, res) => {
    try {
        // --- PARTIE 1 : On charge TOUJOURS la liste complète de la colonne nom ---
        const gramAllNom = 'SELECT nom FROM gram_char ORDER BY nom ASC;';
        const [allGramNom] = await dbPool.query(gramAllNom);
        
        // --- PARTIE 2 : On regarde si l'utilisateur a sélectionné un nom dans la liste allGramNom ---
        // La nom sélectionnée arrivera dans l'URL, comme: /gram_jap_regles?Nom=挙げ句に (あげくに) : finalement, en fin de compte
        const selectedGramName = req.query.selection || '';

        let gramNomDetails = []; // On initialise un tableau vide pour les détails

        // --- PARTIE 3 : Si un nom est sélectionné, on va chercher ses détails ---
        if (selectedGramName) {
            console.log(`--- Recherche des détails pour le nom : ${selectedGramName} ---`);
            const queryDetails = `
                SELECT  nom, description, construction, exemple
                FROM gram_char
                WHERE nom = ?`; // Recherche exacte avec le nom

            const [details] = await dbPool.query(queryDetails, [selectedGramName]);
           
            gramNomDetails = details; // On remplit notre tableau avec le résultat
            // === MODIFICATION DU CONSOLE.LOG ===
            // On utilise JSON.stringify pour voir la vraie structure des données
            console.log('--- Données brutes envoyées au template ---');
            console.log(JSON.stringify(gramNomDetails, null, 2)); // Le 2 est pour une jolie indentation
        }

        // --- PARTIE 4 : On rend la page en lui passant TOUTES les données ---
        res.render('pages/gram_jap_regle_form', { 
            title: 'Les Règles de grammaire Japonaise',
            listeGramRegle: allGramNom,      // Pour la liste déroulante
            results: gramNomDetails,       // Pour le tableau de résultats (contient les détails ou est vide)
            searchTerm: selectedGramName   // Pour savoir quel nom pré-sélectionner dans la liste
        });

    } catch (err) {
        console.error("ERREUR lors du chargement de la page des grammaire japonaise :", err);
        res.status(500).send("Erreur serveur.");
    }
});

// ------------------------------------------------------------- Japon ----------------------------------------------------------//

// *******************************************************************************************************************************//
// Ile de Kyushuu
// *******************************************************************************************************************************//

app.get('/japon_kyushu', (req, res) => {
    try {
        res.render('pages/japon_kyushu_form', { title: 'Ile de Kyushu'});
    } catch (err) {
        console.error("ERREUR lors du chargement de la page de Japon Kyushu :", err);
        res.status(500).send("Erreur serveur.");
    }
});

//*******************************************************************************************************************************//
// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur Funigo démarré sur http://localhost:${PORT}`);
});