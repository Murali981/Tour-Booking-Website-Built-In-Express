const express = require("express");

const tourController = require("../controllers/tourController");

// const {getAllTours , getTour , createTour , updateTour , deleteTour} = require("./../controllers/tourController");

const router = express.Router();

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
