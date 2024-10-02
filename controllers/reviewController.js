const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

exports.getAllReviews = factory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   // We will gonna check whether there is a tourId and if there is a tourId , then we will only search for the reviews
//   // where the tour is equal to this tourId.
//   let filter = {};
//   if (req.params.tourId) {
//     filter = { tour: req.params.tourId }; // If there is a tourId then we will filter the reviews by that tourId.
//   }
//   const reviews = await Review.find(filter); // Now by passing the above filter object into this find() function , then
//   // only the reviews that matches the tourId are going to be found . So if it is a regualar API call without a nested
//   // route then this filter will be simply an empty object and then we will find all the reviews.

//   res.status(200).json({
//     status: "success",
//     result: reviews.length,
//     data: { reviews },
//   });
// });

// In the below setTourIds function we are basically setting the IDs on the body and then move straight to the next
// middleware function where the review is actually created
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) {
    // If we didn't specify the tourId in the body then we want to define that as the one that is coming from the URL.
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id; // We are getting the req.user from the protect middleware.
  }
  // By the above two if conditions we are making sure that the user can still specify manually the tour and the user ID.
  // Basically what we are doing is , We are simply defining them when they are not there as when they are not specified
  // in the req.body
  next();
};

// exports.createReview = catchAsync(async (req, res, next) => {
//   //   // Allow nested routes
//   //   if (!req.body.tour) {
//   //     // If we didn't specify the tourId in the body then we want to define that as the one that is coming from the URL.
//   //     req.body.tour = req.params.tourId;
//   //   }
//   //   if (!req.body.user) {
//   //     req.body.user = req.user.id; // We are getting the req.user from the protect middleware.
//   //   }
//   // By the above two if conditions we are making sure that the user can still specify manually the tour and the user ID.
//   // Basically what we are doing is , We are simply defining them when they are not there as when they are not specified
//   // in the req.body
//   const newReview = await Review.create(req.body); // If there are any fields on the body that are not in the review schema
//   // then they will be simply ignored

//   res.status(201).json({
//     status: "success",
//     data: {
//       review: newReview,
//     },
//   });
// });

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review); // Here we are implementing the delete handler using the factory function
