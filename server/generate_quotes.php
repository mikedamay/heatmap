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
// get the next quote.  The id is provided by examining the value of
// last_quote and finding the next in sequence or if we have reached the
// end of the table then starting from the beginning
$quoteQuery = "
        SELECT
          quote_id,
          stock,
          time_indicator,
          price,
          volume
        FROM quotes.quotes
        WHERE quote_id =
              CASE WHEN (SELECT last_quote
                         FROM last_quote)
                        >= (SELECT max(quote_id)
                            FROM quotes)
                THEN (SELECT min(quote_id)
                      FROM quotes)
              ELSE (SELECT min(quote_id)
                    FROM quotes
                    WHERE quote_id > (SELECT last_quote
                                      FROM last_quote)) END
";
try {
    /** too much effort to install mysqli or PDO on this custom rolled v5.4 installation */
    $host = "localhost"; $userName = "quoter"; $password = "thisusercando_nothing!!"; $db = "quotes";
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
    if (!mysql_query("update last_quote set last_quote=" . $rowQuote["quote_id"])) {
        throw new Exception("failed to update last_quote. " . mysql_error($conn));
    }
    sleep(getRandomDelay());
    print "heatMapQuotesHandler_ns({ data: {" . "stock:" . "'" . $rowQuote["stock"] . "'" . ",price:" . $rowQuote["price"] . ",volume:" . $rowQuote["volume"] . "}})";
    mysql_close($conn);
}
catch (Exception $ex) {
    print "heatMapQuotesHandler_ns({ err: \"" . $ex->getMessage() . "\"})";
}
?>
