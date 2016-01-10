xTuilesElement.methods = {
    changerCouleur: function (e) {
        this.couleur = e.currentTarget.childNodes[0].id;
    },
    ajouterCouleurs: function (couleurs) {
        var me = this;
        couleurs.forEach(function (couleur) {
            me.couleurs[couleur.code] = {
                compte: 0,
                handicap: 0,
                nom: couleur.nom,
                code: couleur.code,
                traduction: {}
            }
        });
    },
    calculerMetriques: function () {
        // Constantes
        this.nblignes = (this.hauteur.value * this.carresparpied * 2) - 1;
        this.nbcarresligne = this.largeur.value * this.carresparpied;

        // Calcul de cote
        var canvas = this.canvas.node();
        this.diagonale = Math.min((canvas.offsetWidth - 2) / this.nbcarresligne, (canvas.offsetHeight - 2) / ((this.nblignes / 2) + 0.5));
        this.cote = this.diagonaleacote(this.diagonale);
        this.decalageRotation = (this.diagonale - this.cote) / 2;
    },
    creationmatriceaffichage: function () {
        this.lignes = this.deepcopy(this.matrice);
        this.resetHandicap();
        this.ajusterlignes();
        this.ajustercolonnes();
    },
    dessiner: function () {
        this.calculerMetriques();
        this.creationmatriceaffichage();
        this.nettoyer();
        this.afficher();
        this.afficherDecompte();
    },
    nettoyer: function () {
        this.svg.selectAll("g.ligne").remove();
    },
    resetHandicap: function () {
        for(var c in this.couleurs){
            this.couleurs[c].handicap = 0;
        }
    },
    ajusterlignes: function () {
        var voulu = this.nblignes;
        var actuel = this.lignes.length;
        if(voulu === actuel) { return; }
        else if(voulu < actuel) { // il y en a trop
            var nb = actuel - voulu;
            var supprimes = this.lignes.splice(-nb, nb);

            // Calculer handicap pour lignes
            var me = this;
            supprimes.forEach(function (ligne) {
                ligne.forEach(function (element) {
                    if(element.opacity) {
                        me.couleurs[element.fill].handicap += 1;
                    }
                });
            });
        }
        else { // il en manque
            var nb = voulu - actuel;
            var nbcarres = this.matrice[0].length;
            for(var i = 0; i < nb; ++i) {
                if(i % 2 === 0){
                    var nouveauCarres = this.creerligne(nbcarres);
                    this.lignes.push(nouveauCarres);
                    this.matrice.push(nouveauCarres);
                }
                else{
                    var nouveauCarres = this.creerligne(nbcarres - 1);
                    this.lignes.push(nouveauCarres);
                    this.matrice.push(nouveauCarres);
                }
            }
        }
    },
    ajustercolonnes: function () {
        var voulu = this.nbcarresligne;
        var actuel = this.matrice[0].length;
        if(voulu === actuel) { return; }
        else if (voulu < actuel) { // il y en a trop
            var me = this;
            var nb = actuel - voulu;
            this.lignes.forEach(function (element) {
                var supprimes = element.splice(-nb, nb); 

                // Calculer handicap
                supprimes.forEach(function (element) {
                    if(element.opacity) {
                        me.couleurs[element.fill].handicap += 1;
                    }
                });
            })
        }
        else { // il ny en a pas assez
            var nb = voulu - actuel;
            var me = this;
            this.lignes.forEach(function (element) {
                for(var i = 0; i < nb; ++i){
                    element.push(me.deepcopy(me.elementBase)); 
                }
            });
            this.matrice.forEach(function (element) {
                for(var i = 0; i < nb; ++i){
                    element.push(me.deepcopy(me.elementBase)); 
                }
            });
        }
    },
    creerligne: function (nb) {
        var ligne = [];
        for(var i = 0; i < nb; ++i) {
            ligne.push(this.deepcopy(this.elementBase));
        }
        return ligne;
    },
    afficher: function () {
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
        .attr("x", function (d, i) { return (i * me.diagonale) + me.decalageRotation})
        .attr("y", this.decalageRotation)
        .attr("fill-opacity", function(d) { return d.opacity})
        .attr("fill", function(d) { return d.fill })
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .on("mousedown", function () { me.changecolor.call(this, me)} )
        .on("mouseover", function () { if(me.sourisenfoncee) me.changecolor.call(this, me)});
    },
    afficherDecompte: function () {
        var decompte = "";
        for(var c in this.couleurs){
            var couleur = this.couleurs[c];
            document.getElementById("compteur-" + couleur.code).innerHTML = couleur.compte - couleur.handicap;
            //if(couleur.compte - couleur.handicap > 0) {
            //    decompte += c + " : " + (couleur.compte - couleur.handicap) + "\n"; 
            // }
        }
        //d3.select("#decompte").node().innerHTML = decompte;
    },
    changecolor: function (me) {
        var element = d3.select(this);
        var elementNode = element.node();
        var datum = me.matrice[elementNode.parentNode.getAttribute("index")][elementNode.getAttribute("index")];
        var couleur = me.getCouleur.call(me);

        if(datum.opacity == 0 && couleur.opacity == 0) return; // pas de changement
        else if(datum.opacity == 0 && couleur.opacity != 0){ // nouvelle case
            datum.fill = couleur.fill;
            datum.opacity = couleur.opacity;

            element.attr("fill", datum.fill);
            element.attr("fill-opacity", datum.opacity);

            ++me.couleurs[datum.fill].compte;
        }
        else if(datum.opacity != 0 && couleur.opacity == 0){ // efface
            --me.couleurs[datum.fill].compte;

            datum.fill = couleur.fill;
            datum.opacity = couleur.opacity;

            element.attr("fill", datum.fill);
            element.attr("fill-opacity", datum.opacity);
        }
        else { // changement couleur
            --me.couleurs[datum.fill].compte;

            datum.fill = couleur.fill;
            datum.opacity = couleur.opacity;

            element.attr("fill", datum.fill);
            element.attr("fill-opacity", datum.opacity);

            ++me.couleurs[datum.fill].compte;
        }
        me.afficherDecompte();
    },
    getCouleur: function () {
        return {fill: this.couleur, opacity: d3.event.altKey ? 0 : 1}; // Si transparence, voir
    },
    coteadiagonale: function (cote) {
        return Math.sqrt(Math.pow(cote, 2) * 2)
    },
    diagonaleacote: function (diagonale) {
        return Math.sqrt(Math.pow(diagonale, 2) / 2)
    },
    deepcopy: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    export: function () {
        var sauvegarde = {};
        sauvegarde.hauteur = this.hauteur.value;
        sauvegarde.largeur = this.largeur.value;
        sauvegarde.matrice = this.matrice;
        //http://www.noupe.com/design/html5-filesystem-api-create-files-store-locally-using-javascript-webkit.html
        console.log(sauvegarde);
        window.prompt("Copier dans le presse-papier avec CTRL-C et sauvegardez dans un document sur votre bureau", JSON.stringify(sauvegarde))
    }
}
