/**
 * Created by mikedamay on 02/11/2016.
 */


var heatMapStocksHandler_ns;

function makeStockHandler() {
    var ii = 0;

    requestQuote();


    function requestQuote() {
        var script = document.createElement("script");
        // script.src = 'http://localhost/quotes/generate_quotes.php' + '?cahdebreaker='+ ii++ + '&jsonp_wrapper=heatMapQuotesHandler_ns&ticker=FB';
        script.src = 'http://frankfurt-rdp/quotes/list_stocks.php' + '?cahdebreaker='+ ii++ + '&jsonp_wrapper=heatMapStocksHandler_ns';
        // server returns "heatMapQuotesHandler_ns(...payload...);"
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    function displayError(msg) {
        document.getElementById("PayloadError").innerHTML = msg;
    }

    // payload: eg. { data: {stock: 'MSFT', price: 501.01, volume: 555444}}
    heatMapStocksHandler_ns = function handler(payload) {
        if ( payload.data !== undefined) {
            makeHeatMap(payload.data);
        }
        else if (payload.err !== undefined) {
            displayError(payload.err);
        }
        else {
            displayError("Invalid payload returned from server");
        }
    }
};


