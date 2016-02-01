function getSmallestMatrix (matrix) {
    var rows = []; 
    var columns = [];
    matrix.forEach(function (row, rowIndex) {
        var rowUsed = false;
        row.forEach(function (tile, columnIndex) {
            if(tile.opacity){
                rowUsed = true; 
                columns.push(columnIndex);
            }
        });
        if(rowUsed) rows.push(rowIndex);
    });
    return getMatrixExtract(arrayMin(columns), arrayMin(rows), arrayMax(columns), arrayMax(rows), matrix);
}

function getMatrixExtract (x1, y1, x2, y2, matrix) {
    var extract = [];
    matrix.slice(y1, y2+1).forEach(function (el, i){
        extract.push(el.slice(x1, i % 2 == 0 ? x2 + 1 : x2))            
    });
    return extract;
}

function arrayMax (arr) {
    var max = arr[0];
    arr.forEach(function (el) {
        max = Math.max(max, el);
    });
    return max;
}

function arrayMin (arr) {
    var min = arr[0];
    arr.forEach(function (el) {
        max = Math.min(min, el);
    });
    return min;
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function readUrlAsData(file, callback){
    var reader = new FileReader();
    reader.onloadend = function(){
        callback(reader.result);
    }
    reader.readAsDataURL(file);
}

function readUrlAsText(file, callback){
    var reader = new FileReader();
    reader.onloadend = function() {
        callback(reader.result);
    }
    reader.readAsText(file);
}

function side2Diagonal (cote) {
    return Math.sqrt(Math.pow(cote, 2) * 2)
}

function diagonal2Side (diagonale) {
    return Math.sqrt(Math.pow(diagonale, 2) / 2)
}

function deepCopy (obj) {
    return JSON.parse(JSON.stringify(obj));
}

function Matrix (matrix) {
    var me = this;
    this.baseElement = {fill: "#000000", opacity: 0};
    this.matrix = matrix || [[{fill: "#000000", opacity: 0}]];

    // Private functions
    function createRow (number) {
        var line = [];
        for(var i = 0; i < number; ++i) line.push(deepCopy(me.baseElement));
        return line;
    }

    function addRows (number) {
        for(var i = 0; i < number; ++i) me.matrix.push(createRow(me.matrix.length % 2 == 0 ? me.matrix[0].length : me.matrix[0].length - 1));
    }

    function addColumns (number) {
        me.matrix.forEach(function (line) {
            for(var i = 0; i < number; ++i) line.push(deepCopy(me.baseElement));
        });
    }

    // Public object
    var public_members = {
        extract: function (rows, columns) {
            if(rows > me.matrix.length) {
                addRows(rows - me.matrix.length);
            }
            if(columns > me.matrix[0].length) { // Important que les colonnes soient en premier pour ne pas ajouter des colonnes vides
                addColumns(columns - me.matrix[0].length);
            }
            return getMatrixExtract(0, 0, columns - 1, rows - 1, me.matrix);
        },
        updateCell: function (cell, color, opacity) {
            var cell = this.get(cell);
            cell.color = color;
            cell.opacity = opacity;
        },
        get: function (cell) {
            if(cell instanceof SVGElement) {
                return me.matrix[cell.parentNode.getAttribute("index")][cell.getAttribute("index")];
            }
            else if(cell.hasOwnProperty("x") && cell.hasOwnProperty("y")) {
                return me.matrix[cell.y][cell.x];
            }
            else {
                throw "Invalid cell format";
            }
        },
        getMatrix: function () {
            return me.matrix;
        }
    };
    return public_members;
}
