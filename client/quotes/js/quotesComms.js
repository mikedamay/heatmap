// mike may, 29-Oct-2016

var heatMapQuotesHandler_ns;

(function() {
    var ii = 0;
    var lastRequestTime = new Date("2099-12-31");
    var xpublic = {};
    var handleData;
    var handleError;

    xpublic.start = function start(stock, handleDataCallback, handleErrorCallback) {
        handleData = handleDataCallback;
        handleError = handleErrorCallback;

        window.clearTimeout();
        var stockList = document.getElementById("StockList");
        if (stockList.options.length === 0) {
            return function () {
            };
        }
        if (stockList.options.selectedIndex === -1) {
            stockList.value = stockList.options.item(0).value;
        }
        // stock = stockList.value;
        // stockList.onchange = doheatMapQuotesHandler_ns;

        function requestQuote() {
            var script = document.createElement("script");
            script.src = 'http://54.93.64.181/heatmap-server/generate_quotes.php' + '?cahdebreaker=' + ii++ + '&jsonp_wrapper=heatMapQuotesHandler_ns&ticker=' + stock;
            //script.src = 'http://54.93.212.68/quotes/generate_quotes.php' + '?cahdebreaker='+ ii++ + '&jsonp_wrapper=heatMapQuotesHandler_ns&ticker=' + stock;
            // server returns "heatMapQuotesHandler_ns(...payload...);"
            document.getElementsByTagName("head")[0].appendChild(script);
            lastRequestTime = new Date();

        }

        function handleTimeout() {
            function checkTime() {
                if (new Date() - lastRequestTime > 30000) {
                    handleError("The server does not appear to be responding");
                    // displayError("The server does not appear to be responding");
                }
                window.setTimeout(checkTime, 5000);
            }

            window.setTimeout(checkTime, 5000);
        }


        handleTimeout();
        requestQuote();
        // payload: eg. { data: {stock: 'MSFT', price: 501.01, volume: 555444}}
        heatMapQuotesHandler_ns = function handler(payload) {
            lastRequestTime = new Date("2099-12-31");
            handleError("");
            if (payload.data !== undefined) {
                handleData(payload.data);
                // document.hmcontext.makeHeatMap(payload.data);
                requestQuote();     // I think we can assume that all errors are irrecoverable
            }
            else if (payload.err !== undefined) {
                handleError(payload.err);
                // displayError(payload.err);
            }
            else {
                handleError("Invalid payload returned from server");
                // displayError("Invalid payload returned from server");
            }
        }
    }
    document.hmcontext.quotesComms = xpublic;
})();


