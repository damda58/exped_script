// ==UserScript==
// @name         business.facebook
// @namespace    damda58
// @downloadURL  https://raw.githubusercontent.com/damda58/exped_script/master/business.facebook.js
// @updateURL    https://raw.githubusercontent.com/damda58/exped_script/master/business.facebook.js
// @version      0.5
// @description  Retirer les blocs de Pub
// @author       Damien Cebrian
// @match        https://business.facebook.com/latest/home*
// @icon         https://business.facebook.com/images/bizkit/mbs_favicon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Fonction pour masquer les div cibles
    function masquerDivs() {
        document.querySelectorAll('div[data-pagelet="MainColumn_4"]').forEach(div => {
            div.style.display = 'none';
        });
        document.querySelectorAll('div[data-pagelet="MainColumn_5"]').forEach(div => {
            div.style.display = 'none';
        });
    }

    // Exécuter au chargement initial
    masquerDivs();

    // Surveiller les changements du DOM pour masquer les nouveaux éléments
    const observer = new MutationObserver(masquerDivs);
    observer.observe(document.body, { childList: true, subtree: true });
})();
