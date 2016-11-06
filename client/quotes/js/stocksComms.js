/**
 * Created by mikedamay on 02/11/2016.
 */

// depends on init.js

(function() {
    var ii = 0;
    var xpublic = {};
    var handleData;
    var handleError;

    xpublic.requestStocks = function requestStocks(handleDataCallback, handleErrorCallback) {
        handleData = handleDataCallback;
        handleError = handleErrorCallback;
        var script = document.createElement("script");
        script.src = 'http://54.93.64.181//heatmap-server/list_stocks.php' + '?cahdebreaker='+ ii++
          + '&jsonp_wrapper=' + encodeURIComponent('document.hmcontext.stocksComms.handleStocks');
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    // payload: eg. { data: {stock: 'MSFT', price: 501.01, volume: 555444}}
    //          or { err: 'stuff has gone bad' }
    xpublic.handleStocks = function handler(payload) {
        if ( payload.data !== undefined) {
            // document.hmcontext.stocksFetcher.populateStocksList(payload.data);
            handleData(payload.data);
        }
        else if (payload.err !== undefined) {
            // document.hmcontext.stocksFetcher.displayError(payload.err);
            handleError(payload.err);
        }
        else {
            handleError("Invalid payload returned from server");
            // document.hmcontext.stocksFetcher.displayError(
            //   "Invalid payload returned from server");
        }
    }
    document.hmcontext.stocksComms = xpublic;
})();
