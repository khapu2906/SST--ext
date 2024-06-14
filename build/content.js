"use strict";
// Generate a common uuid to mark visited input
const MARKER_INPUT = crypto.randomUUID();
const MARKER_BUTTON = crypto.randomUUID();
/**
 * Bind the recorder's event listener to a new target
 * @param {HTMLElement} target - Input field or editable element that need STT
 */
let setTarget;
main();
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
        const modal = getModal(() => _recorder.pause(), () => _recorder.stop());
        _recorder.ondataavailable = (event) => audioChunks.push(event.data);
        _recorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });
            // for testing purpose
            // await downloadAudio(blob);
            try {
                const text = await transcribe(blob, () => modal.remove());
                if (target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement) {
                    target.value = text;
                }
                else {
                    target.innerText = text;
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
    crawl().forEach((input) => {
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
            // parentDiv?.classList.add('input-container');
            document.body.append(button);
        }
    });
}
/**
 *
 * @param input - an input field or editable that user want to STT
 * @returns A button with the coordinate at top-left corner of the input
 */
function getButton(input) {
    const domRect = input.getBoundingClientRect();
    const buttonHeight = 24;
    const button = document.createElement("img");
    button.classList.add(MARKER_BUTTON);
    button.src = chrome.runtime.getURL("microphone-svgrepo-com.svg");
    appendCss(button, [
        "width:auto",
        `height:${buttonHeight}px`,
        "padding:3px",
        "z-index:999",
        "background-color:lightgray",
        "border-radius:50%",
        "margin:0",
        "position:absolute",
        `left:${domRect.x - buttonHeight / 2}px`,
        `top:${domRect.y - buttonHeight / 2}px`,
    ]);
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
//# sourceMappingURL=content.js.map