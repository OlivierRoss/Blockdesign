/*
 * TODO ::
 * implementer la gestion de la matrice en 2d
 * pouvoir colorier plusieurs carreaux en meme temps
 * implementer modification dynamique de la matrice
 * utiliser un taille minimum pour les carres, donc pouvoir scroller dans le svg si on sort du cadre
 * implementer un zoom
 * refaire le design
 * exporter en element html par polyfill
 */

// Variable globale
var contexte = {
    carresparpied: 4,
    lignes: [],
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
    afficher();
}

// Calculs
function calculerMetriques () {
    contexte.nblignes = contexte.hauteur.value * contexte.carresparpied;
    contexte.nbcarresligne = contexte.largeur.value * contexte.carresparpied;

    contexte.diagonale = contexte.canvas.node().offsetWidth / contexte.nbcarresligne;
    contexte.cote = diagonaleacote(contexte.diagonale);
    contexte.decalageRotation = (contexte.diagonale - contexte.cote) / 2;

    // Construire la matrice des carres
    for(var i = 0; i < contexte.nblignes; ++i)
    {
        var ligne = [];
        var nbcarres = i % 2 === 0 ? contexte.nbcarresligne : contexte.nbcarresligne - 1;
        for(var j = 0; j < nbcarres; ++j){
            ligne.push(0);
        }
        contexte.lignes.push(ligne);
    }
}

function ajouterLigne () {
    contexte.svg.selectAll("g.ligne").data(contexte.lignes).enter().append("g")
    .attr("id", "ligne")
    .attr("class", "ligne");
}

function afficher () {
    // Creation des lignes
    var groupes = contexte.svg.selectAll("g.lignes").data(contexte.lignes).enter().append("g")
    .attr("class", "ligne")
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
    .attr("class", "carre")
    .attr("height", contexte.cote)
    .attr("width", contexte.cote)
    .attr("x", function (d, i) { return (i * contexte.diagonale) + contexte.decalageRotation })
    .attr("y", contexte.decalageRotation)
    .attr("fill-opacity", 0)
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .on("click", changecolor);
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

    // Affichage
    var decompte = "";
    for(var c in contexte.compte){
        decompte += c + " : " + contexte.compte[c] + "\n"; 
    }
    d3.select("#decompte").node().innerHTML = decompte;
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


