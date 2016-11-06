var newLayout = (function getNewLayout() {
    var heatMapMembers = {};
    document.hmcontext.newEngine(heatMapMembers);
    var newLayout = heatMapMembers.newLayout;
    return newLayout;
})();
var newRectangle = (function getNewRectangle() {
    var heatMapMembers = {};
    document.hmcontext.newEngine(heatMapMembers);
    var newRectangle = heatMapMembers.newRectangle;
    return newRectangle;
})();
describe( "Layout", function() {
    var privateMembers = {};
    newLayout(privateMembers);
    var commitTiles = privateMembers.commitTiles;
    it ( "should be able to calculate the total area of new tiles", function() {
        var committedTiles = [];
        var totalArea = commitTiles(
          [{area:100}], 1, newRectangle(0,0,50,50),'height', 50, committedTiles );
        expect( totalArea ).toEqual(100); 
        totalArea = commitTiles(
          [{area:100}, {area:50}], 2, newRectangle(0,0,50,50),'height', 50, committedTiles );
        expect( totalArea ).toEqual(150);
        totalArea = commitTiles(
        [{area:100}, {area:50}], 1, newRectangle(0,0,50,50),'height', 50, committedTiles );
        expect( totalArea ).toEqual(100);
    });
    it ( "should be able to calculate the position and dimensions of new tiles placed vertically", function() {
        var lo = newLayout([{area:100}]);
        var committedTiles = [];
        var totalArea = commitTiles(
          [{area:9}, {area:9}, {area:9}], 3, newRectangle(20,30,25,9),'height', 9, committedTiles );
        expect( committedTiles.length ).toEqual(3);
        expect( committedTiles[0].get_top() ).toEqual(30);
        expect( committedTiles[1].get_top() ).toEqual(33);
        expect( committedTiles[2].get_top() ).toEqual(36);
        expect( committedTiles[2].get_left() ).toEqual(20);
    });
    it ( "should be able to calculate the position and dimensions of new tiles placed horizontally", function() {
        var lo = newLayout();
        var committedTiles = [];
        var totalArea = commitTiles(
          [{area:9}, {area:9}, {area:9}], 3, newRectangle(20,30,9,25),'width', 9, committedTiles );
        expect( committedTiles.length ).toEqual(3);
        expect( committedTiles[0].get_left() ).toEqual(20);
        expect( committedTiles[1].get_left() ).toEqual(23);
        expect( committedTiles[2].get_left() ).toEqual(26);
        expect( committedTiles[2].get_top() ).toEqual(30);
    });
    it ( "should be able to create tiles for the heatmap data", function() {
        var lo = newLayout();
        var tiles = lo.layoutTiles(
          [
          {area:4}
          ,{area:4}
          ,{area:4}
          ,{area:4}
          ]
          );
        expect( tiles[0].get_area()).toEqual(4);
        expect( tiles[3].get_area()).toEqual(4);
        expect( tiles[3].get_left()).toEqual(2);
        expect( tiles[3].get_top()).toEqual(2);

    });
});