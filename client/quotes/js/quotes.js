// mike may, 29-Oct-2016

var heatMapQuotesHandler_ns = (function() {
    var ii = 0;

    requestQuote();


    function requestQuote() {
        var script = document.createElement("script");
        // script.src = 'http://localhost/quotes/generate_quotes.php' + '?cahdebreaker='+ ii++ + '&jsonp_wrapper=heatMapQuotesHandler_ns&ticker=FB';
        script.src = 'http://frankfurt-rdp/quotes/generate_quotes.php' + '?cahdebreaker='+ ii++ + '&jsonp_wrapper=heatMapQuotesHandler_ns&ticker=FB';
            // server returns "heatMapQuotesHandler_ns(...payload...);"
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    function displayError(msg) {
        document.getElementById("PayloadError").innerHTML = msg;
    }

    // payload: eg. { data: {stock: 'MSFT', price: 501.01, volume: 555444}}
    return function handler(payload) {
        if ( payload.data !== undefined) {
            document.hmcontext.makeHeatMap(payload.data);
            requestQuote();     // I think we can assume that all errors are irrecoverable
        }
        else if (payload.err !== undefined) {
            displayError(payload.err);
        }
        else {
            displayError("Invalid payload returned from server");
        }
    }
})();


