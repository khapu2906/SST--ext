const MODEL_ID = crypto.randomUUID();

export default function getModal(
  onClose: Function,
  onFinish: Function,
): HTMLElement {
  const backdrop = document.createElement("span");
    backdrop.classList.add("ultron_modal")

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
