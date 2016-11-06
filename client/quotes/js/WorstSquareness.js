/**
 * Created by mikedamay on 05/11/2016.
 */

if (document.hmcontext === undefined) {
    document.hmcontext = {};
}

document.hmcontext.newWorstSquarenessCalculator = function () {
    var xpublic = {};
    var xprivate = {};

    /// for a set of areas plus an optional extra area this calculates
    /// the aggregate squareness factor given that all areas have to have one side whose
    /// totals add up to length
    /// @return the ratio of two adjacent sides of the rectangle such that the ration is >= 1 (squareness factor)
    /// @param areas - the areas that we have already decided to commit
    /// @param extraArea - an area that we might decide to add to the above if its addition improves squareness
    /// @param length - typically the shortest side of some rectangle in which we intend to place the areas
    var squareness = xprivate.squareness = function squareness(areas, extraArea, length) {
        assert( typeof areas !== 'undefined' && areas !== null
            , "newSquarenessCalculator.squareness: requires an non-empty array of areas" );
        assert( typeof areas.push !== 'undefined'
            , "newSquarenessCalculator.squareness: requires an array of area");
        assert( extraArea !== 'undefined' && extraArea != null
            , "newSquarenessCalculator.squareness: requires an extra area of type {area:nn}.  It can can have an area of 0" );
        assert( typeof length === 'number', "newSquarenessCalculator.squareness: requires a length");
        var numAreas = areas.length + extraArea.area > 0 ? 1 : 0 ;
        var totalArea = function totalArea() {
                var tot = 0;
                for ( var ii = 0; ii < areas.length; ii++ ) {
                    tot += areas[ii].area;
                }
                return tot;
            }() + extraArea.area;
        var worst = 0;
        for ( var ii = 0; ii < areas.length; ii++ ) {
            var height = length * areas[ii].area / totalArea;
            var width = areas[ii].area / height;
            var candidate = Math.max( height / width, width / height );
            worst = Math.max(worst, candidate);
        }
        if ( extraArea.area > 0 ) {
            height = length * extraArea.area / totalArea;
            width = extraArea.area / height;
            candidate = (Math.max( height / width, width / height ));
            worst = Math.max(worst, candidate);
        }
        return worst;
    };
    /// returns the optimal number of sequential tiles in the sequence
    /// which provide the squarest tiles for the given length.
    /// i.e. in a 'turn' we add the number of tiles which creates the greatest squareness factor
    /// @param seqAreas sequence of type {area:nnn}
    /// @param length - this is typically either the width or the height of
    ///   a rectangle along which the tiles are placed.
    var squarestTileCount = xprivate.squarestTileCount
        = function squarestTileCount(seqAreas, length) {
        assert( !seqAreas.isEmpty()
            , "squarenesCalculateor.squarestTileCount: cannot handle an empty sequence of tiles");
        assert( typeof seqAreas.head().area === 'number'
            , "the tile sequence must contain raw objects containing an area property");
        /// areasPart shrinks and areasToCommit grows as this function is executed recursively
        function doSquarestTileCount(areasPart, length, areasToCommit) {
            if (areasPart.isEmpty())  {
                return areasToCommit.length;    // all areas in heapMapdata have been committed except these
                                                // last few (in areasTocommit)
            }
            if ( squareness(areasToCommit, areasPart.head(), length) <= squareness(areasToCommit, {area:0}, length)) {
                areasToCommit.push(areasPart.head());
                return doSquarestTileCount(areasPart.tail(), length, areasToCommit );
            }
            else    // squareness won't improve by adding another area
            {
                return areasToCommit.length;
            }
        };
        return doSquarestTileCount( seqAreas.tail(), length, [seqAreas.head()] );
    };
    xpublic.tileCountForSide = function tileCountForSide(seqAreas, length ) {
        return squarestTileCount(seqAreas, length );
    }
    var assert = function(cond, message ) {
        if (!cond ) {
            throw { name: "assertionFailure", message: message };
        }
    };

    return xpublic;
};
