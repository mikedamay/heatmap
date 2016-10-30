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

    /** too much effort to install mysqli or PDO on this custom rolled v5.4 installation */
    $conn = mysql_connect("localhost","quoter","thisusercando_nothing!!") or die("unable to connect to mysql on localhost");
    mysql_select_db("quotes") or die("failed to find database quotes");

//    $rs = mysql_query("select last_quote + 1 as last_quote_plus_one from last_quote where last_quote_id=1");

//    $row = mysql_fetch_assoc($rs);

//    $thisQuote = $row["last_quote_plus_one"];

//    $rsQuote = mysql_query("select stock, time_indicator, price, volume from quotes.quotes where quotes.quote_id=" . $thisQuote);
    $rsQuote = mysql_query($quoteQuery);
    $rowQuote = mysql_fetch_assoc($rsQuote);
    $res = mysql_query("update last_quote set last_quote=" . $rowQuote["quote_id"]);
    sleep(getRandomDelay());
    print "heatMapQuotesHandler_ns({ data: {" . "stock:" . "'" . $rowQuote["stock"] ."'" . ",price:" . $rowQuote["price"] . ",volume:" . $rowQuote["volume"] . "}})";
    mysql_close($conn);
?>
