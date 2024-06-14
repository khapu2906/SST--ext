"use strict";
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
//# sourceMappingURL=modal.js.map