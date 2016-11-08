/**
 * Created by mikedamay on 08/11/2016.
 */
/**
 * Created by mikedamay on 06/11/2016.
 */

// dependent on init.js

(function() {
    document.hmcontext.getTestDataHelper = function getTestDataHelper() {
        var xpublic = {};

        xpublic.renderTileInterior = function renderTileInterior(div) {
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
                // the testTile is used to roughly calculate the typical area required by the text
                // var testTile = {renderInnerTile: renderInnerTile, get_extraData: function() {return '1234';}};
                divTest.style.display='flex';
                divTest.style.alignItems='center';
                divTest.style.justifyContent='center';
                divTest.style.height = "auto";
                divTest.style.width = "auto";
                body.appendChild(divTest);
                var res = div.clientHeight >= divTest.clientHeight*2 && div.clientWidth >= divTest.clientWidth * 8;
                divTest.remove();
                return res;
            }
            var text = 'rather longish text - ' + this.get_extraData().area;
            if (isSufficientArea() ) {
                div.innerHTML = text;
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
        };
        return xpublic;
    }
})();