/**
 * Created by mikedamay on 02/11/2016.
 */


window.onload =
    function() {
        showAll = myShow;

    };
window.onresize = function() { refreshHeatMap(); };
//    window.onresize = function() { showAll(); };


function drawHeatMap() {

}
function myShow() {
    var engine = heatMapEngine_ns();
    var lo = engine.newLayout();
    tiles = lo.layoutTiles(DataChoices[lstDataSets.value] );
    var div = document.getElementById("DataPanel");
    var rr = engine.newRenderer(
        {left: div.offsetLeft, top: div.offsetTop, width: div.offsetWidth, height: div.offsetHeight});
    rr.renderLayout(tiles, function(div) {
        div.innerHTML = "longish text";
    });

}
