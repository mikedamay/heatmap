var counter = 1;

var lstDataSets = document.getElementById("DataSets");

for ( var dataSetName in DataChoices) {
    opt = document.createElement("OPTION");
    opt.text = dataSetName;
    opt.value = dataSetName;
    lstDataSets.options.add(opt);
}


function gatherParamsFromPage() {
    var params = {left:20,top:20,width:500,height:500};
/*
    var chkApplyLogScale = document.getElementById("ApplyLogScale");
    params.applyLogScale = chkApplyLogScale.checked;
    var chkReverseDisplay = document.getElementById("ReverseDisplay");
    params.reverseDisplay = chkReverseDisplay.checked;
    var lstSortDirection = document.getElementById("SortDirection");
    params.sortDirection = lstSortDirection.value;
*/
    return params;
}

var showNext = function() {
    try
    {
        if ( lstDataSets.options.length === 0 ) {
            alert( "unable to draw heatmap.  No data available.  You need a file called HeatMapTestData.js");
        }
        if ( lstDataSets.options.selectedIndex === -1 ) {
            lstDataSets.value = lstDataSets.options.item(0).value;
        }
        var engine = heatMapEngine_ns();
        engine.drawHeatMap(DataChoices[lstDataSets.value].slice(0,counter), gatherParamsFromPage());
    }
    catch (ex) {
        alert(ex);
    }
    counter++;
};

var showAll = function() {
try
{
    if ( lstDataSets.options.length === 0 ) {
        alert( "unable to draw heatmap.  No data available.  You need a file called HeatMapTestData.js");
    }
    if ( lstDataSets.options.selectedIndex === -1 ) {
        lstDataSets.value = lstDataSets.options.item(0).value;
    }
    var engine = heatMapEngine_ns();
    engine.drawHeatMap(DataChoices[lstDataSets.value], gatherParamsFromPage());
}
catch (ex) {
    alert(ex);
}
};