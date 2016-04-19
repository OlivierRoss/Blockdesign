/*
 * http://codepen.io/pedronauck/pen/fcaDw
 * Changer couleurs avec opacite pour valeur rgba
 * Enlever concept de traduction et de nom de couleur
 */
xTuilesElement.lifecycle = {
    created: function () {
        // Variables globales
        this.carresparpied = 4;
        this.sourisenfoncee = false;
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
        this.mode = "manual";
        this.menuWidth = "150px";
        this.matrix = new Matrix();
        this.symbols = standardSymbols;
        this.sampleDisplay = "h";

        // Composants
        this.hauteur = document.getElementById("hauteur");
        this.largeur = document.getElementById("largeur");
        this.header = document.getElementById("header");
        this.canvas = document.getElementById("canvas");
        this.svg = document.getElementById("svg");
    },
    inserted: function () {
        this.svg.setAttribute('height', this.canvas.offsetHeight);

        ///// Couleurs
        // Echantillons footer
        var widthFooterColorSample = 100.0 / Object.keys(this.couleurs).length;
        for (var c in this.couleurs) {
            this.createPickerSample(this.couleurs[c], widthFooterColorSample);
        }
        // Compteurs de couleurs
        for(var c in this.couleurs) {
            this.createColorCounter(this.couleurs[c].code);
        }
        this.setSelectedColor(this.couleurs[Object.keys(this.couleurs)[0]].element); // Activer la premiere couleur (noir)

        // Evenements
        this.hauteur.onchange = this.dessiner.bind(this);
        this.largeur.onchange = this.dessiner.bind(this);
        this.canvas.onmousedown = function () { this.sourisenfoncee = true }.bind(this);
        this.canvas.onmouseup = function () { this.sourisenfoncee = false }.bind(this);
        document.getElementById("export").onclick = this.export.bind(this);
        document.getElementById("bouton-menu").onclick = this.toggleMenu.bind(this);
        document.getElementById("open").onclick = function () { document.getElementById("upload-file").click() };
        document.getElementById("pdf").onclick = this.pdf.bind(this);
        document.getElementById("open-background-upload").onclick = function () { document.getElementById("background-image").click() };
        document.getElementById("background-image").onchange = this.updateBackgroundImage.bind(this);
        document.getElementById("upload-file").onchange = this.loadFile.bind(this);
        document.getElementById("input-text").onchange = this.drawText.bind(this);
        document.getElementById("mode-menu").onclick = this.toggleMode.bind(this);
        document.getElementById("clear").onclick = this.clear.bind(this);
        document.getElementById("save-symbol").onclick = this.saveSymbol.bind(this);
        document.getElementById("color-selector-displayer").onclick = this.toggleVerticalColorSelector.bind(this);
        window.onresize = this.drawComponents.bind(this);

        // Finalisation
        this.dessiner();
    }
};

xtag.register("x-tuiles", xTuilesElement);
