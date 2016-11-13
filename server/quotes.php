<?php
// mike may, 28-Oct-2016

/**
 * this module serves up either all available stocks or the next quote of
 * some given stock.
 * usage: /heatmap-server/quotes.php?jsonp_wraper=mywrapper&action=list_stocks
 * returns: mywrapper({data: ['MSFT','FB']})
 * usage: heatmap-server/quotes.php?jsonp_wraper=mywrapper&action=generate_quotes&ticker=MSFT
 * returns: mywrapper({data: {stock:'MSFT', price:100.0, volume: 10000}})
 */

if ($_GET["action"] == "generate_quotes") {
    $action = function($conn) {
        $ticker = $_GET['ticker'];
        function getRandomDelay() {
            static $normalishDistribution = array(
                1 => 1
            ,2 => 3
            ,3 => 3
            ,4 => 5
            ,5 => 5
            ,6 => 5
            ,7 => 5
            ,8 => 7
            ,9 => 7
            ,10 => 9
            );

            return $normalishDistribution[round(rand(1,10))];
        }
// get the next quote.  The id is provided by examining the value of
// last_quote and finding the next in sequence or if we have reached the
// end of the table then starting from the beginning
        $quoteQuery = "
        SELECT
          quote_id,
          time_indicator,
          price,
          volume
        FROM quotes.quotes
        WHERE quote_id =
              CASE WHEN (SELECT last_quote_id
                         FROM stocks where ticker = '$ticker')
                        >= (SELECT max(quote_id)
                            FROM quotes where stock_id = (select stock_id from stocks where ticker = '$ticker'))
                THEN (SELECT min(quote_id)
                      FROM quotes where stock_id = (select stock_id from stocks where ticker = '$ticker'))
              ELSE (SELECT min(quote_id)
                    FROM quotes
                    WHERE quote_id > (SELECT last_quote_id
                                      FROM stocks where ticker = '$ticker')
                    and stock_id = (select stock_id from stocks where ticker = '$ticker')) END
";

        if (!($rsQuote = mysql_query($quoteQuery))) {
            throw new Exception("quotes query failed. " . mysql_error($conn));
        }
        $rowQuote = mysql_fetch_assoc($rsQuote);
        if (!$rowQuote) {
            throw new Exception("quotes query failed.  There are no quotes for $ticker");
        }

        if (!mysql_query("update stocks set last_quote_id=" . $rowQuote["quote_id"] . " where ticker ='$ticker'")) {
            throw new Exception("failed to update stocks with last_quote_id. " . mysql_error($conn));
        }
        sleep(getRandomDelay());
        $payload = json_encode(array('data' => array(
            'stock' => $ticker
        , 'price' => (double)$rowQuote["price"]
        , 'volume' => (int)$rowQuote["volume"]
        )));
        return $payload;
    };
}
else { // $_GET["action"] == "stock_list")
    $action = function($conn) {
        if (!($rs = mysql_query("select ticker from stocks order by ticker"))) {
            throw new Exception("stocks query failed. " . mysql_error($conn));
        }
        $stocks = [];
        $ii = 0;
        while($row = mysql_fetch_assoc($rs)) {
            $stocks[$ii] = $row["ticker"];
            $ii++;
        }
        if ( $ii === 0 ) {
            throw new Exception("No quotes exist in the database");
        }
        $stocks = array_values($stocks);
        $payload = json_encode(array('data' => $stocks));
        return $payload;
    };
}



$jsonpWrapper = $_GET['jsonp_wrapper'];
$host = "localhost"; $userName = "quoter"; $password = "thisusercando_nothing!!"; $db = "quotes";
$conn = null;
try {
    /** too much effort to install mysqli or PDO on this custom rolled v5.4 installation */
    if (!($conn = mysql_connect($host,$userName, $password))) {
        throw new Exception("unable to connect to mysql on $host as user $userName. " . mysql_error($conn));
    }
    if (!mysql_select_db($db)) {
        throw new Exception("missing database $db. " . mysql_error($conn));
    }
    $payload = $action($conn);
    print ($jsonpWrapper === null ? $payload : "$jsonpWrapper( " . $payload . ")");
    mysql_close($conn);
}
catch (Exception $ex) {
    $payload = json_encode(array('err' => $ex->getMessage())) ;
    print ($jsonpWrapper === null ? $payload : "$jsonpWrapper( " . $payload . ")");
    try {mysql_close($conn);} catch(Exception $ex2) {}
}
?>
