/**
 * Created by mikedamay on 02/11/2016.
 */

// depends pn stocksFetcher.js, init.js
(function() {
    var tabId = "quotesTab";

    var helper = document.hmcontext.getQuotesHelper();

    if (document.location.href.search("file:") !== -1
      || document.location.href.search("63342") !== -1) {
            // 63342 - debug port for intellij javascript
        document.hmcontext.newComms = document.hmcontext.newJsonpComms;
    }
    else {
        document.hmcontext.newComms = document.hmcontext.newXhrComms;
    }
     document.hmcontext.stocksFetcher.requestStocksAndPopulateDropDown(function(stock) {
        document.hmcontext.quotesFetcher.requestQuotes(stock, makeHeatMap);
    });
    var engine = dummyEngine();
    var areas = [];
    fixUpFindIndex(areas);
    var li = document.getElementById(tabId);
    li.onclick = changeTab;
    $("#StockList").change(restartHeatMap);
    // document.hmcontext.deactivateTab = function() {};
    document.hmcontext.activeTab = tabId;       // active tab by default
                                                // will be overwritten by any VM

    function makeHeatMap(quote) {
        areas = updateAreas(areas, quote);
        drawHeatMap(engine, transformValues(areas));
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
        rr.renderLayout(tiles, helper.renderTileInterior);
    }
    function restartHeatMap() {
        areas = [];
        var stock = getSelectedStock();
        document.hmcontext.quotesFetcher.requestQuotes(stock, makeHeatMap);
        redoHeatMap();
    }
    function redoHeatMap() {
        engine = makeHeatMapEngine();
        refreshHeatMap();
    }
    function refreshHeatMap() {
        drawHeatMap(engine, areas);
    }
    function makeHeatMapEngine() {
        var params = gatherParamsFromPage();
        var squareNessCalculator = {};
        if (params.method === 'bruis') {
            squareNessCalculator = {newSquarenessCalculator: document.hmcontext.newWorstSquarenessCalculator};
        }
        return document.hmcontext.newEngine(null, squareNessCalculator);
    }
    function gatherParamsFromPage() {
        var params = {};
        var chkApplyLogScale = document.getElementById("ApplyLogScale");
        params.applyLogScale = chkApplyLogScale.checked;
        var lstMethod = document.getElementById("Method");
        params.method = lstMethod.value;
        return params;
    }

    function activateTab() {
        window.onresize = refreshHeatMap;
        engine = makeHeatMapEngine();
        // engine = document.hmcontext.newEngine();
        $("#Method").change(redoHeatMap);
        document.getElementById("ApplyLogScale").onclick = redoHeatMap;
        // the quotes handler has a dependency on the list of stocks
        // having been returned
        // document.hmcontext.quotesFetcher.requestQuotes(
        //   getSelectedStock(), makeHeatMap);
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
    function deactivateQuotesTab() {
        areas = [];
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
            document.hmcontext.deactivateTab = deactivateQuotesTab;
            document.hmcontext.activeTab = tabId;
        }
    }
    // apply log scaling and sorting as per user
    function transformValues(vals) {
        if (!vals) {
            return vals;
        }
        var areas = [];
        var params = gatherParamsFromPage();
        var transform = params.applyLogScale ? function (v) {
            return {area: Math.log(v.area * 10), volume: v.area, range: v.range};
        } : function (v) {
            return {area: v.area, volume: v.area, range: v.range};
        };
        for (var ii = 0; ii < vals.length; ii++ ) {
            areas.push(transform(vals[ii]));
        }
        return areas;
    }})();


