// This index.js file is the entry file and to this index.js file we cannot get the data from the user interface and then
// we delegate actions to some functions coming from other modules like alerts.js,login.js...

import "@babel/polyfill";
import { displayMap } from "./mapbox";
import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";

// CREATING SOME DOM ELEMENTS
const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data"); // We are selecting the "form-user-data" class name from
// the account.pug file which is a template created from the account.html file
const userPasswordForm = document.querySelector(".form-user-password"); // We are selecting the "form-user-password" class name from
// the account.pug file which is a template created from the account.html file

// VALUES

// This is basically a javascript file where we are going to integrate into our HTML and which will then run on the client side
// We are trying to get access to the location data of the tour that we are currently trying to display.

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations); // We are getting this location data from the tour.pug file
  // document.getElementById("map").dataset.locations => The data that we are getting from the tour.pug HTML file is a string
  // and so we have to convert it back into a JSON object again using JSON.parse() function. Only the Tour details page
  // has this "map" element but the above code runs on other pages as well and then create errors there. So to fix these errors
  // We will first create an element and test if it actually exists (or) not before we execute this line of code
  // JSON.parse(document.getElementById("map").dataset.locations)
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener("click", logout);
}

if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault(); // We will prevent the form being submitted
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    updateSettings({ name, email }, "data");
  });
}

if (userPasswordForm) {
  userDataForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // We will prevent the form being submitted

    document.querySelector(".btn--save-password").textContent = "Updating...";

    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password",
    );

    document.querySelector(".btn--save-password").textContent = "Save password";

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}

// The below three exact names expected by our API to update the password from the frontend account.pug template
// {
//     "passwordCurrent":"pass1234",
//     "password":"newpassword",
//     "passwordConfirm":"newpassword"
// }
