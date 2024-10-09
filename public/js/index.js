// This index.js file is the entry file and to this index.js file we cannot get the data from the user interface and then
// we delegate actions to some functions coming from other modules like alerts.js,login.js...

import "@babel/polyfill";
import { displayMap } from "./mapbox";
import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";

// CREATING SOME DOM ELEMENTS and also SELECTING SOME DOM ELEMENTS
const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data"); // We are selecting the "form-user-data" class name from
// the account.pug file which is a template created from the account.html file
const userPasswordForm = document.querySelector(".form-user-password"); // We are selecting the "form-user-password" class name from
// the account.pug file which is a template created from the account.html file
const bookBtn = document.getElementById("book-tour");

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

// In the below we are sending the form data to be updated on the server which is the name and email of the user for updation. But
// in the below we are not actually sending the form data to the server but we are selecting them from the form and then passing them
//- into updateSettings()
if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault(); // We will prevent the form being submitted
    // All the below steps we are doing because we want to update the photo along with the input data which is name and email
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]); //Here it is not ".value" but ".files" because we are uploading a
    // file. and these files are actually an array and since there is only one photo we are uploading then we need to select first
    // element in the array which is files[0].
    console.log(form);
    // const name = document.getElementById("name").value;
    // const email = document.getElementById("email").value;
    // updateSettings({ name, email }, "data");
    updateSettings(form, "data");
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

if (bookBtn) {
  // Whenever someone hits the "Book Tour" button the tourId is getting read from "e.target.dataset.tourId" and gets stored in "tourId"
  bookBtn.addEventListener("click", (e) => {
    e.target.textContent = "Processing..."; // We are using this to change the text of the button
    // Now getting the tourId from the button
    // We are getting the below tourId from the data-attribute which is on the button and then call the bookTour() function with the tourId
    const tourId = e.target.dataset.tourId; // e.target is the element which was basically clicked which is the one that triggered the
    // event listener here to be fired (#book-tour(data-tour-id="oyeroiuery")). So we are getting the data-tour-id attribute
    // from the button and in javascript the tour-id is converted into camel case as "tourId".
    bookTour(tourId);
  });
}

// The below three exact names expected by our API to update the password from the frontend account.pug template
// {
//     "passwordCurrent":"pass1234",
//     "password":"newpassword",
//     "passwordConfirm":"newpassword"
// }
