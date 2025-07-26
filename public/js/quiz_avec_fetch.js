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
  const nb = document.querySelector('[data-nbquestion]');

    if (nb) {
        tabNombreDeQuestion = initTabQuestion(parseInt(nb.dataset.nbquestion));
        console.log("tableau tabNombreDeQuestion :", tabNombreDeQuestion);

        // Affichage dans la div

        // document.getElementById('affichage') Sélectionne l’élément HTML avec l’ID affichage. Par exemple : <div id="affichage"></div>
        // .textContent => Change le contenu textuel de cet élément (tout ce qu’on voit à l’intérieur, sans balises HTML)
        // tabNombreDeQuestion.join(', ') => Transforme le tableau tabNombreDeQuestion en chaîne de caractères avec les éléments séparés par des virgules 
        // et un espace

        document.getElementById('affichage').textContent = tabNombreDeQuestion.join(', ');
        document.getElementById('affichage').textContent = `tabNombreDeQuestion[10] = ${tabNombreDeQuestion[10]}`;
    }

  // Vérifier que le tableau n'est pas vide pour éviter les erreurs
    if (tabNombreDeQuestion.length === 0) {
        console.log("Le tableau est vide, impossible de choisir un élément aléatoire.");
    } else {
        // Générer un index aléatoire
        const randomIndex = Math.floor(Math.random() * tabNombreDeQuestion.length);

        // Récupérer l'élément à cet index
        const randomElement = tabNombreDeQuestion[randomIndex];

        // Si on veut afficher une balise HTML avec javascript

        // .textContent ne fonctionne pas affiche que du texte pur, aucune balise HTML n’est interprétée.
        // document.getElementById('affichage').textContent =  `tabNombreDeQuestion[10] = ${tabNombreDeQuestion[10]} <br> Nombre aléatoire = ${randomElement}`;
        
        // innerHTML : insère le texte avec interprétation des balises HTML (comme <br>, qui fera bien un saut de ligne).
        document.getElementById('affichage').innerHTML = `<br> tabNombreDeQuestion[10] = ${tabNombreDeQuestion[10]} <br> Nombre aléatoire = ${randomElement}`;
    
        // Retirer un élement du tableau avec la méthode .splice. On retire 1 à la position randomIndex
        console.log("Elément à supprimer:", randomIndex)
        tabNombreDeQuestion.splice(randomIndex, 1);
        console.log("tableau tabNombreDeQuestion mis à jour :", tabNombreDeQuestion);
    
        // --- ENVOI DE LA REQUÊTE AU SERVEUR ---
        // On retire le listener imbriqué et on appelle fetch directement !
        console.log("Envoi de la requête fetch vers /quiz/search_question...");
        console.log(`Envoi du numéro de question ${randomElement} au serveur...`);

        fetch('/quiz/search_question', {
                method: 'POST',  // ou 'GET' selon votre besoin
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ numeroQuestion: randomElement }) // On envoie la valeur de randomElement !
        })
        .then(response => response.json())
        .then(data => {
                console.log('Réponse du serveur:', data);
            
            })
        .catch(error => console.error('Erreur:', error));
    }
});



