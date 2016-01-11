/*
 * TODO ::
 * refaire le design
 *
 * Etape 2
 * mettre une image en arriere plan
 * calculer par panneau de cloture
 *
 * Etape 3
 * Gerer l'ecriture de texte
 *
 * Etape 4
 * rasterisation d'image pour cloture
 */

xTuilesElement.lifecycle = {
    created: function () { // Variables globales
        this.carresparpied = 4;
        this.lignes = [];
        this.matrice = [];
        this.sourisenfoncee = false;
        this.elementBase = {fill: "#000000", opacity: 0};
        this.couleurs = {};
        this.couleur = null;
        this.ajouterCouleurs([{nom: "noir", code: "black"}, {nom: "rouge", code: "red"}]);
    },
    inserted: function () {
        // Composants
        this.hauteur = d3.select("#hauteur").node();
        this.largeur = d3.select("#largeur").node();
        this.canvas = d3.select("#canvas");


        // Creation du canvas
        var canvas = this.canvas.node();
        this.svg = this.canvas.append("svg").attr("height", canvas.offsetHeight).attr("width", canvas.offsetWidth);

        // Creation du choix de couleurs
        var width = document.getElementById("footer").offsetWidth / Object.keys(this.couleurs).length;
        var offset = 0;
        for (var c in this.couleurs) {
            var couleur = this.couleurs[c];
            var div = document.createElement("div");
            div.id = couleur.code;
            div.setAttribute("class", "container-echantillon");
            div.setAttribute("style", "position: absolute; top: 5px; bottom: 5px; left: " + offset + "px; width:" + width + "px;");
            div.innerHTML = '<div class="echantillon" style="background-color: ' + couleur.code + ';"></div><div id="compteur-' + couleur.code + '" class="compteur"></div>';
            div.onclick = this.changerCouleur.bind(this);
            document.getElementById("footer").appendChild(div);
            couleur.element = div;

            offset += width;
        }
        // Activer la premiere couleur (noir)
        this.setSelectedColor(this.couleurs[Object.keys(this.couleurs)[0]].element);

        // Construction matrice + affichage
        this.calculerMetriques();
        for(var i = 0; i < this.nblignes; ++i)
        {
            var nbcarres = i % 2 === 0 ? this.nbcarresligne : this.nbcarresligne - 1;
            this.matrice.push(this.creerligne(nbcarres));
        }

        // Evenements
        this.hauteur.onchange = this.dessiner.bind(this);
        this.largeur.onchange = this.dessiner.bind(this);
        this.canvas.node().onmousedown = function () { this.sourisenfoncee = true }.bind(this);
        this.canvas.node().onmouseup = function () { this.sourisenfoncee = false }.bind(this);
        document.getElementById("export").onclick = this.export.bind(this);
        document.getElementById("popup-menu").onclick = this.toggleMenu.bind(this);
        // TODO : window.onresize = function () { console.log("resize");};

        // Finalisation
        this.creationmatriceaffichage();
        this.afficher();
    }
};

xtag.register("x-tuiles", xTuilesElement);
