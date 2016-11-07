/**
 * Created by mikedamay on 02/11/2016.
 */

// depends on init.js

/**
 * usage:
 * document.hmcontext.stockComms.requestStocks(dataCallback, errorCallback);
 */

(function() {
    var ii = 0;
    var xpublic = {};
    var handleData;
    var handleError;

    /**
     * calls server to provide list of stocks
     * typically the server response will look something like the following
     * "document.hmcontext.stocksComms( {data: [ 'stockA', 'stockB']}"
     * @param handleDataCallback fn(data-payload) where payload e.g.
     *   ['AAPL', 'IBM']
     * @param handleErrorCallback fn(error-payload) where payload e.g. "something went wrong"
     */
    xpublic.requestStocks = function requestStocks(handleDataCallback, handleErrorCallback) {
        handleData = handleDataCallback;
        handleError = handleErrorCallback;
        var script = document.createElement("script");
        script.src = '/heatmap-server/quotes.php' + '?cahdebreaker='+ ii++
          + '&jsonp_wrapper=' + encodeURIComponent('document.hmcontext.stocksComms.handleStocks') + '&action=list_stocks';
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    // called back using jsonp appr=oach
    // payload: eg. { data: ['MSFT', 'IBM']}
    //          or { err: 'stuff has gone bad' }
    xpublic.handleStocks = function handler(payload) {
        if ( payload.data !== undefined) {
            handleData(payload.data);
        }
        else if (payload.err !== undefined) {
            handleError(payload.err);
        }
        else {
            handleError("Invalid payload returned from server");
        }
    };
    document.hmcontext.stocksComms = xpublic;
})();
