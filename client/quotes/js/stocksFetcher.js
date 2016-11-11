/**
 * Created by mikedamay on 06/11/2016.
 */

// depends on init.js and jsonpComms
/**
 * this plays at the model level - it does level type things such as
 * formatting and validation before calling back the view-model
 */
(function() {
    var xpublic = {};

    xpublic.requestStocksAndPopulateDropDown = function requestStocks() {
        document.hmcontext.newJsonpComms()
          .request("http://54.93.170.161/heatmap-server/quotes.php?action=list_stocks"
          , populateStocksList, displayError);
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
