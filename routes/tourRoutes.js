const express = require("express");

const tourController = require("../controllers/tourController");

const authController = require("../controllers/authController");

// const reviewController = require("../controllers/reviewController");

const reviewRouter = require("../routes/reviewRoutes");

// const {getAllTours , getTour , createTour , updateTour , deleteTour} = require("./../controllers/tourController");

const router = express.Router();

/* POST /tour/234hsdf45t/reviews => We have the tourId right in the URL and the userID will also come from the currently
logged in user , If you see the above route then it is clearly called as nested route and this makes a lot of sense when 
there is a clear parent child relationship between resources this is clearly the case here , Here reviews is clearly
a child of tour and so this nested route clearly means to access the reviews resource on the tours resource and in the
same way we actually wants to access reviews from a certain tour in the same way as GET /tour/234hsdf45t/reviews => then
this nested route will get us all the reviews for this tour and we can go further on this nested route 
 GET /tour/234hsdf45t/reviews/27364gdfhsdgf => This is the reviewId(27364gdfhsdgf) of a particular tour with the ID(234hsdf45t) 
 So this is what all about the nested routes and This is a way more easier way of reading and understanding how the API 
 works for our API users , It's way easier than messing around with query strings and all this stuff and also this
 really shows how there is a clear relationship between these resources which are the reviews and tours */

// router.route("/:tourId/reviews").post(
//   authController.protect,
//   authController.restrictTo("user"),
//   reviewController.createReview, // It is little bit confusing calling the reviewController.createReview in tourRoutes.js
// file . Basically what we are saying is , It doesn't make much sense to actually call the reviewController in the
// tourRoute.js file but again for now we have to do like this because the route starts with tour and at the end we will
// fix this and for now please understand how the nested routes will be implemented
// );

router.use("/:tourId/reviews", reviewRouter); // We will basically say that the tour Router should use the tour Router incase it ever encounters a route
// like this , Just keep in mind that here the router itself a middleware and so we can use a use() method on it and then
// say that for this specific route "/:tourId/reviews" here we want to use the reviewRouter instead and this is actually
// mounting a router . There is still one piece missing here which is , right now the above reviewRouter doesn't get access
// to the above "tourId" parameter and so we have to enable the reviewRouter to actually get access to this tourId parameter
// as well

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours); // Before calling this route-handler , We basically want to prefill
// some of the fields in the query string and we already know that our query string should look like this "?limit=5&sort=-ratingsAverage,price"
// and the solution is gonna be is to run a middleware function before we run the getAllTours handler and that middleware function
// will manipulate the query object that is coming in and this is yet another good example of using the middleware . In the above
// route handler "tourController.aliasTopTours" is the middleware function that will run before the getAllTours handler called.

router.route("/tour-stats").get(tourController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan,
  );

/* EVERYTHING ABOUT GEO-SPATIAL QUERIES */
/* Inorder to implement the above cool feature which is GEO-SPATIAL QUERIES which is to provide a search functionality
for tours within a certain distance of a specified point . So let's say you live in a certain point and wanted to know
which tours start at a certain distance from you , like 250 miles because you don't want to drive further than that inorder
to start your tour experience. So this would be an awesome feature and this is really nice use case of geo-spatial queries
and Inorder to implement something like this , Here in our tourRouter we could create a nice route */

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin); // here center is the point where you live and ":latlng" is the
// coordinates that we want to pass that where we are currently living. Let's say we live in los-angeles and wanted to
// find all the tours within a distance of 300 miles , So you would say in distance=300 miles and in the :latlng we will
// pass the coordinates of the los-angeles location that where we are currently living in. and the :unit parameter is
// specifying that is miles (or) kilometers so on...
// Other way of doing it is sending a query string as below
// /tours-distance?distance=300&center=-40,45&unit=miles => This is a query string which comes after question mark(?)

/* GEO-SPATIAL AGGREGATION */
// We use geo-spatial aggregation inorder to calculate distances to all the tours from a certain point.

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances); // here ":latlng" is the latitude and the longitude points where the
// user is currently in and the unit what we will specify as we already specified in the previous route. This time in this
// route there is no need to pass ":distance" parameter which we have used in the previous route because we are not gonna
// searching for a certain radius. We are gonna calculate the distance from a certain point to all the tours that we have in
// our collection

router
  .route("/")
  // .get(authController.protect, tourController.getAllTours) // Inorder to protect these routes here we gonna use a middleware function which is gonna
  // // run before all of these handlers . So this middlware function will return an error if the user is not authenticated (or)
  // // it will call the next middleware function which is the getAllTours handler here
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour,
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"), // Both admin and lead-guide can now update the tours
    tourController.updateTour,
  )
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
