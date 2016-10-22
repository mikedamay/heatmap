var heatMapEngine_ns = function() {
    var xprivate = {};     // strictly for use of the test runner
    var xpublic = {};

    /// main entry point
    /// usage eg.: heatMapEngine_ns.drawHeatMap( [{area:49}...], {left:20...});
    xpublic.drawHeatMap = function(heatMapData) {
        var lo = newLayout();
        tiles = lo.layoutTiles(heatMapData );
        var rr = newRenderer({left:20,top:20,width:500,height:500});
        rr.renderLayout(tiles);
    };

    var newLayout = xpublic.newLayout = function newLayout() {
        var xpublic = {};
        xpublic.xprivate = {};

        var calcTotalArea = function(heatMapData, numTiles) {
            if ( typeof numTiles !== 'number' ) {
                 numTiles = heatMapData.length;
            }
            var tot = 0;
                for ( var ii = 0; ii < numTiles; ii++ ) {
                tot += heatMapData[ii].area;
            }
            return tot;
        };

        var sc = SquarenessCalculator();
        /// adds tiles to the committedTiles array from heatMap data
        /// @param nuMTiles - the number of tiles to add
        /// @param remainingRect provides coordinates for the tiles
        /// @param side - the side along which the tiles are aligned.
        /// @param length - the length of the side along which the tiles are alinged.
        /// #param committedTiles - array into which tiles are added.
        var commitTiles = xpublic.xprivate.commitTiles = function (heatMapData
          , numTiles, remainingRect, side, length, committedTiles)
        {
            var totalArea = calcTotalArea(heatMapData, numTiles);
            var curTop = remainingRect.get_top();
            var curLeft = remainingRect.get_left();
            for (var ii = 0; ii < numTiles; ii++)
            {
                var width;
                var height;
                if (side === 'width')
                {
                    width = length * (heatMapData[ii].area / totalArea );
                    height = heatMapData[ii].area / width;
                }
                else
                {
                    height = length * (heatMapData[ii].area / totalArea );
                    width = heatMapData[ii].area / height;
                }
                var tile = newTile(curLeft, curTop, width, height);
                committedTiles.push(tile);
                if (side === 'width')
                {
                    curLeft += tile.get_width();
                }
                else
                {
                    curTop += tile.get_height();
                }
            }
            return totalArea;
        };
        /// @return an array of tiles for displaying
        xpublic.layoutTiles = function layoutTiles(heatMapData ) {
            assert( typeof heatMapData === 'object' && typeof heatMapData.push === 'function'
              , "Layout.layouTiles: heatMapData must be an array of areas");
            var committedTiles = [];
            var area = calcTotalArea(heatMapData );
            var sideLength = Math.sqrt(area);
            var rect = newRectangle(0,0, sideLength, sideLength );

            layoutRectangle(heatMapData, rect, committedTiles );
            return committedTiles;
        };
        var layoutRectangle = xpublic.xprivate.layoutRectangle
          = function layoutRectangle(heatMapData, remainingRect, committedTiles ) {
            assert( typeof heatMapData === 'object' && typeof heatMapData.push === 'function'
              , "Layout.layouTiles: heatMapData must be an array of areas");
            assert( typeof committedTiles === 'object' && typeof committedTiles.push === 'function'
              , "Layout.layouTiles: committedTiles must be an array of areas");
            assert( typeof remainingRect === 'object' && typeof remainingRect.get_remainingRect === 'function'
              , "Layout.layouTiles: remainingRect must be a newRectangle");

            var side = remainingRect.shortestSide();
            var length = side === 'width' ? remainingRect.get_width() : remainingRect.get_height();
            var seqAreas = newSequence(heatMapData);
            var numTiles = sc.tileCountForSide(seqAreas, length);
            assert( numTiles <= seqAreas.length()
              , "the squareness calculator has allocated more tiles than are available" );
            var totalArea = commitTiles(heatMapData, numTiles, remainingRect, side, length, committedTiles);
            if ( heatMapData.length > numTiles ) {
                remainingRect = remainingRect.get_remainingRect(side, totalArea );
                layoutRectangle(heatMapData.slice(numTiles), remainingRect, committedTiles );
            }
        };
        return xpublic;
    };

    /// tile contains the data to draw an appropriate rectangle on the heatmap
    var newTile = xprivate.newTile = function newTile(left, top, width, height) {
        assert( typeof(left) === 'number'
          && typeof(top) === 'number'
          && typeof(width) === 'number'
          && typeof(height) === 'number'
        );
        var xpublic = {};
        xpublic.get_left = function get_left() {
            return left;
        };
        xpublic.get_top = function get_top() {
            return top;
        };
        xpublic.get_width = function get_width() {
            return width;
        };
        xpublic.get_height = function get_height() {
            return height;
        };
        xpublic.get_area = function get_area() {
            return width * height;
        };
//        /// if you add arbitrary properties to the tile when you creeate it
//        /// then you can query them with this
//        xpublic.get_property = function(propertyName) {
//            return spec[propertyName];
//        };
        return xpublic;
    };

    // newRectangle extends Tile (adding get_remainingRect() and shrtestSide()
    var newRectangle = xprivate.newRectangle = function newRectangle(left, top, width, height) {
        assert( width > 0 && height > 0, "cannot handle a rectangle with zero area or an anti-rectangle");
        var xpublic = newTile(left, top, width, height);
        var get_area = xpublic.get_area;
        var get_left = xpublic.get_left;
        var get_top = xpublic.get_top;
        var get_width = xpublic.get_width;
        var get_height = xpublic.get_height;
        /// @param givenSide the side that is already fixed must be 'height' or 'width'
        ///
        xpublic.get_remainingRect = function (givenSide, areaToRemove ) {
            var newLeft;
            var newTop;
            var newWidth;
            var newHeight;
            if ( givenSide === 'height') {
                var removedWidth = areaToRemove / get_height();
                newLeft = get_left() + removedWidth;
                newTop = get_top();
                newWidth = get_width() - removedWidth;
                newHeight = get_height();
            }
            else {
                assert( givenSide === 'width', "get_reaminingRect: side must be either 'width' or 'height'");
                var removedHeight = areaToRemove / get_width();
                newLeft = get_left();
                newTop = get_top() + removedHeight;
                newWidth = get_width();
                newHeight = get_height() - removedHeight;
            }
            return newRectangle(newLeft, newTop, newWidth, newHeight );
        };
        xpublic.shortestSide = function shortestSide() {
            return width < height ? 'width' : 'height';  
        };
        return xpublic;
    };


    /// utility class that converts an array to a lisp style sequence with head and tail etc.
    var newSequence = xprivate.newSequence = function newSequence(arr, pos)
    {
        if ( typeof pos === 'undefined') {
            pos = 0;
        }
        var xpublic = {};
        var head = xpublic.head = function head() {
            if ( arr.length > pos ) {
                return arr[pos];
            }
            else
            {
                return null;
            }
        };
        var isEmpty = xpublic.isEmpty = function isEmpty() {
            return head() === null;
        };

        var tail = xpublic.tail = function tail() {
            assert( pos  < arr.length, "Squence.tail: attempt to tail an  empty sequence");
            return newSequence( arr, pos + 1);
        };
        var length = xpublic.length = function length() {
            return arr.length - pos;
        }
        return xpublic;
    };

    var SquarenessCalculator = xprivate.SquarenessCalculator = function() {
        var xpublic = {};
        var xprivate = {};

        /// for a set of areas plus an optional extra area this calculates
        /// the aggregate squareness factor given that all areas have to have one side whose
        /// totals add up to length
        var squareness = xpublic.squareness = function squareness(areas, extraArea, length) {
            assert( typeof areas !== 'undefined' && areas !== null
              , "SquarenessCalculator.squareness: requires an non-empty array of areas" );
            assert( typeof areas.push !== 'undefined'
               , "SquarenessCalculator.squareness: requires an array of area");
            assert( extraArea !== 'undefined' && extraArea != null
              , "SquarenessCalculator.squareness: requires an extra area of type {area:nn}.  It can can have an area of 0" );
            assert( typeof length === 'number', "SquarenessCalculator.squareness: requires a length");
            var totalArea = function() {
                var tot = 0;
                for ( var ii = 0; ii < areas.length; ii++ ) {
                    tot += areas[ii].area;
                }
                return tot;
            }() + extraArea.area;
            var sq = 0;
            for ( var ii = 0; ii < areas.length; ii++ ) {
                var height = length * areas[ii].area / totalArea;
                var width = areas[ii].area / height;
                sq += (Math.max( height / width, width / height ));
            }
            if ( extraArea.area > 0 ) {
                height = length * extraArea.area / totalArea;
                width = extraArea.area / height;
                sq += (Math.max( height / width, width / height ));
            }
            return sq;
        };
        /// returns the optimal number of sequential tiles in the sequence
        /// which provide the squarest tiles for the given length
        /// @param seqAreas sequence of type {area:nnn}
        /// @param length - this is typically either the width or the height of
        ///   a rectangle along which the tiles are placed.
        var squarestTileCount = xpublic.squarestTileCount
          = function(seqAreas, length) {
            assert( !seqAreas.isEmpty()
              , "squarenesCalculateor.squarestTileCount: cannot handle an empty sequence of tiles");
            assert( typeof seqAreas.head().area === 'number'
              , "the tile sequence must contain raw objects containing an area property");
            var doSquarestTileCount = function doSquarestTileCount(seqAreasPart, length, areasPart) {
                if (seqAreasPart.isEmpty())  {
                    return areasPart.length;
                }
                if ( squareness(areasPart, seqAreas.head(), length) <= squareness(areasPart, {area:0}, length)) {
                    areasPart.push(seqAreasPart.head());
                    return doSquarestTileCount(seqAreasPart.tail(), length, areasPart );
                }
                else
                {
                    return areasPart.length;
                }
            };
            var areas = [seqAreas.head()];
            var areaCount = doSquarestTileCount( seqAreas.tail(), length, areas );
            return areaCount;
        };
        xpublic.tileCountForSide = function tileCountForSide(seqAreas, length ) {
            return squarestTileCount(seqAreas, length );
        };
        exposeForUnitTests(this.length, arguments, xpublic, xprivate);
        return xpublic;
    };
    var exposeForUnitTests = function(numNamedArgs, args, xpublic, xprivate) {
        var copyMembers = function copyMembers(members, source) {
            for ( var member in source ) {
                if (source.hasOwnProperty(member)) {
                    members[member] = source[member];
                }
            }
        };
        if (args.length > numNamedArgs) { // an extra arg has been passed to obtain the set of private functions
            var argsArray;
            argsArray = Array.prototype.slice.call(args);
            var members = argsArray[numNamedArgs];
            members.value = {};
            copyMembers(members.value, xpublic);
            copyMembers(members.value, xprivate);
        }
    };
    /// this has sole charge of rendering the constructed layout to the browser page
    var newRenderer = xpublic.newRenderer = function newRenderer(canvasRect) {
        assert( typeof(canvasRect.left) === 'number' && typeof(canvasRect.top) === 'number'
          && typeof(canvasRect.width) === 'number' && typeof(canvasRect.height) === 'number'
          ,"canvasRect passed to renderer constructor must contain left, top, width, height");
        assert( canvasRect.width > 0 && canvasRect.height > 0 );

        var publicState = {};

        var renderTile = function(tile, left, top, width, height ) {
           writeTileHTML(left, top, width, height, 0 );
        };
        var writeTileHTML = function( left, top, width, height, backgroundColor ) {
            debugPrint( "left="+left+" top="+top+" width="+width+" height=" +height);

            var divTag = document.createElement("div");
            divTag.style.position = "absolute";
            divTag.style.left = left+"px";
            divTag.style.top = top+"px";
            divTag.style.width = width+"px";
            divTag.style.height = height+"px";
            divTag.style.border = "2px solid rgb(153,0,153)";
            divTag.style.backgroundColor = "white";
            divTag.innerHTML = "xx";
            var divDataPanel = document.getElementById("DataPanel");
            divDataPanel.appendChild(divTag);
        };
        var calcTotalArea = function(tiles) {
            var tot = 0;
            for ( var ii = 0; ii < tiles.length; ii++ ) {
                tot += tiles[ii].get_area();
            }
            return tot;
        };
        publicState.renderLayout = function( tiles, reverse ) {
            try {

                if ( typeof(reverse) === 'undefined' ) {
                    reverse = false;
                }
                var totalArea = calcTotalArea(tiles);
                var xScale = canvasRect.width / Math.sqrt(totalArea);
                var yScale = canvasRect.height / Math.sqrt(totalArea);
                for ( var ii = 0; ii < tiles.length; ii++ ) {
                    renderTile(tiles[ii]
                      , canvasRect.left + tiles[ii].get_left() * xScale
                      , canvasRect.top + tiles[ii].get_top() * yScale
                      , tiles[ii].get_width() * xScale
                      , tiles[ii].get_height() * yScale
                      );
                }
            }
            catch ( ex ) {
                alert( "renderLayout:" + ex );
            }
        };
        return publicState;
    };

    var debugPrint = function(str) {
//        document.writeln( str + "<br>" );
    };
    var assert = function(cond, message ) {
        if (!cond ) {
            throw { name: "assertionFailure", message: message };
        }
    };
    return xpublic;
}();