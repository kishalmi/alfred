/**
 * add an invisible button to the top left corner,
 *  that loads webroot / if held for tLong and released
 */

(function () {
    var tLong = 2000; // [ms]
    function onLongClick() {
        document.location.href = "/";
    }

    // inject button div when ready
    document.addEventListener('DOMContentLoaded', function () {
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = '0';
        div.style.top = '0';
        div.style.zIndex = '99999';
        div.style.width = '64px';
        div.style.height = '64px';
        div.style.borderBottomRightRadius = '16px';
        div.style.background = 'rgba(255,50,0,0.25)';

        var tDown;
        div.addEventListener('mouseup', function () {
            if (tDown && (new Date().getTime() - tDown) > tLong)
                onLongClick();
            tDown = 0; // reset tDown, so 'up' only doesnt trigger
        });
        div.addEventListener('mousedown', function () {
            tDown = new Date().getTime();
        });

        document.body.appendChild(div);
    }, false);
})();