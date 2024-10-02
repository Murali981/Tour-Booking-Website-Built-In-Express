const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"], // like this each review document now knows exactly what tour it
      // belongs to.
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"], // like this each review document now knows exactly what user it
      // belongs to.
    },
  },
  {
    toJSON: {
      virtuals: true, // This will include virtual properties in the JSON output . For example when we have a virtual
      // property which is basically a field that is not stored in the database but calculated using some other value
      // so we want this to show up whenever there is an output
    },
    toObject: {
      virtuals: true, // This will include virtual properties in the JSON output
    },
  },
);

// A review belongs to a tour and also it needs an author and this is what we have specified in the data modelling concepts.
// We are going to implement parent referencing in this case because both the tour and the user are in the sense the
// parents of this data set and we want to decide to do this way because we are going to potentially huge arrays in the
// parent elements . So we should design our application thinking there will be only few reviews then only come back
// after some time and find out that our assumptions were wrong and now we want to rebuild our entire data model and this
// would be terrible and so in many situations as we donot really know how much our arrays will grow then it is best to
// opt for parent referencing , This is what exactly we are doing here when we are referencing tour and the user.

/* Let's Learn about a new mongoose advanced feature which is called VIRTUAL POPULATE  */
/* In the below reviewSchema.pre() query middleware , We have populated the reviews with the tour and the user data .
 So when we query for reviews , we will get access to the tour and the user information . However  this still leaves
 one problem unsolved which is , how are we going to access reviews on the tours model. So basically the other way 
 around . Let us say i have queried for a specific tour and then how will i get access to all the reviews for that 
 tour and this problem arises here because we did parent referencing on the reviews which is basically having the reviews
 pointing to the tours and not the tours pointing to the reviews. So in this case  , the parent tour doesnot know
 anything about the children reviews and sometimes it is ok but in this case we actually want the tour to basically
 know about all the reviews that it's got . The knowledge that we have until this point , We can think of 2 solutions
 first solution would be manually query for reviews each time that we query for tours but it will be a cumbersome doing
 it manually like this and the second solution could be also doing child referencing on the tours . So basically keep
 an array of all the review ID's on each tour document then all we have to do is populate this review ID's array but we 
 have actually ruled out this second solution because we donot want to store the array of review ID's that could grow
 indefinitely on our database and this is the reason exactly we have taken the parent referencing in the first place.
 However there is a great solution for this and that's because mongoose actually offers us a very nice solution  for
 this problem with a pretty advanced feature called "VIRTUAL POPULATE" . So with "VIRTUAL POPULATE" we can actually 
 populate the tour with the reviews . So in other words we can get access to all the reviews for a certain tour but
 without keeping this array of ID's on the tour. So think of  "VIRTUAL POPULATE" like a way of keeping the array of
 review ID's on the tour but without actually  persisting it to the database and so this solves the problem that
 we have with child referencing. So it is a bit like virtual fields but with populate */

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // We are doing compound indexing here where we indexing
// both on tour and user . So in simple words what we are doing is , We want each combination of tour and user has always to
// be unique . This is because we want to prevent duplicate reviews given by the same user to the same tour more than once

reviewSchema.pre(/^find/, function (next) {
  //   // This will run before any method starting with find() is called
  //   // Call the populate() method on the current query
  //   this.populate({
  //     // When you want to see(or) populate multiple fields then we have to call the populate() method multiple
  //     // times
  //     path: "tour",
  //     select: "name", // only return the name field when we fetch the reviews
  //   }).populate({
  //     path: "user",
  //     select: "name photo", // only return the name and photo fields when we fetch the reviews
  //   });

  // This will run before any method starting with find() is called
  // Call the populate() method on the current query
  this.populate({
    path: "user",
    select: "name photo", // only return the name and photo fields when we fetch the reviews
  });

  next();
});

// Storing a summary of a related dataset on the main dataset is actually a very popular technique in data modelling that we
// hadn't actually mentioned yet And this technique can actually be really helpful inorder to prevent constant queries of the
// related dataset. So in this tours application a great example of this technique is to store the averageRating and the number
// of ratings on each tour. So that we don't want have to query the reviews and calculate the average each time that we query
// for all the tours. For example this could be very useful for a tour overview page in our front-end where we really donot
// want to display all the reviews but still want to show the summary of these reviews like for example, the number of ratings
// and the average and actually we already have the fields for this in our tourSchema which are "ratingsAverage" and
// "ratingsQuantity" but at present in our tours application these both fields "ratingsAverage" and "ratingsQuantity are just
// random numbers but they are not actual average and the actual no of ratings because we never calculated these both fields
// in our application, But that's exactly we will do below which is calculating the actual average rating and also the
// number of ratings of a tour each time when a new review is added to the tour (or) also when a review is updated (or) deleted
// because this is exactly the situations when the number (or) average might change. So now how are we going to implement this
// feature is , In this reviewModel.js file we will create a new function which will take in a tourId and calculate the average
// and the number of ratings that exist in our collection for this exact tour then in the end this function will even update
// the corresponding tour document, Then inorder to use this function we will use the middleware to basically call this
// function each time whenever there is a new review (or) any review is updated (or) deleted

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // The tourId is the id of the tour for which the current review belongs to...
  // Inorder to do this calculation we will again use this aggregation pipeline
  // In the static method "this" keyword points to the current model which is reviewSchema and so we can use the aggregate()
  // method directly on the "this" keyword
  const stats = await this.aggregate([
    // here this.aggregate() method will return a promise , So we have to await on this
    {
      $match: { tour: tourId }, // Here we are only selecting the tour that we want to update
    },
    {
      $group: {
        _id: "$tour", // Here we are grouping all the tours together by tour
        nRating: { $sum: 1 }, // We will basically add one to each tour that is actually matched in the previous step.
        // let us suppose if there are five review documents for the current tour then for each of the documents
        // one will be added. So if there are five review documents for the current tour then each of these documents
        // one will get added and so in the end the no of ratings will be five.
        avgRating: { $avg: "$rating" }, // We are calculating the average from the rating field available on the reviewSchema
      }, // In this group stage the first field we have to specify is the _id and then the common field that all
      // of the documents having in common that we want to group by and that is going to be the tour
    },
  ]); // We can call the aggregate() method on the model directly . So this is the reason we are making the
  // above calcAverageRatings() method a static method rather than an instance method. To this aggregate() method we have to
  // pass an array of all the stages that we want to aggregate. First stage we want to pass is , selecting all the
  // reviews that actually belong to the current  tour that we have passed in as an argument. So our first stage is a
  // match stage where we match the tourId that we have passed in as an argument.
  //   console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      // This return a promise , So we are awaiting on it
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      // When the stats.length === 0 then update the ratingsQuantity to 0 and
      // ratingsAverage to 4.5 as these are the default values when there are no reviews for the tour
      // This return a promise , So we are awaiting on it
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// We will call the above static method calcAverageRatings() using a middleware whenever a new review is created

reviewSchema.post("save", function () {
  // This post() middleware will be called after a new review is created
  // For post middleware there will be no access to next()
  // In this kind of middleware the this keyword points to the document that is currently being saved which is the current
  // review.
  // this.constructor points to the current model
  this.constructor.calcAverageRatings(this.tour); // If you see the Review is defined below but we are reading it before defining it.
  // But we can't move this code snippet below the "Review" where it is defined as the "Review" model is already created.
  // So the solution for this is , using this.constructor where "this" still points to the model. Again "this" is the
  // current document and the constructor is basically the model who has created this document
});

// A review is updated (or) deleted using findByIdAndUpdate() , findByIdAndDelete() => for these we don't have document
// middleware but we have only query middleware and so in the query we don't have direct access to the document inorder to
// do something similar to above because please remember we need access to the current review and from the current review
// we can access to the tourId and then calculate the statistics, But we don't have document middleware for these two
// hooks findByIdAndUpdate() and findByIdAndDelete() , So to bypass this limitation , We will follow the below small trick
// where we are going to implement a pre-middleware for the above two hooks.
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Remember the goal is to get access to the current review document but here the this keyword is the current query,So now
  // how are we going around this is , Well we can basically execute a query and then that give us the document that is
  // currently being processed. So inorder to do that we can use findOne().
  // We have created a property variable on this.r
  this.r = await this.findOne(); // This findOne() here will really gets the document from the database and at this point
  // of time in pre() middleware it didn't persist any changes in the database.
  //   console.log(this.r); // From here we need the tourId to calculate the average ratings.
  /* Let's think here for sometime  as if we want to use the calcAverageRatings() function at this point in time then we 
  would calculate the statistics using the non-updated data and this is the exact same reason why we have used the post()
  middleware function above but not the pre() function middleware because only after the  document is already saved to the 
  database then only it makes sense to calculate the ratings and so here also it is the same exact thing but the big 
  difference that we cannot simply change this pre() to post() because at this point in time we have no longer access to the
  query because the query is already executed and so without the query  we cannot save the query document and we cannot run this
  calcAverageRatings() function. So this is really confusing but the solution here is to use post() middleware below where
  we will get the updated review as the query will be already finished executing  */
  next();
}); // remember that behind the scenes , findByIdAndUpdate() and findByIdAndDelete() are just
// a shorthand for findOneAndUpdate with the current ID. So here we have to actually use "findOneAndDelete()" and
// "findOneAndUpdate()" middleware hooks

reviewSchema.post(/^findOneAnd/, async function () {
  // this.findOne() => doesnot work here because the query is already executed
  // In the below this.r.tour where this.r has the review object and from there this.r.tour gives us the access to the
  // tourId of the document that we have to calculate the average rating on this tourId and also we cannot directly call
  // the below calcAverageRatings(this.r.tour) method becasue this is a static method and static methods can only be
  // called on the model and where does the model exists here , The answer is the model exists on this.r.constructor
  await this.r.constructor.calcAverageRatings(this.r.tour); // From where we will get the tourId from , So here we will use a trick which is basically to pass
  // data from pre middleware to the post middleware , So  from the above written pre() middleware , We will get the
  // tourId.
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

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
