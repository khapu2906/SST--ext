import getModal from "./modal";
import transcribe from "./transcript_service";
import { insertAfter, simulateTyping } from "./utils";
import crawl from "./crawler";
// Generate a common uuid to mark visited input
const MARKER_INPUT = crypto.randomUUID();
const MARKER_BUTTON = crypto.randomUUID();

/**
 * Bind the recorder's event listener to a new target
 * @param {HTMLElement} target - Input field or editable element that need STT
 */
let setTarget: (target: HTMLElement) => MediaRecorder;

document.onreadystatechange = ()  => main();

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
    } catch (err) {
      // Prevent permission alert deadlock
      if (permission_denied) return;
      permission_denied = true;
      alert(`Could not gain permission for microphone: ${err}`);
    }
  } else {
    alert("This browser does not support Ultron");
  }
}

async function getRecorder(): Promise<(target: HTMLElement) => MediaRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const _recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

  return function (target: HTMLElement) {
    const audioChunks: BlobPart[] = [];
    const modal = getModal(
      () => _recorder.pause(),
      () => _recorder.stop(),
    );

    _recorder.ondataavailable = (event) => audioChunks.push(event.data);

    _recorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });
      // for testing purpose
      // await downloadAudio(blob);
      try {
        const text = await transcribe(blob, () => modal.remove());
            target.focus()
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        ) {
          target.value += ` ${text}`;
        } else {
            target.click()
            simulateTyping(target, text);
        }
      } catch (err) {
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

      document.body.append( button );
    }
  });
}

/**
 *
 * @param input - an input field or editable that user want to STT
 * @returns A button with the coordinate at right edge of the input
 */
function getButton(input: HTMLElement): HTMLImageElement {
  const domRect = input.getBoundingClientRect();
  const buttonHeight = 24;

  const button = document.createElement("img");
  button.classList.add(MARKER_BUTTON);
  button.src = chrome.runtime.getURL("microphone-svgrepo-com.svg");

  button.classList.add("ultron_record-button");
  button.style.cssText = `
    height:${buttonHeight}px;
    left: ${ domRect.x + domRect.width - buttonHeight * 1.5 }px;
    top:${domRect.y + buttonHeight / 2}px
    `;

  return button;
}

function removeAllButtons() {
  for (const button of Array.from(
    document.getElementsByClassName(MARKER_BUTTON),
  )) {
    button.remove();
  }
}

function unmarkAllInputs() {
  for (const input of Array.from(
    document.getElementsByClassName(MARKER_INPUT),
  )) {
    input.classList.remove(MARKER_INPUT);
  }
}
