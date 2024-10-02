const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

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

const router = express.Router({
  mergeParams: true, // By default each router only have access to the parameters of their specific routes , But here in the
  // below route which is router.route("/").post() request there is no access to the tourId but we want to still get access
  //  to the tourId which was in the other router which is "router.use("/:tourId/reviews", reviewRouter)" , So inorder to get
  // access to this tourId we have to basically set the mergeParams:true
}); // Here in the express.Router({}) function we can specify some options and here what all
// we need to do is to set the mergeParams property to "true"

// Protects all routes after this middleware
router.use(authController.protect); // As we already know that middlewares run in sequence . So what this
// router.use(authController.protect) will do is , It will protect all the routes that comes after this line and if
// the user successfully logs in by using the authController.protect middleware then only the next() will be called
// and all the below routes will be called. So you can remove the "authController.protect" middleware from all the below
// routes as they all are already protected from this middleware

router.route("/").get(reviewController.getAllReviews).post(
  // authController.protect, // This protect middleware makes sure that only authenticated users can access this route
  authController.restrictTo("user"), // Here we are restricting this route to only the users who have a role as "user"
  reviewController.setTourUserIds, // This middleware sets the tourUserIds to the currently logged in user,
  //  and it only gets executed if the user making the request is authenticated
  reviewController.createReview,
);

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview,
  );

module.exports = router;
