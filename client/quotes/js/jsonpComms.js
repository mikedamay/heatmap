/**
 * Created by mikedamay on 02/11/2016.
 */

// depends on init.js

/**
 * usage:
 * document.hmcontext.newJsonpComms().request( endpoint, dataCallback, errorCallback);
 */

(function jsonpComms() {
    var tt = 111;
    // The well known address is on S3.  When the quote server starts on ed2 it drops a file
    // onto s3 with its ip address on.  We need to pick that up before making
    // the first call using jsonpComms.
    var ipaddress = "not set";      // "" or "http://nn.nn.nn.nn"
                                    // starts as "not set"
                                    // changes to "" when request is sent for the actual ip address
                                    // changes to the actual ip address on when ipAddressFetcher
                                    // gets a response
                                    // now other components can make requests using jsonpComms.
                                    // TODO
                                    // this relies on our making only one call at a time
                                    // to jsonpComms - it won't handle multiple concurrent calls
                                    // before we have the real ip address
    document.hmcontext.newJsonpComms = function(userSpecifiedTag) {
        var xpublic = {};
        var xreturn = {};
        var handleData;
        var handleError;
        var tag;
        var REQUEST_TIMEOUT = 30000;
        var TIMEOUT_CHECK_INTERVAL = 5000;
        var userSpecifiedTag;
        var ii = 0;
        if (userSpecifiedTag !== undefined)
            tag = userSpecifiedTag;
        else
            tag = "t" + tt++;

        /**
         * calls server to provide list of stocks for the quotes screen or the ipaddress for jsonp calls
         * typically the server response will look something like the following
         * "document.hmcontext.handleJsonpResponse( {data: [ 'stockA', 'stockB']}"
         * or document.hmcontent.handleJsonpResponse{ data: '54.93.105.168'}
         * @param endpoint e.g. '/heatmap-server/quotes.php?action=list_stocks'
         * @param handleDataCallback fn(data-payload) where payload e.g.
         *   ['AAPL', 'IBM']
         * @param handleErrorCallback fn(error-payload) where payload e.g. "something went wrong"
         */
        xreturn.request = xpublic.request = function request(endpoint, action, handleDataCallback, handleErrorCallback) {
            if (ipaddress === "not set") {
                ipaddress = "";     // we are about to recurse into jsonpComms.
                document.hmcontext.newIpAddressFetcher(function(ipaddress) {
                    var jsonpComms = document.hmcontext.newJsonpComms();
                    jsonpComms.setIpAddress("http://" + ipaddress);
                    jsonpComms.request(endpoint, action, handleDataCallback, handleErrorCallback);
                }).request();
                return;
            }

            handleData = handleDataCallback;
            handleError = handleErrorCallback;
            var script = document.createElement("script");
            script.src = ipaddress + endpoint
                + '&cahdebreaker=' + + Math.floor(Math.random() * 100)
                + '&jsonp_wrapper=' + encodeURIComponent('document.hmcontext.jsonpComms.' + tag + '.handleJsonpResponse')
                + '&action=' + action;
            document.getElementsByTagName("head")[0].appendChild(script);
            lastRequestTime = new Date();
            handleTimeout();
        };
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


        xreturn.setIpAddress = xpublic.setIpAddress = function setIpAddress(ipaddressArg) {
            ipaddress = ipaddressArg;
        };
        // called back using jsonp appr=oach
        // payload: eg. { data: ['MSFT', 'IBM']}
        //          or { err: 'stuff has gone bad' }
        xpublic.handleJsonpResponse = function handleJsonpResponse( payload) {
            lastRequestTime = new Date("2099-12-31");
            if ( payload.data !== undefined) {
                handleData(payload.data);
            }
            else if (payload.err !== undefined) {
                handleError(payload.err);
            }
            else {
                handleError("Invalid payload returned from server");
            }
            // delete document.hmcontext.jsonpComms[tag];
        };
        if (document.hmcontext.jsonpComms == undefined) {
            document.hmcontext.jsonpComms = {};
        }
        document.hmcontext.jsonpComms[tag] = xpublic;
        return xreturn;
    };
})();
