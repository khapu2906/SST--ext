"use strict";
/**
 * Replicate CSS rule declaration method
 * @param e
 * @param style {string[]} - Valid CSS strings
 */
function appendCss(e, style) {
    e.style.cssText += style.join(";");
}
async function downloadAudio(blob) {
    try {
        const _anchor = document.createElement("a");
        const url = URL.createObjectURL(blob);
        _anchor.href = url;
        _anchor.download = crypto.randomUUID() + ".webm";
        _anchor.click();
    }
    catch (err) {
        console.log(`Error when converting. ${err}`);
    }
}
//# sourceMappingURL=utils.js.map