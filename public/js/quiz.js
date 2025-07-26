function initTabQuestion(nombreDeQuestion){
  const nombresAvecBoucle = [];
  for (let i = 1; i <= nombreDeQuestion; i++) {
    nombresAvecBoucle.push(i);
  }
  return(nombresAvecBoucle);
}

// Appel avec une valeur définie dans le HTML :

// en JavaScript, lorsque l'on parle de document (comme dans document.addEventListener ou document.getElementById), 
// on fait référence à la page HTML actuellement chargée dans le navigateur.

// document.addEventListener() est une méthode JavaScript fondamentale qui vous permet d'attacher une fonction 
// (un "écouteur d'événement" ou "event listener") à un événement spécifique qui se produit sur un élément du document HTML.

// element.addEventListener(event, function, useCapture);

// element : L'objet sur lequel l'événement est écouté (par exemple, document, window, un bouton, une div, etc.).
// event : Une chaîne de caractères spécifiant le nom de l'événement à écouter (par exemple, 'click', 'mouseover', 'submit', 'DOMContentLoaded').
// function : La fonction à exécuter lorsque l'événement se produit. C'est votre "gestionnaire d'événement".
// useCapture (optionnel) : Un booléen (vrai/faux) qui spécifie si l'événement doit être exécuté en phase de capture ou de propagation. Généralement false (par défaut) pour la propagation.

// En termes simples, c'est comme dire au navigateur : "Quand cet événement se produit sur cet élément, exécute cette fonction."

// DOMContentLoaded est un événement JavaScript qui se déclenche lorsque le document HTML initial a été entièrement chargé et 
// analysé par le navigateur, sans attendre que les feuilles de style, les images et les sous-cadres aient fini de charger.


document.addEventListener("DOMContentLoaded", () => {
 // Dans ejs <div data-nbquestion="<%= results.length %>"> </div>
 const nbElement = document.querySelector('[data-nbquestion]');

    // Si l’élément existe, sa valeur sera un objet DOM correspondant S’il n’existe pas, sa valeur sera null
    // L’opérateur ET logique && signifie que les deux conditions entourant l’opérateur doivent être vraies

    // parseInt(nbElement.dataset.nbquestion, 10) > 0

    // nbElement.dataset.nbquestion => lire la valeur de l’attribut HTML data-nbquestion de l’élément.
    // cette valeur est toujours une chaîne de caractères, même si tu mets un chiffre dans le HTML.

    // parseInt(..., 10) Convertit cette chaîne en nombre entier. Le 10 base décimal.

    if (nbElement && parseInt(nbElement.dataset.nbquestion, 10) > 0) {

        // On crée tabNombreDeQuestion en appellant la fonction initTabQuestion

        const nbQuestion = parseInt(nbElement.dataset.nbquestion, 10);

        // Appelle la fonction initTabQuestion. On créé un tableau de nbQuestion
        let tabNombreDeQuestion = initTabQuestion(nbQuestion);

        // --- Récupération des données complètes des questions ---
        // On lit le contenu de notre balise script <script id="questions-data" type="application/json"> <%- JSON.stringify(results) %> </script>
        const questionsJsonString = document.getElementById('questions-data').textContent;
        // On le parse en un vrai tableau JavaScript
        // Par exemple, questionsJsonString pourrait contenir la valeur suivante :
        // '[{"id": 1, "question": "Quelle est la capitale du Japon?", "answer": "Tokyo"}, {"id": 2, "question": "2+2?", "answer": "4"}]'
        
        // JSON.parse(): C'est une méthode JavaScript intégrée (faisant partie de l'objet global JSON).
        // Sa fonction est de parser (analyser) une chaîne de caractères JSON et de la convertir en un objet ou une valeur JavaScript correspondante.
        // Si la chaîne JSON représente un tableau (comme dans l'exemple ci-dessus), JSON.parse() la convertira en un tableau JavaScript.
        // Si la chaîne JSON représente un objet (par exemple, '{"name": "Alice", "age": 30}'), JSON.parse() la convertira en un objet JavaScript
        
        // Déclare une nouvelle constante (const) nommée questionsArray.
        // Cette constante va stocker le tableau JavaScript (ou l'objet JavaScript) qui résulte de l'analyse de la chaîne questionsJsonString 
        // par JSON.parse(). 
        const questionsArray = JSON.parse(questionsJsonString);

        // --- Logique du jeu ---
        // Sélectionner un élément aléatoire dans un tableau en générant un index aléatoire valide pour ce tableau.
        // Math.random(): C'est une fonction JavaScript intégrée qui renvoie un nombre flottant pseudo-aléatoire dans l'intervalle [0, 1)

        // Si Math.random() renvoie 0.1, et que tabNombreDeQuestion.length est 49, le résultat sera 0.1 * 49 = 4.9.
        // Math.floor(...): C'est une fonction JavaScript intégrée qui arrondit un nombre à l'entier inférieur le plus proche.
            // Math.floor(4.9) donnera 4.
            // Math.floor(48.951) donnera 48.
        const randomIndex = Math.floor(Math.random() * tabNombreDeQuestion.length);
        console.log("Tableau de questions complet récupéré (questionsArray):", questionsArray);

        // On récupère le *numéro* de la question à afficher
        const randomElement = tabNombreDeQuestion[randomIndex];

        // On trouve l'objet de la question correspondant à ce numéro
        // Cette ligne est utilisée pour rechercher et sélectionner un objet spécifique (dans ce cas, une question de quiz) 
        // à l'intérieur d'un tableau, en se basant sur une condition.
        // C'est la variable qui représente votre tableau JavaScript. Comme nous l'avons vu précédemment, il s'agit d'un tableau d'objets, 
        // où chaque objet représente une question de quiz avec ses différentes propriétés 
        // (comme ANNEE, NIVEAU, TEXTE, REP_OK, QUESTION, REP1, REP2, REP3, REP4, et surtout index_quiz).

        // .find(): C'est une méthode de tableau JavaScript (Array.prototype.find()). Elle parcourt chaque élément du tableau (questionsArray) 
        // dans l'ordre. Pour chaque élément, elle exécute une fonction de rappel (la "callback function") que vous lui fournissez.
        // Elle renvoie le premier élément du tableau pour lequel la fonction de rappel retourne 

        // q: C'est le paramètre de la fonction de rappel. À chaque itération de find(), q représente l'élément courant du 
        // tableau questionsArray qui est en train d'être examiné. Donc, q sera un objet question 
        // (par exemple, { index_quiz: 1, ANNEE: 2023, ... }).

        // q.index_quiz: Accède à la propriété index_quiz de l'objet q et compare à randomElement
        const questionChoisie = questionsArray.find(q => q.index_quiz === randomElement)

        if (questionChoisie) {
            // On affiche la question
            const affichageDiv = document.getElementById('affichage');


        // On construit le HTML pour la question et les boutons de réponse
            affichageDiv.innerHTML = `
                <div class="quiz-question-container" >
                    <h3>Question n°${questionChoisie.index_quiz}</h3>
                    <p class="question-text">Dans la phrase ou le texte suivant: </p>
                    <p class="question-text quiz-txt-question">${questionChoisie.TEXTE}</p>
                    <p class="question-text">Question :</p>
                    <p class="question-text quiz-txt-question">${questionChoisie.QUESTION}</p>
                </div>

                <div class="quiz-options-container" style="display: flex; flex-direction: column;" >
                    <button class="quiz-option-btn quiz-btn-question">REP1 :  ${questionChoisie.REP1}</button>
                    <button class="quiz-option-btn quiz-btn-question">REP2 :  ${questionChoisie.REP2}</button>
                    <button class="quiz-option-btn quiz-btn-question">REP3 :  ${questionChoisie.REP3}</button>
                    <button class="quiz-option-btn quiz-btn-question">REP4 :  ${questionChoisie.REP4}</button>
                </div>
            `;

            // On retire la question de la liste pour ne pas la reposer
            tabNombreDeQuestion.splice(randomIndex, 1);
            console.log("Numéros de questions restants :", tabNombreDeQuestion);

        } else {
            // Ce message s'affichera si le bug du "+ 1" se produit
            affichageDiv.innerHTML = `<br> Erreur : impossible de trouver les données pour la question n°${randomElement}.`;
        }

    } else {
        console.log("Aucune question à traiter.");
        // Optionnel : afficher un message sur la page
        document.getElementById('affichage').innerHTML = "Veuillez choisir un niveau pour commencer le quiz.";
    }
});


 



