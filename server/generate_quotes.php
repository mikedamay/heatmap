<?php
    // mike may, 28-Oct-2016
    /** too much effort to install mysqli or PDO on this custom rolled v5.4 installation */
    $conn = mysql_connect("localhost","quoter","thisusercando_nothing!!") or die("unable to connect to mysql on localhost");
    mysql_select_db("quotes") or die("failed to find database quotes");

    $rs = mysql_query("select last_quote + 1 as last_quote_plus_one from last_quote where last_quote_id=1");

    $row = mysql_fetch_assoc($rs);

    $thisQuote = $row["last_quote_plus_one"];

    $rsQuote = mysql_query("select stock, time_indicator, price, volume from quotes.quotes where quotes.quote_id=" . $thisQuote);
    $res = mysql_query("update last_quote set last_quote=last_quote + 1");
    $rowQuote = mysql_fetch_assoc($rsQuote);

    print "{ data: {" . "stock:" . "'" . $rowQuote["stock"] ."'" . ",price:" . $rowQuote["price"] . ",volume:" . $rowQuote["volume"] . "}}";
?>
