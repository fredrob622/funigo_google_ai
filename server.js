// Importer les modules
require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const { log } = require('console');

// Initialiser l'application Express
const app = express();
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

// --- DÉFINITION DES ROUTES ---

// Accueil
app.get('/', (req, res) => {
    res.render('pages/index', { title: 'Accueil' });
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
        const query = `
            SELECT kanji, onyomi, kunyomi, francais, niveau 
            FROM kanji_char 
            WHERE kanji LIKE ? 
               OR onyomi LIKE ? 
               OR kunyomi LIKE ? 
               OR francais LIKE ? 
               OR niveau LIKE ?`; // <-- ON AJOUTE CETTE LIGNE

        const searchPattern = `%${searchTerm}%`;

        // Log pour voir la requête SQL et les paramètres
        console.log("--- NOUVELLE RECHERCHE KANJI ---");
        console.log("Requête SQL exécutée :", query);
        console.log("Avec le paramètre de recherche :", searchPattern);

        // --- ON AJOUTE LE PARAMÈTRE UNE FOIS DE PLUS ---
        const [results] = await dbPool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]); // <-- 5 paramètres maintenant

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

        const searchPattern = `%${searchTerm}%`;

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
// NOUVEAU : Régions
//*******************************************************************************************************************************//
app.get('/regions', (req, res) => {
    res.render('pages/region_form', { title: 'Régions Françaises', results: [], searchTerm: '' });
});

app.post('/regions/search', async (req, res) => {
    // Note : La table 'reg_fr' devra être créée dans votre base de données.
    const searchTerm = req.body.searchTerm;

    try {
        // Supposons que la table region_fr ait au moins une colonne 'nom_reg'
        const query = `
            SELECT reg_nom, reg_cheflieu, reg_dep, reg_superficie, reg_population
                FROM reg_fr 
                WHERE 
                    LOWER(reg_nom) LIKE ?       -- CORRECTION : On compare en minuscules
                    OR LOWER(reg_cheflieu) LIKE ?  -- CORRECTION : On compare en minuscules
                    OR LOWER(reg_dep) LIKE ?       -- CORRECTION : On compare en minuscules
                    OR reg_superficie LIKE ?
                    OR reg_population LIKE ?`; 

        
        

        
           const searchPattern = `%${searchTerm.toLowerCase()}%`;

        console.log("--- NOUVELLE RECHERCHE DÉPARTEMENT ---");
        console.log("Requête SQL exécutée :", query.trim().replace(/\s+/g, ' '));
        console.log("Avec le paramètre de recherche :", searchPattern);

        const [results] = await dbPool.query(query, [
            searchPattern, 
            searchPattern, 
            searchPattern, 
            searchPattern, 
            searchPattern
        ]);

        console.log("Nombre de résultats trouvés :", results.length);
        console.log("--------------------------------------");
        
        res.render('pages/region_form', { 
            title: 'Résultats Régions', 
            results: results, 
            searchTerm: searchTerm });

    } catch (err) {
        console.error("Erreur de recherche Région:", err);
        // Renvoyer un message d'erreur clair si la table n'existe pas
        if (err.code === 'ER_NO_SUCH_TABLE') {
            res.status(500).send("Erreur : La table 'reg_fr' n'a pas été trouvée. Veuillez la créer.");
        } else {
            res.status(500).send("Erreur serveur lors de la recherche.");
        }
    }
});


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur Funigo démarré sur http://localhost:${PORT}`);
});