// mike may, 29-Oct-2016

var ii = 0;

requestQuote();


function requestQuote() {
    var tag = document.createElement("script");
    tag.src = 'http://localhost/quotes/generate_quotes.php' + '?cachebreaker=' + ii++;

    document.getElementsByTagName("head")[0].appendChild(tag);
}

function handler(payload) {
/*
    var test_async = document.getElementById("test_async");
    var para = document.createElement("p");
    para.innerHTML = "handler is active " +payload.data.price + " "+ ii; ii++;
    test_async.appendChild(para);
*/
    makeHeatMap(payload.data);
    requestQuote();
}

