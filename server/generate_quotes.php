<?php
// mike may, 28-Oct-2016
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

$ticker = $_GET['ticker'];
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
$host = "localhost"; $userName = "quoter"; $password = "thisusercando_nothing!!"; $db = "quotes";
try {
    /** too much effort to install mysqli or PDO on this custom rolled v5.4 installation */
    if (!($conn = mysql_connect($host,$userName, $password))) {
        throw new Exception("unable to connect to mysql on $host as user $userName. " . mysql_error($conn));
    }
    if (!mysql_select_db($db)) {
        throw new Exception("missing database $db. " . mysql_error($conn));
    }
    if (!($rsQuote = mysql_query($quoteQuery))) {
        throw new Exception("quotes query failed. " . mysql_error($conn));
    }
    $rowQuote = mysql_fetch_assoc($rsQuote);
    if (!mysql_query("update stocks set last_quote_id=" . $rowQuote["quote_id"] . " where ticker ='$ticker'")) {
        throw new Exception("failed to update stocks with last_quote_id. " . mysql_error($conn));
    }
    sleep(getRandomDelay());
    $payload = "heatMapQuotesHandler_ns("
      . json_encode(array('data' => array(
      'stock' => $ticker
      , 'price' => (double)$rowQuote["price"]
      , 'volume' => (int)$rowQuote["volume"]
      ))) . ")";
    print $payload;
    mysql_close($conn);
}
catch (Exception $ex) {
    print "heatMapQuotesHandler_ns( " . json_encode(array('err' => $ex->getMessage())) . ")";
}
?>
