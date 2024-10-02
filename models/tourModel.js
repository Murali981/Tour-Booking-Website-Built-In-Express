const mongoose = require("mongoose");
const slugify = require("slugify");
// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true, // It will remove all the white spaces in the beginning and in the end of the string
      maxLength: [40, "A tour name must have less or equal than 40 characters"],
      minLength: [10, "A tour name must have or equal than 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contains characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a  group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either easy,medium (or) difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // This set function will run each time whenever a new value is set for this field , Here we will usually specify
      // a callback function , 4.666666 * 10 = 46.66666 => round(46.6666) = 47 => 47/10 = 4.7
      // The above setter(set) function will run each when there is a new value for the ratingsAverage field
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // Here the this keyword points to the current document only on NEW document creation
          return val < this.price; // price discount is 100 and the real price is 200
        }, // Please remember that we can't use a arrow function here because we will not access to this keyword
        // in a arrow function
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true, // It will remove all the white spaces in the beginning and in the end of the string
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String], // Array of strings to store image URLs
    createdAt: {
      type: Date,
      default: Date.now(), // This will simply give a timestamp in milliseconds
      select: false, // When we are querying the data this select : false will hide the output to the client without sending the
      // createdAt field to the client as a response
    },
    startDates: [Date], // Array of dates to store start dates of the tour
    secretTour: {
      type: Boolean,
      default: false,
    },
    /* LOCATION DATA IS EMBEDDED INTO THIS TOURS MODEL */
    // MongoDB Supports geo-spatial data out of the box. Geo-Spatial data is basically a data that describes places on earth
    // using longitude and latitude coordinates where we can describe simple points (or) we can also describe more complex
    // geometries like lines , polygons (or) even multi polygons , So these all possible with geoSpatial data in mongoDB
    startLocation: {
      // MongoDB uses a special data format called GeoJSON inorder to specify geo-spatial data and also remember that we
      // are embedding the location data into this tour model
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number], // Here we are saying that we are expecting an array of numbers.
      address: String,
      description: String,
    },
    /* We should always use the below array of objects [{}] which will create brand new documents inside of this 
      parent document which is in this case is the tour */
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number], // Here we are saying that we are expecting an array of numbers.
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, // This is for emebedding
    guides: [
      { type: mongoose.Schema.ObjectId, ref: "User" }, // We expect  the type of each of the elements in the guides array to be a
      // mongoDB ID , In the above way (ref:User) we will establish references between different datasets in Mongoose.
    ],
    // reviews: [{ type: mongoose.Schema.ObjectId, ref: "Review" }], // This is the way we implement the child referencing.

    // The idea here is , tours and users will always remain completely separate entities in our database.
    // So all we save on a certain tour document is the ID's of the users that are the tour guides for that specific tour.
    // Then we query that tour we want to get automatically get access to the tour guides . But again without them being
    // actually saved on the tour document itself and this is exactly what we call as referencing

    // Next we gonna use populate inorder to basically replace the fields that we have referenced with the actual related
    // data and the result of that data will look as if the data has always been embedded and we know that it is completely
    // in a different location. Now the populate process always happens in a query and so we will go to the tourController
    // and write a function where we get a single tour
  },
  {
    toJSON: {
      virtuals: true, // This will include virtual properties in the JSON output
    },
    toObject: {
      virtuals: true, // This will include virtual properties in the JSON output
    },
  },
);

/* INDEXING CONCEPT GENERAL DECRYPTED BELOW  */

/* HOW DO WE DECIDE WHICH FIELD WE ACTUALLY NEED TO INDEX ? */
/* The answer for the above question is , Why can't we set indexes on all the fields ? Well we can use this kind of
strategy that we have used to set indexes on the price and averageRating fields. So basically we need to carefully study
the access patterns of our application inorder to figure out which fields are queried the most and then set the indexes
for these fields. For example , We are not setting an index on the group size because we don't believe that many people
will query for this "groupSize" parameter and so i don't need to create index on "groupSize" field  because we really
donot want to overdo with indexes. So we don't want to blindly set indexes on all the fields and the reason for this is
each index actually use resources and also each index needs to be updated each time when the underlying collection got
updated. So if you have a collection with high write/read ratio(Which is a collection that is mostly written to) then
it would make absolutely no sense to create an index on any field in this collection because the cost of always updating
the index and keeping it in memory clearly outweighs the benefit of having the index in the first place if we rarely 
have searches , so have queries for this collection . So in summary, When deciding to index a certain field (or) not then
we must kind of balance the frequency of queries using this exact field with the cost of mantaining this index and also
with the read-write pattern of the resource */

// tourSchema.index({ price: 1 }); // We are setting the index on the price field as we thought that users might be more interested
// // in querying the price field of all the tours than other fields and we have set the "price:1" which means we are sorting the
// //  price index in ascending order and "-1" stands for descending order

tourSchema.index({ price: 1, ratingsAverage: -1 }); // We are setting the index on both price field and ratingsAverage field
// as we thought that users might be more interested in querying the price field and ratingsAverage field
//  of all the tours than other fields  and we have set the "price:1" which means we are sorting the  price index
// in ascending order and "ratingsAverage: -1" which means we are sorting the ratingsAverage index in descending order
// And also we are applying indexing on 2 fields which is known as compound indexing.

tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: "2dsphere" }); // for the geo-location data the index needs to be a  2D sphere index if the data
// describes real points on the  earth like sphere (or) instead we can also use a 2D index if we are using just fictional
// points on a simple two dimensional plane , Now in this case we are talking about real points on the earth's surface.
// So we are going to use a 2D sphere index here... So here we are basically telling the mongoDB that this startLocation here
// should be indexed to a 2D sphere . So in a earth like sphere where all our data are located.

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7; // This function will return the duration of the tour in weeks.
}); // This virtual property here will basically be created each time that we get some data out of the
// database . This get() function is called a getter. To this getter we will pass a normal function. Here we have used the normal function
// because remeber that for a call-back function you will not get access to the "this" keyword but you will get access to "this" keyword
// for a normal function. The "this" keyword will be pointing to the current document.

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

// THIS IS VIRTUAL POPULATE
tourSchema.virtual("reviews", {
  ref: "Review", // This is the name of the model we are referencing.
  localField: "_id", // This is the field in our current document that we are referencing.
  foreignField: "tour", // This is the field in the Review model that we are referencing.
});

//// JUST LIKE VIRTUAL PROPERTIES WE DEFINE MIDDLEWARE IN THE SCHEMA //////////////////////////////////

//  DOCUMENT MIDDLEWARE : runs before .save() and .create() //////////////////////////////////
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
  // Slug is basically just a string that we can put on the URL usually based on some string like the name
}); // This pre() middleware is gonna run before an actual event , The event in this case is the "save"
// event. This middleware will be executed before the document is saved. This function will be called before th actaul document is
// getting stored in the database. In the save() middleware the this keyword is point to the currently processed document And this is
// the reason it is called the document middleware. Please remember that inorder to trigger this middleware we have to run either
// the ".create()" (or) ".save()" command . We need to create a new tour using our API inorder to trigger this middleware.

// PRE SAVE Middleware happens automatically behind the scenes whenever each time a new tour is saved

// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // this.guides will be an array of userId's and we will loop through a map with the array of
//   // userId's and then in each iteration get the user document for the currentId.
//   // The above map() method will assign the result of each iteration to the new element in the guides array and if you
//   // see inside the map() method there is an asynchronous function and it will return a promise and therefore the guides
//   // array will contain an array of promises.
//   this.guides = await Promise.all(guidesPromises); // We can directly assign the results of this to this.guides and basically
//   // we are overriding the array of Id's with an array of user documents
//   next();
// });

tourSchema.pre("save", function (next) {
  console.log("Will save the document");
  next();
});

tourSchema.post("save", function (doc, next) {
  console.log(doc); // post middleware functions are executed after all the pre middleware functions are executed (or) completed.
  next();
});

/// QUERY MIDDLEWARE ////////////////////////////////////////////////////////
// tourSchema.pre("find", (next) => {
tourSchema.pre(/^find/, function (next) {
  // This /^find/ regular expression means all the strings that starts with "find"
  this.find({
    secretTour: { $ne: true },
  });
  this.start = Date.now(); // This will start a timer when the query starts.
  next();
}); // This find hook makes this middleware a query middleware rather than a document middleware
// The only difference is here the "this" keyword points to the current query rather than the current document. The usecase that we
// gonna do here is . Let's suppose that we can have secret tours in our database like for the tours that are offered internally (or)
// very small VIP group of people and the public shouldn't know about that. Now since these tours are secret , We donot want the secret
// tours to ever appear in the result outputs. So what we gonna do here is to create a secret tour field and then query only for the
// tours that are not secret.

tourSchema.pre(/^find/, function (next) {
  // This query middleware will run each time when there is a query
  this.populate({
    // this always points to the current query
    path: "guides",
    select: "-__v -passwordChangedAt", // Here in the select we are mentioning explicitly that while populating the
    // guides data , don't show the "__v" and "passwordChangedAt" fields in the response output
  });
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(doc);
  next();
}); // in this post find middleware we will actually get access to all the documents that were
// returned from the query and remember that this post middleware gonna run after the query has already executed. Therefore it will have
// access to the documents that were returned from the query

// tourSchema.pre("findOne", (next) => {
//   this.find({
//     secretTour: { $ne: true },
//   });
//   next();
// });

///// AGGREGATION MIDDLEWARE //////////////////////////////////
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } }, // This will filter out the tours that are secret. This is an aggregation stage.
//   }); // We are using the standard unshift javascript function to add elements to the beginning of the array.
//   // And to this unshift() method we are adding another stage "$match : {secretTour : {$ne: true}}"
//   // console.log(this.pipeline()); // Here this points to the current aggregation object
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema); // Try to use Upper cases in model names and variables which is a convention to follow

module.exports = Tour; // Export the model for use in other files. In this case, it's used in the app.js file.
