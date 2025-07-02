document.addEventListener('DOMContentLoaded', () => {
    // --- Code existant pour les APIs ---
    const weatherApiUrlParis = 'https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&current=temperature_2m,cloud_cover,rain';
    const weatherApiUrlTokyo = 'https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.69&current=temperature_2m,cloud_cover,rain';
    const currencyApiUrl = 'https://api.exchangerate-api.com/v4/latest/EUR';

    // --- Logique du Menu Hamburger ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('#nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // --- Logique pour les sous-menus sur mobile (accordéon) ---
    const dropdownToggles = document.querySelectorAll('.dropdown > a');

    dropdownToggles.forEach(clickedToggle => {
        clickedToggle.addEventListener('click', (event) => {
            if (window.getComputedStyle(hamburger).display !== 'none') {
                event.preventDefault();
                const currentSubmenu = clickedToggle.nextElementSibling;
                dropdownToggles.forEach(otherToggle => {
                    if (otherToggle !== clickedToggle) {
                        otherToggle.nextElementSibling.classList.remove('open');
                    }
                });
                currentSubmenu.classList.toggle('open');
            }
        });
    });

    // --- NOUVEAU : Logique pour marquer l'onglet actif en vert ---
    const topLevelLinks = document.querySelectorAll('#nav-links > li > a');

    topLevelLinks.forEach(link => {
        link.addEventListener('click', () => {
            // D'abord, on retire la classe 'menu-active' de TOUS les onglets
            topLevelLinks.forEach(l => l.classList.remove('menu-active'));
            // Ensuite, on l'ajoute UNIQUEMENT à celui qui a été cliqué
            link.classList.add('menu-active');
        });
    });


    // --- Fonctions Fetch ---
    function fetchWeather(city, url) { /* ... (code inchangé) ... */ }
    function fetchCurrencyRate() { /* ... (code inchangé) ... */ }
    
    // (Je remets le code complet des fonctions pour être sûr)
    function fetchWeather(city, url) {
        fetch(url).then(response => response.json())
        .then(data => {
            if (data && data.current) {
                document.getElementById(`${city}-temp`).textContent = Math.round(data.current.temperature_2m);
                document.getElementById(`${city}-clouds`).textContent = data.current.cloud_cover;
                document.getElementById(`${city}-rain`).textContent = data.current.rain;
            }
        }).catch(error => console.error(`Erreur météo pour ${city}:`, error));
    }
    function fetchCurrencyRate() {
        fetch(currencyApiUrl).then(response => response.json())
        .then(data => {
            if (data && data.rates && data.rates.JPY) {
                document.getElementById('eur-jpy-rate').textContent = data.rates.JPY.toFixed(2);
            }
        }).catch(error => console.error('Erreur devise:', error));
    }

    // Lancement des appels API
    fetchWeather('paris', weatherApiUrlParis);
    fetchWeather('tokyo', weatherApiUrlTokyo);
    fetchCurrencyRate();

    

   // Fichier : public/js/main.js (Nouvelles options pour le carrousel)

    const swiper = new Swiper('.my-swiper', {
        // --- NOUVELLES OPTIONS POUR L'AFFICHAGE EN GRILLE ---
        slidesPerView: 3,      // Affiche 3 slides en même temps sur grand écran
        spaceBetween: 20,      // Espace de 20px entre les slides
        
        loop: true,
        
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        // --- NOUVEAU : Rendre le carrousel "responsive" ---
        // Pour que sur les petits écrans (mobiles), on ne voie qu'une seule image
        breakpoints: {
            // quand la largeur de la fenêtre est >= 320px
            320: {
            slidesPerView: 3,
            spaceBetween: 10
            },
            // quand la largeur de la fenêtre est >= 768px
            768: {
            slidesPerView: 4,
            spaceBetween: 20
            },
            // quand la largeur de la fenêtre est >= 1024px
            1024: {
            slidesPerView: 6,
            spaceBetween: 30
            }
        }
    });

    // Fonction:  charger l'image position pour la région dans region_carte_form.ejs
    // --- NOUVEAU : Logique pour la page carte des régions ---
    const regionSelect = document.getElementById('region-select');

    if (regionSelect) {
        const cartesContainer = document.getElementById('cartes-container');
        const positionImage = document.getElementById('region-position-image');
        const departementImage = document.getElementById('region-departement-image');

        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;

            if (selectedRegion) {
                // Construire les deux chemins d'image
                const positionImagePath = `/images/cartes/france/reg_position/${selectedRegion}.webp`;
                const departementImagePath = `/images/cartes/france/reg_departement/${selectedRegion}.webp`;
                
                // Mettre à jour la source des deux images
                positionImage.src = positionImagePath;
                departementImage.src = departementImagePath;

                // Afficher le conteneur principal
                cartesContainer.style.display = 'flex'; // On utilise 'flex' pour activer le CSS Flexbox

            } else {
                // Cacher le conteneur si aucune région n'est sélectionnée
                cartesContainer.style.display = 'none';
            }
        });
    }

});


