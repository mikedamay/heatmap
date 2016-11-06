/**
 * Created by mikedamay on 06/11/2016.
 */

// depends on init.js
(function() {
    var xpublic = {};

    xpublic.requestStocks = function requestStocks() {
        document.hmcontext.stocksComms.requestStocks(
            populateStocksList, displayError
        );
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

    document.hmcontext.stocksFetcher = xpublic;

})();
