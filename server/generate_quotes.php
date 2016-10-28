<?php
/**
 * Created by IntelliJ IDEA.
 * User: mike
 * Date: 27/10/16
 * Time: 19:03
 */

/** too much effort to install mysqli or PDO on this custom rolled v5.4 installation */
$conn = mysql_connect("localhost","quoter","thisusercando_nothing!!") or die("unable to connect to mysql on localhost");
mysql_select_db("quotes") or die("failed to find database quotes");

$rs = mysql_query("select last_quote from last_quote where last_quote_id=1");

$row = mysql_fetch_assoc($rs);

$lastQuote = $row["last_quote"];
$thisQuote = $lastQuote + 1;

$rsQuote = mysql_query("select stock, time_indicator, price, volume from quotes.quotes where quotes.quote_id=" . $thisQuote);
$res = mysql_query("update last_quote set last_quote=last_quote + 1");
print "last_quote = " . $row["last_quote"] . "<br>";
$rowQuote = mysql_fetch_assoc($rsQuote);

print "price = " . $rowQuote["price"] . "<br>";


?>
other stuff
