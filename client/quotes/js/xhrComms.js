// mike may 28-Oct-2016


(function XhrComms(){

    document.hmcontext.newXhrComms = function newXhrComms() {
        var xpublic = {};
        var xreturn = {};
        var xhr = new XMLHttpRequest();
        var handleData;
        var handleError;

        xpublic.request = xreturn.request = function request(endpoint, handleDataCallback, handleErrorCallback) {
            handleData = handleDataCallback;
            handleError = handleErrorCallback;
            try {
                xhr.open("GET", endpoint);
                xhr.send();

            }
            catch(ex) {
                alert("request failed:");
            }
        };

        xhr.onreadystatechange = function displayQuoteOrError() {
            // TODO - we are unnecessarily processing some responses
            // and possibly processing others multiple times.
            // This does not seem to affect function but who
            // knows what will happen in future
            if (xhr.status === 200 ) {
                var payload = JSON.parse(xhr.responseText);
                if ( payload.data !== undefined) {
                    handleData(payload.data);
                }
                else if (payload.err !== undefined) {
                    handleError(payload.err);
                }
                else {
                    handleError("Invalid payload returned from server");
                }
            }
            else {
                handleError("status " + xhr.status);
            }
        };
        document.hmcontext.xhrComms = xpublic;
        return xreturn;
    };
})();
