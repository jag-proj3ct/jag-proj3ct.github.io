/**
 * Detects if the device has touch capability and adds a corresponding
 * class to the <body> element for CSS targeting.
 */
(function() {
    // Standard way to check for touch capabilities on modern browsers
    // maxTouchPoints > 0 is reliable for identifying touch devices (mobiles, tablets)
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
        document.body.classList.add('touch-device');
    } else {
        // This is primarily for debugging/desktop optimization
        document.body.classList.add('no-touch-device');
    }
})();
