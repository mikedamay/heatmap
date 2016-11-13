/**
 * Created by mikedamay on 03/11/2016.
 */

(function() {
    var tabId = "testDataTab";
    var counter;
    var helper = document.hmcontext.getTestDataHelper();

    var engine = dummyEngine();
    var areas;

    var lstDataSets = document.getElementById("DataSets");
    populateDataSetsDropdown(lstDataSets);
    document.hmcontext.activeTab = tabId;       // active tab by default
    activateTab();
    clear();
    document.hmcontext.deactivateTab = deactivateTestDataTab;

   function drawHeatMap(engine, areas) {
       var lo = engine.newLayout();
       var tiles = lo.layoutTiles(areas);
       var div = document.getElementById("DataPanel");
       var rr = engine.newRenderer(
         {left: div.offsetLeft, top: div.offsetTop, width: div.offsetWidth, height: div.offsetHeight});
       rr.renderLayout(tiles, helper.renderTileInterior);
    }

    function makeHeatMapEngine() {
        var params = gatherParamsFromPage();
        var squareNessCalculator = {};
        if (params.method === 'bruis') {
            squareNessCalculator = {newSquarenessCalculator: document.hmcontext.newWorstSquarenessCalculator};
        }
        return document.hmcontext.newEngine(null, squareNessCalculator);
    }
    function refreshHeatMap() {
        drawHeatMap(engine, areas);
    }

    function showAll() {
        if ( lstDataSets.options.length === 0 ) {
            alert( "unable to draw heatmap.  No data available.  You need a file called HeatMapTestData.js");
            return;
        }
        if ( lstDataSets.options.selectedIndex === -1 ) {
            lstDataSets.value = lstDataSets.options.item(0).value;
        }
        engine = makeHeatMapEngine();
        areas = transformValues(DataChoices[lstDataSets.value]);
        drawHeatMap(engine, areas);
    }
    function showNext() {
        try
        {
            if ( lstDataSets.options.length === 0 ) {
                alert( "unable to draw heatmap.  No data available.  You need a file called HeatMapTestData.js");
                return;
            }
            if ( lstDataSets.options.selectedIndex === -1 ) {
                lstDataSets.value = lstDataSets.options.item(0).value;
            }
            var engine = makeHeatMapEngine();
            drawHeatMap(engine, transformValues(DataChoices[lstDataSets.value].slice(0,counter++)), {});
        }
        catch (ex) {
            alert(ex);
        }
    };
    function activateTab() {
        fixUpEvents();
        document.getElementById("DataPanel").innerHTML = "";
        engine = makeHeatMapEngine();
        window.onresize = refreshHeatMap;
    }
    // apply log scaling and sorting as per user
    function transformValues(vals) {
        if (!vals) {
            return vals;
        }
        var areas = [];
        var params = gatherParamsFromPage();
        var transform = params.applyLogScale ? function (v) {
            return {area: Math.log(v.area * 10)};
        } : function (v) {
            return {area: v.area};
        };
        for (var ii = 0; ii < vals.length; ii++ ) {
            areas.push(transform(vals[ii]));
        }
        if (params.sortDirection === 'asc') {
            areas.sort( function(v1, v2) {return v1.area > v2.area ? 1 : v1.area < v2.area ? -1 :0;});
        }
        else if (params.sortDirection === 'desc' ) {
            areas.sort( function(v1, v2) {return v1.area > v2.area ? -1 : v1.area < v2.area ? 1 :0;});
        }
        return areas;
    }
    function gatherParamsFromPage() {
        var params = {};
         var chkApplyLogScale = document.getElementById("ApplyLogScale");
         params.applyLogScale = chkApplyLogScale.checked;
         var lstSortDirection = document.getElementById("SortDirection");
         params.sortDirection = lstSortDirection.value;
         var lstMethod = document.getElementById("Method");
         params.method = lstMethod.value;
        return params;
    }
    function redoHeatMap() {
        showAll();
    }
    function populateDataSetsDropdown(lstDataSets) {
        for ( var dataSetName in DataChoices) {
            opt = document.createElement("OPTION");
            opt.text = dataSetName;
            opt.value = dataSetName;
            lstDataSets.options.add(opt);
        }
    }
    function fixUpEvents() {
        var li = document.getElementById(tabId);
        li.onclick = changeTab;
        document.getElementById("ApplyLogScale").onclick = redoHeatMap;
        // apparently jquery disables vanilla ways of fixing up events
        $("#SortDirection").change(redoHeatMap);
        $("#Method").change(redoHeatMap);
        $("#DataSets").change(redoHeatMap);
        //
        // document.hmcontext.deactivateTab = function() {};
        // document.hmcontext.deactivateTab = deactivateTab;
        document.getElementById("showAllBtn").onclick = showAll;
        document.getElementById("showNextBtn").onclick = showNext;
        document.getElementById("clearBtn").onclick = clear;

    }
    function deactivateTestDataTab() {
        clear();
        engine = dummyEngine;
    }
    function clear() {
        counter = 1;
        document.getElementById("DataPanel").innerHTML = "";
        areas = [];
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
            activateTab();
            document.hmcontext.deactivateTab();
            document.hmcontext.deactivateTab = deactivateTestDataTab;
            document.hmcontext.activeTab = tabId;
        }
    }

})();