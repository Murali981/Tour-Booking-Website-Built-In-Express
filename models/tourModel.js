const mongoose = require("mongoose");
const slugify = require("slugify");

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

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7; // This function will return the duration of the tour in weeks.
}); // This virtual property here will basically be created each time that we get some data out of the
// database . This get() function is called a getter. To this getter we will pass a normal function. Here we have used the normal function
// because remeber that for a call-back function you will not get access to the "this" keyword but you will get access to "this" keyword
// for a normal function. The "this" keyword will be pointing to the current document.

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
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } }, // This will filter out the tours that are secret. This is an aggregation stage.
  }); // We are using the standard unshift javascript function to add elements to the beginning of the array.
  // And to this unshift() method we are adding another stage "$match : {secretTour : {$ne: true}}"
  // console.log(this.pipeline()); // Here this points to the current aggregation object
  next();
});

const Tour = mongoose.model("Tour", tourSchema); // Try to use Upper cases in model names and variables which is a convention to follow

module.exports = Tour; // Export the model for use in other files. In this case, it's used in the app.js file.
