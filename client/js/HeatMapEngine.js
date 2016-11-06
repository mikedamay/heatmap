var heatMapEngine_ns = function heatMapEngine_ns() {
    var xprivate = {};     // strictly for use of the test runner
    var xpublic = {};
    var units = "px";
    var borderWidth = 2;

    gatherMixins(this.length, arguments, xprivate);

    /// main entry point
    /// usage eg.: heatMapEngine_ns.drawHeatMap( [{area:49}...], {left:20...});
    xpublic.drawHeatMap = function(heatMapData) {
        var lo = newLayout();
        tiles = lo.layoutTiles(heatMapData );
        var renderParams = null;
 {
            renderParams = {left:20,top:20,width:500,height:500};
            units = "px";
            borderWidth = 2;
        }
        var rr = newRenderer(renderParams);
        rr.renderLayout(tiles);
    };
   /**
        Layout
        ------
        the main entry point is layoutTiles which takes an array of areas (numbers) and lays them out (i.e.
        sets top, left, height and width) within a square equal to the aggregate of all the areas.  The
        laid out areas are called 'Tiles' and the total area in which they are placed is defined as a 'Rectangle'.

        The routine takes each area at a time and places the 'tile' along either the full width or the full height of the
        rectangle (or whatever part of the rectangle is still unpopulated).  The decision as to whether to
        align with the width or the height depends on which is shorter.  Aligning on a shorter side improves the
        look of squareness so is always selected.

        In fact if we view each attempt to populate the unpopulated rectangle as a 'turn' then it should
        be noted that an attempt is made to align multiple tiles (all along the same side of the
        unpopulated rectangle) during each turn.  Larger and larger sets of tiles are tested as long as the
        squareness factor continues to increase.

        I'm not sure where the algorithm came from (we are talking 2010.  I may have come up with it myself
        but it seems a bit clever for me.  The code is almost certainly mine.  I don't think the algo's
        Bruis, Huizing and Van Wijk because there is no attempt to compare width-wise layout with
        length-wise layout and it does not pick up on their succinct functional style.
    */
    var newLayout = xpublic.newLayout = function newLayout() {
        var xpublic = {};
        var xprivate = {};

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

        var sc = newSquarenessCalculator();
        /// adds tiles to the committedTiles array from heatMap data
        /// @param nuMTiles - the number of tiles to add
        /// @param remainingRect provides coordinates for the tiles
        /// @param side - the side along which the tiles are aligned.
        /// @param length - the length of the side along which the tiles are alinged.
        /// #param committedTiles - array into which tiles are added.
        var commitTiles = xprivate.commitTiles = function commitTiles(heatMapData
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
                var tile = newTile(curLeft, curTop, width, height, heatMapData[ii]);
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
        /// remainingRect shrinks and committedTiles list grows as the routine is called recursively
        ///
        /// the tile to be placed will take up the complete shorter side of the available
        /// unused rectangle (remainingRect) as this must necessarily provide the squarer geometry
        function layoutRectangle(heatMapData, remainingRect, committedTiles ) {
            assert( typeof heatMapData === 'object' && typeof heatMapData.push === 'function'
              , "Layout.layouTiles: heatMapData must be an array of areas");
            assert( typeof committedTiles === 'object' && typeof committedTiles.push === 'function'
              , "Layout.layouTiles: committedTiles must be an array of areas");
            assert( typeof remainingRect === 'object' && typeof remainingRect.get_remainingRect === 'function'
              , "Layout.layoutTiles: remainingRect must be a Rectangle");

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
        exposeMembersForUnitTests(this.length, arguments, xpublic, xprivate);
        return xpublic;     // Layout
    };

    /// tile contains the data to draw an appropriate rectangle on the heatmap
    var newTile = xprivate.newTile = function newTile(left, top, width, height, extraData) {
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
        xpublic.get_extraData = function get_extraData() {
            return extraData === undefined ? {} : extraData;
        };
        xpublic.renderInnerTile = function renderInnerTile() {};
//        /// if you add arbitrary properties to the tile when you creeate it
//        /// then you can query them with this
//        xpublic.get_property = function(propertyName) {
//            return spec[propertyName];
//        };
        return xpublic;
    };

    // newRectangle extends Tile (adding get_remainingRect() and shortestSide()
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
    /// the sequence is backed by an unchanging array
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

    /// for some set of areas (numbers) and some length the calculator will determine what number of adjacent
    /// areas will provide the set of squarest looking rectangles given that the rectangles are aligned
    /// and that the length of the aligned sides is equal to the given length.
    ///
    /// note that the squarenessCalculator only affects the number of tiles that can be aligned
    /// in this turn.  It does not determine which side of the unpopulated rectangle should
    /// be used for aligning the tile(s).
    var newSquarenessCalculator = xprivate.newSquarenessCalculator !== undefined
      ? xprivate.newSquarenessCalculator : xprivate.newSquarenessCalculator = function getSquarenessCalculator() {
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
            assert( sq >= numAreas);
            return sq / numAreas;
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
        };
        exposeMembersForUnitTests(this.length, arguments, xpublic, xprivate);
        return xpublic;
    };
    /// this has sole charge of rendering the constructed layout in the browser
    /// renderLayout takes a set of "tiles" which have positions and dimensions expressed
    /// in "real-world" units.  These positions and dimensions are scaled by the Renderer
    /// to fit the canvas passed to newRenderer.
    var newRenderer = xpublic.newRenderer = function newRenderer(canvasRect) {
        assert( typeof(canvasRect.left) === 'number' && typeof(canvasRect.top) === 'number'
          && typeof(canvasRect.width) === 'number' && typeof(canvasRect.height) === 'number'
          ,"canvasRect passed to renderer constructor must contain left, top, width, height");
        assert( canvasRect.width > 0 && canvasRect.height > 0 );

        var spublic = {};

        function renderTile(tile, left, top, width, height, idx, tiles) {
            var div = writeTileHTML(left, top, width, height, 0 );
            tile.renderInnerTile(div, idx, tiles);
        };
        function writeTileHTML( left, top, width, height, backgroundColor ) {
            debugPrint( "left="+left+" top="+top+" width="+width+" height=" +height);

            var divTag = document.createElement("div");
            divTag.style.position = "absolute";
            divTag.style.left = left+units;
            divTag.style.top = top+units;
            divTag.style.width = width+units;
            divTag.style.height = height+units;
            divTag.style.border = borderWidth + units + " solid rgb(153,0,153)";
            //divTag.style.backgroundColor = "green";
            var divDataPanel = document.getElementById("DataPanel");
            divDataPanel.appendChild(divTag);
            return divTag;
        };
        function calcTotalArea(tiles) {
            var tot = 0;
            for ( var ii = 0; ii < tiles.length; ii++ ) {
                tot += tiles[ii].get_area();
            }
            return tot;
        }
        spublic.renderLayout = function renderLayout( tiles, renderInnerTile) {
            try {
                if (renderInnerTile === undefined) {
                    renderInnerTile = function(div) {
                        div.style.backgroundColor = "green";
                        div.innnerHTML = "long way home";
                    };
                }
                document.getElementById("DataPanel").innerHTML = "<div/>";
                var totalArea = calcTotalArea(tiles);
                var xScale = canvasRect.width / Math.sqrt(totalArea);
                var yScale = canvasRect.height / Math.sqrt(totalArea);
                for ( var ii = 0; ii < tiles.length; ii++ ) {
                    tiles[ii].renderInnerTile = renderInnerTile;
                    renderTile(tiles[ii]
                      , canvasRect.left + tiles[ii].get_left() * xScale
                      , canvasRect.top + tiles[ii].get_top() * yScale
                      , tiles[ii].get_width() * xScale
                      , tiles[ii].get_height() * yScale
                      , ii, tiles
                      );
                }
            }
            catch ( ex ) {
                alert( "renderLayout:" + ex );
            }
        };
        return spublic;
    };
    /// usage:
    /// var heatmpaMembers = {};
    /// heatmapEngine_ns(heatMapmembers);
    /// var tile = heatmapMembers.newTile();  etc., etc.
    ///
    /// newLaout(layoutMembers);
    /// layoutMembers.commitTiles etc.
    function exposeMembersForUnitTests(numNamedArgs, args, xpublic, xprivate) {
        var copyMembers = function copyMembers(members, source) {
            for ( var member in source ) {
                if (source.hasOwnProperty(member)) {
                    members[member] = source[member];
                }
            }
        };
        if (args.length > numNamedArgs && args[numNamedArgs] != null) { // an extra arg has been passed to obtain the set of private functions
            var argsArray;
            argsArray = Array.prototype.slice.call(args);
            var members = argsArray[numNamedArgs];
            copyMembers(members, xpublic);
            copyMembers(members, xprivate);
        }
    }

    function gatherMixins(numNamedArgs, args, xprivate) {
        var copyMembers = function copyMembers(members, source) {
            for ( var member in source ) {
                if (source.hasOwnProperty(member)) {
                    members[member] = source[member];
                }
            }
        };
        var POS_HIDDEN_PARAM = 1;
        if (args.length > numNamedArgs + POS_HIDDEN_PARAM && args[numNamedArgs + POS_HIDDEN_PARAM] != null) {
                                                              // two extra args have been passed
                                                              // 1) to obtain the set of private functions
                                                              // 2) mixins
            var argsArray;
            argsArray = Array.prototype.slice.call(args);
            var members = argsArray[numNamedArgs + POS_HIDDEN_PARAM];
            copyMembers(xprivate, members);
        }

    }

    var debugPrint = function(str) {
//        document.writeln( str + "<br>" );
    };
    var assert = function(cond, message ) {
        if (!cond ) {
            throw { name: "assertionFailure", message: message };
        }
    };
    exposeMembersForUnitTests(this.length, arguments, xpublic, xprivate);
    return xpublic;
};