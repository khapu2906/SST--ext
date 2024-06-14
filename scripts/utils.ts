export async function downloadAudio(blob: Blob) {
  try {
    const _anchor = document.createElement("a");

    const url = URL.createObjectURL(blob);
    _anchor.href = url;

    _anchor.download = crypto.randomUUID() + ".webm";

    _anchor.click();
  } catch (err) {
    console.log(`Error when converting. ${err}`);
  }
}

export function insertAfter(refElement: HTMLElement, newElement: HTMLElement) {
    refElement.parentNode?.insertBefore(newElement, refElement.nextSibling);
}

export function simulateTyping(element: HTMLElement, text: string) {
    for (const char of text) {
        element.dispatchEvent(new KeyboardEvent("keypress", {
            key: char
        }))
    }
}
