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
