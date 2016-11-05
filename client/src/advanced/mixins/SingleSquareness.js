/**
 * Created by mikedamay on 24/10/2016.
 */

// pass {newSquarenessCalculator: heatmapEngineSingleSquareness_ns} as 2nd parameter to the engine
function heatmapEngineSingleSquareness_ns() {
    var xpublic = {};
    xpublic.tileCountForSide = function tileCountForSide() {
        return 1;
    };
    return xpublic
}
