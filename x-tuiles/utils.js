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
    matrix.slice(y1, y2+1).forEach(function (el){
        extract.push(el.slice(x1, x2+1))            
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

function Matrix (config) {
    if (config) {
        //this.apply(config);
    }
    else {
        this.nextLineFull = true;
        this.baseElement = {fill: "#000000", opacity: 0};
        this.matrix = [[]];
    }

    // Private functions
    function createRow (number) {
        var line = [];
        for(var i = 0; i < nb; ++i) line.push(deepCopy(this.baseElement));
        return line;
    }

    function addRows (number) {
        for(var i = 0; i < number; ++i){
            this.matrix.push(createRow(this.nextLineFull ? this.matrix[0].length : this.matrix[0].length - 1));
            this.nextLineFull = !this.nextLineFull;
        }
    }

    function addColumns (number) {
        var me = this;
        this.matrix.forEach(function (line) {
            for(var i = 0; i < number; ++i) line.push(deepCopy(me.baseElement));
        });
    }

    // Public object
    var public_members = {
        resize: function (rows, columns) {
            if(columns > this.matrix[0].length) { // Important que les colonnes soient en premier pour ne pas ajouter des colonnes vides
                addColumns(rows - this.matrix[0].length);
            }
            if(rows > this.matrix.length) {
                addRows(rows - this.matrix.length);
            }
        }

        updateCell: function (cell, opacity, color) {
            if(cell instanceof HTMLElement) {
                cell.attr("fill", color);
                cell.attr("fill-opacity", opacity);
            }
            else if(cell.hasOwnProperty("x") && cell.hasOwnProperty("y")) {
                var _cell = this.matrix[cell.y][cell.x];
                _cell.attr("fill", color);
                _cell.attr("fill-opacity", opacity);
            }
            else {
                throw "Invalid cell";
            }
        }
    };

    return public_members;
}
