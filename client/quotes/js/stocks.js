/**
 * Created by mikedamay on 02/11/2016.
 */

(function() {
    var ii = 0;
    if (document.hmcontext === undefined) {
        document.hmcontext = {};
    }

    requestStocks();


    function requestStocks() {
        var script = document.createElement("script");
        script.src = 'http://localhost/heatmap-server/list_stocks.php' + '?cahdebreaker='+ ii++
          + '&jsonp_wrapper=' + encodeURIComponent('document.hmcontext.handleStocks');
        // server returns "doument.hmcontext.handleStocks(...payload...);"
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    function populateStocksList(stocks) {
        var stockList = document.getElementById("StockList");

        for ( var stock in stocks) {
            var opt = document.createElement("OPTION");
            opt.text = stocks[stock];
            opt.value = stocks[stock];
            stockList.options.add(opt);
        }
    }

    function displayError(msg) {
        document.getElementById("PayloadError").innerHTML = msg;
    }

    // payload: eg. { data: {stock: 'MSFT', price: 501.01, volume: 555444}}
    document.hmcontext.handleStocks = function handler(payload) {
        if ( payload.data !== undefined) {
            populateStocksList(payload.data);
            heatMapQuotesHandler_ns = doheatMapQuotesHandler_ns();
        }
        else if (payload.err !== undefined) {
            displayError(payload.err);
        }
        else {
            displayError("Invalid payload returned from server");
        }
    }
})();
