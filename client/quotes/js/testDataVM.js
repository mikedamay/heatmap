/**
 * Created by mikedamay on 03/11/2016.
 */

(function() {
    var tabId = "testDataTab";
    var counter;

    var dummyEngine = {newLayout: function() {return [];}, newRenderer: function() {}}
    var engine = dummyEngine;
    var areas;
    var tiles;


    var lstDataSets = document.getElementById("DataSets");

    for ( var dataSetName in DataChoices) {
        opt = document.createElement("OPTION");
        opt.text = dataSetName;
        opt.value = dataSetName;
        lstDataSets.options.add(opt);
    }

    // initialising later


    var li = document.getElementById(tabId);
    li.onclick = function() {
        if (document.hmcontext.activeTab !== tabId) {
            activateTab();
            document.hmcontext.deactivateTab();
            document.hmcontext.deactivateTab = deactivateTab;
            document.hmcontext.activeTab = tabId;
        }
    };
    document.getElementById("ApplyLogScale").onclick = redoHeatMap;
    document.getElementById("SortDirection").onchange = redoHeatMap;
    document.getElementById("Method").onchange = redoHeatMap;

    if (document.hmcontext === undefined) {
        document.hmcontext = {};
        document.hmcontext.deactivateTab = function() {};
    }
    document.hmcontext.activeTab = tabId;       // active tab by default
    document.hmcontext.deactivateTab = deactivateTab;
    activateTab();
    var btn = document.getElementById("showAllBtn");
    btn.onclick = showAll;
    var btn2 = document.getElementById("showNextBtn");
    btn2.onclick = showNext;
    var btn2 = document.getElementById("clearBtn");
    btn2.onclick = clear;
    clear();

   function drawHeatMap(engine, areas) {
       var lo = engine.newLayout();
       // lo = document.hmcontext.newBHWLayout();
       tiles = lo.layoutTiles(areas);
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
               // divTest.style.visibility = "hidden";
               divTest.style.display='flex';
               divTest.style.alignItems='center';
               divTest.style.justifyContent='center';
               divTest.style.height = "auto";
               divTest.style.width = "auto";
               body.appendChild(divTest);
               var res = div.clientHeight >= divTest.clientHeight*2 && div.clientWidth >= divTest.clientWidth * 8;
               divTest.remove();
               return res;
           }
           var text = 'rather longish text - ' + this.get_extraData().area;
           if (isSufficientArea() ) {
               div.innerHTML = text;
               div.style.display='flex';
               div.style.alignItems='center';
               div.style.justifyContent='center';
           }
           else {
                var span = document.createElement('span');
                span.innerHTML = text;
                span.className = "tooltipx";
                span.style.backgroundColor = "white";
                span.style.border = "black 1px solid";
                div.className = "ht";
                div.appendChild(span);
           }
       };
       // the testTile is used to roughly calculate the typical area required by the text
       // var testTile = {renderInnerTile: renderInnerTile, get_extraData: function() {return '1234';}};
       rr.renderLayout(tiles, renderInnerTile);
    }

    function makeHeatMapEngine() {
        var params = gatherParamsFromPage();
        var squareNessCalculator = {};
        if (params.method === 'bruis') {
            squareNessCalculator = {newSquarenessCalculator: document.hmcontext.newWorstSquarenessCalculator};
        }
        return heatMapEngine_ns(null, squareNessCalculator);
        // return heatMapEngine_ns(null, {newSquarenessCalculator: document.hmcontext.newWorstSquarenessCalculator});
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
        document.getElementById("DataPanel").innerHTML = "";
        engine = makeHeatMapEngine();
        window.onresize = refreshHeatMap;
    }
    function deactivateTab() {
        clear();
        engine = dummyEngine;
    }
    function clear() {
        counter = 1;
        document.getElementById("DataPanel").innerHTML = "";
        areas = [];
        tiles = [];

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
         var chkReverseDisplay = document.getElementById("ReverseDisplay");
         params.reverseDisplay = chkReverseDisplay.checked;
         var lstSortDirection = document.getElementById("SortDirection");
         params.sortDirection = lstSortDirection.value;
         var lstMethod = document.getElementById("Method");
         params.method = lstMethod.value;
        return params;
    }
    function redoHeatMap() {
        showAll();
    }
})();