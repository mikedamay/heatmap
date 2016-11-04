/**
 * Created by mikedamay on 02/11/2016.
 */

(function() {
    var tabId = "quotesTab";

    var dummyEngine = {
        newLayout: function() {
            return {layoutTiles: function() {return [];}}
        }
      , newRenderer: function() {
            return {renderLayout: function() {}}
      }
    };
    var engine = dummyEngine;
    var areas = [];
    // var tiles = [];

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
        drawHeatMap(engine, areas);
    }
    heatMapQuotesHandler_ns = doheatMapQuotesHandler_ns();

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
        var tiles = lo.layoutTiles(areas);
        var div = document.getElementById("DataPanel");
        var rr = engine.newRenderer(
            {left: div.offsetLeft, top: div.offsetTop, width: div.offsetWidth, height: div.offsetHeight});
        var renderInnerTile = function(div) {
            // this is pretty horrible (such a local operation taking dependenies on
            // affecting the document as a whole, but...
            // Even given the above compromise - calculatoing used height and widht
            // is non-trivial.  The following 'M' based approach is sufficient
            // for our purposes
            function isSufficientArea() {
                var body = document.getElementsByTagName("body")[0];
                var divTest = document.createElement("div");
                divTest.innerHTML = "M";
                divTest.style.position = "absolute";
                divTest.style.visibility = "hidden";
                divTest.style.display='flex';
                divTest.style.alignItems='center';
                divTest.style.justifyContent='center';
                divTest.style.height = "auto";
                divTest.style.width = "auto";
                body.appendChild(divTest);
                // can the largest possible text fit on two lines or on one line
                var res = div.clientHeight >= divTest.clientHeight*2 && div.clientWidth >= divTest.clientWidth * 8
                  || div.clientWidth >= divTest.clientWidth * 16;
                divTest.remove();
                return res;
            }
            var text = '' + this.get_extraData().area + ' @' + ' ' + this.get_extraData().range;
            if (isSufficientArea() ) {
                div.innerHTML =  text;
                div.style.display='flex';
                div.style.alignItems='center';
                div.style.justifyContent='center';
            }
            else {
                var span = document.createElement('span');
                span.innerHTML = text;
                span.className = "tooltip";
                div.className = "ht";
                div.appendChild(span);
            }
        };
        rr.renderLayout(tiles, renderInnerTile);
    }

    function refreshHeatMap() {
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


