// ==UserScript==
// @name         EWC Team tracker
// @namespace    damda58
// @downloadURL  https://github.com/damda58/exped_script/raw/master/EWC_Team_tracker.js
// @updateURL    https://github.com/damda58/exped_script/raw/master/EWC_Team_tracker.js
// @version      0.1
// @description  Mettre en surbrillance la team choisi dans les live timing
// @author       Damien Cebrian
// @match        https://www.its-live.net*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=its-live.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Fonction pour mettre en surbrillance la ligne correspondant à la moto #24
   function highlightBike24Row() {
        console.log("Début de la recherche de la ligne de la moto #24");
        setTimeout(function() {
            const rows = document.querySelectorAll('.row-content');
            for (let i = 0; i < rows.length; i++) {
                const motoNumber = rows[i].querySelector('.number .value').innerText.trim();
                console.log("Numéro de moto trouvé : " + motoNumber);
                if (motoNumber === '#24') {
                    console.log("Moto #24 trouvée ! Mettant en surbrillance la ligne...");
                    rows[i].style.backgroundColor = 'yellow'; // Fond jaune
                    rows[i].parentNode.style.color = 'black'; // Police en noir
                    break;
                }
            }
            console.log("Fin de la recherche de la ligne de la moto #24");
        }, 8000); // Délai de 2 secondes (2000 millisecondes)
    }

    // Appel de la fonction highlightBike24Row
    highlightBike24Row();
})();
