/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector(".alert"); // We are selecting the element with the alert class
  if (el) el.parentElement.removeChild(el); // If we find an alert, we remove it from the DOM.
};

// type is "success" or "error"
export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup); // Inside of the body but right at the beginning we want to
  // include our markup.
  window.setTimeout(hideAlert, 5000);
};
