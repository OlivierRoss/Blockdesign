/*
 * TODO ::
 * arranger probleme d'affichage des carreaux pas tous affiches
 * implementer efface (clic droit) et nb couleurs limitees
 * utiliser un taille minimum pour les carres, donc pouvoir scroller dans le svg si on sort du cadre
 * implementer un zoom
 * implementer un scroll
 * mettre une image en arriere plan
 * refaire le design
 * exporter en element html par polyfill
 * calculer par panneau de cloture
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

    // Evenements
    contexte.hauteur.onchange = dessiner;
    contexte.largeur.onchange = dessiner;

    // Statut souris
    contexte.canvas.node().onmousedown = function () { contexte.sourisenfoncee = true };
    contexte.canvas.node().onmouseup = function () { contexte.sourisenfoncee = false };

    // Affichage
    calculerMetriques();
    construirematrice();
    contexte.lignes = deepcopy(contexte.matrice);
}

// Dessin
function dessiner () {
    calculerMetriques();
    nettoyer();
    afficher();
}

function nettoyer () {
    contexte.svg.selectAll("g.ligne").remove();
}

function calculerMetriques () {
    // Constantes
    contexte.nblignes = contexte.hauteur.value * contexte.carresparpied;
    contexte.nbcarresligne = contexte.largeur.value * contexte.carresparpied;

    // Mise a jour de la matrice utilisee
    contexte.lignes = deepcopy(contexte.lignes);
    ajusterlignes();
    //ajustercolonnes();

    // Calcul de cote
    var canvas = contexte.canvas.node();
    contexte.diagonale = Math.min(canvas.offsetWidth / contexte.nbcarresligne, canvas.offsetHeight / (contexte.nblignes / 2) + (contexte.nblignes / 2));
    contexte.cote = diagonaleacote(contexte.diagonale);
    contexte.decalageRotation = (contexte.diagonale - contexte.cote) / 2;
}

function ajusterlignes () {
    var voulu = contexte.nblignes;
    var actuel = contexte.lignes.length;
    if(voulu === actuel) return;
    else if(voulu < actuel){ // il y en a trop
        var nb = actuel - voulu;
        contexte.lignes.splice(-nb, nb);
    }
    else { // il en manque
        var nb = voulu - actuel;
    }
}

function ajouterligne () {
    
}
 
function construirematrice () {
    for(var i = 0; i < contexte.nblignes; ++i)
    {
        var ligne = [];
        var nbcarres = i % 2 === 0 ? contexte.nbcarresligne : contexte.nbcarresligne - 1;
        for(var j = 0; j < nbcarres; ++j){
            ligne.push({fill: "#000000", opacity: 0});
        }
        contexte.matrice.push(ligne);
   }
}

function afficher () {
    // Creation des lignes
    var groupes = contexte.svg.selectAll("g.ligne").data(contexte.lignes).enter().append("g")
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
    .attr("class", "carre")
    .attr("index", function (d, i) { return i})
    .attr("height", contexte.cote)
    .attr("width", contexte.cote)
    .attr("x", function (d, i) { 
        return (i * contexte.diagonale) + contexte.decalageRotation
    })
    .attr("y", contexte.decalageRotation)
    .attr("fill-opacity", function(d) { return d.opacity})
    .attr("fill", function(d) { return d.fill })
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .on("mousedown", changecolor)
    .on("mouseover", mouseover);
}

// Evenements
function mouseover () {
   if( contexte.sourisenfoncee ) changecolor.apply(this);
}

function changecolor () {
    var element = d3.select(this);
    var datum = element.datum();
    var couleur = d3.select("#color").node().value;

    if(datum.opacity === 0){
        datum.opacity = 1;
        element.attr("fill-opacity", datum.opacity);

        element.attr("fill", couleur);
        datum.fill = couleur;
        contexte.compte[couleur] = incremente(contexte.compte[couleur]);
    }
    else {
        var ancienneCouleur = datum.fill;
        contexte.compte[ancienneCouleur] = decremente(contexte.compte[ancienneCouleur]);

        element.attr("fill", couleur);
        datum.fill = couleur;
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

function deepcopy (obj) {
    return JSON.parse(JSON.stringify(obj));
}
