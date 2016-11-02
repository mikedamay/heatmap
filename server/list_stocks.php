<?php

$jsonpWrapper = $_GET['jsonp_wrapper'];
$conn=null;
try {
    $host = "localhost"; $userName = "quoter"; $password = "thisusercando_nothing!!"; $db = "quotes";
    if (!($conn = mysql_connect($host,$userName, $password))) {
        throw new Exception("unable to connect to mysql on $host as user $userName. " . mysql_error($conn));
    }
    if (!mysql_select_db($db)) {
        throw new Exception("missing database $db. " . mysql_error($conn));
    }
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
    print ($jsonpWrapper === null ? $payload : "$jsonpWrapper( " . $payload . ")");
    mysql_close($conn);
}
catch (Exception $ex) {
    $payload = json_encode(array('err' => $ex->getMessage())) ;
    print ($jsonpWrapper === null ? $payload : "$jsonpWrapper( " . $payload . ")");
    try {mysql_close($conn);} catch(Exception $ex2) {}
}

?>