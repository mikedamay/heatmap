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

    var whencomplete;
    /**
     *
     * @param whencompleteArg - typically a function that kicks off the quotes acquisition
     * routine.  It is called when the stocks have been returned by the server
     */
    xpublic.requestStocksAndPopulateDropDown = function requestStocks(whencompleteArg) {
        document.hmcontext.newComms()
          .request("/heatmap-server/quotes.php?action=list_stocks", populateStocksList, displayError);
        whencomplete = whencompleteArg;
    };
    // TODO move to quotesVM
    function populateStocksList(stocks) {
        var stockList = document.getElementById("StockList");
        if (stocks.length === 0) {
            displayError("no stocks available on server");
            return;
        }
        for ( var stock in stocks) {
            var opt = document.createElement("OPTION");
            opt.text = stocks[stock];
            opt.value = stocks[stock];
            stockList.options.add(opt);
        }
        if (stockList.options.selectedIndex === -1) {
            stockList.value = stockList.options.item(0).value;
        }
        whencomplete(stockList.value);
    }

    function displayError(msg) {
        document.getElementById("PayloadError").innerHTML = msg;
    }

    document.hmcontext.stocksFetcher = xpublic;

})();
