/**
 * Created by mikedamay on 06/11/2016.
 */

// dependent on init.js

(function() {
    document.hmcontext.getQuotesHelper = function getQuotesHelper() {
        var xpublic = {};

        xpublic.renderTileInterior = function renderTileInterior(div, idx, tiles) {
            // this is pretty horrible (such a local operation taking dependenies on
            // affecting the document as a whole, but...
            // Even given the above compromise - calculatoing used height and widht
            // is non-trivial.  The following 'M' based approach is sufficient
            // for our purposes
            function isSufficientArea() {
                var body = document.getElementsByTagName("body")[0];
                var divTest = document.createElement("div");
                divTest.innerHTML = "M";
                divTest.style.position = "absolute";
                divTest.style.visibility = "hidden";
                divTest.style.display='flex';
                divTest.style.alignItems='center';
                divTest.style.justifyContent='center';
                divTest.style.height = "auto";
                divTest.style.width = "auto";
                body.appendChild(divTest);
                // can the largest possible text fit on two lines or on one line
                var res = div.clientHeight >= divTest.clientHeight*2 && div.clientWidth >= divTest.clientWidth * 8
                    || div.clientWidth >= divTest.clientWidth * 16;
                divTest.remove();
                return res;
            }
            // TODO: I cannot make this display multi-line - resize will cause it to display multi-line but not
            // the initial display.
            var text = this.get_extraData().area + ' @'  + this.get_extraData().range;
            div.className = "";
            if (isSufficientArea() ) {
                div.innerHTML =  text;
                div.style.display='flex';
                div.style.alignItems='center';
                div.style.justifyContent='center';
            }
            else {
                var span = document.createElement('span');
                span.innerHTML = text;
                span.className = "tooltipx";
                span.style.backgroundColor = "white";
                span.style.border = "black 1px solid";
                div.className = "ht";
                div.appendChild(span);
            }
            if (tiles[0].get_extraData().lastUpdateIdx == idx) {
                div.className = div.className + " flash";
            }
            else {
                div.className = div.className + " noflash";
            }
        };
        return xpublic;
    }
})();