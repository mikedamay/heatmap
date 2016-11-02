<?php


try {
    $host = "localhost"; $userName = "quoter"; $password = "thisusercando_nothing!!"; $db = "quotes";
    if (!($conn = mysql_connect($host,$userName, $password))) {
        throw new Exception("unable to connect to mysql on $host as user $userName. " . mysql_error($conn));
    }
    if (!mysql_select_db($db)) {
        throw new Exception("missing database $db. " . mysql_error($conn));
    }
    if (!($rs = mysql_query("select ticker from stocks order by ticker"))) {
        throw new Exception("quotes query failed. " . mysql_error($conn));
    }
    $stocks = [];
    $ii = 0;
    while($row = mysql_fetch_assoc($rs)) {
        $stocks[$ii] = $row["ticker"];
        $ii++;
    }
    $stocks = array_values($stocks);
    $payload = json_encode(array('data' => $stocks));
    print "heatMapStocksHandler_ns( " . $payload . ")";
    mysql_close($conn);
}
catch (Exception $ex) {
    print "heatMapStocksHandler_ns( " . json_encode(array('err' => $ex->getMessage())) . ")";
}

?>