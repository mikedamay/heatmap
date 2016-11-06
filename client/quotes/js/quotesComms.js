// mike may, 29-Oct-2016

(function() {
    var ii = 0;
    var lastRequestTime = new Date("2099-12-31");
    var xpublic = {};
    var handleData;
    var handleError;
    var REQUEST_TIMEOUT = 30000;
    var TIMEOUT_CHECK_INTERVAL = 5000;

    xpublic.start = function start(stock, handleDataCallback, handleErrorCallback) {
        handleData = handleDataCallback;
        handleError = handleErrorCallback;

        function requestQuote() {
            var script = document.createElement("script");
            script.src = 'http://54.93.64.181/heatmap-server/generate_quotes.php' + '?cahdebreaker=' + ii++ + '&jsonp_wrapper=document.hmcontext.quotesComms.handleQuotes&ticker=' + stock;
            document.getElementsByTagName("head")[0].appendChild(script);
            lastRequestTime = new Date();
        }

        function handleTimeout() {
            window.clearTimeout();
            function checkTime() {
                if (new Date() - lastRequestTime > REQUEST_TIMEOUT) {
                    handleError("The server does not appear to be responding");
                }
                window.setTimeout(checkTime, TIMEOUT_CHECK_INTERVAL);
            }

            window.setTimeout(checkTime, TIMEOUT_CHECK_INTERVAL);
        }

        handleTimeout();
        requestQuote();

        // payload: eg. { data: {stock: 'MSFT', price: 501.01, volume: 555444}}
        xpublic.handleQuotes = function handler(payload) {
            lastRequestTime = new Date("2099-12-31");
            handleError("");
            if (payload.data !== undefined) {
                handleData(payload.data);
                requestQuote();     // I think we can assume that all errors are irrecoverable
            }
            else if (payload.err !== undefined) {
                handleError(payload.err);
            }
            else {
                handleError("Invalid payload returned from server");
            }
        }
    };
    document.hmcontext.quotesComms = xpublic;
})();


