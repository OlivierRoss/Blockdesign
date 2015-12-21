/*
 * TODO ::
 * implementer un zoom
 * implementer un scroll
 * refaire le design
 *
 * Etape 2
 * calculateur de prix
 * mettre une image en arriere plan
 * exporter en element html par polyfill
 * calculer par panneau de cloture
 *
 * Etape 3
 * Gerer l'ecriture de texte
 *
 * Etape 4
 * rasterisation d'image pour cloture
 */

// Variable globale
var contexte = {
    carresparpied: 4,
    lignes: [],
    matrice: [],
    compte: {},
    sourisenfoncee: false
};

// Initialisation
window.onload = function initialize () {
    // Composants
    contexte.hauteur = d3.select("#hauteur").node();
    contexte.largeur = d3.select("#largeur").node();
    contexte.canvas = d3.select("#canvas");

    // Creation du canvas
    var canvasStyle = contexte.canvas.node().style;
    contexte.svg = contexte.canvas.append("svg").attr("height", canvasStyle.height).attr("width", canvasStyle.width);

    // Construction matrice + affichage
    calculerMetriques();
    for(var i = 0; i < contexte.nblignes; ++i)
    {
        var nbcarres = i % 2 === 0 ? contexte.nbcarresligne : contexte.nbcarresligne - 1;
        contexte.matrice.push(creerligne(nbcarres));
    }
    
    // Evenements
    contexte.hauteur.onchange = dessiner;
    contexte.largeur.onchange = dessiner;
    contexte.canvas.node().onmousedown = function () { contexte.sourisenfoncee = true };
    contexte.canvas.node().onmouseup = function () { contexte.sourisenfoncee = false };

    // Finalisation
    creationmatriceaffichage();
    afficher();
}

// Dessin
function dessiner () {
    calculerMetriques();
    creationmatriceaffichage();
    nettoyer();
    afficher();
}

function calculerMetriques () {
    // Constantes
    contexte.nblignes = contexte.hauteur.value * contexte.carresparpied;
    contexte.nbcarresligne = contexte.largeur.value * contexte.carresparpied;

    // Calcul de cote
    var canvas = contexte.canvas.node();
    contexte.diagonale = Math.min((canvas.offsetWidth - 2) / contexte.nbcarresligne, (canvas.offsetHeight - 2) / ((contexte.nblignes / 2) + 0.5));
    contexte.cote = diagonaleacote(contexte.diagonale);
    contexte.decalageRotation = (contexte.diagonale - contexte.cote) / 2;
}

function creationmatriceaffichage () {
    contexte.lignes = deepcopy(contexte.matrice);
    ajusterlignes();
    ajustercolonnes();
}

function nettoyer () {
    contexte.svg.selectAll("g.ligne").remove();
}

function ajusterlignes () {
    var voulu = contexte.nblignes;
    var actuel = contexte.lignes.length;
    if(voulu === actuel) { return; }
    else if(voulu < actuel) { // il y en a trop
        var nb = actuel - voulu;
        contexte.lignes.splice(-nb, nb);
    }
    else { // il en manque
        var nb = voulu - actuel;
        var nbcarres = contexte.matrice[0].length;
        for(var i = 0; i < nb; ++i) {
            if(i % 2 === 0){
                contexte.lignes.push(creerligne(nbcarres));
                contexte.matrice.push(creerligne(nbcarres));
            }
            else{
                contexte.lignes.push(creerligne(nbcarres - 1));
                contexte.matrice.push(creerligne(nbcarres - 1));
            }
        }
    }
}

function ajustercolonnes () {
    var voulu = contexte.nbcarresligne;
    var actuel = contexte.matrice[0].length;
    if(voulu === actuel) { return; }
    else if (voulu < actuel) { // il y en a trop
        var nb = actuel - voulu;
        contexte.lignes.forEach(function (element) {
            element.splice(-nb, nb); 
        });
    }
    else { // il ny en a pas assez
        var nb = voulu - actuel;
        contexte.lignes.forEach(function (element) {
            for(var i = 0; i < nb; ++i){
                element.push({fill: "#000000", opacity: 0}); 
            }
        });
        contexte.matrice.forEach(function (element) {
            for(var i = 0; i < nb; ++i){
                element.push({fill: "#000000", opacity: 0}); 
            }
        });
    }
}


function creerligne (nb) {
    var ligne = [];
    for(var i = 0; i < nb; ++i) {
        ligne.push({fill: "#000000", opacity: 0});
    }
    return ligne;
}
 
function afficher () {
    // Creation des lignes
    var groupes = contexte.svg.selectAll("g.ligne").data(contexte.lignes).enter().append("g")
    .attr("index", function (d, i) { return i })
    .attr("class", "ligne")
    .attr("index", function (d, i) { return i})
    .attr("transform", function (d, i) { 
        if(i % 2 === 0){
            return "translate(0, " + contexte.diagonale * i / 2 + ")" 
        }
        else {
            return "translate(" + contexte.diagonale / 2 + ", " + contexte.diagonale * i / 2 + ")" 
        }
    })

    // Creation des carres
    groupes.selectAll("rect").data(function(d) { return d; }).enter().append("rect")
    .attr("index", function (d, i) { return i })
    .attr("class", "carre")
    .attr("index", function (d, i) { return i})
    .attr("height", contexte.cote)
    .attr("width", contexte.cote)
    .attr("x", function (d, i) { return (i * contexte.diagonale) + contexte.decalageRotation })
    .attr("y", contexte.decalageRotation)
    .attr("fill-opacity", function(d) { return d.opacity})
    .attr("fill", function(d) { return d.fill })
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .on("mousedown", changecolor)
    .on("mouseover", mouseover);
}

// Evenements
function mouseover (e) {
   if( contexte.sourisenfoncee ) changecolor.call(this);
}

function changecolor () {
    var element = d3.select(this);
    var elementNode = element.node();
    var datum = contexte.matrice[elementNode.parentNode.getAttribute("index")][elementNode.getAttribute("index")];
    var couleur = getCouleur();

    if(datum.opacity == 0 && couleur.opacity == 0) return; // pas de changement
    else if(datum.opacity == 0 && couleur.opacity != 0){ // nouvelle case
        datum.fill = couleur.fill;
        datum.opacity = couleur.opacity;

        element.attr("fill", datum.fill);
        element.attr("fill-opacity", datum.opacity);

        contexte.compte[datum.fill] = incremente(contexte.compte[datum.fill]);
    }
    else if(datum.opacity != 0 && couleur.opacity == 0){ // efface
        contexte.compte[datum.fill] = decremente(contexte.compte[datum.fill]);

        datum.fill = couleur.fill;
        datum.opacity = couleur.opacity;
        
        element.attr("fill", datum.fill);
        element.attr("fill-opacity", datum.opacity);
    }
    else { // changement couleur
        contexte.compte[datum.fill] = decremente(contexte.compte[datum.fill]);
        
        datum.fill = couleur.fill;
        datum.opacity = couleur.opacity;
        
        element.attr("fill", datum.fill);
        element.attr("fill-opacity", datum.opacity);
        
        contexte.compte[datum.fill] = incremente(contexte.compte[datum.fill]);
    }

    // Affichage
    var decompte = "";
    for(var c in contexte.compte){
        decompte += c + " : " + contexte.compte[c] + "\n"; 
    }
    d3.select("#decompte").node().innerHTML = decompte;
}

function getCouleur () {
    return {fill: d3.select("#couleur").node().value, opacity: d3.event.altKey ? 0 : 1};
}

// Utilitaires
function coteadiagonale (cote) {
    return Math.sqrt(Math.pow(cote, 2) * 2)
}
function diagonaleacote (diagonale) {
    return Math.sqrt(Math.pow(diagonale, 2) / 2)
}

function incremente (valeur) {
    return ++valeur || 1;
}
function decremente (valeur) {
    return valeur === 0 ? 0 : --valeur;
}

function deepcopy (obj) {
    return JSON.parse(JSON.stringify(obj));
}

