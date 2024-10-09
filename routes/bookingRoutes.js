const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect); // This authController.protect middleware will protect all the below routes

router.get(
  // We will create the session whenever someone hits the below "/checkout-session/:tourId" route
  "/checkout-session/:tourId", // We want the client to send the ID of the tour that he want to book
  //   authController.protect,
  bookingController.getCheckoutSession,
);

router.use(authController.restrictTo("admin", "lead-guide")); // This authController.restrictTo middleware will restrict all
// the below routes to only admin and lead-guide.

/// BELOW IS THE COMPLETE BOOKINGS API

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
