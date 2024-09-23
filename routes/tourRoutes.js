const express = require("express");

const tourController = require("../controllers/tourController");

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
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour); // We are using the app.route() method to define multiple routes for the same path.

module.exports = router;
