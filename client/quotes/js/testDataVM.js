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
                   span.className = "xxx";
                    span.style.backgroundColor = "white";
                    span.style.border = "black 1px solid";
                   div.className = "ht";
                   div.appendChild(span);
                   // document.getElementById("DataPanel").appendChild(span);
/*
               div.onmousedown = function() {
                   var span = document.createElement('span');
                   span.innerHTML = text;
                   span.className = "xxx";
                   div.className = "ht";
                   div.appendChild(span);
               }
*/
           }
       };
       // the testTile is used to roughly calculate the typical area required by the text
       // var testTile = {renderInnerTile: renderInnerTile, get_extraData: function() {return '1234';}};
       rr.renderLayout(tiles, renderInnerTile);
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