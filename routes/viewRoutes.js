const express = require("express");

const viewsController = require("../controllers/viewsController");

const authController = require("../controllers/authController");

const bookingController = require("../controllers/bookingController");

const router = express.Router();

// router.get("/", (req, res) => {
//   // Here the "/" is the root path of where our base.pug file which is present in views folder.
//   res.status(200).render("base", {
//     // The variables that we are passing into this object are called locals in the pug file
//     tour: "The Forest Hiker",
//     user: "Jonas",
//   }); // This will render the template of the name that we have passed in. Here we are
//   // basically rendering the pug template which is base.pug but when we are passing the template into this render("base")
//   // function then there is no need to give the .pug extension
// }); // This is the get() request we will always use to rendering pages in the browser.

// router.use(authController.isLoggedIn); // This middleware will get applied to all the below routes

router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview,
);

router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTour);

router.get("/login", authController.isLoggedIn, viewsController.getLoginForm);

router.get("/me", authController.protect, viewsController.getAccount);

router.get("/my-tours", authController.protect, viewsController.getMyTours);

router.post(
  "/submit-user-data",
  authController.protect,
  viewsController.updateUserData,
);

module.exports = router;
