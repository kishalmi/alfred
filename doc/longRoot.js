/**
 * add an "invisible button" to the top left corner (actually just a zone),
 *  that loads webroot / if held long enough
 */

(function () {
    var sButton = 64; // [px] size of button area
    var tLong = 2000; // [ms] time needed to hold button

    function onLongClick() {
        document.location.href = "/";
    }

    function isInZone(e) {
        return e.pageX < sButton && e.pageY < sButton; // top left corner
    }

    // inject button div when ready
    document.addEventListener('DOMContentLoaded', function () {


        var tDown;

        document.addEventListener('mouseup', function (e) {
            if (isInZone(e) && tDown && (new Date().getTime() - tDown) > tLong)
                onLongClick();
            tDown = 0; // reset tDown, so 'up' only doesnt trigger
        });
        document.addEventListener('mousedown', function (e) {
            if (isInZone(e))
                tDown = new Date().getTime();
        });

    }, false);
})();