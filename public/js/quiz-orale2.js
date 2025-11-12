// public/js/quiz-orale2.js


    document.addEventListener('DOMContentLoaded', () => {

        document.getElementById('showTranslationBtn').addEventListener('click', function() {
        var elem = document.getElementById('translationText');
        if (elem.style.display === "none") {
            elem.style.display = "block";
            this.textContent = "Cacher la traduction";
            this.title = "Cacher la traduction";
        } else {
            elem.style.display = "none";
            this.textContent = "Voir la traduction";
            this.title = "Voir la traduction";
        }
    });

        document.getElementById('showTexteBtn').addEventListener('click', function() {
        var elem = document.getElementById('exerciceText');
        if (elem.style.display === "none") {
            elem.style.display = "block";
            this.textContent = "Cacher le texte";
            this.title = "Cacher le texte";
        } else {
            elem.style.display = "none";
            this.textContent = "Voir le texte";
            this.title = "Voir le texte";
        }
    });
    
    // =================================================================
    // ==         INITIALISATION DE LA SYNTHÈSE VOCALE             ==
    // =================================================================
    // On exécute cette partie sur toutes les pages où le script est chargé
    const synth = window.speechSynthesis;

    // Fonction pour "réveiller" l'API. C'est la clé.
    function warmUpSpeechSynthesis() {
        // Crée un énoncé vide
        const warmUpUtterance = new SpeechSynthesisUtterance('');
        // Le lance avec un volume de 0 pour qu'il soit inaudible
        warmUpUtterance.volume = 0;
        // L'envoie au synthétiseur.
        synth.speak(warmUpUtterance);
        console.log("Synthèse vocale 'réchauffée' et prête.");
    }

    // On attache l'événement de réveil à la première interaction possible, UNE SEULE FOIS.
    document.body.addEventListener('click', warmUpSpeechSynthesis, { once: true });
    document.body.addEventListener('submit', warmUpSpeechSynthesis, { once: true });
    
    // --- Le reste du code ne s'exécute que si le quiz est affiché ---
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) {
        return;
    }
    
    // --- Préparation des voix (uniquement sur la page du quiz) ---
    let voices = [];
    function populateVoiceList() {
        voices = synth.getVoices();
        console.log("Voix chargées :", voices);
    }
    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoiceList;
    }


    // --- LOGIQUE DU QUIZ EXISTANTE ---
    const continuerBtn = document.getElementById('continuer-btn');
    const arreterBtn = document.getElementById('arreter-btn');
    const scoreElement = document.getElementById('score');
    const questions = document.querySelectorAll('.question-container');
    const totalQuestions = questions.length;

    let currentQuestionIndex = 0;
    let score = 0;
    let answerChecked = false;

    continuerBtn.addEventListener('click', () => {
        const currentQuestion = questions[currentQuestionIndex];
        const selectedAnswer = currentQuestion.querySelector(`input[name="reponse-${currentQuestionIndex}"]:checked`);
        const feedbackElement = document.getElementById(`feedback-${currentQuestionIndex}`);

        if (answerChecked) {
            currentQuestion.classList.remove('active');
            
            currentQuestionIndex++;
            if (currentQuestionIndex < totalQuestions) {
                questions[currentQuestionIndex].classList.add('active');
                continuerBtn.textContent = 'Valider';
                answerChecked = false;
            } else {
                continuerBtn.style.display = 'none';
                arreterBtn.style.display = 'block';
                arreterBtn.textContent = `Quiz terminé ! Score : ${score}/${totalQuestions}. Recommencer ?`;
            }
            return;
        }

        if (!selectedAnswer) {
            feedbackElement.textContent = "Veuillez sélectionner une réponse.";
            feedbackElement.style.color = "red";
            return;
        }

        const correctAnswer = currentQuestion.getAttribute('data-rep-ok');
        if (selectedAnswer.value === correctAnswer) {
            score++;
            scoreElement.textContent = score;
            feedbackElement.textContent = "Bonne réponse !";
            feedbackElement.style.color = "green";
        } else {
            feedbackElement.textContent = `Mauvaise réponse. La bonne réponse était : ${correctAnswer}`;
            feedbackElement.style.color = "orange";
        }
        
        answerChecked = true;
        continuerBtn.textContent = 'Question Suivante';
        if (currentQuestionIndex === totalQuestions - 1) {
            continuerBtn.textContent = 'Voir le score final';
        }

        const radioButtons = currentQuestion.querySelectorAll(`input[name="reponse-${currentQuestionIndex}"]`);
        radioButtons.forEach(radio => radio.disabled = true);
    });

    arreterBtn.addEventListener('click', () => {
        window.location.href = '/quiz_orale'; 
    });


    // --- LOGIQUE DE LECTURE DU TEXTE AVEC DÉBOGAGE ---
    quizContainer.addEventListener('click', function(event) {
        if (event.target.matches('.speak-btn')) {
            if (synth) {
                const questionDiv = event.target.closest('.question-container');
                if (!questionDiv) return;

                const textElement = questionDiv.querySelector('.question-text');
                if (!textElement) return;

                const textToSpeak = textElement.textContent;
                
                // On arrête toute lecture précédente.
                synth.cancel();

                const utterance = new SpeechSynthesisUtterance(textToSpeak);

                utterance.onerror = function(e) {
                    console.error('ERREUR DE L\'UTTÉRANCE :', e);
                };

                // ===== AJOUTS POUR LE DÉBOGAGE =====
                console.log("--- Clic sur le bouton Speak ---");
                console.log("Texte à lire :", textToSpeak);

                const frenchVoice = voices.find(voice => voice.lang === 'ja-JP');

                // Affiche la voix française trouvée (ou undefined si pas trouvée)
                console.log("Voix ja-JP trouvée :", frenchVoice);

                if (frenchVoice) {
                    utterance.voice = frenchVoice;
                } else {
                    utterance.lang = 'ja-JP';
                    console.warn("Pas de voix ja-JP spécifique, fallback sur utterance.lang.");
                }

                // Affiche l'objet final avant de le donner au navigateur
                console.log("Objet Utterance final :", utterance);
                // =====================================
                
                // DERNIÈRE TENTATIVE : Lancer la lecture après une micro-pause
                // Parfois, cancel() et speak() trop rapprochés posent problème.
                setTimeout(() => {
                    synth.speak(utterance);
                }, 100); // 100 millisecondes de délai

            } else {
                alert("Désolé, votre navigateur ne supporte pas la lecture de texte.");
            }
        }
    });


});