// mike may, 29-Oct-2016

var engine = heatMapEngine_ns();
var areas = [];

if (Array.prototype.findIndex === undefined) {
    areas.findIndex = function findIndex(fn) {
        for (var ii = 0; ii < this.length; ii++ ) {
            if (fn(this[ii], ii, this)) {
                return ii;
            }
        }
        return -1;
    }
}

function makeHeatMap(quote) {
    areas = updateAreas(areas, quote);
    engine.drawHeatMap(areas);

}

function updateAreas(areas, quote) {
    var range = Math.round(quote.price * 10);
    var idx = areas.findIndex(function (el) {
        return el.range === range;
    });
    if ( idx === -1 ) {
        areas.push({area: quote.volume, range: range});
    }
    else {
        areas[idx].area += quote.volume;
    }
    return areas;
}
