/**
 * Created by mikedamay on 02/11/2016.
 */

// depends on init.js

/**
 * usage:
 * document.hmcontext.newJsonpComms().request( endpoint, dataCallback, errorCallback);
 */

(function() {
    var ii = 0;
    document.hmcontext.newJsonpComms = function() {
        var ii = 0;
        var xpublic = {};
        var xreturn = {};
        var handleData;
        var handleError;
        var tag = "t" + ii++;

        /**
         * calls server to provide list of stocks for the quotes screen or the ipaddress for jsonp calls
         * typically the server response will look something like the following
         * "document.hmcontext.handleJsonpResponse( {data: [ 'stockA', 'stockB']}"
         * or document.hmcontent.handleJsonpResponse{ data: '54.93.105.168'}
         * @param endpoint e.g. 'http://52.59.219.94/heatmap-server/quotes.php?action=list_stocks'
         * @param handleDataCallback fn(data-payload) where payload e.g.
         *   ['AAPL', 'IBM']
         * @param handleErrorCallback fn(error-payload) where payload e.g. "something went wrong"
         */
        xreturn.request = function request(endpoint, handleDataCallback, handleErrorCallback) {
            handleData = handleDataCallback;
            handleError = handleErrorCallback;
            var script = document.createElement("script");
            script.src = endpoint
                + '&cahdebreaker=' + ii
                + '&jsonp_wrapper=' + encodeURIComponent('document.hmcontext.jsonpComms.' + tag + '.handleJsonpResponse')
                + '&action=list_stocks';
            document.getElementsByTagName("head")[0].appendChild(script);
        };

        // called back using jsonp appr=oach
        // payload: eg. { data: ['MSFT', 'IBM']}
        //          or { err: 'stuff has gone bad' }
        xpublic.handleJsonpResponse = function handleJsonpResponse( payload) {
            if ( payload.data !== undefined) {
                handleData(payload.data);
            }
            else if (payload.err !== undefined) {
                handleError(payload.err);
            }
            else {
                handleError("Invalid payload returned from server");
            }
            delete document.hmcontext.jsonpComms[tag];
        };
        if (document.hmcontext.jsonpComms == undefined) {
            document.hmcontext.jsonpComms = {};
        }
        document.hmcontext.jsonpComms[tag] = xpublic;
        return xreturn;
    };
})();
