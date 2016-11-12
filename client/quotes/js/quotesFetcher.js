/**
 * Created by mikedamay on 06/11/2016.
 */

// depends on init.js and quotesComms
/**
 * this plays at the model level - it does level type things such as
 * formatting and validation before calling back the view-model
 */
(function quotesFetcher() {
    xpublic = {};
    var assert = document.hmcontext.assert;
    var handleData;
    var stock;
    var jsonpComms;

    xpublic.requestQuotes = function requestQuotes(stockArg, dataHandlerCallback) {
        stock = stockArg;
        // document.hmcontext.quotesComms.start(stockArg, handleQuote, displayError);
        if (jsonpComms === undefined) {
            jsonpComms = document.hmcontext.newJsonpComms();
        }
        jsonpComms.request("/heatmap-server/quotes.php?dummy=1", "generate_quotes&ticker=" + stock, handleQuote, displayError);
        handleData = dataHandlerCallback;
    };

    xpublic.setStock = function setStock(stockArg) {
        stock = stockArg;
    };
    function displayError(msg) {
        document.getElementById("PayloadError").innerHTML = msg;
    }
    function validate(payload) {
        if (payload.price === undefined || payload.volume === undefined || payload.stock === undefined) {
            displayError("payload has invalid format: " + JSON.stringify(payload));
            return false;
        }
        if ( payload.stock !== stock) {
            return false;   // when the stock is changed there will usually be
                            // an unwanted trailing update
        }
        return true;
    }
    function handleQuote(payload) {
        // requestQuotes(stock, handleQuote);
        if (!validate(payload)) {
            return;
        }
        handleData(payload);
        jsonpComms.request("/heatmap-server/quotes.php?dummy=1", "generate_quotes&ticker=" + stock, handleQuote, displayError);
    }
    document.hmcontext.quotesFetcher = xpublic;
})();