/**
 * Created by mikedamay on 03/11/2016.
 */

(function() {
    var tabId = "testDataTab";

    var dummyEngine = {newLayout: function() {return [];}, newRenderer: function() {}}
    var engine = dummyEngine;
    var areas = [];
    var tiles = [];

    var li = document.getElementById(tabId);
    li.onclick = function() {
        if (document.hmcontext.activeTab !== tabId) {
            activateTab();
            document.hmcontext.deactivateTab();
            document.hmcontext.deactivateTab = deactivateTab;
            document.hmcontext.activeTab = tabId;
        }
    };

    if (document.hmcontext === undefined) {
        document.hmcontext = {};
        document.hmcontext.deactivateTab = function() {};
    }
    document.hmcontext.activeTab = tabId;       // active tab by default
    document.hmcontext.deactivateTab = deactivateTab;
    activateTab();
    var btn = document.getElementById("showAllBtnId");
    btn.onclick = showAll;

   function drawHeatMap(engine, areas) {
       var lo = engine.newLayout();
       tiles = lo.layoutTiles(areas);
       var div = document.getElementById("DataPanel");
       var rr = engine.newRenderer(
           {left: div.offsetLeft, top: div.offsetTop, width: div.offsetWidth, height: div.offsetHeight});
       rr.renderLayout(tiles);
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
        engine = heatMapEngine_ns();
        areas = DataChoices[lstDataSets.value];
        drawHeatMap(engine, areas);
    }
    function activateTab() {
        document.getElementById("DataPanel").innerHTML = "";
        engine = heatMapEngine_ns();
        window.onresize = refreshHeatMap;
    }
    function deactivateTab() {
        document.getElementById("DataPanel").innerHTML = "";
        areas = [];
        tiles = [];
        engine = dummyEngine;
    }
})();