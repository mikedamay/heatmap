/**
 * Created by mikedamay on 02/11/2016.
 */

// depends pn stocksFetcher.js, init.js
(function() {
    var tabId = "quotesTab";

    document.hmcontext.stocksFetcher.requestStocksAndPopulateDropDown();
    var getQuotesHelper = document.hmcontext.getQuotesHelper;
    var engine = dummyEngine();
    var areas = [];
    fixUpFindIndex(areas);
    var li = document.getElementById(tabId);
    li.onclick = changeTab;
    document.hmcontext.deactivateTab = function() {};
    document.hmcontext.activeTab = tabId;       // active tab by default
                                                // will be overwritten by any VM
                                                // initialising later


    function makeHeatMap(quote) {
        areas = updateAreas(areas, quote);
        drawHeatMap(engine, areas);
    }

    function getSelectedStock() {
        var stockList = document.getElementById("StockList");
        if (stockList.options.length === 0) {
            return function () {
                return "none";
            };
        }
        if (stockList.options.selectedIndex === -1) {
            stockList.value = stockList.options.item(0).value;
        }
        return stockList.value;
    }

    function updateAreas(areas, quote) {
        var range = Math.round(quote.price * 10);
        var idx = areas.findIndex(function (el) {
            return el.range === range;
        });
        // using areas[0] below feels a bit nasty but possibly in keeping with
        // a schema free aproach to data.
        // mark the region that should be flashed when the heatmap is displayed
        if ( idx === -1 ) {
            areas.push({area: quote.volume, range: range});
            areas[0].lastUpdateIdx = areas.length - 1;
        }
        else {
            areas[idx].area += quote.volume;
            areas[0].lastUpdateIdx = idx
        }
        return areas;
    }

    function drawHeatMap(engine, areas) {
        var lo = engine.newLayout();
        var tiles = lo.layoutTiles(areas);
        var div = document.getElementById("DataPanel");
        var rr = engine.newRenderer(
            {left: div.offsetLeft, top: div.offsetTop, width: div.offsetWidth, height: div.offsetHeight});
        rr.renderLayout(tiles, getQuotesHelper().renderTileInterior);
    }

    function refreshHeatMap() {
        drawHeatMap(engine, areas);
    }

    function activateTab() {
        window.onresize = refreshHeatMap;
        engine = heatMapEngine_ns();
        // the quotes handler has a dependency on the list of stocks
        // having been returned
        document.hmcontext.quotesFetcher.requestQuotes(
          getSelectedStock(), makeHeatMap);
    }
    function deactivateTab() {
        areas = [];
        tiles = [];
        engine = dummyEngine();
    }
    function dummyEngine() {
        return {
            newLayout: function() {
                return {layoutTiles: function() {return [];}}
            }
        , newRenderer: function() {
            return {renderLayout: function() {}}
        }
        }
    }
    function changeTab() {
        if (document.hmcontext.activeTab !== tabId) {
            document.hmcontext.deactivateTab(); // execute the previous tab's deactivate
            activateTab();
            document.hmcontext.deactivateTab = deactivateTab;
            document.hmcontext.activeTab = tabId;
        }
    }
    function fixUpFindIndex(areas)  {
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
    }
})();


