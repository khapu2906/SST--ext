let language = "en";
function setLanguage(locale) {
  language = locale;
  console.log(locale);
}

const langMenu = document.getElementById("language");
langMenu.onchange = function (event) {
  const {
    target: { value: locale },
  } = event;

  console.log(locale);
};
