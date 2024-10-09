const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // Here this booking table will be referred by the tour and also the user who has booked the tour
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour", // This booking is referring to the Tour model
    required: [true, "Booking must belong to a tour"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User", // This booking is referring to the User model
    required: [true, "Booking must belong to a user who has purchased a tour"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    // This paid fied is mantained for example if the administrator of the Tours who wants to create a booking outside of stripe
    // So for example if a customer doesn't have a credit card and wants to pay directly like in a tour with the cash and in this case
    // the administrator can use our bookings API to manually create a tour and then this tour might paid (or) might not yet paid
    type: Boolean,
    default: true,
  },
});

// We also want to do here is , To populate the "Tour" and the "User" automatically whenever there is a query. We will do this by using the
// query middleware by doing right on the schema using "bookingSchema.pre()"
bookingSchema.pre(/^find/, function (next) {
  // Whatever starts with the find then this query middleware will gets executed
  // In this case there is absolutely no problem for performance because there won't be many calls to the bookings, because only
  // the guides and the admins will be actually allowed to do this. So basically for a guide to check who has actually booked their
  // tours and this is one of the usecase i am seeing in this API. So again this query will not happen that much often , So we can easily
  // populate all of this without any problem
  this.populate("user").populate({
    path: "tour",
    select: "name", // Here we only want to select the tour name that's why we are writing the populate({}) like this
  });
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
