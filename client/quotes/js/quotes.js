// mike may, 29-Oct-2016

var heatMapQuotesHandler_ns;

function doheatMapQuotesHandler_ns() {
    var ii = 0;
    var lastRequestTime = new Date("2099-12-31");

    window.clearTimeout();
    var stock;
    var stockList = document.getElementById("StockList");
    if ( stockList.options.length === 0 ) {
        return function() {};
    }
    if ( stockList.options.selectedIndex === -1 ) {
        stockList.value = stockList.options.item(0).value;
    }
    stock = stockList.value;
    stockList.onchange = doheatMapQuotesHandler_ns;

    function requestQuote() {
        var script = document.createElement("script");
        script.src = 'http://54.93.64.181/heatmap-server/generate_quotes.php' + '?cahdebreaker='+ ii++ + '&jsonp_wrapper=heatMapQuotesHandler_ns&ticker=' + stock;
        //script.src = 'http://54.93.212.68/quotes/generate_quotes.php' + '?cahdebreaker='+ ii++ + '&jsonp_wrapper=heatMapQuotesHandler_ns&ticker=' + stock;
            // server returns "heatMapQuotesHandler_ns(...payload...);"
        document.getElementsByTagName("head")[0].appendChild(script);
        lastRequestTime = new Date();

    }

    function handleTimeout() {
        function checkTime() {
            if (new Date() - lastRequestTime > 30000) {
                displayError("The server does not appear to be responding");
            }
            window.setTimeout( checkTime, 5000);
        }
        window.setTimeout( checkTime, 5000);
    }

    function displayError(msg) {
        document.getElementById("PayloadError").innerHTML = msg;
    }


    handleTimeout();
    requestQuote();
    // payload: eg. { data: {stock: 'MSFT', price: 501.01, volume: 555444}}
    return function handler(payload) {
        lastRequestTime = new Date("2099-12-31");
        displayError("");
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
};


