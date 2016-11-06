/**
 * Created by mikedamay on 06/11/2016.
 */

(function() {
    xpublic = {};
    var assert = document.hmcontext.assert;
    var handleData;

    xpublic.requestQuotes = function requestQuotes(stock, dataHandlerCallback) {
        document.hmcontext.quotesComms.start(stock, handleData, displayError)
        handleData = dataHandlerCallback;
    }

    function displayError(msg) {
        document.getElementById("PayloadError").innerHTML = msg;
    }
    function validate(payload) {
        if (payload.price === undefined || payload.volume === undefined) {
            displayError("payload has invalid format: " + JSON.stringify(payload));
            return false;
        }
        return true;
    }
    function handleData(payload) {
        if (!validate(payload)) {
            return;
        }
        handleData(payload);
        // document.hmcontext.makeHeatMap(payload);
    }
    document.hmcontext.quotesFetcher = xpublic;
})();