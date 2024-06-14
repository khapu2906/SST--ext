"use strict";
const input_types = [
    "text",
    "password",
    "email",
    "search",
    "tel",
    "number",
    "url",
];
// Get interesting inputs and textareas
function crawl() {
    const inputs = Array.from(document.querySelectorAll("input")).filter((input) => {
        const domRect = input.getBoundingClientRect();
        // honey pot trap
        if (0 == domRect.width && 0 == domRect.height) {
            return false;
        }
        return (input.disabled == false &&
            input.type != "hidden" &&
            input_types.includes(input.type));
    });
    const textareas = Array.from(document.querySelectorAll("textarea")).filter((area) => area.disabled == false && area.type != "hidden");
    const editables = Array.from(document.querySelectorAll("[contenteditable=true]"));
    const dataLexicalDditor = Array.from(document.querySelectorAll("[data-lexical-editor=true]"));
    return [...inputs, ...textareas, ...editables, ...dataLexicalDditor].map((element) => element);
}
//# sourceMappingURL=crawler.js.map