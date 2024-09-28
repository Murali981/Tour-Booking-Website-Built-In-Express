const express = require("express");

const tourController = require("../controllers/tourController");

const authController = require("../controllers/authController");

// const {getAllTours , getTour , createTour , updateTour , deleteTour} = require("./../controllers/tourController");

const router = express.Router();

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours); // Before calling this route-handler , We basically want to prefill
// some of the fields in the query string and we already know that our query string should look like this "?limit=5&sort=-ratingsAverage,price"
// and the solution is gonna be is to run a middleware function before we run the getAllTours handler and that middleware function
// will manipulate the query object that is coming in and this is yet another good example of using the middleware . In the above
// route handler "tourController.aliasTopTours" is the middleware function that will run before the getAllTours handler called.

router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours) // Inorder to protect these routes here we gonna use a middleware function which is gonna
  // run before all of these handlers . So this middlware function will return an error if the user is not authenticated (or)
  // it will call the next middleware function which is the getAllTours handler here
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"), // Both admin and lead-guide can now delete the tours
    tourController.deleteTour,
  ); // We are using the app.route() method
// to define multiple routes for the same path. Before deleting a tour we have to always check if the user is
// actually logged in (or) not . Let us suppose if the administrator is trying to delete a tour then we still need to check
// if the administrator is logged in (or) not ? So the first middleware in this stack here is always the "authController.protect"
// one . But then after this protected middleware we will have another middleware which is "authController.restrictTo" and
// to this authController.restrictTo("admin") we will pass some user roles which will be authorized to interact with
// this resource , and we have set the user role to "admin" in this restrict middleware which means only the admin role
// can delete this tour

module.exports = router;
