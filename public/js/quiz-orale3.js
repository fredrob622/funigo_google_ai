
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
            this.textContent = "Voir la traduction";
            this.title = "Voir la traduction";
        }
    });

