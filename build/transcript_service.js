"use strict";
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
//# sourceMappingURL=transcript_service.js.map