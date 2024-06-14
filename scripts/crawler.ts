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
export default function crawl(): HTMLElement[] {
  const inputs = Array.from(document.querySelectorAll("input")).filter(
    (input) =>
      input.disabled == false &&
      input.type != "hidden" &&
      input_types.includes(input.type),
  );

  const textareas = Array.from(document.querySelectorAll("textarea")).filter(
    (area) => area.disabled == false && area.type != "hidden",
  );

  const editables = Array.from(
    document.querySelectorAll("[contenteditable=true]"),
  );

  const dataLexicalDditor = Array.from(
    document.querySelectorAll("[data-lexical-editor=true]"),
  );

  return [...inputs, ...textareas, ...editables, ...dataLexicalDditor]
    .map((element) => element as HTMLElement)
    .filter((element) => {
      // honey pot trap
      const domRect = element.getBoundingClientRect();
      return 0 < domRect.width && 0 < domRect.height;
    });
}

export function isInterestedInput(element: HTMLElement): boolean {
  let interesting = false;

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    interesting =
      element.disabled == false &&
      element.type != "hidden" &&
      input_types.includes(element.type);
  } else if (
    element.isContentEditable ||
    element.dataset.lexicalEditor == "true"
  ) {
    interesting = true;
  }

  if (interesting) {
    const domRect = element.getBoundingClientRect();
    interesting = 0 < domRect.width && 0 < domRect.height;
  }

  return interesting;
}
