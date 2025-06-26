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

    

    // Fichier : public/js/main.js (Version finale optimisée)

    const swiper = new Swiper('.my-swiper', {
        loop: true,
        // PAS de "lazy: true" ici
        
        autoplay: {
            delay: 4000,
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
    });


});
