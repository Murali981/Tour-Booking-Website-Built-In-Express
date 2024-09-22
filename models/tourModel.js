const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true, // It will remove all the white spaces in the beginning and in the end of the string
  },
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
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
  priceDiscount: Number,
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
});

const Tour = mongoose.model("Tour", tourSchema); // Try to use Upper cases in model names and variables which is a convention to follow

module.exports = Tour; // Export the model for use in other files. In this case, it's used in the app.js file.
