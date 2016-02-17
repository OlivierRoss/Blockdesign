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
        this.nblignes = (Math.max(this.hauteur.value, 1) - 1) * 2 + 1;
        this.nbcarresligne = Math.max(this.largeur.value, 1);

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
        var nodes = document.querySelectorAll(".container-echantillon-" + this.sampleDisplay + ".selected");
        for(var i = 0; i < nodes.length; ++i){
            nodes[i].className = "container-echantillon-" + this.sampleDisplay;
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
        div.setAttribute("class", "container-echantillon-" + this.sampleDisplay);
        div.setAttribute("style", "width:" + width + "%;");
        div.innerHTML = '<div class="echantillon" style="background-color: ' + color.code + ';"></div>';
        div.onclick = this.changerCouleur.bind(this);
        document.getElementById("color-selector-h").appendChild(div);
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
        var csh = document.getElementById("color-selector-h");
        var csv = document.getElementById("color-selector-v");
        if(this.mode === "manual"){
            this.mode = "text";
            this.sampleDisplay = "v";
            toggler.classList.remove("fa-toggle-on");
            toggler.classList.add("fa-toggle-off");
            this.showCursor();

            document.getElementById("input-text-container").style.display = "block";

            while(csh.childNodes.length) {
                var el = csh.childNodes[0];
                el.className = "container-echantillon-v";
                el.style.width = "";
                csv.appendChild(el);
            }
            csv.style.display = "block";
        }
        else {
            this.mode = "manual";
            this.sampleDisplay = "h";
            toggler.classList.remove("fa-toggle-off");
            toggler.classList.add("fa-toggle-on");
            this.hideCursor();

            document.getElementById("input-text-container").style.display = "none";

            var width = 100.0 / Object.keys(this.couleurs).length;
            while(csv.childNodes.length) {
                var el = csv.childNodes[0];
                el.style.width = width + "%";
                el.className = "container-echantillon-h";
                csh.appendChild(el);
            }
            csv.style.display = "none";
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
    saveSymbol: function () {
        var matrix = this.matrix.getMatrix();
        var rectangle = getSmallestRectangleCoordinates(matrix);
        var symbolMatrix = getMatrixExtract(rectangle.x1, rectangle.y1, rectangle.x2, rectangle.y2, matrix);
        var symbol = [];

        var needShift = rectangle.y1 % 2 == 1;
        symbolMatrix.forEach(function (line, rowIndex) {
            var shift = needShift && rowIndex % 2 == 0 ? 1 : 0;
            line.forEach(function (cell, columnIndex) {
               if(cell.opacity != 0) symbol.push({x: (columnIndex + shift), y: rowIndex});
            });
        });
        console.log(JSON.stringify(symbol));
    },
    drawText: function () {
        if(this.mode != "text" || !this.cursorElement) return;
        var text = document.getElementById("input-text").value;
        for(var i = 0; i < text.length; ++i) {
            var symbol = this.symbols[text[i]] || this.symbols["default"];
            var column = this.cursorElement.getAttribute("index");
            var symbolWidth = this.writeSymbol(this.cursorElement.parentNode.getAttribute("index"), column, symbol);
            this.setCursor(this.cursorElement.parentNode.childNodes[parseInt(column) + symbolWidth + 2]);
        }
        this.dessiner();
    },
    // Retourne la largeur maximale pour etre capable de deplacer le curseur
    writeSymbol: function (row, column, symbolCells) {
        var maxWidth = 1;
        var needShift = row % 2 == 1;
        symbolCells.forEach(function (cell) {
            maxWidth = Math.max(maxWidth, cell.x);
            var shift = needShift && cell.y % 2 == 0 ? 0 : 1;
            this.matrix.updateCell({x: parseInt(column) + cell.x + shift, y: parseInt(row) + cell.y}, this.couleur, cell.opacity);
        }.bind(this));
        return maxWidth;
    },
    showCursor: function () {
        if(this.cursorElement) this.cursorElement.classList.add("blink");
    },
    hideCursor: function () {
        if(this.cursorElement) this.cursorElement.classList.remove("blink");
    },
    setCursor: function (element) {
        this.hideCursor();
        this.cursorElement = element;
        this.showCursor();
    }
    //--- Symboles ---//
}

