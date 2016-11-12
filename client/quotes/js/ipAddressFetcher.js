/**
 * Created by mikedamay on 12/11/2016.
 */

(function() {
    document.hmcontext.newIpAddressFetcher = function newIpAddressFetcher(whencomplete) {
        var xreturn = {};
        xreturn.request = function request() {
            document.hmcontext.newJsonpComms("ipaddress")
                .request("http://mikedamay.co.uk/ipaddress.json?dummy=1", "no_action", handleResponse, displayError);

        };
        // payload = ip address, e.g. "54.93.106.105"
        function handleResponse(payload) {
            whencomplete(payload);

        }
        function displayError(msg) {
            document.getElementById("PayloadError").innerHTML = msg;
        }

        return xreturn;

    }
})();
