// Importer les modules
require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

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

// --- LANGUE ---
// Dico Kanji
app.get('/kanji', (req, res) => {
    res.render('pages/kanji_form', { title: 'Dictionnaire Kanji', results: [], searchTerm: '' });
});

app.post('/kanji/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    try {
        const query = `SELECT kanji, onyomi, kunyomi, francais, niveau FROM kanji_char WHERE kanji LIKE ? OR onyomi LIKE ? OR kunyomi LIKE ? OR francais LIKE ?`;
        const searchPattern = `%${searchTerm}%`;
        const [results] = await dbPool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern]);
        res.render('pages/kanji_form', { title: 'Résultats Kanji', results: results, searchTerm: searchTerm });
    } catch (err) { console.error(err); res.status(500).send("Erreur serveur."); }
});

// Dico Vocabulaire
app.get('/vocabulaire', (req, res) => {
    res.render('pages/vocabulaire_form', { title: 'Dictionnaire Vocabulaire', results: [], searchTerm: '' });
});

app.post('/vocabulaire/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    try {
        const query = `SELECT kana, kanji, francais, niveau FROM voca_char WHERE kana LIKE ? OR kanji LIKE ? OR francais LIKE ?`;
        const searchPattern = `%${searchTerm}%`;
        const [results] = await dbPool.query(query, [searchPattern, searchPattern, searchPattern]);
        res.render('pages/vocabulaire_form', { title: 'Résultats Vocabulaire', results: results, searchTerm: searchTerm });
    } catch (err) { console.error(err); res.status(500).send("Erreur serveur."); }
});


// --- FRANCE ---
// Départements
app.get('/departements', (req, res) => {
    res.render('pages/departements_form', { title: 'Départements Français', results: [], searchTerm: '' });
});

app.post('/departements/search', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    try {
        const query = `SELECT num_dep, nom_dep, nom_reg, superficie, pop_dep, densite, nom_pref FROM departement_fr WHERE nom_dep LIKE ? OR num_dep LIKE ? OR nom_reg LIKE ?`;
        const searchPattern = `%${searchTerm}%`;
        const [results] = await dbPool.query(query, [searchPattern, searchPattern, searchPattern]);
        res.render('pages/departements_form', { title: 'Résultats Départements', results: results, searchTerm: searchTerm });
    } catch (err) { console.error(err); res.status(500).send("Erreur serveur."); }
});

// NOUVEAU : Régions
app.get('/regions', (req, res) => {
    res.render('pages/region_form', { title: 'Régions Françaises', results: [], searchTerm: '' });
});

app.post('/regions/search', async (req, res) => {
    // Note : La table 'region_fr' devra être créée dans votre base de données.
    const searchTerm = req.body.searchTerm;
    try {
        // Supposons que la table region_fr ait au moins une colonne 'nom_reg'
        const query = `SELECT * FROM region_fr WHERE nom_reg LIKE ?`; 
        const searchPattern = `%${searchTerm}%`;
        const [results] = await dbPool.query(query, [searchPattern]);
        res.render('pages/region_form', { title: 'Résultats Régions', results: results, searchTerm: searchTerm });
    } catch (err) {
        console.error("Erreur de recherche Région:", err);
        // Renvoyer un message d'erreur clair si la table n'existe pas
        if (err.code === 'ER_NO_SUCH_TABLE') {
            res.status(500).send("Erreur : La table 'region_fr' n'a pas été trouvée. Veuillez la créer.");
        } else {
            res.status(500).send("Erreur serveur lors de la recherche.");
        }
    }
});


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur Funigo démarré sur http://localhost:${PORT}`);
});