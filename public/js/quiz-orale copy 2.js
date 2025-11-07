/**
 * Fichier : public/js/quiz-orale.js
 * Ce script gère le filtrage dynamique et la soumission du formulaire de recherche des quiz oraux.
 * Il récupère les données directement de l'attribut 'data-quiz-data' du formulaire (méthode sans script inline).
 */

// La fonction sera exécutée uniquement lorsque le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', () => {
    // --- Logique pour la page de RECHERCHE des niveaux (celle avec le formulaire) ---
    const quizOraNiveau = document.getElementById('quizora-niveau');
    if (quizOraNiveau) {

        console.log("Logique pour la page de recherche des  des niveaux activée.");
        const quizOraNiveauSelect = document.getElementById('quizora-niveau-select');
        console.log(quizOraNiveau)
        // On stocke la dernière liste modifiée pour éviter les boucles infinies
        let lastChanged = null;

         quizOraNiveauSelect.addEventListener('change', () => {
        // On ne fait quelque chose que si l'utilisateur a vraiment changé cette liste
        if (lastChanged !== quizOraNiveauSelect) {
            lastChanged = quizOraNiveauSelect;
            // On réinitialise les autres listes
            quizOraNiveauSelect.value = '';
            // On soumet le formulaire
            if (quizOraNiveauSelect.value) quizOraNiveau.submit();
            }
        });

    }
});