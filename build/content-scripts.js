/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./scripts/crawler.ts":
/*!****************************!*\
  !*** ./scripts/crawler.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isInterestedInput = void 0;
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
    const inputs = Array.from(document.querySelectorAll("input")).filter((input) => input.disabled == false &&
        input.type != "hidden" &&
        input_types.includes(input.type));
    const textareas = Array.from(document.querySelectorAll("textarea")).filter((area) => area.disabled == false && area.type != "hidden");
    const editables = Array.from(document.querySelectorAll("[contenteditable=true]"));
    const dataLexicalDditor = Array.from(document.querySelectorAll("[data-lexical-editor=true]"));
    return [...inputs, ...textareas, ...editables, ...dataLexicalDditor]
        .map((element) => element)
        .filter((element) => {
        // honey pot trap
        const domRect = element.getBoundingClientRect();
        return 0 < domRect.width && 0 < domRect.height;
    });
}
exports["default"] = crawl;
function isInterestedInput(element) {
    let interesting = false;
    if (element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement) {
        interesting =
            element.disabled == false &&
                element.type != "hidden" &&
                input_types.includes(element.type);
    }
    else if (element.isContentEditable ||
        element.dataset.lexicalEditor == "true") {
        interesting = true;
    }
    if (interesting) {
        const domRect = element.getBoundingClientRect();
        interesting = 0 < domRect.width && 0 < domRect.height;
    }
    return interesting;
}
exports.isInterestedInput = isInterestedInput;


/***/ }),

/***/ "./scripts/modal.ts":
/*!**************************!*\
  !*** ./scripts/modal.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const MODEL_ID = crypto.randomUUID();
function getModal(onClose, onFinish) {
    const backdrop = document.createElement("span");
    backdrop.classList.add("ultron_modal");
    const container = document.createElement("div");
    const close = document.createElement("p");
    close.innerText = "X";
    close.onclick = () => {
        backdrop.remove();
        onClose();
    };
    const finish = document.createElement("button");
    finish.innerHTML = "Stop Recording";
    finish.type = "button";
    finish.onclick = () => {
        finish.disabled = true;
        onFinish();
    };
    container.append(close);
    container.append(finish);
    backdrop.append(container);
    return backdrop;
}
exports["default"] = getModal;


/***/ }),

/***/ "./scripts/transcript_service.ts":
/*!***************************************!*\
  !*** ./scripts/transcript_service.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const API = "https://api.dev.ez.knfs-tech.com/cvt/v1";
const TRANSCRIBING = 202;
const SUCCESSFUL = 200;
const POLLING_INTERVAL = 1000; //ms
const POLLING_DEPTH = 5;
/**
 * The API use a variation of Long Polling but rather than keep the connection
 * open, the processing is separated into 2 routes like a drive-through restaurant
 */
async function transcribe(audioBlob, closeModal) {
    const taskId = await _sendAudio(audioBlob);
    switch (taskId) {
        case "":
            closeModal();
            return "";
        default:
            return await _getText(taskId, POLLING_DEPTH, closeModal);
    }
}
exports["default"] = transcribe;
/**
 * After a delay of $POLLING_INTERVAL ms, fetch the transcribed text
 * recursively until either the pollingDepth reach 0 or the API returned the
 * text.
 * @param {string} taskId - The task_id return by the api
 * @param {int} pollingDepth - Max recursion depth
 * @returns { string } Transcribed text from the API, default to an empty string
 * if error
 */
async function _getText(taskId, pollingDepth, closeModal) {
    let text = "";
    if (1 > pollingDepth) {
        closeModal();
        alert(`Connection Timed Out`);
        return text;
    }
    // behave like sleep()
    await new Promise((res) => setTimeout(res, POLLING_INTERVAL));
    try {
        const res = await fetch(`${API}/speech/get-text/${taskId}`, {
            method: "GET",
        });
        switch (res.status) {
            case SUCCESSFUL:
                closeModal();
                text = _getResult(await res.json());
                break;
            case TRANSCRIBING:
                text = await _getText(taskId, pollingDepth - 1, closeModal);
        }
    }
    catch (err) {
        alert(`Could not get transcribed text. ${err}`);
    }
    return text;
}
/**
 * @param audioBlob
 * @returns { string } The fetch id (task_id) for pending transcribed text
 * default to an empty string if error
 */
async function _sendAudio(audioBlob) {
    let task_id = "";
    const _file = new File([audioBlob], crypto.randomUUID() + ".webm");
    const _form = new FormData();
    _form.append("voice", _file);
    try {
        const res = await fetch(`${API}/speech/to-text`, {
            method: "POST",
            body: _form,
        });
        const resBody = await res.json();
        task_id = resBody.data.task_id;
    }
    catch (err) {
        alert(`Could not send audio for processing. ${err}`);
    }
    return task_id;
}
function _getResult(resBody) {
    let text = "";
    for (const [key, value] of Object.entries(resBody.data.result)) {
        switch (key) {
            case "error":
                alert("Could not transcribe audio");
                text = "";
                break;
            case "text":
                text = value;
        }
    }
    return text;
}


/***/ }),

/***/ "./scripts/utils.ts":
/*!**************************!*\
  !*** ./scripts/utils.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.simulateTyping = exports.insertAfter = exports.downloadAudio = void 0;
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
exports.downloadAudio = downloadAudio;
function insertAfter(refElement, newElement) {
    refElement.parentNode?.insertBefore(newElement, refElement.nextSibling);
}
exports.insertAfter = insertAfter;
function simulateTyping(element, text) {
    for (const char of text) {
        element.dispatchEvent(new KeyboardEvent("keypress", {
            key: char
        }));
    }
}
exports.simulateTyping = simulateTyping;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/*!****************************!*\
  !*** ./scripts/content.ts ***!
  \****************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const modal_1 = __webpack_require__(/*! ./modal */ "./scripts/modal.ts");
const transcript_service_1 = __webpack_require__(/*! ./transcript_service */ "./scripts/transcript_service.ts");
const utils_1 = __webpack_require__(/*! ./utils */ "./scripts/utils.ts");
const crawler_1 = __webpack_require__(/*! ./crawler */ "./scripts/crawler.ts");
// Generate a common uuid to mark visited input
const MARKER_INPUT = crypto.randomUUID();
const MARKER_BUTTON = crypto.randomUUID();
/**
 * Bind the recorder's event listener to a new target
 * @param {HTMLElement} target - Input field or editable element that need STT
 */
let setTarget;
document.onreadystatechange = () => main();
/**
 * Resolve Permission requirements then bind buttons
 */
async function main() {
    if (navigator.mediaDevices) {
        let permission_denied = false;
        try {
            setTarget = await getRecorder();
            bindButtons();
            const domObserver = new MutationObserver(bindButtons);
            // Visit newly generated input fields
            domObserver.observe(document.body, {
                subtree: true,
                childList: true,
            });
            // move buttons to new position whenever window resizes
            window.onresize = function () {
                domObserver.disconnect();
                removeAllButtons();
                unmarkAllInputs();
                bindButtons();
                domObserver.observe(document.body, {
                    subtree: true,
                    childList: true,
                });
            };
        }
        catch (err) {
            // Prevent permission alert deadlock
            if (permission_denied)
                return;
            permission_denied = true;
            alert(`Could not gain permission for microphone: ${err}`);
        }
    }
    else {
        alert("This browser does not support Ultron");
    }
}
async function getRecorder() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const _recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    return function (target) {
        const audioChunks = [];
        const modal = (0, modal_1.default)(() => _recorder.pause(), () => _recorder.stop());
        _recorder.ondataavailable = (event) => audioChunks.push(event.data);
        _recorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });
            // for testing purpose
            // await downloadAudio(blob);
            try {
                const text = await (0, transcript_service_1.default)(blob, () => modal.remove());
                target.focus();
                if (target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement) {
                    target.value += ` ${text}`;
                }
                else {
                    target.click();
                    (0, utils_1.simulateTyping)(target, text);
                }
            }
            catch (err) {
                alert(`Could not make request to server.\n${err}`);
            }
        };
        document.body.append(modal);
        return _recorder;
    };
}
/**
 * Visit unmarked inputs field and bind a record button to them
 */
function bindButtons() {
    (0, crawler_1.default)().forEach((input) => {
        // avoid already visited input
        if (false == input.classList.contains(MARKER_INPUT)) {
            input.classList.add(MARKER_INPUT);
            const button = getButton(input);
            button.onclick = () => {
                const recorder = setTarget(input);
                switch (recorder.state) {
                    case "paused":
                        recorder.resume();
                        break;
                    case "inactive":
                        recorder.start();
                }
            };
            document.body.append(button);
        }
    });
}
/**
 *
 * @param input - an input field or editable that user want to STT
 * @returns A button with the coordinate at right edge of the input
 */
function getButton(input) {
    const domRect = input.getBoundingClientRect();
    const buttonHeight = 24;
    const button = document.createElement("img");
    button.classList.add(MARKER_BUTTON);
    button.src = chrome.runtime.getURL("microphone-svgrepo-com.svg");
    button.classList.add("ultron_record-button");
    button.style.cssText = `
    height:${buttonHeight}px;
    left: ${domRect.x + domRect.width - buttonHeight * 1.5}px;
    top:${domRect.y + buttonHeight / 2}px
    `;
    return button;
}
function removeAllButtons() {
    for (const button of Array.from(document.getElementsByClassName(MARKER_BUTTON))) {
        button.remove();
    }
}
function unmarkAllInputs() {
    for (const input of Array.from(document.getElementsByClassName(MARKER_INPUT))) {
        input.classList.remove(MARKER_INPUT);
    }
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtEQUErRCxJQUFJO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0RBQStELGFBQWE7QUFDNUUsa0RBQWtELHdCQUF3QjtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWlELG1CQUFtQixjQUFjO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLEtBQUs7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0REFBNEQsSUFBSTtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsYUFBYTtBQUMxQixZQUFZLCtDQUErQztBQUMzRCxVQUFVLDZCQUE2QjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3VsdHJvbi8uL3NjcmlwdHMvY3Jhd2xlci50cyIsIndlYnBhY2s6Ly91bHRyb24vLi9zY3JpcHRzL21vZGFsLnRzIiwid2VicGFjazovL3VsdHJvbi8uL3NjcmlwdHMvdHJhbnNjcmlwdF9zZXJ2aWNlLnRzIiwid2VicGFjazovL3VsdHJvbi8uL3NjcmlwdHMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vdWx0cm9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3VsdHJvbi8uL3NjcmlwdHMvY29udGVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuaXNJbnRlcmVzdGVkSW5wdXQgPSB2b2lkIDA7XG5jb25zdCBpbnB1dF90eXBlcyA9IFtcbiAgICBcInRleHRcIixcbiAgICBcInBhc3N3b3JkXCIsXG4gICAgXCJlbWFpbFwiLFxuICAgIFwic2VhcmNoXCIsXG4gICAgXCJ0ZWxcIixcbiAgICBcIm51bWJlclwiLFxuICAgIFwidXJsXCIsXG5dO1xuLy8gR2V0IGludGVyZXN0aW5nIGlucHV0cyBhbmQgdGV4dGFyZWFzXG5mdW5jdGlvbiBjcmF3bCgpIHtcbiAgICBjb25zdCBpbnB1dHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKSkuZmlsdGVyKChpbnB1dCkgPT4gaW5wdXQuZGlzYWJsZWQgPT0gZmFsc2UgJiZcbiAgICAgICAgaW5wdXQudHlwZSAhPSBcImhpZGRlblwiICYmXG4gICAgICAgIGlucHV0X3R5cGVzLmluY2x1ZGVzKGlucHV0LnR5cGUpKTtcbiAgICBjb25zdCB0ZXh0YXJlYXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZXh0YXJlYVwiKSkuZmlsdGVyKChhcmVhKSA9PiBhcmVhLmRpc2FibGVkID09IGZhbHNlICYmIGFyZWEudHlwZSAhPSBcImhpZGRlblwiKTtcbiAgICBjb25zdCBlZGl0YWJsZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbY29udGVudGVkaXRhYmxlPXRydWVdXCIpKTtcbiAgICBjb25zdCBkYXRhTGV4aWNhbERkaXRvciA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWxleGljYWwtZWRpdG9yPXRydWVdXCIpKTtcbiAgICByZXR1cm4gWy4uLmlucHV0cywgLi4udGV4dGFyZWFzLCAuLi5lZGl0YWJsZXMsIC4uLmRhdGFMZXhpY2FsRGRpdG9yXVxuICAgICAgICAubWFwKChlbGVtZW50KSA9PiBlbGVtZW50KVxuICAgICAgICAuZmlsdGVyKChlbGVtZW50KSA9PiB7XG4gICAgICAgIC8vIGhvbmV5IHBvdCB0cmFwXG4gICAgICAgIGNvbnN0IGRvbVJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICByZXR1cm4gMCA8IGRvbVJlY3Qud2lkdGggJiYgMCA8IGRvbVJlY3QuaGVpZ2h0O1xuICAgIH0pO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gY3Jhd2w7XG5mdW5jdGlvbiBpc0ludGVyZXN0ZWRJbnB1dChlbGVtZW50KSB7XG4gICAgbGV0IGludGVyZXN0aW5nID0gZmFsc2U7XG4gICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50IHx8XG4gICAgICAgIGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MVGV4dEFyZWFFbGVtZW50KSB7XG4gICAgICAgIGludGVyZXN0aW5nID1cbiAgICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPT0gZmFsc2UgJiZcbiAgICAgICAgICAgICAgICBlbGVtZW50LnR5cGUgIT0gXCJoaWRkZW5cIiAmJlxuICAgICAgICAgICAgICAgIGlucHV0X3R5cGVzLmluY2x1ZGVzKGVsZW1lbnQudHlwZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGVsZW1lbnQuaXNDb250ZW50RWRpdGFibGUgfHxcbiAgICAgICAgZWxlbWVudC5kYXRhc2V0LmxleGljYWxFZGl0b3IgPT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgaW50ZXJlc3RpbmcgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoaW50ZXJlc3RpbmcpIHtcbiAgICAgICAgY29uc3QgZG9tUmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGludGVyZXN0aW5nID0gMCA8IGRvbVJlY3Qud2lkdGggJiYgMCA8IGRvbVJlY3QuaGVpZ2h0O1xuICAgIH1cbiAgICByZXR1cm4gaW50ZXJlc3Rpbmc7XG59XG5leHBvcnRzLmlzSW50ZXJlc3RlZElucHV0ID0gaXNJbnRlcmVzdGVkSW5wdXQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IE1PREVMX0lEID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbmZ1bmN0aW9uIGdldE1vZGFsKG9uQ2xvc2UsIG9uRmluaXNoKSB7XG4gICAgY29uc3QgYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBiYWNrZHJvcC5jbGFzc0xpc3QuYWRkKFwidWx0cm9uX21vZGFsXCIpO1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29uc3QgY2xvc2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICBjbG9zZS5pbm5lclRleHQgPSBcIlhcIjtcbiAgICBjbG9zZS5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICBiYWNrZHJvcC5yZW1vdmUoKTtcbiAgICAgICAgb25DbG9zZSgpO1xuICAgIH07XG4gICAgY29uc3QgZmluaXNoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICBmaW5pc2guaW5uZXJIVE1MID0gXCJTdG9wIFJlY29yZGluZ1wiO1xuICAgIGZpbmlzaC50eXBlID0gXCJidXR0b25cIjtcbiAgICBmaW5pc2gub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgZmluaXNoLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgb25GaW5pc2goKTtcbiAgICB9O1xuICAgIGNvbnRhaW5lci5hcHBlbmQoY2xvc2UpO1xuICAgIGNvbnRhaW5lci5hcHBlbmQoZmluaXNoKTtcbiAgICBiYWNrZHJvcC5hcHBlbmQoY29udGFpbmVyKTtcbiAgICByZXR1cm4gYmFja2Ryb3A7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBnZXRNb2RhbDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgQVBJID0gXCJodHRwczovL2FwaS5kZXYuZXoua25mcy10ZWNoLmNvbS9jdnQvdjFcIjtcbmNvbnN0IFRSQU5TQ1JJQklORyA9IDIwMjtcbmNvbnN0IFNVQ0NFU1NGVUwgPSAyMDA7XG5jb25zdCBQT0xMSU5HX0lOVEVSVkFMID0gMTAwMDsgLy9tc1xuY29uc3QgUE9MTElOR19ERVBUSCA9IDU7XG4vKipcbiAqIFRoZSBBUEkgdXNlIGEgdmFyaWF0aW9uIG9mIExvbmcgUG9sbGluZyBidXQgcmF0aGVyIHRoYW4ga2VlcCB0aGUgY29ubmVjdGlvblxuICogb3BlbiwgdGhlIHByb2Nlc3NpbmcgaXMgc2VwYXJhdGVkIGludG8gMiByb3V0ZXMgbGlrZSBhIGRyaXZlLXRocm91Z2ggcmVzdGF1cmFudFxuICovXG5hc3luYyBmdW5jdGlvbiB0cmFuc2NyaWJlKGF1ZGlvQmxvYiwgY2xvc2VNb2RhbCkge1xuICAgIGNvbnN0IHRhc2tJZCA9IGF3YWl0IF9zZW5kQXVkaW8oYXVkaW9CbG9iKTtcbiAgICBzd2l0Y2ggKHRhc2tJZCkge1xuICAgICAgICBjYXNlIFwiXCI6XG4gICAgICAgICAgICBjbG9zZU1vZGFsKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBfZ2V0VGV4dCh0YXNrSWQsIFBPTExJTkdfREVQVEgsIGNsb3NlTW9kYWwpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IHRyYW5zY3JpYmU7XG4vKipcbiAqIEFmdGVyIGEgZGVsYXkgb2YgJFBPTExJTkdfSU5URVJWQUwgbXMsIGZldGNoIHRoZSB0cmFuc2NyaWJlZCB0ZXh0XG4gKiByZWN1cnNpdmVseSB1bnRpbCBlaXRoZXIgdGhlIHBvbGxpbmdEZXB0aCByZWFjaCAwIG9yIHRoZSBBUEkgcmV0dXJuZWQgdGhlXG4gKiB0ZXh0LlxuICogQHBhcmFtIHtzdHJpbmd9IHRhc2tJZCAtIFRoZSB0YXNrX2lkIHJldHVybiBieSB0aGUgYXBpXG4gKiBAcGFyYW0ge2ludH0gcG9sbGluZ0RlcHRoIC0gTWF4IHJlY3Vyc2lvbiBkZXB0aFxuICogQHJldHVybnMgeyBzdHJpbmcgfSBUcmFuc2NyaWJlZCB0ZXh0IGZyb20gdGhlIEFQSSwgZGVmYXVsdCB0byBhbiBlbXB0eSBzdHJpbmdcbiAqIGlmIGVycm9yXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIF9nZXRUZXh0KHRhc2tJZCwgcG9sbGluZ0RlcHRoLCBjbG9zZU1vZGFsKSB7XG4gICAgbGV0IHRleHQgPSBcIlwiO1xuICAgIGlmICgxID4gcG9sbGluZ0RlcHRoKSB7XG4gICAgICAgIGNsb3NlTW9kYWwoKTtcbiAgICAgICAgYWxlcnQoYENvbm5lY3Rpb24gVGltZWQgT3V0YCk7XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICAvLyBiZWhhdmUgbGlrZSBzbGVlcCgpXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlcykgPT4gc2V0VGltZW91dChyZXMsIFBPTExJTkdfSU5URVJWQUwpKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtBUEl9L3NwZWVjaC9nZXQtdGV4dC8ke3Rhc2tJZH1gLCB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIH0pO1xuICAgICAgICBzd2l0Y2ggKHJlcy5zdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgU1VDQ0VTU0ZVTDpcbiAgICAgICAgICAgICAgICBjbG9zZU1vZGFsKCk7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF9nZXRSZXN1bHQoYXdhaXQgcmVzLmpzb24oKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFRSQU5TQ1JJQklORzpcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYXdhaXQgX2dldFRleHQodGFza0lkLCBwb2xsaW5nRGVwdGggLSAxLCBjbG9zZU1vZGFsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgZ2V0IHRyYW5zY3JpYmVkIHRleHQuICR7ZXJyfWApO1xuICAgIH1cbiAgICByZXR1cm4gdGV4dDtcbn1cbi8qKlxuICogQHBhcmFtIGF1ZGlvQmxvYlxuICogQHJldHVybnMgeyBzdHJpbmcgfSBUaGUgZmV0Y2ggaWQgKHRhc2tfaWQpIGZvciBwZW5kaW5nIHRyYW5zY3JpYmVkIHRleHRcbiAqIGRlZmF1bHQgdG8gYW4gZW1wdHkgc3RyaW5nIGlmIGVycm9yXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIF9zZW5kQXVkaW8oYXVkaW9CbG9iKSB7XG4gICAgbGV0IHRhc2tfaWQgPSBcIlwiO1xuICAgIGNvbnN0IF9maWxlID0gbmV3IEZpbGUoW2F1ZGlvQmxvYl0sIGNyeXB0by5yYW5kb21VVUlEKCkgKyBcIi53ZWJtXCIpO1xuICAgIGNvbnN0IF9mb3JtID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgX2Zvcm0uYXBwZW5kKFwidm9pY2VcIiwgX2ZpbGUpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0FQSX0vc3BlZWNoL3RvLXRleHRgLCB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgYm9keTogX2Zvcm0sXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZXNCb2R5ID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICAgICAgdGFza19pZCA9IHJlc0JvZHkuZGF0YS50YXNrX2lkO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGFsZXJ0KGBDb3VsZCBub3Qgc2VuZCBhdWRpbyBmb3IgcHJvY2Vzc2luZy4gJHtlcnJ9YCk7XG4gICAgfVxuICAgIHJldHVybiB0YXNrX2lkO1xufVxuZnVuY3Rpb24gX2dldFJlc3VsdChyZXNCb2R5KSB7XG4gICAgbGV0IHRleHQgPSBcIlwiO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHJlc0JvZHkuZGF0YS5yZXN1bHQpKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICBhbGVydChcIkNvdWxkIG5vdCB0cmFuc2NyaWJlIGF1ZGlvXCIpO1xuICAgICAgICAgICAgICAgIHRleHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInRleHRcIjpcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRleHQ7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2ltdWxhdGVUeXBpbmcgPSBleHBvcnRzLmluc2VydEFmdGVyID0gZXhwb3J0cy5kb3dubG9hZEF1ZGlvID0gdm9pZCAwO1xuYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRBdWRpbyhibG9iKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgX2FuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBfYW5jaG9yLmhyZWYgPSB1cmw7XG4gICAgICAgIF9hbmNob3IuZG93bmxvYWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpICsgXCIud2VibVwiO1xuICAgICAgICBfYW5jaG9yLmNsaWNrKCk7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYEVycm9yIHdoZW4gY29udmVydGluZy4gJHtlcnJ9YCk7XG4gICAgfVxufVxuZXhwb3J0cy5kb3dubG9hZEF1ZGlvID0gZG93bmxvYWRBdWRpbztcbmZ1bmN0aW9uIGluc2VydEFmdGVyKHJlZkVsZW1lbnQsIG5ld0VsZW1lbnQpIHtcbiAgICByZWZFbGVtZW50LnBhcmVudE5vZGU/Lmluc2VydEJlZm9yZShuZXdFbGVtZW50LCByZWZFbGVtZW50Lm5leHRTaWJsaW5nKTtcbn1cbmV4cG9ydHMuaW5zZXJ0QWZ0ZXIgPSBpbnNlcnRBZnRlcjtcbmZ1bmN0aW9uIHNpbXVsYXRlVHlwaW5nKGVsZW1lbnQsIHRleHQpIHtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgdGV4dCkge1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEtleWJvYXJkRXZlbnQoXCJrZXlwcmVzc1wiLCB7XG4gICAgICAgICAgICBrZXk6IGNoYXJcbiAgICAgICAgfSkpO1xuICAgIH1cbn1cbmV4cG9ydHMuc2ltdWxhdGVUeXBpbmcgPSBzaW11bGF0ZVR5cGluZztcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IG1vZGFsXzEgPSByZXF1aXJlKFwiLi9tb2RhbFwiKTtcbmNvbnN0IHRyYW5zY3JpcHRfc2VydmljZV8xID0gcmVxdWlyZShcIi4vdHJhbnNjcmlwdF9zZXJ2aWNlXCIpO1xuY29uc3QgdXRpbHNfMSA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xuY29uc3QgY3Jhd2xlcl8xID0gcmVxdWlyZShcIi4vY3Jhd2xlclwiKTtcbi8vIEdlbmVyYXRlIGEgY29tbW9uIHV1aWQgdG8gbWFyayB2aXNpdGVkIGlucHV0XG5jb25zdCBNQVJLRVJfSU5QVVQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuY29uc3QgTUFSS0VSX0JVVFRPTiA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4vKipcbiAqIEJpbmQgdGhlIHJlY29yZGVyJ3MgZXZlbnQgbGlzdGVuZXIgdG8gYSBuZXcgdGFyZ2V0XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBJbnB1dCBmaWVsZCBvciBlZGl0YWJsZSBlbGVtZW50IHRoYXQgbmVlZCBTVFRcbiAqL1xubGV0IHNldFRhcmdldDtcbmRvY3VtZW50Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IG1haW4oKTtcbi8qKlxuICogUmVzb2x2ZSBQZXJtaXNzaW9uIHJlcXVpcmVtZW50cyB0aGVuIGJpbmQgYnV0dG9uc1xuICovXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICAgIGlmIChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKSB7XG4gICAgICAgIGxldCBwZXJtaXNzaW9uX2RlbmllZCA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0VGFyZ2V0ID0gYXdhaXQgZ2V0UmVjb3JkZXIoKTtcbiAgICAgICAgICAgIGJpbmRCdXR0b25zKCk7XG4gICAgICAgICAgICBjb25zdCBkb21PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGJpbmRCdXR0b25zKTtcbiAgICAgICAgICAgIC8vIFZpc2l0IG5ld2x5IGdlbmVyYXRlZCBpbnB1dCBmaWVsZHNcbiAgICAgICAgICAgIGRvbU9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBtb3ZlIGJ1dHRvbnMgdG8gbmV3IHBvc2l0aW9uIHdoZW5ldmVyIHdpbmRvdyByZXNpemVzXG4gICAgICAgICAgICB3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZG9tT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlbW92ZUFsbEJ1dHRvbnMoKTtcbiAgICAgICAgICAgICAgICB1bm1hcmtBbGxJbnB1dHMoKTtcbiAgICAgICAgICAgICAgICBiaW5kQnV0dG9ucygpO1xuICAgICAgICAgICAgICAgIGRvbU9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8vIFByZXZlbnQgcGVybWlzc2lvbiBhbGVydCBkZWFkbG9ja1xuICAgICAgICAgICAgaWYgKHBlcm1pc3Npb25fZGVuaWVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHBlcm1pc3Npb25fZGVuaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgZ2FpbiBwZXJtaXNzaW9uIGZvciBtaWNyb3Bob25lOiAke2Vycn1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYWxlcnQoXCJUaGlzIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBVbHRyb25cIik7XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gZ2V0UmVjb3JkZXIoKSB7XG4gICAgY29uc3Qgc3RyZWFtID0gYXdhaXQgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoeyBhdWRpbzogdHJ1ZSB9KTtcbiAgICBjb25zdCBfcmVjb3JkZXIgPSBuZXcgTWVkaWFSZWNvcmRlcihzdHJlYW0sIHsgbWltZVR5cGU6IFwiYXVkaW8vd2VibVwiIH0pO1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvQ2h1bmtzID0gW107XG4gICAgICAgIGNvbnN0IG1vZGFsID0gKDAsIG1vZGFsXzEuZGVmYXVsdCkoKCkgPT4gX3JlY29yZGVyLnBhdXNlKCksICgpID0+IF9yZWNvcmRlci5zdG9wKCkpO1xuICAgICAgICBfcmVjb3JkZXIub25kYXRhYXZhaWxhYmxlID0gKGV2ZW50KSA9PiBhdWRpb0NodW5rcy5wdXNoKGV2ZW50LmRhdGEpO1xuICAgICAgICBfcmVjb3JkZXIub25zdG9wID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKGF1ZGlvQ2h1bmtzLCB7IHR5cGU6IFwiYXVkaW8vd2VibTsgY29kZWNzPW9wdXNcIiB9KTtcbiAgICAgICAgICAgIC8vIGZvciB0ZXN0aW5nIHB1cnBvc2VcbiAgICAgICAgICAgIC8vIGF3YWl0IGRvd25sb2FkQXVkaW8oYmxvYik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCAoMCwgdHJhbnNjcmlwdF9zZXJ2aWNlXzEuZGVmYXVsdCkoYmxvYiwgKCkgPT4gbW9kYWwucmVtb3ZlKCkpO1xuICAgICAgICAgICAgICAgIHRhcmdldC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50IHx8XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCBpbnN0YW5jZW9mIEhUTUxUZXh0QXJlYUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnZhbHVlICs9IGAgJHt0ZXh0fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuY2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgKDAsIHV0aWxzXzEuc2ltdWxhdGVUeXBpbmcpKHRhcmdldCwgdGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGFsZXJ0KGBDb3VsZCBub3QgbWFrZSByZXF1ZXN0IHRvIHNlcnZlci5cXG4ke2Vycn1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQobW9kYWwpO1xuICAgICAgICByZXR1cm4gX3JlY29yZGVyO1xuICAgIH07XG59XG4vKipcbiAqIFZpc2l0IHVubWFya2VkIGlucHV0cyBmaWVsZCBhbmQgYmluZCBhIHJlY29yZCBidXR0b24gdG8gdGhlbVxuICovXG5mdW5jdGlvbiBiaW5kQnV0dG9ucygpIHtcbiAgICAoMCwgY3Jhd2xlcl8xLmRlZmF1bHQpKCkuZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICAgICAgLy8gYXZvaWQgYWxyZWFkeSB2aXNpdGVkIGlucHV0XG4gICAgICAgIGlmIChmYWxzZSA9PSBpbnB1dC5jbGFzc0xpc3QuY29udGFpbnMoTUFSS0VSX0lOUFVUKSkge1xuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LmFkZChNQVJLRVJfSU5QVVQpO1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gZ2V0QnV0dG9uKGlucHV0KTtcbiAgICAgICAgICAgIGJ1dHRvbi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY29yZGVyID0gc2V0VGFyZ2V0KGlucHV0KTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHJlY29yZGVyLnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwYXVzZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY29yZGVyLnJlc3VtZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJpbmFjdGl2ZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3JkZXIuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQoYnV0dG9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLyoqXG4gKlxuICogQHBhcmFtIGlucHV0IC0gYW4gaW5wdXQgZmllbGQgb3IgZWRpdGFibGUgdGhhdCB1c2VyIHdhbnQgdG8gU1RUXG4gKiBAcmV0dXJucyBBIGJ1dHRvbiB3aXRoIHRoZSBjb29yZGluYXRlIGF0IHJpZ2h0IGVkZ2Ugb2YgdGhlIGlucHV0XG4gKi9cbmZ1bmN0aW9uIGdldEJ1dHRvbihpbnB1dCkge1xuICAgIGNvbnN0IGRvbVJlY3QgPSBpbnB1dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBidXR0b25IZWlnaHQgPSAyNDtcbiAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKE1BUktFUl9CVVRUT04pO1xuICAgIGJ1dHRvbi5zcmMgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoXCJtaWNyb3Bob25lLXN2Z3JlcG8tY29tLnN2Z1wiKTtcbiAgICBidXR0b24uY2xhc3NMaXN0LmFkZChcInVsdHJvbl9yZWNvcmQtYnV0dG9uXCIpO1xuICAgIGJ1dHRvbi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgIGhlaWdodDoke2J1dHRvbkhlaWdodH1weDtcbiAgICBsZWZ0OiAke2RvbVJlY3QueCArIGRvbVJlY3Qud2lkdGggLSBidXR0b25IZWlnaHQgKiAxLjV9cHg7XG4gICAgdG9wOiR7ZG9tUmVjdC55ICsgYnV0dG9uSGVpZ2h0IC8gMn1weFxuICAgIGA7XG4gICAgcmV0dXJuIGJ1dHRvbjtcbn1cbmZ1bmN0aW9uIHJlbW92ZUFsbEJ1dHRvbnMoKSB7XG4gICAgZm9yIChjb25zdCBidXR0b24gb2YgQXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKE1BUktFUl9CVVRUT04pKSkge1xuICAgICAgICBidXR0b24ucmVtb3ZlKCk7XG4gICAgfVxufVxuZnVuY3Rpb24gdW5tYXJrQWxsSW5wdXRzKCkge1xuICAgIGZvciAoY29uc3QgaW5wdXQgb2YgQXJyYXkuZnJvbShkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKE1BUktFUl9JTlBVVCkpKSB7XG4gICAgICAgIGlucHV0LmNsYXNzTGlzdC5yZW1vdmUoTUFSS0VSX0lOUFVUKTtcbiAgICB9XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=