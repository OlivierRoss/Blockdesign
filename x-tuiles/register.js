/*
 * TODO
 *
 * Changer couleurs avec opacite pour valeur rgba
 * Enlever concept de traduction et de nom de couleur
 *
 */

xTuilesElement.lifecycle = {
    created: function () {
        // Variables globales
        this.carresparpied = 4;
        this.lignes = [];
        this.matrice = [];
        this.sourisenfoncee = false;
        this.elementBase = {fill: "#000000", opacity: 0};
        this.couleurs = {};
        this.couleur = null;
        this.ajouterCouleurs([{nom: "noir", code: "black"}, {nom: "rouge", code: "red"}]);
        this.menuHidden = true;
        
        // Composants
        this.hauteur = d3.select("#hauteur").node();
        this.largeur = d3.select("#largeur").node();
        this.canvas = d3.select("#canvas");
    },
    inserted: function () {
        // Creation du canvas
        var canvas = this.canvas.node();
        this.svg = this.canvas.append("svg").attr("height", canvas.offsetHeight).attr("width", "100%");

        // Creation du choix de couleurs
        this.drawColorSamples();
        this.setSelectedColor(this.couleurs[Object.keys(this.couleurs)[0]].element); // Activer la premiere couleur (noir)

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
        document.getElementById("final").onclick = this.finalExport.bind(this);
        document.getElementById("bouton-menu").onclick = this.toggleMenu.bind(this);
        window.onresize = this.drawComponents.bind(this);

        // Finalisation
        this.creationmatriceaffichage();
        this.afficher();
    }
};

xtag.register("x-tuiles", xTuilesElement);
