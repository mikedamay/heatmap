// mike may, 29-Oct-2016

var heatMapQuotesHandler_ns = (function() {
    var ii = 0;

    requestQuote();


    function requestQuote() {
        var script = document.createElement("script");
        script.src = 'http://frankfurt-rdp/quotes/generate_quotes.php' + '?cachebreaker=' + ii++;
            // server returns "heatMapQuotesHandler_ns(...payload...);"
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    // payload: eg. { data: {stock: 'MSFT', price: 501.01, volume: 555444}}
    return function handler(payload) {
        makeHeatMap(payload.data);
        requestQuote();
    }
})();


