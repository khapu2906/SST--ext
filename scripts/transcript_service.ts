const API = "http://localhost:8008";
const TRANSCRIBING = 202;
const SUCCESSFUL = 200;
const POLLING_INTERVAL = 1000; //ms
const POLLING_DEPTH = 5;

/**
 * The API use a variation of Long Polling but rather than keep the connection
 * open, the processing is separated into 2 routes like a drive-through restaurant
 */
export default async function transcribe(
  audioBlob: Blob,
  closeModal: Function,
): Promise<string> {
  return await _sendAudio(audioBlob, POLLING_DEPTH, closeModal);
}


/**
 * @param audioBlob
 * @returns { string } The fetch id (task_id) for pending transcribed text
 * default to an empty string if error
 */
async function _sendAudio(audioBlob: Blob, pollingDepth: number,
  closeModal: Function): Promise<string> {
  let text = "";

  if (1 > pollingDepth) {
    closeModal();
    alert(`Connection Timed Out`);
    return text;
  }


  const _file = new File([audioBlob], crypto.randomUUID() + ".webm");
  const _form = new FormData();
  _form.append("voice", _file);
  try {
    const res = await fetch(`${API}/convert`, {
      method: "POST",
      body: _form,
    });

    switch (res.status) {
      case SUCCESSFUL:
        closeModal();
        text = _getResult(await res.json());
        break;
    }
  } catch (err) {
    alert(`Could not send audio for processing. ${err}`);
  }

  return text;
}

function _getResult(resBody: any): string {
  let text = "";

  for (const [key, value] of Object.entries(resBody.data.result)) {
    switch (key) {
      case "error":
        alert("Could not transcribe audio");
        text = "";
        break;
      case "text":
        text = value as string;
    }
  }

  return text;
}
