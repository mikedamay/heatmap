var newSequence = (function getNewSequence() {
    var heatMapMembers = {};
    document.hmcontext.newEngine(heatMapMembers);
    var newSequence = heatMapMembers.newSequence;
    return newSequence;
})();

describe( "Sequence", function() {

    it("should return correct head values", function() {
        var seq = newSequence( [{area:20}, {area:30}, {area:40}, {area:50}], 0);

        expect( seq.head().area ).toEqual(20);
        expect( seq.tail().head().area).toEqual(30);
        expect(seq.tail().tail().tail().tail().isEmpty()).toEqual(true);
    });
    it("should know its own length", function() {
        var seq = newSequence( [{area:20}, {area:30}, {area:40}, {area:50}], 0);

        expect( seq.length()).toEqual(4);
        expect( seq.tail().length()).toEqual(3);
        expect(seq.tail().tail().tail().tail().length()).toEqual(0);
        expect( newSequence([]).length()).toEqual(0);
    });
});