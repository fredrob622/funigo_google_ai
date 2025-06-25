document.addEventListener('DOMContentLoaded', () => {
    // Plus besoin de clés API !

    // URLs pour l'API Open-Meteo -- VERSION DÉFINITIVEMENT CORRIGÉE
    const weatherApiUrlParis = 'https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35&current=temperature_2m,cloud_cover,rain';
    const weatherApiUrlTokyo = 'https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.69&current=temperature_2m,cloud_cover,rain';
    
    // URL pour l'API de change (version v4 sans clé)
    const currencyApiUrl = 'https://api.exchangerate-api.com/v4/latest/EUR';

    /**
     * Fonction pour récupérer la météo pour une ville donnée.
     * @param {string} city - Le nom de la ville pour les IDs HTML ('paris' ou 'tokyo').
     * @param {string} url - L'URL de l'API Open-Meteo à appeler.
     */
    const fetchWeather = (city, url) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur réseau pour la météo de ${city}`);
                }
                return response.json();
            })
            .then(data => {
                // Les données actuelles sont dans l'objet 'current'
                if (data && data.current) {
                    const currentData = data.current;
                    
                    // Mise à jour de la température
                    document.getElementById(`${city}-temp`).textContent = Math.round(currentData.temperature_2m);
                    
                    // Mise à jour de la couverture nuageuse (en %)
                    document.getElementById(`${city}-clouds`).textContent = currentData.cloud_cover;

                    // Mise à jour de la pluie (en mm)
                    document.getElementById(`${city}-rain`).textContent = currentData.rain;
                }
            })
            .catch(error => {
                console.error(`Erreur lors de la récupération de la météo pour ${city}:`, error);
                // Afficher une erreur dans l'interface utilisateur
                document.getElementById(`${city}-temp`).textContent = 'Erreur';
                document.getElementById(`${city}-clouds`).textContent = 'Erreur';
                document.getElementById(`${city}-rain`).textContent = 'Erreur';
            });
    };

    /**
     * Fonction pour récupérer le taux de change EUR/JPY.
     */
    const fetchCurrencyRate = () => {
        fetch(currencyApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur réseau pour le taux de change');
                }
                return response.json();
            })
            .then(data => {
                // Le taux JPY est dans l'objet 'rates'
                if (data && data.rates && data.rates.JPY) {
                    document.getElementById('eur-jpy-rate').textContent = data.rates.JPY.toFixed(2);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération du taux de change:', error);
                document.getElementById('eur-jpy-rate').textContent = 'Erreur';
            });
    };

    // Lancer les appels aux fonctions au chargement de la page
    fetchWeather('paris', weatherApiUrlParis);
    fetchWeather('tokyo', weatherApiUrlTokyo);
    fetchCurrencyRate();
});