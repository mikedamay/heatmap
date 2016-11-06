/**
 * Created by mikedamay on 06/11/2016.
 */

if (document.hmcontext === undefined) {
    document.hmcontext = {};

    document.hmcontext.assert = function(cond, message ) {
        if (!cond ) {
            throw "assertionFailure: " +  message;
        }
    };
}
