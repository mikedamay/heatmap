/**
 * Created by mikedamay on 02/11/2016.
 */

(function() {
    var tabId = "quotesTab";

    var dummyEngine = {newLayout: function() {return [];}, newRenderer: function() {}}
    var engine = dummyEngine;
    var areas = [];
    var tiles = [];

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

    var li = document.getElementById(tabId);
    li.onclick = function() {
        if (document.hmcontext.activeTab !== tabId) {
            document.hmcontext.deactivateTab();
            activateTab();
            document.hmcontext.deactivateTab = deactivateTab;
            document.hmcontext.activeTab = tabId;
        }
    };

    if (document.hmcontext === undefined) {
        document.hmcontext = {};
        document.hmcontext.deactivateTab = function() {};
    }
    document.hmcontext.activeTab = tabId;       // active tab by default


    document.hmcontext.makeHeatMap = function makeHeatMap(quote) {
        areas = updateAreas(areas, quote);
        drawHeatMap(areas);
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

    function drawHeatMap(engine, areas) {
        var lo = engine.newLayout();
        tiles = lo.layoutTiles(areas);
        var div = document.getElementById("DataPanel");
        var rr = engine.newRenderer(
            {left: div.offsetLeft, top: div.offsetTop, width: div.offsetWidth, height: div.offsetHeight});
        rr.renderLayout(tiles, function(div) {div.innerHTML = "longish text";});
    }

    function refreshHeatMap() {
        drawHeatMap(engine, areas);
    }

    function showAll() {
        engine = heatMapEngine_ns();
        areas = DataChoices[lstDataSets.value];
        drawHeatMap(engine, areas);
    }
    function activateTab() {
        window.onresize = refreshHeatMap;
        engine = heatMapEngine_ns();
    }
    function deactivateTab() {
        areas = [];
        tiles = [];
        engine = dummyEngine;
    }
})();


