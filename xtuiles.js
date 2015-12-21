/*
 * TODO ::
 * implementer un zoom
 * implementer un scroll
 * refaire le design
 * envoyer a nico et diane
 *
 * Etape 2
 * calculateur de prix
 * mettre une image en arriere plan
 * calculer par panneau de cloture
 *
 * Etape 3
 * Gerer l'ecriture de texte
 *
 * Etape 4
 * rasterisation d'image pour cloture
 */

xtag.register("x-tuiles", {
    content: function () {/*
        <style>
            .carre {
                transform-origin: 50% 50%;
                transform: rotate(45deg);
            }
        </style>
        <div id="conteneur">
            <div id="input">
                <p>Tuiles</p>
                <label for="hauteur">Hauteur</label>
                <input type="number" id="hauteur" value="3">
                <label for="largeur">Largeur</label>
                <input type="number" id="largeur" value="4">
                <label for="couleur">Couleur</label>
                <select id="couleur">
                    <option value="red">rouge</option>
                    <option value="black" selected>noir</option>
                </select>
            </div>
            <div id="canvas" style="width: 100%; height: 200px;"></div>
            <div id="decompte"></div>
        </div>
    */
    },
    lifecycle: {
        created: function () { // Variables globales
            this.carresparpied = 4;
            this.lignes = [];
            this.matrice = [];
            this.compte = [];
            this.sourisenfoncee = false;
        },
        inserted: function () {
            // Composants
            this.hauteur = d3.select("#hauteur").node();
            this.largeur = d3.select("#largeur").node();
            this.canvas = d3.select("#canvas");

            // Creation du canvas
            var canvasStyle = this.canvas.node().style;
            this.svg = this.canvas.append("svg").attr("height", canvasStyle.height).attr("width", canvasStyle.width);

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

            // Finalisation
            this.creationmatriceaffichage();
            this.afficher();
        }
    },
    methods: {
        calculerMetriques: function () {
            // Constantes
            this.nblignes = this.hauteur.value * this.carresparpied;
            this.nbcarresligne = this.largeur.value * this.carresparpied;

            // Calcul de cote
            var canvas = this.canvas.node();
            this.diagonale = Math.min((canvas.offsetWidth - 2) / this.nbcarresligne, (canvas.offsetHeight - 2) / ((this.nblignes / 2) + 0.5));
            this.cote = this.diagonaleacote(this.diagonale);
            this.decalageRotation = (this.diagonale - this.cote) / 2;
        },
        creationmatriceaffichage: function () {
            this.lignes = this.deepcopy(this.matrice);
            this.ajusterlignes();
            this.ajustercolonnes();
        },
        dessiner: function () {
            this.calculerMetriques();
            this.creationmatriceaffichage();
            this.nettoyer();
            this.afficher();
        },
        nettoyer: function () {
            this.svg.selectAll("g.ligne").remove();
        },
        ajusterlignes: function () {
            var voulu = this.nblignes;
            var actuel = this.lignes.length;
            if(voulu === actuel) { return; }
            else if(voulu < actuel) { // il y en a trop
                var nb = actuel - voulu;
                this.lignes.splice(-nb, nb);
            }
            else { // il en manque
                var nb = voulu - actuel;
                var nbcarres = this.matrice[0].length;
                for(var i = 0; i < nb; ++i) {
                    if(i % 2 === 0){
                        this.lignes.push(this.creerligne(nbcarres));
                        this.matrice.push(this.creerligne(nbcarres));
                    }
                    else{
                        this.lignes.push(this.creerligne(nbcarres - 1));
                        this.matrice.push(this.creerligne(nbcarres - 1));
                    }
                }
            }
        },
        ajustercolonnes: function () {
            var voulu = this.nbcarresligne;
            var actuel = this.matrice[0].length;
            if(voulu === actuel) { return; }
            else if (voulu < actuel) { // il y en a trop
                var nb = actuel - voulu;
                this.lignes.forEach(function (element) {
                    element.splice(-nb, nb); 
                });
            }
            else { // il ny en a pas assez
                var nb = voulu - actuel;
                this.lignes.forEach(function (element) {
                    for(var i = 0; i < nb; ++i){
                        element.push({fill: "#000000", opacity: 0}); 
                    }
                });
                this.matrice.forEach(function (element) {
                    for(var i = 0; i < nb; ++i){
                        element.push({fill: "#000000", opacity: 0}); 
                    }
                });
            }
        },
        creerligne: function (nb) {
            var ligne = [];
            for(var i = 0; i < nb; ++i) {
                ligne.push({fill: "#000000", opacity: 0});
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
        changecolor: function (me) {
            var element = d3.select(this);
            var elementNode = element.node();
            var datum = me.matrice[elementNode.parentNode.getAttribute("index")][elementNode.getAttribute("index")];
            var couleur = me.getCouleur();

            if(datum.opacity == 0 && couleur.opacity == 0) return; // pas de changement
            else if(datum.opacity == 0 && couleur.opacity != 0){ // nouvelle case
                datum.fill = couleur.fill;
                datum.opacity = couleur.opacity;

                element.attr("fill", datum.fill);
                element.attr("fill-opacity", datum.opacity);

                me.compte[datum.fill] = me.incremente(me.compte[datum.fill]);
            }
            else if(datum.opacity != 0 && couleur.opacity == 0){ // efface
                me.compte[datum.fill] = me.decremente(me.compte[datum.fill]);

                datum.fill = couleur.fill;
                datum.opacity = couleur.opacity;

                element.attr("fill", datum.fill);
                element.attr("fill-opacity", datum.opacity);
            }
            else { // changement couleur
                me.compte[datum.fill] = me.decremente(me.compte[datum.fill]);

                datum.fill = couleur.fill;
                datum.opacity = couleur.opacity;

                element.attr("fill", datum.fill);
                element.attr("fill-opacity", datum.opacity);

                me.compte[datum.fill] = me.incremente(me.compte[datum.fill]);
            }

            // Affichage
            var decompte = "";
            for(var c in me.compte){
                decompte += c + " : " + me.compte[c] + "\n"; 
            }
            d3.select("#decompte").node().innerHTML = decompte;
        },
        getCouleur: function () {
            return {fill: d3.select("#couleur").node().value, opacity: d3.event.altKey ? 0 : 1};
        },
        coteadiagonale: function (cote) {
            return Math.sqrt(Math.pow(cote, 2) * 2)
        },
        diagonaleacote: function (diagonale) {
            return Math.sqrt(Math.pow(diagonale, 2) / 2)
        },
        incremente: function (valeur) {
            return ++valeur || 1;
        },
        decremente: function (valeur) {
            return valeur === 0 ? 0 : --valeur;
        },
        deepcopy: function (obj) {
            return JSON.parse(JSON.stringify(obj));
        }
    },
});

window.onload = function () {
//    var tuiles = document.createElement("x-tuiles");
//    document.body.appendChild(tuiles);
}
