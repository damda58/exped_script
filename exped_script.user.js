// ==UserScript==
// @name         exped_script
// @namespace    damda58
// @downloadURL  https://github.com/damda58/exped_script/blob/master/exped_script.user.js
// @updateURL    https://github.com/damda58/exped_script/blob/master/exped_script.user.js
// @version      0.6
// @description  try to take over the world!
// @author       DC
// @match        https://*.ogame.gameforge.com/game/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

let redirect = localStorage.getItem('ogl-redirect');

if(localStorage.getItem("Premier_lancement") == null)
{
    default_config();
}
if(redirect && redirect.indexOf('https') > -1)
{
    localStorage.setItem('ogl-redirect', false);
    window.location.href = redirect;
}

GM_addStyle(`
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.icon:not(.sprite):not(.resource), .material-icons, .close-tooltip
{
transform:rotate(0.03deg);
font-family:'Material Icons' !important;
font-weight:normal !important;
font-style:normal !important;
font-size:inherit !important;
line-height:inherit !important;
letter-spacing:normal;
text-transform:none;
display:inline-block;
white-space:nowrap;
word-wrap:normal;
direction:ltr;
-webkit-font-feature-settings:'liga';
-webkit-font-smoothing:antialiased;
}
`);


class Exped
{
    constructor()
    {
        this.rawURL = new URL(window.location.href);
        this.page = this.rawURL.searchParams.get('component') || this.rawURL.searchParams.get('page');
        this.mode = this.rawURL.searchParams.get('oglMode') || 0; // 0=default; 1=transpo; 2=lock; 3=autoHarvest; 4=raid; 5=linkedMoon;
        this.ecoSpeed = document.querySelector('head meta[name="ogame-universe-speed"]').getAttribute('content');
        this.planetList = document.querySelectorAll('.smallplanet');
        this.isMobile = ('ontouchstart' in document.documentElement);
        this.universe = window.location.host.replace(/\D/g,'');

        this.highlighted = false;
        this.tooltipList = {};

        // current planet
        this.current = {};
        this.current.planet = (document.querySelector('.smallplanet .active') || document.querySelector('.smallplanet .planetlink')).parentNode;
        this.current.coords = this.current.planet.querySelector('.planet-koords').textContent.slice(1, -1);
        this.current.hasMoon = this.current.planet.querySelector('.moonlink') ? true : false;
        this.current.isMoon = this.current.hasMoon && this.current.planet.querySelector('.moonlink.active') ? true : false;


        this.gameLang = document.querySelector('meta[name="ogame-language"]').getAttribute('content');
        this.separatorLangType = ['en', 'us'].includes(this.gameLang) ? 1 : 0;
        //goodbyeTipped();
        //DisplayMenu();
        this.start();

    }

    start()
    {
        this.expedition();
        //this.show_fleet();
    }

    show_fleet()
    {

        if(this.page == "overview")
        {

            var dpil = document.querySelector('#js_eventDetailsClosed');
            [dpil].forEach(btn =>
                           {
                btn.addEventListener('click', () =>
                                     {
                    var eventFleet = document.getElementsByClassName("eventFleet");
                    for (i = 0; i < eventFleet.length; i++)
                        if (eventFleet[i].getAttribute('data-return-flight')=='true')
                        {
                            var td_alert = document.createElement("td");
                            td_alert.setAttribute('class','send_Alert');
                            eventFleet[i].appendChild(td_alert);
                            var a_alert = document.createElement("a");
                            a_alert.setAttribute('class','send_Alert tooltip');
                            a_alert.setAttribute('title','Envoyer une alerte lorsque arrivé');
                            a_alert.innerHTML = '<img src="https://gf2.geo.gfsrv.net/cdndf/3e567d6f16d040326c7a0ea29a4f41.gif">';
                            td_alert.appendChild(a_alert);
                            var span_alert = document.createElement("span");
                            span_alert.setAttribute('class','icon icon_chat');
                            a_alert.appendChild(span_alert);

                        }

                })});



        }

    }

    expedition()
    {
        var Pub = document.getElementById('banner_skyscraper');
        Pub.remove();
        if(this.page == "fleetdispatch")
        {
            if (document.querySelector('#allornone'))
            {
                //Checkbox envoi rapide
                var div = document.createElement("div");
                div.setAttribute('id','ul_auto');
                div.setAttribute('class','ul_auto');
                div.innerHTML='<label for="send_auto">Envoi rapide</label>';
                document.querySelector('#allornone').appendChild(div);
                var check_auto = document.createElement("input");
                check_auto.setAttribute('type','checkbox');
                check_auto.setAttribute('id','send_auto');
                check_auto.setAttribute('class','send_auto');
                //si send auto est activé alors on coche la checkbox
                if(localStorage.getItem("Send_auto") == 1)
                {
                    check_auto.checked = true;

                }
                document.querySelector('#ul_auto').appendChild(check_auto);

                //Input heure retour
                //var div_heure = document.createElement("div");
                //div_heure.setAttribute('id','div_heure');
                //div_heure.setAttribute('class','div_heure');
                //div_heure.innerHTML='<label for="send_heure">DateHeure de retour souhaitée (format YYYY-MM-DD HH:MM:SS)</label>';
                //document.querySelector('#allornone').appendChild(div_heure);
                //var input_heure = document.createElement("input");
                //input_heure.setAttribute('type','text');
                //input_heure.setAttribute('id','send_heure');
                //input_heure.setAttribute('class','send_heure');
                //input_heure.setAttribute('value',localStorage.getItem("heure_retour"));
                //document.querySelector('#div_heure').appendChild(input_heure);

                //Bouton Goodnight
                //var span_GN = document.createElement("span");
                //span_GN.setAttribute('class', 'span_GN');
                //span_GN.setAttribute('id', 'span_GN');
                //document.querySelector('#div_heure').appendChild(span_GN);
                //var button_GN = document.createElement("a");
                //button_GN.setAttribute('id','a_GN');
                //button_GN.setAttribute('class','tooltip js_hideTipOnMobile tpd-hideOnClickOutside');
                //button_GN.setAttribute('title','Envoyer la flotte pour la nuit');
                //button_GN.innerHTML = '<img src="https://gf2.geo.gfsrv.net/cdndf/3e567d6f16d040326c7a0ea29a4f41.gif">';
                //let bouton_GN = document.getElementById('span_GN').appendChild(button_GN);
            }


            if (document.querySelector('#allornone .secondcol'))
            {

                //Bouton de sauvegarde de la flotte
                var span_sauv = document.createElement("span");
                span_sauv.setAttribute('class', 'send_sauv');
                document.querySelector('#allornone .secondcol').appendChild(span_sauv);
                var button_sauv = document.createElement("a");
                button_sauv.setAttribute('id','sauv');
                button_sauv.setAttribute('class','tooltip js_hideTipOnMobile tpd-hideOnClickOutside');
                button_sauv.setAttribute('title','Sauvegarde de la flotte');
                button_sauv.innerHTML = '<img src="https://gf2.geo.gfsrv.net/cdndf/3e567d6f16d040326c7a0ea29a4f41.gif">';
                let bouton_sauv = document.querySelector('#allornone .send_sauv').appendChild(button_sauv);
                [bouton_sauv].forEach(btn =>
                                      {
                    btn.addEventListener('click', () =>
                                         {

                        localStorage.setItem("CLe",document.getElementsByName("fighterLight")[0].value);
                        localStorage.setItem("CLo",document.getElementsByName("fighterHeavy")[0].value);
                        localStorage.setItem("Cro",document.getElementsByName("cruiser")[0].value);
                        localStorage.setItem("Vb",document.getElementsByName("battleship")[0].value);
                        localStorage.setItem("Tr",document.getElementsByName("interceptor")[0].value);
                        localStorage.setItem("Bom",document.getElementsByName("bomber")[0].value);
                        localStorage.setItem("Des",document.getElementsByName("destroyer")[0].value);
                        localStorage.setItem("RIP",document.getElementsByName("deathstar")[0].value);
                        localStorage.setItem("Fau",document.getElementsByName("reaper")[0].value);
                        localStorage.setItem("Ec",document.getElementsByName("explorer")[0].value);
                        localStorage.setItem("Pt",document.getElementsByName("transporterSmall")[0].value);
                        localStorage.setItem("Gt",document.getElementsByName("transporterLarge")[0].value);
                        localStorage.setItem("So",document.getElementsByName("espionageProbe")[0].value);
                        alert("Sauvegardé");
                    }
                                        )
                }
                                     )
                let coords = this.current.coords.split(':');

                //Bouton Expédition avec système aléatoire
                var span = document.createElement("span");
                span.setAttribute('class', 'send_exped_random');
                document.querySelector('#allornone .secondcol').appendChild(span);
                var button = document.createElement("a");
                button.setAttribute('id','exped1');
                button.setAttribute('class','tooltip js_hideTipOnMobile tpd-hideOnClickOutside');
                button.setAttribute('title','Envoyer expédition dans un système aléatoire');
                button.innerHTML = '<img src="https://gf2.geo.gfsrv.net/cdndf/3e567d6f16d040326c7a0ea29a4f41.gif">';
                let Exped_random = document.querySelector('#allornone .send_exped_random').appendChild(button);

                //Bouton Expédition
                var span2 = document.createElement("span");
                span2.setAttribute('class', 'send_exped');
                document.querySelector('#allornone .secondcol').appendChild(span2);
                var button2 = document.createElement("a");
                button2.setAttribute('id','exped2');
                button2.setAttribute('class','tooltip js_hideTipOnMobile tpd-hideOnClickOutside');
                button2.setAttribute('title','Envoyer expédition');
                button2.innerHTML = '<img src="https://gf2.geo.gfsrv.net/cdndf/3e567d6f16d040326c7a0ea29a4f41.gif">';
                let Exped_classic = document.querySelector('#allornone .send_exped').appendChild(button2);

                //Bouton Urgence
                var span_urg= document.createElement("span");
                span_urg.setAttribute('class', 'send_urg');
                document.querySelector('#allornone .secondcol').appendChild(span_urg);
                var button_urg = document.createElement("a");
                button_urg.setAttribute('id','sauv');
                button_urg.setAttribute('class','tooltip js_hideTipOnMobile tpd-hideOnClickOutside');
                button_urg.setAttribute('title','Envoi flotte vers CDR avec un max de ressources');
                button_urg.innerHTML = '<img src="https://gf2.geo.gfsrv.net/cdndf/3e567d6f16d040326c7a0ea29a4f41.gif">';
                let bouton_urg = document.querySelector('#allornone .send_urg').appendChild(button_urg);

                //Event sur input
                [input_heure].forEach(btn =>
                                      {
                    btn.addEventListener('change', () =>
                                         {
                        //alert(document.getElementById("send_heure").value);
                        localStorage.setItem("heure_retour",document.getElementById("send_heure").value);
                    })});

                //Event sur checkbox
                [check_auto].forEach(btn =>
                                     {
                    btn.addEventListener('change', () =>
                                         {
                        if(document.getElementById("send_auto").checked)
                        {
                            localStorage.setItem("Send_auto",1)
                        }
                        else
                        {
                            localStorage.setItem("Send_auto",0)
                        }

                    })});

                //Clic Good night
                [button_GN].forEach(btn =>
                                    {
                    btn.addEventListener('click', () =>
                                         {
                        //Récupère le nombre de planètes pour vérifier qu'il n'y en a pas de dispo
                        var str_pla = document.querySelector('#countColonies .textCenter').innerHTML
                        var nb_pla_possedee = str_pla.split("<span>");
                        nb_pla_possedee = nb_pla_possedee[1];
                        nb_pla_possedee = nb_pla_possedee.split("/")
                        var nb_pla_dispo = nb_pla_possedee[1];
                        nb_pla_possedee = nb_pla_possedee[0];
                        nb_pla_dispo = nb_pla_dispo.split("<");
                        nb_pla_dispo = nb_pla_dispo[0];
                        alert("Vous avez "+nb_pla_possedee+" planètes sur "+nb_pla_dispo+" il vous reste donc "+(nb_pla_dispo-nb_pla_possedee)+" planètes a coloniser");

                        document.querySelector('#sendall').click();
                        fleetDispatcher.targetPlanet.galaxy = coords[0];
                        fleetDispatcher.targetPlanet.system = coords[1];
                        fleetDispatcher.targetPlanet.position = coords[2];
                        fleetDispatcher.targetPlanet.type = 1; //1 = planet 2 = cdr 3 = lune
                        fleetDispatcher.mission = 7; //Mission 7 = coloniser
                        fleetDispatcher.speedPercent = 1; // 1 = 10, 2 = 20
                        fleetDispatcher.refresh();
                        document.querySelector('#continueToFleet2').click();
                        //document.querySelector('#backToFleet1').click();
                        var dateheure_actuelle = new Date();
                        var dateheure_voulue = str_todate('-',localStorage.getItem("heure_retour"));
                        var dateheure_retour_flotte = str_todate('.',document.getElementById('returnTime').innerHTML);
                        console.log("dateheure_actuelle : " + dateheure_actuelle);
                        console.log("dateheure_voulue : " + dateheure_voulue);
                        console.log("dateheure_retour_flotte : " + dateheure_retour_flotte);
                        var diff = (dateheure_voulue - dateheure_actuelle);
                        alert("Le voyage doit faire minimum :"+Math.round(((diff/1000)/60))+' minutes');
                        var diff_reel = (dateheure_retour_flotte - dateheure_actuelle);
                        //alert("Avec les paramètres défini actuellement, le voyage durerai :"+Math.round(((diff_reel/1000)/60))+' minutes');

                    })});

                //Clic urgence
                [bouton_urg].forEach(btn =>
                                     {
                    btn.addEventListener('click', () =>
                                         {
                        document.querySelector('#sendall').click();

                        fleetDispatcher.targetPlanet.galaxy = coords[0];
                        fleetDispatcher.targetPlanet.system = coords[1];
                        fleetDispatcher.targetPlanet.position = coords[2];
                        fleetDispatcher.targetPlanet.type = 2;
                        fleetDispatcher.targetPlanet.name = '-';
                        fleetDispatcher.mission = 8; //Mission 7 = coloniser
                        fleetDispatcher.speedPercent = 1; // 1 = 10, 2 = 20
                        fleetDispatcher.refresh();

                        if(localStorage.getItem("Send_auto") == 1)
                        {
                            document.querySelector('#continueToFleet2').click();

                            if(document.querySelector('#continueToFleet3'))
                            {

                                sleep(getRandomIntInclusive(800,1300)).then(() => {
                                    document.querySelector('#continueToFleet3').click();
                                    sleep(getRandomIntInclusive(500,1500)).then(() => {
                                        document.querySelector('#allresources').click();
                                        sleep(getRandomIntInclusive(500,1800)).then(() => {
                                            document.querySelector('#sendFleet').click();
                                        })
                                    })
                                })

                            }

                        }

                    })});


                //Evenement clic
                [Exped_random, Exped_classic].forEach(btn =>
                                                      {
                    btn.addEventListener('click', () =>
                                         {
                        //On reset tout
                        document.querySelector('#resetall').click();
                        let type = btn == Exped_random ? 'R' : 'C';
                        let SS = "" ;
                        if (type == 'C')
                        {
                            SS = coords[1];
                        }
                        else
                        {
                            SS = getRandomIntInclusive(parseInt(coords[1]) - 5, parseInt(coords[1]) + 5);
                        }


                        //Ajout de la flotte voulue (sauvegardé précédemment

                        if(localStorage.getItem("Gt")!= 0) selectShips(203,localStorage.getItem("Gt"));
                        if(localStorage.getItem("Pt")!= 0) selectShips(202,localStorage.getItem("Pt"));
                        if(localStorage.getItem("So")!= 0) selectShips(210,localStorage.getItem("So"));

                        if(localStorage.getItem("CLe")!= 0) selectShips(204,localStorage.getItem("CLe"));
                        if(localStorage.getItem("CLo")!= 0) selectShips(205,localStorage.getItem("CLo"));
                        if(localStorage.getItem("Cro")!= 0) selectShips(206,localStorage.getItem("Cro"));
                        if(localStorage.getItem("Vb")!= 0) selectShips(207,localStorage.getItem("Vb"));
                        if(localStorage.getItem("Tr")!= 0) selectShips(215,localStorage.getItem("Tr"));
                        if(localStorage.getItem("Bom")!= 0) selectShips(211,localStorage.getItem("Bom"));
                        if(localStorage.getItem("Des")!= 0) selectShips(213,localStorage.getItem("Des"));
                        if(localStorage.getItem("RIP")!= 0) selectShips(214,localStorage.getItem("RIP"));
                        if(localStorage.getItem("Fau")!= 0) selectShips(218,localStorage.getItem("Fau"));
                        if(localStorage.getItem("Ec")!= 0) selectShips(219,localStorage.getItem("Ec"));


                        fleetDispatcher.targetPlanet.galaxy = coords[0];
                        fleetDispatcher.targetPlanet.system = SS;
                        fleetDispatcher.targetPlanet.position = 16;
                        fleetDispatcher.targetPlanet.type = 1;
                        fleetDispatcher.targetPlanet.name = '-';
                        fleetDispatcher.mission = 15;
                        fleetDispatcher.expeditionTime = 1;
                        fleetDispatcher.speedPercent = 10; // 1 = 10, 2 = 20
                        fleetDispatcher.refresh();
                        if(localStorage.getItem("Send_auto") == 1)
                        {
                            document.querySelector('#continueToFleet2').click();

                            if(document.querySelector('#continueToFleet3'))
                            {

                                sleep(getRandomIntInclusive(500,1100)).then(() => {
                                    document.querySelector('#continueToFleet3').click();
                                    sleep(getRandomIntInclusive(500,1200)).then(() => {
                                        document.querySelector('#sendFleet').click();
                                    })
                                })
                            }

                        }

                    }
                                        )});

            }
        }
    };
}


window.addEventListener ("DOMContentLoaded", () =>
                         {
    let exped = new Exped();
});

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
// goodbye tooltips
function goodbyeTipped()
{
    if(typeof Tipped !== 'undefined')
    {
        for(let [key] of Object.entries(Tipped))
        {
            Tipped[key] = function() { return false; }
        }
    }
    else requestAnimationFrame(() => goodbyeTipped());
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

function default_config() {
    localStorage.setItem("Premier_lancement",0);
    localStorage.setItem("CLe",0);
    localStorage.setItem("CLo",0);
    localStorage.setItem("Cro",0);
    localStorage.setItem("Vb",0);
    localStorage.setItem("Tr",0);
    localStorage.setItem("Bom",0);
    localStorage.setItem("Des",0);
    localStorage.setItem("RIP",0);
    localStorage.setItem("Fau",0);
    localStorage.setItem("Ec",0);
    localStorage.setItem("Pt",0);
    localStorage.setItem("Gt",0);
    localStorage.setItem("So",0);
    localStorage.setItem("Send_auto",0);
}

function DisplayMenu()
{
    if (document.getElementById('playerName'))
    {
        var icone = 'data:image/gif;base64,R0lGODlhGwAbAPelABAXGg0UFhMYHRohJgYKDQIEBwYLDRYcIRQaHgIEBgcLDwMFCAIFCAAAAAAAAAAAABUbIAYKDwIFB5eWkggOEQAAAAECAwAAAJaXlpWVkpWWlXh8fAQHCRsiKhofJRwjKBogJh0kKUlSVhohJW1xcwIEBWxxc5KUkpOTkpWUkpWUk5aWk3l8fCEkLCElKQQHCCMrL3x9fpWWlpOWlmFobwMGCQwPEJKSkm5ydgAAAJaXlTY6PwUIDFhfYwYJDwAAAQABAhcdIH+Eh32FiZWSkUxQWUxUWWdsbJaVjhMaHRMXGnZ2dgoPFg4TGRUaHw4WGjpARA4UGAMGCAQHCgECAgICBG55fwwPFg4VGCs2QAABAmJpawQGCAABApWXlUJJVCUsMhAWGpWWkgkOEgcNEI2NjZeWkTI6RCgvNSAkKJSWlRYdIQkPEl5kYys2QQcNEU9SVpaWlJaWli8yNDtBSjZBTZOUlgUGCDA5QAQICiovNgAAAS02Pl5kZggNEpGVkZWWkWZqbRMdJVRZXXiAh1FXYlheYAQHCpOSjwAAAWNobRQZHy45QAcKDwkMD0lKUBshJCYpMzU8RAABAwAAAAIDBoeLjWlvdBwlLGdxe5aVkYWIiY+SkhQZHhMXHRUbHgICAxYbIBUbHxYcIAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTg0OTY5QTg4MjY4MTFFQTk5RDZFRjgxRDVEQzg3QjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTg0OTY5QTk4MjY4MTFFQTk5RDZFRjgxRDVEQzg3QjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1ODQ5NjlBNjgyNjgxMUVBOTlENkVGODFENURDODdCMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1ODQ5NjlBNzgyNjgxMUVBOTlENkVGODFENURDODdCMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAEAAKUALAAAAAAbABsAAAj/AEuVGjCqoMGDCBMOEFjKg8JPDx+WGpGwosWLGDMWRBCqo8ePIEOCHCBAlMmTKEWNgpCyZRIBoQ6ucfOh4IGbBzIKgIkyyx8WX0CYZNky5c5Qn5J+OmNGxYQNUIIoTSpqqtJRAhB02tqpg5AVMuIAMsHHCddFXNN2yuqpbds6GDRosKMJSSAwbvO6DZMVgF+/ggh5yZDihCVOZdrA+MvYr4UoASJHfsJIDRExOqxgwrNlwyA0WCRHpkKqtGnTl+QYgjNhTuk7ehTRiHS6dm0IM44kIpHBxWlIImzYHk6qBwYfk/og8kS8uWk/KOiULrLJkXPnhWKY3rFEyXXijW5cZDHdYgiP78ONPDqdJlMX9LUT4Eh0usl7+KclhcBPiv7wLkx8ZwF/zlVSAigIJqjgggwmWEUpeRxyCAc1LGChBBgWoGECGzLgoRRcvMABQ2yM8QYZCqRoAAErshiBizBSQIFAAQEAOw==';

        var AJours = "";
        //alert(Boolean(GM_getValue(nomScript+"aJours",'true')) + '  '+ GM_getValue(nomScript+"aJours",'true'))

        var aff_option ='<span class="menu_icon"><a id="iconeUpdate" href='+(AJours ? adresse_forum : "https://openuserjs.org/scripts/benneb/InfoCompte3" )+' target="blank_" ><img class="mouseSwitch" src="'+(icone)+'" height="27" width="27"></span><a class="menubutton "';
        aff_option += 'href="" accesskey="" target="_self">';
        aff_option += '<span class="textlabel">Exped 5000</span></a>';

        var tableau = document.createElement("li");
        tableau.innerHTML = aff_option;
        tableau.id='optionIFC';
        document.getElementById('menuTableTools').appendChild(tableau);
    }
}

function selectShips(shipID, amount)
{
    fleetDispatcher.shipsOnPlanet.forEach(ship =>
                                          {
        if(ship.id == shipID)
        {
            if(amount > ship.number) amount = ship.number;

            fleetDispatcher.selectShip(parseInt(shipID), parseInt(amount));
            fleetDispatcher.refresh();
            if(document.querySelector('#continueToFleet2'))
            {
                document.querySelector('#continueToFleet2').focus();
            }
            else
            {
                alert("Impossible a trouver");
            }
        }
    });

    return amount;
}

function str_todate(delimiteur,dateheure_voulue_str)
{
    var reggie = ""
    var dateArray = ""
    var dateheure_voulue = ""
    if (delimiteur == "-")
    {
        reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
        dateArray = reggie.exec(dateheure_voulue_str);
        dateheure_voulue = new Date(
            (+dateArray[1]),
            (+dateArray[2])-1, // Careful, month starts at 0!
            (+dateArray[3]),
            (+dateArray[4]),
            (+dateArray[5]),
            (+dateArray[6])
        );
    }
    else
    {
        reggie = /(\d{2}).(\d{2}).(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
        dateArray = reggie.exec(dateheure_voulue_str);
        dateheure_voulue = new Date(
            (+20+dateArray[3]),
            (+dateArray[2])-1, // Careful, month starts at 0!
            (+dateArray[1]),
            (+dateArray[4]),
            (+dateArray[5]),
            (+dateArray[6])
        );
    }
    return dateheure_voulue;
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

GM_addStyle(`
:root
{
--main:#375879;
--mainLight:#466c92;
--hover:#b1390b;
--hoverLight:#ff5e2c;
--active:#873496;
--activeLight:#a449b5;
}

#fleetdispatchcomponent .allornonewrap .secondcol
{
background:#0d1014;
border-radius:5px;
display:grid !important;
grid-template-columns:repeat(7, 1fr);
padding:5px !important;
width:239px !important;
}

#allornone .secondcol .clearfloat
{
display:none !important;
}

#allornone .secondcol *
{
float:none !important;
}

.ogl-prefab
{
background:url(https://gf2.geo.gfsrv.net/cdn7e/41c09757d8212f48fc574515c8bc87.jpg);
background-position:calc(-8px * 30) 0 !important;
background-size:calc(30px * 14) !important;
border:1px solid #000;
cursor:pointer;
display:inline-block;
height:30px;
position:relative;
width:30px;
z-index:10;
}

.ogl-prefab:before
{
background:url(https://gf2.geo.gfsrv.net/cdn14/f45a18b5e55d2d38e7bdc3151b1fee.jpg) no-repeat;
background-size:calc(36px * 11) !important;
background-position:-3px -5px;
border:1px solid #000;
content:'';
display:block;
height:28px;
right:-5px;
position:absolute;
top:-5px;
transform:scale(.5);
transform-origin:top right;
width:28px;
}

.ogl-prefab:hover
{
border:1px solid orange;
}

.ogl-gtexpe
{
background-position:calc(-9px * 30) 0 !important;
}

.send_sauv a
{

margin:0;
display:block;
width:32px;
height:32px;
overflow:hidden;
background:url("data:image/gif;base64,R0lGODlhIABAAPcAAIaq0fDz9Nvo8trl70eJxs3e7QCR4Yu75ABNnABptgBbpwBquQCN4QB01oW15ABouzeJyfP2+NTn+ABUpwALKABr1kd7rWOXyQBnyWGUxh1/xgCA3QAAAwB0yABOn6bD3a/I49Hi8gBs0rHL4wBcrgBktABpzwBo0gBeywBNoyxyqwADCQBxvQBuwFyQwAB42gBjx1mNvlKPwIm24wBVrACB4ABx1jCDyABouQBIhQBUqgCF3ABjuABYryF/wwBeuQBvyCCS3wCG3gBx0QCC3gBbygBbsACD3cDV6sDS4wBv14m55ABHmwB9wkKGxrLH2rPH2AAHEgBwu67E15a42ABeyQBtzwBitQBJnwBXjvb5/Yqt0QB/2QBFmwBHlwBmtwBGnlif1Iix1aS80gBouNPj8gBiuXObw2KLswV6vgB30QBfswIAAYiw1LPK4wIAAwBSiwBgyOvy+UN3r0uMv3Kl1ymV3gBp1ABYogBryQBougBRpQBz1wBz1ABrzgACBAABCABWpgBInAADAQIBCABt2ABkxwBHoABRnwBBhwBZywCE3e/z9wBixwBwvQBEhABtvO/y9QCI3wBgxwBnxgAAAPv7+wB50ER5rM7b6PD0+ABKjAB93QBYpwBImABEmQBXpwAycABIogBNgABwz+/z9gBswQBInwBPmgAXQwQZAABUmQEMAABiqQB/3VGc0wB0zU6MvABy3ViDrE6OwyWT3iCDzwBy3tzm8WGJsQCC3czZ5szc7Cl2tACF3dzq9ABjpu/0+ABut7PF2QA7lUyY01Gb1QBszwBWwdLm+ACF3gByzTeX4AB5wwBOoABrugB3xV6e2gBw1GCQuAAMFQBtvAB62QBluarA2QBHjwBLhwBOis3f8Ux+rQBZoxx+wQBhsT6d36i7z5K95wBNqIOv06PA3q2/0wBEm1yX0pqyymGh17fP5jd7sbbK3M/l90N8rwADFur0/ABpswCJ3c7j97DF2gBjzQBLm0mT1JjC5wBTpgBfxwBKmwBZsf///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDU4MUU1Njg4MkRCMTFFQTk5OEU4QTE5NDRDQ0E5QkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDU4MUU1Njk4MkRCMTFFQTk5OEU4QTE5NDRDQ0E5QkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENTgxRTU2NjgyREIxMUVBOTk4RThBMTk0NENDQTlCRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENTgxRTU2NzgyREIxMUVBOTk4RThBMTk0NENDQTlCRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAAAAAAALAAAAAAgAEAAAAj/AFmx4bCioEGDgBImJPSmIZuHEB9yqMSqEoVQWTJqzAin4zZt2nKIzPGopMmSoShUWvHoiqOXMB1Vq7ZggR49166ZMfOjp0+f80IRVHDFn9GjRnsoVUqjqY6nUKNeybKCTauoWJv2MMLVyJqvV8KKDfsjy8RW/rBm1bq0B9K3jzhwaPXjrd27eP1tmqigrtFeT5Ik2ZWpsOHDuwQ/6XX0x6hBK0A9mPxARoR/cqiUE8O5s5g25ajI+ReBDo/TD/Zy8PAggetYpf5xk5KAjG0yOHLjeCCF279SdCin5vAHlOvXscukuW1b9+5mIX4Hp7w38vEEsP8pZ45b9wPo0oVX/wfFojwLGYz+hWhivoX79y2gRWdEy5T94ZFZzKyGXjuEbz4EKKAGGnwDQRn/0GefKR3s9YcHCezXnxa4DGDhhRjiokWCMuzHwl6VZINHPyRiEsk/KKao4or/RAKPBzCCMkolHKBCYoknsqgjipFgcmM/cQ1i440m7rhjjz/GVeOPRRrJIpI3KukBkzn+M8wsaGSZy5azDJMilP0gIGWYCCBgQZVnlFnmj2d86SOJYso1pZpnpgjAmlj0g8UppwDw5RyHBBrnamqaWeWdCJCIxZ59/hnoIYhIicCjc2hiJxgqiHOOBVgI0o+fKGryZj+REoSKJ2p2E4AlrG7RTwwoqv/D6BasWhKJBY96McoKHKyCCB7AqjDGMFNA4QIe7UzhzjQKdKJABk9MYc8YKihgLT6jyKXAIZ506223XjAhLhOCMAEGGI+m+2i2NXbyybvwvttFF+jMe+696j5Kzoy9doLIvwAHLPDAAnuzKwehTNDJwgwvHEgg++yzxx4pVCzKxRhj7IxQbKQSSiIghyzyyCSPnBIbqtAYxcoss4zQQg29ERFEE7GiykAt5xxPQQox5NDMA1FUSSqrxATTfjUt8MXSX/Aw1libpMJGFP68sMPVWF/NxdbWvPBCA3zYoIQShZRtdiE7rMJBFJd47fbbDcTNx9w2SCONCHjnnfcLjkT/wcYlIlwi+OCXqGF43H30YYPYY59tNt9yXVLICZRXXvkdJ9xRweacV+B42Sdc8ccKl9xi+el3pN65555/Xgg4KwxSutm2jIAEErwUoPvuvPNy+wi2nC3MIFGQssjxi4RxmTz6LHHA888vIb0D48hDWj6yZM+JMARRwgnyr1j6Dj26lL/B+Ru4ov4R9fwTTDGcxM8JDxxQY3wN+BtjqQQM4O8/EQAkwiIMIIF/aOIVyFsE/VZgPPDtzwDl0wX60qc+BiTDffCLnwJXULxFSOKDYXjgB4VAQmWY0Be+sKABEYi8BZLigyDcXzhqYQc71KIWQchhDplRQE0Yw3+S4EFB/14IwxD+Qwu/wIUAlsjEJeLiFxvSRBhgWAMe/IEDPzAEP7bohPQ4aUWMcMIW+UEKUMiFEmPkRxe/CEYxjtEf3eOHIeZIAC+yEUVhTCMcOYDGORqijndMUR63aAh/rOAPfaSjHd0QgwtcIAOQzEAM3CBIN8oRjiughB//aMc6wOCTn5yEKOtQyTEWsnubBCSKHADKUIrSAaXcYiMwqUk/qvIfrGylKCcBSzxacpaotOVlVgmDG2DDHgTYZS9J80s4RoESyLDlqlg1AxikA0VU2OUMahUAAowRGaCIAh8bAYty3uADI0jnOpYBgRGw4wJWsIIfouEGEIDAHBowgT4x0JOKFbyBEo0IqEAFGoeCVgEFCC2CQhXB0IY2FBhnNMFAB1rQOFThoihQaBEcylGIrsARQ+iASEdKUiCYFAh5SCkGVspSlg4BD1F4wyGOMYSa2rSm8fSDPu9xj4RulKOKOEYiqpIKYuznqM94BhlKwFQSOJUEE4iqVKVKDKmpYm0UyKpWtxqPrnaVEGCVGdBWUAlVBAQAOw==");

}
.send_sauv a:hover
{
background-position:0px 32px;
}

.send_exped_random a
{

margin:0;
display:block;
width:32px;
height:32px;
overflow:hidden;
background:url("data:image/gif;base64,R0lGODlhIABAAPcAAD3e5k21vvz8/AC8zQC0u1fm6QC6wQDb3nvd4zWttwCiqQCMnjXAx0nP2QDM1pnr8H3Kzn7Z3Pj4+J3k6gC/z7rr7QCOh4vf5mrq6wDM0gDd2QDA0O/x8QCJmP7+/gDI1gCVpACGhQC3tQDY3QDU2gAJCfb29n/p7kDj5wClrwDX3VXW3KTX26Du8gDAyACxuACPogCytgDI0ojL0gDR1/Hy8kDHzACwuQC3vADA0AABAwCImwCwtff4+ACpsPX29wAiKY7O0wADBO3v7wCeqwDDzwDY2QDDyAC1uQCjrSOosQCXpwDD0gCXpAC2zQC5yQC0txnG0+zt7gCMnACzyefo6QDF0ACss5zU2QDF1AC9ugCbogDL1wCxyk7LzgDd4PX19oXd5fPz8/Hy8gC5vgDGzQClsAC4ugC4uACgrQC8yQCKmgC7ugC0yADP0jTK1gCepwC9zwATEgDZ37719gAECQC7wF/Q00rFzAC2vADZ4AAXHgDP0wDP2ACPnADL1ACdqQDO1QC6uQCpswCbpgCepQCOnwANEgIAAgADAADL2ADc3wCUnwB6hwCwywCgqgCRnAC1xwDY4ACBhPP09AC3xwC+xgAAAADQ0QC2xwC7vQCIjQCToPv7+wCgpwCHmQBlcACAewDHz/T19fL09AC3x/r6+gCWngA4RACUmgChq+7w8Pn6+gDP3f39/QkMAADZ3RYZAACXmQCppwCipPb3+AAKBwDE0/j5+enq6/v8/ACyt/r6+wCyygIAAKzh5ACzuu/x8QDT3gCmpACowQB7lezu7gCirKbu8xvBx1a7wQCorgDQ3ACxuQC5zgDd4QC2yHnGy0izvACssQuirAC1uwCIkACosgCQoMfv8wCWqADY3wCfpjXFywCPngCiqMbm6gCVoQCMmwAUEACzsQDD0ADKzz7KzgCrtACutp/h4zDb5Jre4QDT2ACzuQDM2QCiq2rW1wCzyxjZ4gne4zDa4wCbo57f4gCwuAC7vgCMoADa3QC4xwCnsQC1xwCOmyH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NThFMzg1OEQ4MkRDMTFFQTkwQTdFNEM0QTk3MjVBODYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NThFMzg1OEU4MkRDMTFFQTkwQTdFNEM0QTk3MjVBODYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1OEUzODU4QjgyREMxMUVBOTBBN0U0QzRBOTcyNUE4NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1OEUzODU4QzgyREMxMUVBOTBBN0U0QzRBOTcyNUE4NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAAAAAAALAAAAAAgAEAAAAj/AF8h0lGioEGDdYQkrKOjIaKHECHquPTqEhBQFjJq3GghRMcQICeJHDkSFJBLJSbx0MKypRY2bASdmYmkJpIbOHPmJAeKIC0e/YIKDZqiaNEkSY6pUvWoqdOmPCyU8DXr6VNV8OAV7efDx5WvPMKKDXvDwsRZ/aw6XXoMqdGizfDc+5Vs6CQdQmbdGMq37yAG7EyNIbXq19BNQi7R2tvXLx5Xq8T0IIVrCAOhN0IlKuGJgOfPoIGJ7uaK0ihKY354iGDjhesXBDbhPUUghu3bt3ftskEpGKUeq5PlAf1ZthBPuJPH2OVFtTF1NoYTBy2bs3LcZMCMMnFnunfEnDWJ/x9PPp6rMRXsqDfAvr372ELC45hPn74XEyZYnWtvx737I4gJwUkM9RWIgyvBeGBKBXeQYSB9msh2iTVb/GPhhRb64UcCtUihSzC1eJAAJySWSKInoVwiRCoYtnhhGkGMMoQrrJgAiIsWTiJEIizi6CI1M7AyxBhB+KijDj362KISWFRhygxGCqHDKUpeGE4ALPwmwSg3ugjJXUJQCcmYZI4JiDRYCEBKD7wEI0ACPn452z9lNqEEBL90MgYlEpgwBi4zAKLPoIQSKmeYZSqjZxUm9NBJLaR0MkMaC1RaaKGMgHkKJISCs4orP0jhJhYBNFHpFFVmSlAqHZAZjRS5mP8ShDRNQOKNN4YYUukClxLaQSgl6CALI1sU+w0EyixT7BaFFMLNs9woIO201IoTipS06NPBttxyu8a3a0wxxa69EhpKQ6nA8cm67K67w7vvLrBDuYVqk6IQssDByL789uvvv/7aA6wOoCwBx8EIH0zIwiA03DAMEEcsMTY9IYIKKI1krPHGHHfMsUmIxHKJDnKUbHLJhxxSUB0sOxRRRIm9EstAJ9eccgkst/xyRBNVhIosLrkUExpEQwGFa1CMNdYmqCAiRz8kaCD11FIbYTUJJLRDQx9cK+L1115rIIsQcmCC9dlot6M1DYG0/cfbMsQtd9wkaCGHL5jIgMnefO//7YYbfPDRdiAOFA422HU3hIkiTDTuOBO33JLF5B9UXrkizADQAjLzfM0ED/FhIszjjkc+eRaWc1HPA4KREgwyYE9TQiKiH2671+8AAJlklA2xDtgiJCKHKPsUb3zxsMAywggq6G4aaqqdAEAr1LeiggjxWaLC8ccnDwsKrv/mwQn0MK/C+ei/oMM4xEvi/vvvb1OAakO0gMIc3HOvfgnE54/8M6YxQQG2YT70GXB7LyjB8PaxiAY60IEYOA8dDkBB/x3vBfERxQM3uIgC4IcV99ODCOEHv0UkkH8cfOAXEOQBXNABA19IYQMlgUEd3IAf/sihDncYBQl4CEQeeMMO/3coCk/gxRJDTKI/KHABGbkCF2CggBL90Q8hCAGJ/MiiFrNYii52sRxhMMWQLjDFKl7RH1vcohe9GIUJVIEVZEwiP/pRgjOmUYteHEADJjCKHmxJinKsYgkscUctUmCPAhCDBNokACEqcY7ZS+MAooCACvBiTz3wEy7CQIFMTJGKkdTiChb1A0dBqhMX6GQmPFnGUGYxGzMKlZsm0IABlGKVq/xkP0hmCWJoEQGwMsUFarlGXLIyicTwhBzOWIZmmgMBK8hAM8tQhGpaMwfYzKY2oTGLYCFxim0IJxWo0ItedOGcjkinOtU5jIZYIgfgFCc5zYnOda6znbbQghWOwGTPfvbTBQAFqBoG+oSCGtSgVtiCHHSgjwFY4aEQfWgRsBmHODjDGU5wgjy6YM90DqARJbBYMR5UDXfgIx3ouIYZzECEli7hpTB9aTGaFgsh2AIIOM1pTvfA05TlbGcQKcElYhEQADs=");

}
.send_exped_random a:hover
{
background-position:0px 32px;
}

.send_exped a
{

margin:0;
display:block;
width:32px;
height:32px;
overflow:hidden;
background:url("data:image/gif;base64,R0lGODlhIABAAPcAANixi5xCAP9vAOmTRddsAOXJruF/H6paAP+7hg4CAO9pAMKDReBsALJUANikeKVFANxwAOOVRr55MuCGMaNWAPTPr9t3Cf/dxOzKsPjbw/J3AP/+/dKld+rRuvvr3f+0dembT95iAN9yGrpwJs2ERP+JIffTsP3v48iRW7xUAPfXvNJOAP9wAPh1AL5gALVSALBhC6dVAOBxAOVsAOhkAMljALBeAPPLq9irgdlzAuhfAMZVAP/y5/S5gv9+COVoAOJ2Bv+kV+l4CP/Fl+FoAKtUAP/PqetpAOhoAP+RNpsxAPHEnCgSAMhLAP78+tVgAOmqa61gAMhUAPz38f1xAJM1APaNJuCHFeSRNf77+LxfCbhTAKtSAON2AA8MAM6ba/90AOZyANdkALdRAPTm2rNmFgADAO3Zxf359f97COmkYN5jAOuxcsyWYdp8AKtZAtRdAPC8jAMBANhoBrlHALhaANVgAMRYAOVxAOprAORmAP3178xgAahYAP94AOqeW//MpOdwALxYAPHi1MNhAPzx6vC/kel1AMFiCPJjAOzWwdx2AP9yALlbAQMDAM9dAPTo3v+YQ9p5AOKLRNl2APbs5M9iAOuMM/HGpMJmDeBpAd+8neyyeu1zAPr077RcANlsAPnl1L9VAK5iAqxfAO++j9q0kNhrDQMHANttAKlVAMt7M7htH8xSAJhMANVeAP90ANl4AIw6ANNbAAAAAMxaAO9yAPheAN9cAHg5AI8wAKdLAEUkAAkCGgQBDf9xAL5cANJzAL1aAOJwALRXANtzAAABAgQAAO5vAPO5kf57AfR7AMiOUuJvAOZtAP9zAPvo2f/q2PCseeFsBf+tbrRsG/jx66tbAMSJS//Use5lAM6eacRmFLhTANZ3J+ppBuqBEv9+ANNcAOajb+imZPjizuy0iO23hOyONK1dBrFkCtljANt3AO/eztlxANptANy3kt+0j6JRAPrz7v/06t17FKxXAPCxfOuBH+22eeVsANpqANZsAKdSALxXAP///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjBGNEMzQjI4MkRDMTFFQTk5NTlBRTMzMTE3QkQyRTgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjBGNEMzQjM4MkRDMTFFQTk5NTlBRTMzMTE3QkQyRTgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGMEY0QzNCMDgyREMxMUVBOTk1OUFFMzMxMTdCRDJFOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGMEY0QzNCMTgyREMxMUVBOTk1OUFFMzMxMTdCRDJFOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUk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");

}
.send_exped a:hover
{
background-position:0px 32px;
}

.send_exped_random a:hover
{
background-position:0px 32px;
}

.send_urg a
{

margin:0;
margin-left:10px;
display:block;
width:32px;
height:32px;
overflow:hidden;
background:url("data:image/gif;base64,R0lGODlhIABAAPf/ALwAANRdANdsAJ4IAPTbxtN/L9mkdORsAP79/eu4iphMAOQbG894Ifz18u+GLriFU9xwALVrZ8suJtpqANezrqhSAMwEAP91APB0AKkNBbiTcPTb2Ou8uc0UAKdYANzLwwEBALxXAMkhIu7j2dusqbJ7QfKncOcxMuIAAJAAAQ0AAN+4tdzItf9vAOlmAOuXktiMisiHhdFgWMMTE6IaCcGfftFzD3wBAbQAAI04AMAeH9MVEcxaAMVWAPXAl+EEA+C0ivXq6uNnAPLq5Kx1PqphD8yohvTh398yMOCbmtURBKIwKv2AGK9COco/N9UABN3BqO7Tus+rqt5iAMqdmrJUANZNRfrw6aURAKcZEN2SRvTj1N+6msI3M/XUuNl2AKxmG7xBQcBgAOvdzs0dCPKUSNybZe7d2+3k4rpZU//6+JxCANmthubGw9CHQMV6dtt2FMhJROQOEM0WBtlWVc+RjO/GxNxCQZ4AANl7dSoOAIwJAf349tFya+hCQPPl4+1pAKVFAN5nZ+jNtObHq8eXaM5XUf92AP3r3O3W1f1xAPjfyqlYAt6UkMNSTLdiFKkCAPjt5e3e0doAAMyxl8IuKe/OzdK8p8hpZ+CKPvvq68AMCOiopLRSAPDSz98AAKwAAuHWzKhFP80TE9JOAKcvJso0LM1lC/78+tOWWqYlHbJQTLJdAKtZUvt8CaMNBNQdA757PN9dAJsyAMtSAN8AAOXPzdqYWObKyOnay+bUws4pHPrj4ckfD54TAeR1AN1sDQ4JAMMNE9IiFwICGsEABfjy8e3Zx9RvArkABLsNDeNvALlHAOfc29minvp0ALdRALJXAOYlKfv6+cVyKa0JAKY4MdllAO7WwfFjAKdbCrYKANkAAObU1AIBCfTn3L0DAgIFAOY4OaZjHbYAAOheAPheAHg5ALwEDUYDAEUkAMYZALEVAOEAANGujd9nAMYlFeKDgcYmKPTNr/fQsORRT8CLWNqJUK1tLrZpKPvk0vjn2Obc0vjS0f///////yH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFDQkRERkY1ODMwODExRUE5MUIxRjYxNEUxQzhENTc0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFDQkRERkY2ODMwODExRUE5MUIxRjYxNEUxQzhENTc0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUNCRERGRjM4MzA4MTFFQTkxQjFGNjE0RTFDOEQ1NzQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUNCRERGRjQ4MzA4MTFFQTkxQjFGNjE0RTFDOEQ1NzQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3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");

}
.send_urg a:hover
{
background-position:0px 32px;
}

.span_GN a
{

margin:0;
margin-left:10px;
display:block;
width:32px;
height:32px;
overflow:hidden;
background:url("data:image/gif;base64,R0lGODlhIABAAPf/ALwAANRdANdsAJ4IAPTbxtN/L9mkdORsAP79/eu4iphMAOQbG894Ifz18u+GLriFU9xwALVrZ8suJtpqANezrqhSAMwEAP91APB0AKkNBbiTcPTb2Ou8uc0UAKdYANzLwwEBALxXAMkhIu7j2dusqbJ7QfKncOcxMuIAAJAAAQ0AAN+4tdzItf9vAOlmAOuXktiMisiHhdFgWMMTE6IaCcGfftFzD3wBAbQAAI04AMAeH9MVEcxaAMVWAPXAl+EEA+C0ivXq6uNnAPLq5Kx1PqphD8yohvTh398yMOCbmtURBKIwKv2AGK9COco/N9UABN3BqO7Tus+rqt5iAMqdmrJUANZNRfrw6aURAKcZEN2SRvTj1N+6msI3M/XUuNl2AKxmG7xBQcBgAOvdzs0dCPKUSNybZe7d2+3k4rpZU//6+JxCANmthubGw9CHQMV6dtt2FMhJROQOEM0WBtlWVc+RjO/GxNxCQZ4AANl7dSoOAIwJAf349tFya+hCQPPl4+1pAKVFAN5nZ+jNtObHq8eXaM5XUf92AP3r3O3W1f1xAPjfyqlYAt6UkMNSTLdiFKkCAPjt5e3e0doAAMyxl8IuKe/OzdK8p8hpZ+CKPvvq68AMCOiopLRSAPDSz98AAKwAAuHWzKhFP80TE9JOAKcvJso0LM1lC/78+tOWWqYlHbJQTLJdAKtZUvt8CaMNBNQdA757PN9dAJsyAMtSAN8AAOXPzdqYWObKyOnay+bUws4pHPrj4ckfD54TAeR1AN1sDQ4JAMMNE9IiFwICGsEABfjy8e3Zx9RvArkABLsNDeNvALlHAOfc29minvp0ALdRALJXAOYlKfv6+cVyKa0JAKY4MdllAO7WwfFjAKdbCrYKANkAAObU1AIBCfTn3L0DAgIFAOY4OaZjHbYAAOheAPheAHg5ALwEDUYDAEUkAMYZALEVAOEAANGujd9nAMYlFeKDgcYmKPTNr/fQsORRT8CLWNqJUK1tLrZpKPvk0vjn2Obc0vjS0f///////yH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFDQkRERkY1ODMwODExRUE5MUIxRjYxNEUxQzhENTc0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFDQkRERkY2ODMwODExRUE5MUIxRjYxNEUxQzhENTc0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUNCRERGRjM4MzA4MTFFQTkxQjFGNjE0RTFDOEQ1NzQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUNCRERGRjQ4MzA4MTFFQTkxQjFGNjE0RTFDOEQ1NzQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQFMgD/ACwAAAAAIABAAAAI/wC9gQChguBAEOEOElRRUKFDhQJV3EhBkeKNixXxaNRYsWPFG3oIpgBQDAAOUCRTlgTAsqVLl8lA3SCIEodNHCZv6tzJ0yaAFAVB2UzmM42Uo0i74ASQjKlTcsnIoUwxUOjOOv6yanXEk2XTpjapgqiJE0exOHVgaNoQI0Yllph0OH1JDodYsskgASBHTlkiEuScYprWJgvfw3xZ3vCmAtKmTeDQKdNhyNkZPghsJQmDLkwQf7h0gBtNGp0wsXg2KXschgMCBEEQNPjsr5GjI1nb6HjMezXVxspWhzHWgEqcSryoVHK0wh+CZm8s5ZnB+7FvgpCCVwrSAJMIEfIsxf/4riOGv24zuuiYMUMY9VHXG7t35s/7d3mm5H0XMQNrH2EAAjiHe8Js8hsownThDwc64FeJKRJUIo9+IlSiiSfysKehhqMABUJ2b/jjiA4PSmCKKRLKo8OKMLyhQxdhrLfhDGKlAAkH/jShiipZZCGKJRSoQkMGWZSyShavONMGDZAM0KSTM4GAxwDN8WHMkVlQ4dwbGdDwRhBLDBBBVnUMYOaZqA3AwTQRrMJjKZ8lYk0WGSwhyiul/NGMLcaIcqaZadaBwBKv0JBFBEdEUAqddL6SARWDqtJMNzSciUea1vhDRaGqxJBGjz1m4KgomC3hCxoIRPDnb1PS0AYCTfj/UkopNGAxZAa4ZtAcAtaogoY/tqiC5kBTDtBEA91Y44svNJAQwSuvQPLKKtM4J4oq1aLyxrAqFCvmNIlm4csRm6riaHNZvdFKVggkIuwAqEGChZlpnOHPGVIYgwYFaWSwCgLsxhDBNACrse0rrPpipi94xmAvwLZkgQUF7E5jajda2VLpDQXhAa20H9NgzSqOqJJBGABr9cEKKWfVii8cjzUvFgrTzDDDWGDRRB11SEHBBx/YsrIUVNSxCsLEZjDAvNWQk4G0T1cjdTU5V2111dVEiYeor2CR69dfV5OB1cuW7XXMNwyZ8yvM0lBrrVdXDXYG7NAwUzjp3LDH3r7s/3HR33rvLbjgKexReOEggUDMQCokVBBDkDOkUEOPM2YQCN4sbtDjDkXe0EOcYw5COngU81UyqKNezOqsv8T66smkkA5BOKCAQi21TIL77u2g0Hs7vfsuvO3Eo4AHQZPYPgk3tQC/e/PAO8/N9NNPYr31KBRT0BOTPIG774aQIP74SGBf/PnJFzOQ98znzk0jWmlVj/nnEz99Mgw90Q43wNtuBQyNWAsMYICE2wliGPWzHe7IsT3f1eIHz9vBBkhQC+IJAhV2GMYPIPi8dtQCHYx5wgIW8AM5LEAaguDEEdSAAEu8wApyuMNn7LCLDdqwhHJAB0GKYUIT3oEDqIANKv9mk5UX0AE3/rDDAuTARCYuERwEEeEIrdAANSShHuLgBQmQQAcc3SsP/YjHCMc4RiiqQIRyQIImjCEIcZxAHP2AwQmkcQIY+CMR0riDNMg4QhOCI39ykAYn/NHGE7zRD26cozSSgIA88JGP6jvjAu6QRGmIww+YRKQ4EnkHTfRDkScc4x7/eEZpxAMBMjhBJjO5SUOeoBHxUKUeQ7nHBUARBACwgGviIIFd+DIO/ViBBIaxAxGYwhC9WAcn7AAPCzjTmU+AxECciSMrycCX9PFHHogZgyCYYg6YyEoj1tGBcnbAAjjYoS7VgAlHmGIXptCEPzbgBGJ2IQ5zMAUvzmD/iwY4opzrcCYOGOJM+HVhDr7sAy/6UM9hEHMHZEiCPyoBjzN4ohflnAE6C1IMCzjBH86YAxkkAAMZONShOxjFDuKAmUr04ld9KKcFOpBOFTiTDG1ARRzIcCIykGEUQA0qjhDgBHj8wR+egMc5LQAAdXbACXxIhBN8ugtO9GEHWB2FIdTgHF6iwjl5COgcBmrTZ2JCDQvdBRmSswMJpNSLCPCUVjYgAQuMVZ1zsMAMZHAEBByBBA34wwpksANDtKwOfWhAVtSQhw7c1abktMA6eBqPDTgHqRhFlz/4UIkOYCwrlkgmKBhSjA7sQAlzUOkOhuEEOtBBAkqwwmu0ggvXmMRPBr0YbTgmMYc5dGAdIvWpcGHRASu8oBEkWEEbbGGLNqyAAs54gSE6AIqBFAO1Mq2FErbLXe7C4rvgJa45yylNFRQjpXOABVaVgNXTdhcWwRUuGXrr0x1AonHVIGY5g9uL4Yb3v91l7zD2UJB0+GIG7GAHdabGYKlt48HbAAdk0EFhdLDDF7NbnApCEg7PeZgxHvac4gICACH5BAUUAP8ALAAAAAAgAEAAAAj/AP8J/KeCoIqDCIOFC6YwnMNw/yBGHDhQz7lZGDNqxJijo8ePH88NzNGDlMmTJ2mpVNmjpcseYl7SEvmPWY8QOHPqzNkJGrQqnYIKrUK0xyyBzIQKfXCpqVNqOV9KbXm0ZgilndggoPjPDbSdYHHmgGhzZywjRq6MqGEEagh7j8LmXIP0JthHiy7pLKQGW9ywPXII7BSgcOFrmbiMUPMvVwJqAahF+oftFI/LmHkEoPuvguHIg/75G/KPz+R/CQqQ/hfl1GfDnKEZptZADRsGp/ZROlWAkOgRhQgYeA17cOFTV7oaFq75mgEEYwLYuEa8cGxZsrj8u4cdO7B33WWx//lnZor58+c3D5YF598g9PDNA4u06Fp88y7WgFDh2cy/AvC9E58B5QEDR3yycLYGNIMggE8RjFRQARi5QKGNhIwUUUKEXOhyoYQSQiPYP4FU4JtAJUjojmj2SKhBJGBU8IBA7oAI4oglNvgAERdqQ5ok40g4Dj4TDjFCKA0QYWMFOFZghD9BSvjACPYUsWQFK46jzQhjRHijQBLi8w8lGNYQy5UV4DPNP+MwwqKNgoFQIiO6/ENkEVaiycI/0zxI2hh5MglmmHxIEmMF0XDRYgUeeFDCVv+UAAYq/yBQSKOCkgjiA6h8Y080FXxDZhFVMBJapTWUIJA/W4DhQRUjSv/ISqP2jPDPCJc08A8UDzg6kD81aGCMP/+gUkgFsApUooSdVPBIDbYSmwsjHkCx6j9FeMDPQLlYiWMVPoULTTT5xBLLI9DEwpUuLBA70AOwghAOMx4wam+9jeIbCxtGXLJnKKH8w8IllLARiwdVBRICvvfem+/Djc76MCs4hkDUxRhnrLHGIQgWzjliyIUTKyGwYvLJKKcsEgjqnKPAyzDHLPPMMtMkEEQqBEOQzjz/wxBDD4UDQkQgyDs0RRDpsfNBwTDtM9APTTTR0QKpEwhKWJOyEi0tcT1VS2uoI1AIgJhj9tlmZ6N2NoC40DYgB8Qtt9zmBCIQ24Dkrffebbv/LcTfgAf+NyCkCFSOEOUknvg9UDTuuANCHODC3JQfQDhE5cQ9wQGbJ8DVP2VsXnnlPRiOweaou8EGEGqxwUYBByxzCxyjy136P+XAXfky+kAxt38E0F574f8I0cLxxx9Shg/fCESADw4o4kBywWNg/fUYKEJ8AIog7wA9CPgTCQJ8JPcP9Kd58Ywi7LevCA8CGX/BBQ6UBr0riHCh/DwCfWPGIiboHvKQB7/iHc8VV2hAGY53AQB2TxEm+IckFMGEZ7TAfexrQQGNdwgfgG5+82PCIS7QAhJ6zgQDTKEG43cBJvzDC4cYIQhneAEELoKGNNzgIUzgDwfQMIYz3KEJ/1rIBBxegAcF6cEEvPAfGyBDAAJgwCII8UQBIMMGbkAGMrhAABtA8YtCgIZAAiAAevCpAW6AIhAEYgYoGuAKDBBAKgQChC9+MQRjFIAXEJCKLE4AGcnZQhyjGAsIMAARI8hFV+wogBAUjYxrZMAEJpmKfcxuAoxMAAIYYIMRbKGKApgAHlVAxgL8gwuTRAYbMhHKVkKxAGtiADKa10YoinKMf8QGAgowARvYYJKutGJoplEAG5BmEV4MJR7/EYBJFkANgpwkBHyQCle6AVJusAGkDABFCDiSmZOcQCpQgYhbAEMAiKBEL60YhYEYwB4D2YcXvYnLcGphH/7Yh7WGQM4ILQjADQNBgBEKMRBUcJOezPxCOCcABwPsYyCSeOKJ+ORFSQxkDMj4ghhBEAAI8A0QyyhAJrQAB0BkQjQDOcYg3CUQLfyCGWOEgExnKtMDQOAXEPhCJhIABCiwQBe5yIUuBgEFLiRAC19ghkMCgFOazvQLMv2CVKdK1aomVSCkwIALtsrVrgphcnP7hU0PgFOx/gIDYvyHB7DHVgyc9RdwhatVqYoBBVTNA/cxzwQMI4YAiOGvgA2sGDwgNoro4bCITawegrFYqBntsRIJCAA7");

}
.span_GN a:hover
{
background-position:0px 32px;
}

.arrivalTime a
{
margin-left:10px;
}

`);
