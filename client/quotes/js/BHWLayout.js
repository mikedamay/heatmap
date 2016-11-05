/**
 * Created by mikedamay on 05/11/2016.
 */

(function() {

    if (document.hmcontext === undefined) {
        document.hmcontext = {};
    }
    document.hmcontext.newBHWLayout = function newLayout() {
        var xpublic = {};
        var xprivate = {};
        /// tile contains the data to draw an appropriate rectangle on the heatmap
        var newTile = xprivate.newTile = function newTile(left, top, width, height, extraData) {
            assert(typeof(left) === 'number'
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
            xpublic.renderInnerTile = function renderInnerTile() {
            };
//        /// if you add arbitrary properties to the tile when you creeate it
//        /// then you can query them with this
//        xpublic.get_property = function(propertyName) {
//            return spec[propertyName];
//        };
            return xpublic;
        };

        // newRectangle extends Tile (adding get_remainingRect() and shortestSide()
        var newRectangle = xprivate.newRectangle = function newRectangle(left, top, width, height) {
            assert(width > 0 && height > 0, "cannot handle a rectangle with zero area or an anti-rectangle");
            var xpublic = newTile(left, top, width, height);
            var get_area = xpublic.get_area;
            var get_left = xpublic.get_left;
            var get_top = xpublic.get_top;
            var get_width = xpublic.get_width;
            var get_height = xpublic.get_height;
            /// @param givenSide the side that is already fixed must be 'height' or 'width'
            ///
            xpublic.get_remainingRect = function (givenSide, areaToRemove) {
                var newLeft;
                var newTop;
                var newWidth;
                var newHeight;
                if (givenSide === 'height') {
                    var removedWidth = areaToRemove / get_height();
                    newLeft = get_left() + removedWidth;
                    newTop = get_top();
                    newWidth = get_width() - removedWidth;
                    newHeight = get_height();
                }
                else {
                    assert(givenSide === 'width', "get_reaminingRect: side must be either 'width' or 'height'");
                    var removedHeight = areaToRemove / get_width();
                    newLeft = get_left();
                    newTop = get_top() + removedHeight;
                    newWidth = get_width();
                    newHeight = get_height() - removedHeight;
                }
                return newRectangle(newLeft, newTop, newWidth, newHeight);
            };
            xpublic.shortestSide = function shortestSide() {
                return width < height ? 'width' : 'height';
            };
            return xpublic;
        };


        var calcTotalArea = function (heatMapData, numTiles) {
            if (typeof numTiles !== 'number') {
                numTiles = heatMapData.length;
            }
            var tot = 0;
            for (var ii = 0; ii < numTiles; ii++) {
                tot += heatMapData[ii].area;
            }
            return tot;
        };

        /// adds tiles to the committedTiles array from heatMap data
        /// @param nuMTiles - the number of tiles to add
        /// @param remainingRect provides coordinates for the tiles
        /// @param side - the side along which the tiles are aligned.
        /// @param length - the length of the side along which the tiles are alinged.
        /// #param committedTiles - array into which tiles are added.
        var commitTiles = xprivate.commitTiles = function commitTiles(heatMapData
            , numTiles, remainingRect, side, length, committedTiles) {
            var totalArea = calcTotalArea(heatMapData, numTiles);
            var curTop = remainingRect.get_top();
            var curLeft = remainingRect.get_left();
            for (var ii = 0; ii < numTiles; ii++) {
                var width;
                var height;
                if (side === 'width') {
                    width = length * (heatMapData[ii].area / totalArea );
                    height = heatMapData[ii].area / width;
                }
                else {
                    height = length * (heatMapData[ii].area / totalArea );
                    width = heatMapData[ii].area / height;
                }
                var tile = newTile(curLeft, curTop, width, height, heatMapData[ii]);
                committedTiles.push(tile);
                if (side === 'width') {
                    curLeft += tile.get_width();
                }
                else {
                    curTop += tile.get_height();
                }
            }
            return totalArea;
        };
        /// @return an array of tiles for displaying
        xpublic.layoutTiles = function layoutTiles(heatMapData) {
            assert(typeof heatMapData === 'object' && typeof heatMapData.push === 'function'
                , "Layout.layouTiles: heatMapData must be an array of areas");
            var committedTiles = [];
            var area = calcTotalArea(heatMapData);
            var sideLength = Math.sqrt(area);
            var rect = newRectangle(0, 0, sideLength, sideLength);

            layoutRectangle(heatMapData, rect, [], committedTiles);
            assert(heatMapData.length === committedTiles.length);
            return committedTiles;
        };
        /// remainingRect shrinks and committedTiles list grows as the routine is called recursively
        /// the set of remainingRegions shrinks as either 0 or 1 is allocated to the rectangle on
        /// each recursive call.
        /// the set of committedRegions grows at each recursive call or is made empty (when the regions
        /// are actually committed to the rectangle
        /// the set of committedTiles grows and the resulting size is the same of that of the initial remainingRegions
        ///
        /// the tile to be placed will take up the complete shorter side of the available
        /// unused rectangle (remainingRect) as this must necessarily provide the squarer geometry
        function layoutRectangle(remainingRegions, remainingRect, committedRegions, committedTiles) {
            assert(typeof remainingRegions === 'object' && typeof remainingRegions.push === 'function'
                , "Layout.layouTiles: remainingRegions must be an array of areas");
            assert(typeof committedRegions === 'object' && typeof committedRegions.push === 'function'
                , "Layout.layouTiles: committedTiles must be an array of areas");
            assert(typeof remainingRect === 'object' && typeof remainingRect.get_remainingRect === 'function'
                , "Layout.layoutTiles: remainingRect must be a Rectangle");

            function concat(regions, region) {
                var arr = Array.from(regions);
                arr.push(region);
                return arr;      // TODO optimise??
            }

            // @param length the length of the dimension against which new tiles will be aligned
            function worst(regions, length) {
                assert(typeof regions === 'object' && typeof regions.push === 'function'
                    , "Layout.worst: regions must be an array of areas");
                if (regions.length === 0) {
                    return 0;
                }
                assert(regions[0].area !== undefined);
                assert(length > 0);
                var totalArea = calcTotalArea(regions, regions.length);
                var maxItem = regions.reduce(function (a, b) {
                    return a.area >= b.area ? a : b;
                });
                var minItem = regions.reduce(function (a, b) {
                    return a.area >= b.area ? b : a;
                });
                return Math.max(length * length * maxItem.area / (totalArea * totalArea)
                    , (totalArea * totalArea) / (length * length * minItem.area))
            }

            var side = remainingRect.shortestSide();
            var length = side === 'width' ? remainingRect.get_width() : remainingRect.get_height();
            // TODO optimisation??
            if (remainingRegions.length === 0) {
                if (committedRegions.length > 0) {
                    commitTiles(committedRegions, committedRegions.length, remainingRect, side, length, committedTiles);
                }
                return;
            }
            var region = remainingRegions[0];
            if (worst(committedRegions, length) <= worst(concat(committedRegions, region), length)) {
                layoutRectangle(remainingRegions.slice(1), remainingRect, concat(committedRegions, region), committedTiles);
            }
            else {
                commitTiles(committedRegions, committedRegions.length, remainingRect, side, length, committedTiles);
                var totalArea = calcTotalArea(committedRegions);
                layoutRectangle(remainingRegions, remainingRect.get_remainingRect(side, totalArea), [], committedTiles);
            }
        }

        function assert(cond, message) {
            if (!cond) {
                throw message;
            }
        }

        function exposeMembersForUnitTests(numNamedArgs, args, xpublic, xprivate) {
            var copyMembers = function copyMembers(members, source) {
                for (var member in source) {
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

        exposeMembersForUnitTests(this.length, arguments, xpublic, xprivate);
        return xpublic;     // Layout
    }
})();