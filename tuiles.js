/*
 * TODO ::
 * utiliser un taille minimum pour les carres, donc pouvoir scroller dans le svg si on sort du cadre
 * implementer un zoom
 * implementer la gestion de la matrice en 2d
 * implementer modification dynamique de la matrice
 */

// Variable globale
var contexte = {
    carresparpied: 4,
    carres: [],
    compte: {}
};

// Initialisation
window.onload = function initialize () {
    contexte.hauteur = d3.select("#hauteur").node();
    contexte.largeur = d3.select("#largeur").node();
    contexte.canvas = d3.select("#canvas");

    // Creation du canvas
    var canvasStyle = contexte.canvas.node().style;
    contexte.svg = contexte.canvas.append("svg").attr("height", canvasStyle.height).attr("width", canvasStyle.width);
    calculerMetriques();
    createLayout();
}

// Calculs
function calculerMetriques () {
    contexte.nbcarres = contexte.largeur.value * contexte.carresparpied;
    contexte.diagonale = contexte.canvas.node().offsetWidth / contexte.nbcarres;
    contexte.cote = diagonaleacote(contexte.diagonale);
    contexte.decalageRotation = (contexte.diagonale - contexte.cote) / 2;

    // Construire la matrice des carres
    contexte.carres = [];
    for(var i = 0; i < contexte.nbcarres; ++i){
        contexte.carres.push(i);
    }
}

function createLayout () {
    contexte.svg.selectAll("rect").data(contexte.carres).enter().append("rect")
    .attr("class", "carre")
    .attr("height", contexte.cote)
    .attr("width", contexte.cote)
    .attr("x", function (d) { return (d * contexte.diagonale) + contexte.decalageRotation })
    .attr("y", contexte.diagonale / 2)
    .attr("fill-opacity", 0)
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .on("click", changecolor)
}

// Evenements
function changeWidth (w) {
    parametres.canvasHeight = w;
}

function changeHeight (h) {
    parametres.canvasHeight = h;
}

function changecolor () {
    var element = d3.select(this);
    var couleur = d3.select("#color").node().value;

    if(element.attr("fill-opacity") === "0"){
        element.attr("fill-opacity", 1);
        element.attr("fill", couleur);
        contexte.compte[couleur] = incremente(contexte.compte[couleur]);
    }
    else {
        var ancienneCouleur = element.attr("fill");
        contexte.compte[ancienneCouleur] = decremente(contexte.compte[ancienneCouleur]);
        element.attr("fill", couleur);
        contexte.compte[couleur] = incremente(contexte.compte[couleur]);
    }
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


