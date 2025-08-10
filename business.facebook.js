// ==UserScript==
// @name         business.facebook
// @namespace    damda58
// @downloadURL  https://raw.githubusercontent.com/damda58/exped_script/master/business.facebook.js
// @updateURL    https://raw.githubusercontent.com/damda58/exped_script/master/business.facebook.js
// @version      0.3
// @description  Retirer les bloques de Pub
// @author       Damien Cebrian
// @match        https://business.facebook.com/
// @icon         https://business.facebook.com/images/bizkit/mbs_favicon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Fonction pour mettre en surbrillance la ligne correspondant à la moto #24
    function highlightBike24Row() {
        console.log("Début de la recherche de la ligne de la moto #24");
        
        // Fonction pour vérifier et mettre en surbrillance les lignes
        function checkAndHighlight() {
            // Sélectionner tous les tr dans les tables
            const rows = document.querySelectorAll('table.ng-star-inserted tr');
            
            for (let i = 0; i < rows.length; i++) {
                // Chercher le span avec la classe "value" à l'intérieur de ce tr
                const valueSpan = rows[i].querySelector('span.value');
                
                if (valueSpan && valueSpan.textContent.trim() === '#24') {
                    console.log("Moto #24 trouvée ! Mettant en surbrillance la ligne...");
                    rows[i].style.backgroundColor = 'yellow'; // Fond jaune
                    rows[i].style.color = 'black'; // Police en noir
                    rows[i].style.fontWeight = 'bold'; // Police en gras
                    // Scrolling vers l'élément pour qu'il soit visible
                    rows[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    break;
                }
            }
        }
        
        // Exécuter immédiatement une première fois
        setTimeout(checkAndHighlight, 2000);
        
        // Puis mettre en place un observateur pour détecter les changements dans le DOM
        const observer = new MutationObserver(function(mutations) {
            checkAndHighlight();
        });
        
        // Options de configuration de l'observateur
        const config = { 
            childList: true, 
            subtree: true 
        };
        
        // Commencer à observer le document avec les options configurées
        observer.observe(document.body, config);
    }
    
    // Appel de la fonction highlightBike24Row
    highlightBike24Row();
})();
