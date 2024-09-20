const express = require("express");

const tourController = require("./../controllers/tourController");

// const {getAllTours , getTour , createTour , updateTour , deleteTour} = require("./../controllers/tourController");

const router = express.Router();

// router.param("id", (req, res, next, val) => {
//   //   console.log(`Tour id is: ${val}`);
//   next();
// }); //The first argument in the param() method will be the parameter that we actually want to
// search for . So basically the parameter for which this middleware is gonna run and it's called id and the second argument is the
// actual middleware function that will run , Since this is a middleware function it will have access to the next object along with
// the request and response object . But in a param middleware function we will get access to a fourth argument as well and that
// fourth argument is the value of the parameter in a question . In the above the "val" parameter is the one that will actually hold
// the value of the id parameter . So in the console.log(${val}) we are using the val to print it on the console that what is the
// actual value that is holding . Please note that this  param middleware function is defined only in the tourRoutes.js file but
// not in another file which is userRoutes.js . So this param middleware function will only run for this tourRoutes only but not the
// userRoutes.js

router.param("id", tourController.checkId);

// Create a checkBody middleware
// Check if the body contains the name and the price property
// If not , send back 400 (bad request)
// Add it to the post handler stack

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour); // We are using the app.route() method to define multiple routes for the same path.

module.exports = router;
