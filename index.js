const formTemplateElement = document.querySelector("#form-template");
const invalidLinkTemplateElement = document.querySelector(
  "#invalid-link-template"
);
const waitingTemplateElement = document.querySelector("#waiting-template");
const container = document.querySelector("#container");

formTemplateElement.querySelector("#submit");

const parametersAsString = window.location.search.slice(1);
const parameters = parametersAsString
  .split("&")
  .reduce((accumulator, parameter) => {
    const [key, value] = parameter.split("=");
    accumulator[key] = value;
    return accumulator;
  }, {});

const clearAndAppend = (template) => {
  container.innerHTML = "";
  container.appendChild(template);
};

const renderWaitingTemplate = () => {
  const clonedTemplate = waitingTemplateElement.content.cloneNode(true);
  clearAndAppend(clonedTemplate);
};

const renderInvalidLinkTemplate = () => {
  const clonedTemplate = invalidLinkTemplateElement.content.cloneNode(true);
  clearAndAppend(clonedTemplate);
};

const checkForRedirect = async () => {
  const response = await fetch(`url.php?url=${parameters["url"]}`);
  const { original_link: originalLink } = await response.json();
  if (originalLink) {
    window.location.replace(originalLink);
  } else {
    renderInvalidLinkTemplate();
  }
};

const addLinkToRedirect = async (
  generatedLinkWrapperElement,
  generatedLinkElement,
  originalLinkInputElement,
  link
) => {
  const response = await fetch(`url.php`, {
    method: "POST",
    body: JSON.stringify({
      original_link: link,
    }),
  });
  const { generated_link: generatedLink } = await response.json();
  generatedLinkWrapperElement.classList.remove("not-visible");
  generatedLinkElement.textContent = `${window.location.href}?url=${generatedLink}`;
  originalLinkInputElement.value = "";
};

if (!parameters["url"]) {
  const clonedTemplate = formTemplateElement.content.cloneNode(true);
  clearAndAppend(clonedTemplate);
  const submitButtonElement = document.querySelector("#submit");
  const originalLinkInputElement = document.querySelector(
    "#original-link-input"
  );
  const generatedLinkElement = document.querySelector("#generated-link");
  const generatedLinkWrapperElement = document.querySelector(
    "#generated-link-wrapper"
  );
  submitButtonElement.addEventListener("click", () => {
    const { value } = originalLinkInputElement;
    if (value) {
      addLinkToRedirect(
        generatedLinkWrapperElement,
        generatedLinkElement,
        originalLinkInputElement,
        value
      );
    }
  });
} else {
  renderWaitingTemplate();
  checkForRedirect();
}
