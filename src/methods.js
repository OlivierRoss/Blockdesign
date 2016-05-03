xTuilesElement.methods = {
    updateBackgroundImage: function () {
        readUrlAsData(document.getElementById("background-image").files[0], function (file) {
            document.getElementById('canvas').style.backgroundImage = "url(" + file + ")";
        });
    },
    drawComponents: function () {
        this.svg.offsetWidth = this.canvas.offsetWidth;
        this.dessiner();
    },
    calculerMetriques: function (lines, columns) {
        if(!lines && !columns){
            lines = this.nblignes = (Math.max(this.hauteur.value, 1) - 1) * 2 + 1;
            columns = this.nbcarresligne = Math.max(this.largeur.value, 1);
        }

        this.diagonale = Math.min((canvas.offsetWidth - 2) / columns, (canvas.offsetHeight - 2) / ((lines / 2) + 0.5));
        this.cote = diagonal2Side(this.diagonale);
        this.decalageRotation = (this.diagonale - this.cote) / 2;
    },
    clear: function () {
        this.matrix = new Matrix();
        this.dessiner();
    },
    dessiner: function () {
        this.showComputing();
        setTimeout(function () {
            this.calculerMetriques();
            this.lignes = this.matrix.extract(this.nblignes, this.nbcarresligne);
            this.resetHandicap();
            this.nettoyer();
            this.afficher();
            this.afficherDecompte();
            this.hideComputing();
        }.bind(this), 0);
    },
    nettoyer: function () {
        for(var svg = this.svg; svg.firstChild;) svg.removeChild(svg.firstChild);
    },
    resetHandicap: function () {
        var newCount = this.countColors();
        for(var c in this.couleurs) {
            this.couleurs[c].handicap = (this.couleurs[c].compte - (newCount[c] || 0)) || 0;
        }
    },
    mouseDown: function (event) {
        this.mode == "manual" ? this.changecolor(event.target, event.altKey) : this.setCursor(event.target);
    },
    mouseOver: function (event) {
        if(this.mode == "manual" && this.sourisenfoncee) this.changecolor(event.target, event.altKey);
    },
    groupeTranslation: function (index) {
        return "translate(" + ((index % 2 === 0) ? 0 : this.diagonale / 2) + ", " + this.diagonale * index / 2 + ")"
    },
    afficher: function (columns, distance) {
        columns = columns || 1;
        distance = distance || 0;
        var me = this;

        this.lignes.forEach(function drawLine(line, lineIndex) {
            var xTranslateAddition = lineIndex % 2 == 0 ? 0 : me.diagonale / 2;

            var groupe = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            groupe.setAttribute("transform", me.groupeTranslation(lineIndex));
            me.svg.appendChild(groupe);

            line.forEach(function drawCell(cell, cellIndex) {
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('data-x', cellIndex);
                rect.setAttribute('data-y', lineIndex);
                rect.setAttribute('x', (2 * me.decalageRotation) + (cellIndex * me.diagonale + me.decalageRotation + (Math.floor(cellIndex / columns) * distance)));
                rect.setAttribute('y', me.decalageRotation);
                rect.setAttribute('height', me.cote);
                rect.setAttribute('width', me.cote);
                rect.setAttribute('fill-opacity', cell.opacity);
                rect.setAttribute('fill', cell.fill);
                rect.setAttribute('stroke', '#424242');
                rect.setAttribute('stroke-width', '1px');
                rect.onmouseover = me.mouseOver.bind(me);
                rect.onmousedown = me.mouseDown.bind(me);
                groupe.appendChild(rect);
                me.rotate(rect);
            });
        });
    },

    ///// Sauvegarde + enregistrement /////
    export: function () {
        var blob = new Blob([JSON.stringify(this.matrix.getMatrix())], {type: "text/plain;charset=utf-8"});
        saveAs(blob, window.prompt("Nom du fichier: ") + ".txt");
    },
    pdf: function () {
        var divisionFrequency = 2, divisionWidth = 10;
        var totalDivisionsWidth = (this.nbcarresligne / divisionFrequency) * divisionWidth;
        this.lignes = getSmallestMatrix(this.matrix.getMatrix());
        this.calculerMetriques(this.nblignes, this.nbcarresligne + Math.ceil(totalDivisionsWidth / this.diagonale) + 1);
        this.nettoyer();
        this.afficher(divisionFrequency, divisionWidth);
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
        if(this.sampleDisplay == "v" && this.mode == "text") this.toggleVerticalColorSelector();
    },
    setSelectedColor: function (element) {
        var nodes = document.querySelectorAll(".container-echantillon-" + this.sampleDisplay + ".selected");
        for(var i = 0; i < nodes.length; ++i){
            nodes[i].className = "container-echantillon-" + this.sampleDisplay;
        }
        element.className += " selected";
        document.getElementById("active-sample").style.backgroundColor = this.couleur = element.id;
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
    changecolor: function (element, erase) {
        var couleur = {fill: this.couleur, opacity: erase ? 0 : 1};
        var datum = this.matrix.get(element);

        if(datum.opacity == 0 && couleur.opacity == 0) return; // pas de changement
        else if(datum.opacity == 0 && couleur.opacity != 0){ // nouvelle case
            element.setAttribute("fill", couleur.fill);
            element.setAttribute("fill-opacity", couleur.opacity);
            ++this.couleurs[couleur.fill].compte;
        }
        else if(datum.opacity != 0 && couleur.opacity == 0){ // efface
            --this.couleurs[datum.fill].compte;
            element.setAttribute("fill", couleur.fill);
            element.setAttribute("fill-opacity", couleur.opacity);
        }
        else { // changement couleur
            --this.couleurs[datum.fill].compte;
            element.setAttribute("fill", couleur.fill);
            element.setAttribute("fill-opacity", couleur.opacity);
            ++this.couleurs[couleur.fill].compte;
        }

        this.matrix.updateCell(element, couleur.fill, couleur.opacity);
        if(!this.menuHidden) this.afficherDecompte();
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
    toggleVerticalColorSelector: function () {
        var selector = document.getElementById("color-selector-v");
        selector.style.display = selector.style.display == "none" ? "block" : "none";
    },

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
            document.getElementById("color-selector-displayer").style.display = "block";

            while(csh.childNodes.length) {
                var el = csh.childNodes[0];
                el.className = "container-echantillon-v";
                el.style.width = "";
                csv.appendChild(el);
            }
        }
        else {
            this.mode = "manual";
            this.sampleDisplay = "h";
            toggler.classList.remove("fa-toggle-off");
            toggler.classList.add("fa-toggle-on");
            this.hideCursor();

            document.getElementById("input-text-container").style.display = "none";
            document.getElementById("color-selector-displayer").style.display = "none";

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
        this.drawComponents();
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
        var caracter = window.prompt("Associer votre dessin a quel caractere");
        this.symbols[caracter] = symbol;
        var symbolText = document.createElement("div");
        symbolText.innerHTML = caracter + " : " + JSON.stringify(symbol);
        //document.body.appendChild(symbolText);
    },
    drawText: function () {
        var input = document.getElementById("input-text");
        if(this.mode != "text" || !this.cursorElement) return;
        var text = input.value;
        for(var i = 0; i < text.length; ++i) {
            var symbol = this.symbols[text[i]] || this.symbols["default"];
            var column = parseInt(this.cursorElement.getAttribute("data-x"));
            var row = parseInt(this.cursorElement.getAttribute("data-y"));
            var symbolWidth = this.writeSymbol(row, column, symbol);
            this.setCursor(document.querySelector("rect[data-x='" + (column + symbolWidth + 2) + "'][data-y='" + row + "']"));
        }
        input.value = "";
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
    },
    //--- Symboles ---//

    // --- Waiting ---//
    showComputing: function () {
        var opts = {
              lines: 12 // The number of lines to draw
            , length: 4 // The length of each line
            , width: 2 // The line thickness
            , radius: 3 // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#ffffff' // #rgb or #rrggbb or array of colors
            , opacity: 0.25 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1 // Rounds per second
            , trail: 60 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , position: 'absolute' // Element positioning
        };
        this.spinner = new Spinner(opts).spin(this.header);
    },
    hideComputing: function () {
        this.spinner.stop();
    }
}
