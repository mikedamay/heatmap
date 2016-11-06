/**
 * Created by mikedamay on 06/11/2016.
 */

// depends on init.js and stocksComms
/**
 * this plays at the model level - it does level type things such as
 * formatting and validation before calling back the view-model
 */
(function() {
    var xpublic = {};

    xpublic.requestStocks = function requestStocks() {
        document.hmcontext.stocksComms.requestStocks(
            populateStocksList, displayError
        );
    };
    // TODO move to quotesVM
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
