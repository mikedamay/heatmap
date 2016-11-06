// mike may 28-Oct-2016


var xhr = new XMLHttpRequest();

requestQuote();

function requestQuote() {
    try {
        xhr.open("GET", "http://localhost/quotes/quotes.php");
        xhr.send();

    }
    catch(ex) {
        alert("request failed:");
    }
}

xhr.onreadystatechange = function displayQuoteOrError() {
    if (xhr.status === 200 ) {
        alert(xhr.responseText);
        requestQuote();

    }
};
