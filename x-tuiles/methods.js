xTuilesElement.methods = {
    updateBackgroundImage: function () {
        readUrlAsData(document.getElementById("background-image").files[0], function (file) {
            document.getElementById('canvas').style.backgroundImage = "url(" + file + ")";        
        });
    },
    drawComponents: function () {
        var svg = this.svg.node();
        var canvas = this.canvas.node();
        svg.offsetWidth = canvas.offsetWidth;
        this.dessiner();
    },
    calculerMetriques: function () {
        this.nblignes = (Math.max(this.hauteur.value, 1) * this.carresparpied * 2) - 1;
        this.nbcarresligne = Math.max(this.largeur.value, 1) * this.carresparpied;

        var canvas = this.canvas.node();
        this.diagonale = Math.min((canvas.offsetWidth - 2) / this.nbcarresligne, (canvas.offsetHeight - 2) / ((this.nblignes / 2) + 0.5));
        this.cote = diagonal2Side(this.diagonale);
        this.decalageRotation = (this.diagonale - this.cote) / 2;
    },
    clear: function () {
        this.matrix = new Matrix();
        this.dessiner();
    },
    dessiner: function () {
        this.calculerMetriques();
        this.lignes = this.matrix.extract(this.nblignes, this.nbcarresligne);
        this.resetHandicap();
        this.nettoyer();
        this.afficher();
        this.afficherDecompte();
    },
    nettoyer: function () {
        this.svg.selectAll("g.ligne").remove();
    },
    resetHandicap: function () {
        var newCount = this.countColors();
        for(var c in this.couleurs) {
            this.couleurs[c].handicap = (this.couleurs[c].compte - (newCount[c] || 0)) || 0;
        }
    },
    mouseDown: function (element) {
        this.mode == "manual" ? this.changecolor(element) : this.setCursor(element.node());
    },
    mouseOver: function (element) {
        if(this.mode == "manual" && this.sourisenfoncee) this.changecolor(element);
    },
    afficher: function (columns, distance) {
        columns = columns || 1;
        distance = distance || 0;
        var me = this;

        // Creation des lignes
        var groupes = this.svg.selectAll("g.ligne").data(this.lignes).enter().append("g")
        .attr("index", function (d, i) { return i })
        .attr("class", "ligne")
        .attr("index", function (d, i) { return i})
        .attr("transform", function (d, i) {
            if(i % 2 === 0){
                return "translate(0, " + me.diagonale * i / 2 + ")" 
            }
            else {
                return "translate(" + me.diagonale / 2 + ", " + me.diagonale * i / 2 + ")" 
            }
        });

        // Creation des carres
        groupes.selectAll("rect").data(function(d) { return d; }).enter().append("rect") 
        .attr("index", function (d, i) { return i })
        .attr("class", "carre")
        .attr("index", function (d, i) { return i})
        .attr("height", this.cote)
        .attr("width", this.cote)
        .attr("x", function (d, i) { return (i * me.diagonale) + me.decalageRotation + (Math.floor(i / columns) * distance) })
        .attr("y", this.decalageRotation)
        .attr("fill-opacity", function(d) { return d.opacity})
        .attr("fill", function(d) { return d.fill })
        .attr("stroke", "#424242")
        .attr("stroke-width", "1px")
        .on("mousedown", function () { me.mouseDown.call(me, d3.select(this)) } )
        .on("mouseover", function () { me.mouseOver.call(me, d3.select(this)) } )
    },

    ///// Sauvegarde + enregistrement /////
    export: function () {
        var blob = new Blob([JSON.stringify(this.matrix.getMatrix())], {type: "text/plain;charset=utf-8"});
        saveAs(blob, window.prompt("Nom du fichier: ") + ".txt");
    },
    pdf: function () {
        this.lignes = getSmallestMatrix(this.matrix.getMatrix());
        this.nettoyer();
        this.afficher(2, 10);
        saveSvgAsPng(document.getElementById("svg"), "cloture");
    },
    loadFile: function () {
        readUrlAsText(document.getElementById("upload-file").files[0], function (text) { 
            this.loadConfiguration(JSON.parse(text));
        }.bind(this));
    },
    loadConfiguration: function (matrix) {
        this.matrix = new Matrix(matrix);
        this.dessiner();
    },
    //--- Sauvegarde + enregistrement ---//

    ///// Couleurs /////
    changerCouleur: function (ev) {
        this.setSelectedColor(ev.currentTarget);
    },
    setSelectedColor: function (element) {
        var nodes = document.querySelectorAll(".container-echantillon.selected");
        for(var i = 0; i < nodes.length; ++i){
            nodes[i].className = "container-echantillon";
        }
        element.className += " selected";
        this.couleur = element.id;
    },
    ajouterCouleurs: function (couleurs) {
        couleurs.forEach(function (couleur) {
            this.couleurs[couleur.code] = { compte: 0, handicap: 0, nom: couleur.nom, code: couleur.code }
        }.bind(this));
    },
    afficherDecompte: function () {
        var decompte = "";
        for(var c in this.couleurs){
            var couleur = this.couleurs[c];
            document.getElementById(couleur.code + "-counter").innerHTML = couleur.compte - couleur.handicap;
        }
    },
    changecolor: function (element) {
        var couleur = this.getCouleur();
        var datum = this.matrix.get(element.node());

        if(datum.opacity == 0 && couleur.opacity == 0) return; // pas de changement
        else if(datum.opacity == 0 && couleur.opacity != 0){ // nouvelle case
            element.attr("fill", couleur.fill);
            element.attr("fill-opacity", couleur.opacity);
            ++this.couleurs[couleur.fill].compte;
        }
        else if(datum.opacity != 0 && couleur.opacity == 0){ // efface
            --this.couleurs[couleur.fill].compte;
            element.attr("fill", couleur.fill);
            element.attr("fill-opacity", couleur.opacity);
        }
        else { // changement couleur
            --this.couleurs[couleur.fill].compte;
            element.attr("fill", couleur.fill);
            element.attr("fill-opacity", couleur.opacity);
            ++this.couleurs[couleur.fill].compte;
        }

        this.matrix.updateCell(element.node(), couleur.fill, couleur.opacity);
        if(!this.menuHidden) this.afficherDecompte();
    },
    getCouleur: function () {
        return {fill: this.couleur, opacity: d3.event.altKey ? 0 : 1};
    },
    createColorCounter: function (color) {
        var li = document.createElement("li"); 
        li.id = color + "-counter-container";
        li.setAttribute("class", "counter-container");
        li.innerHTML = '<div id="' + color + '-sample" class="sample" style="background-color: ' + color + '"></div><div id="' + color + '-counter" class="counter"></div>'
        document.getElementById("counter-container").appendChild(li);
    },
    createPickerSample: function (color, width) {
        var div = document.createElement("div");
        div.id = color.code;
        div.setAttribute("class", "container-echantillon");
        div.setAttribute("style", "width:" + width + "%;");
        div.innerHTML = '<div class="echantillon" style="background-color: ' + color.code + ';"></div>';
        div.onclick = this.changerCouleur.bind(this);
        document.getElementById("footer").appendChild(div);
        color.element = div;
    },
    countColors: function () {
        var colors = {}
        this.lignes.forEach(function (line) {
            line.forEach(function (cell) {
                if(cell.opacity != 0) {
                    colors[cell.fill] ? ++colors[cell.fill] : colors[cell.fill] = 1;
                }
            });
        });
        return colors;
    },
    //--- Couleurs ---//

    ///// Togglers /////
    toggleMode: function () {
        var toggler = document.getElementById("mode-toggler");
        if(this.mode === "manual"){
            this.mode = "text";
            toggler.classList.remove("fa-toggle-on");
            toggler.classList.add("fa-toggle-off");
            this.showCursor();
        }
        else {
            this.mode = "manual";
            toggler.classList.remove("fa-toggle-off");
            toggler.classList.add("fa-toggle-on");
            this.hideCursor();
        }
    },
    toggleMenu: function () {
        var menu = document.getElementById("menu");
        var conteneur = document.getElementById("conteneur");
        if(this.menuHidden){
            conteneur.style.left = this.menuWidth;
            menu.style.left = "0px";
        }
        else {
            conteneur.style.left = "0px";
            menu.style.left = "-" + this.menuWidth;
        }
        document.getElementById("conteneur").style.left = document.getElementById("menu").style.width = this.menuHidden ? "100px": "0px" ;
        for(var i = 200; i < 1000; i+= 200) window.setTimeout(this.drawComponents.bind(this), i);
        this.menuHidden = !this.menuHidden;
    },
    //--- Togglers ---//

    ///// Symboles /////
    drawSymbol: function () {
        if(this.mode != "text") return;
        var symbol = document.getElementById("inputText").value;
        if(symbol) symbol = symbol[symbol.length - 1];

        var sampleMatrix = this.symbols[symbol];
        if(!sampleMatrix) return;

        this.writeSample(this.cursorElement.parentNode.getAttribute("index"), this.cursorElement.getAttribute("index"), sampleMatrix);
    },
    writeSample: function (row, column, sample) {
        sample.forEach(function (line, rowIndex) {
            line.forEach(function (cell, columnIndex) {
                this.matrix.updateCell({x: parseInt(column) + columnIndex, y: parseInt(row) + rowIndex}, this.couleur, cell.opacity);
            }.bind(this));
        }.bind(this));
        this.dessiner();
    },
    showCursor: function () {
        if(this.cursorElement) this.cursorElement.classList.add("blink");
    },
    hideCursor: function () {
        if(this.cursorElement) this.cursorElement.classList.remove("blink");
    },
    calculateCursor: function () {
        var cursorSquare = {x: 2, y: 1};
 // getSmallest       this.cursorElement = this.svg.node().childNodes[cursorSquare.y].childNodes[cursorSquare.x];
    },
    setCursor: function (element) {
        this.hideCursor();
        this.cursorElement = element;
        this.showCursor();
    }
    //--- Symboles ---//
}

