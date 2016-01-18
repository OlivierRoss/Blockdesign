/*
 * TODO
 * http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
 * http://codepen.io/pedronauck/pen/fcaDw
 *
 * Changer couleurs avec opacite pour valeur rgba
 * Enlever concept de traduction et de nom de couleur
 *
 * Ajouter des tooltips sur les images
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
        this.ajouterCouleurs([{nom: "noir", code: "#000000"},
                              {nom: "gris", code: "#97999B"},
                              {nom: "blanc", code: "#FFFFFF"},
                              {nom: "rouge", code: "#BA0C2F"},
                              {nom: "orange", code: "#FE5000"},
                              {nom: "jaune", code: "#FFCD00"},
                              {nom: "vert", code: "#00B140"},
                              {nom: "vert fonce", code: "#006747"},
                              {nom: "bleu", code: "#004B87"},
                              {nom: "cyan", code: "#0085CA"},
                              {nom: "bleu fonce", code: "#002855"}]);
        this.menuHidden = true;
        this.menuWidth = "150px";
        
        // Composants
        this.hauteur = d3.select("#hauteur").node();
        this.largeur = d3.select("#largeur").node();
        this.canvas = d3.select("#canvas");
    },
    inserted: function () {
        // Creation du canvas
        var canvas = this.canvas.node();
        this.svg = this.canvas.append("svg").attr("id", "svg").attr("height", canvas.offsetHeight).attr("width", "100%");

        // Creation du choix de couleurs
        this.drawColorSamples();
        this.drawColorCounters();
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
        document.getElementById("import").onclick = this.import.bind(this);
        document.getElementById("pdf").onclick = this.pdf.bind(this);
        window.onresize = this.drawComponents.bind(this);

        // Finalisation
        this.creationmatriceaffichage();
        this.afficher();
    }
};

xtag.register("x-tuiles", xTuilesElement);
