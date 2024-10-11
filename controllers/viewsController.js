const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === "booking") {
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  } // If you put this message on res.locals.alert then this alert is available in all pug templates . In this particualr case our
  // base.pug file is present in views folder will pick this alert and displat it in the "data-alert" property
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get all the tour data from the collection
  const tours = await Tour.find(); // We have to pass all this tour data into the below template such that we can use it to
  // render on to the website

  // 2) Build the overview template
  // 3) Render the overview template using tour data from step 1

  res.status(200).render("overview", {
    title: "All Tours",
    tours, // Here the tours data from above is passed into this overview template
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // Step 1: Get the data for the requested tour (including the reviews and the tour guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user", // We need only three fields here which are review,rating and user.
  });

  if (!tour) {
    return next(new AppError("There is no tour with this name", 404));
  }

  // Step 2: Building the template
  // Step 3: Render the template using the data from step 1
  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour, // Here the tour data from above is passed into this tour template.
  });
});

exports.getLoginForm = (req, res) => {
  // rendering a login template
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // Here we have to find all the tours that the user has booked...
  // First we have to find all the bookings for the currently logged in users which will then give us a bunch of tourId's and then we have
  // to find the tours with those Id's
  // Step 1) Find all the Bookings
  const bookings = await Booking.find({ user: req.user.id }); // Each Booking document has a userId and a tourId which was already defined
  // in the bookingSchema.
  // The above "bookings" variable will contain all the bookings (or) booking documents that the currently logged in user has made but
  // really it only gives us the tourId's but not the actual tours and this is what we will do in the below Step-2. In the below Step-2
  // We will create an array of all Id's and then after that query for tours that has (or) contains one of these Id's.

  // Step 2) Find tours with the returned Id's
  const tourIDs = bookings.map((el) => el.tour); // We are using a map() function to create a new array based on a callback function which is
  // "el => el.tour" which will give us an array of tourId's. What does the above map() function will do is , It will loop through the
  // entire bookings array and on each element it will grab the el.tour which is the tourId and after the map() function completed
  // executing on every booking that is present in bookings and then this tourIDs is an array which contain all the tours that are booked
  // by a user and please note that here the el.tour will map to tourId because in the Booking table we are storing only the tourId's and
  // the userId's but not the complete tour document. so el.tour in the bookings is same as the el.tourId. So after getting all the tourId's
  // in the tourIDs array we can then query for the tours that has (or) contains one of these Id's by the below step.

  const tours = await Tour.find({ _id: { $in: tourIDs } }); // This will select all the tours which have an "_id" which is in the tourIDs
  // array and here we can use the very handy operator which is the "in" operator

  // Until this point we have all the tours that are ready to be rendered on to the  frontend using the render() method.
  res.status(200).render("overview", {
    title: "My tours",
    tours, // Passing in the tours data to the overview template which is nothing but the overview.pug
  }); // We are reusing the overview template here to be rendered using the tours data
  // on the frontend which are the tours that the user has booked
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name, // Remember that these are the names of the fields because we gave them the name attribute in the
      // HTML form. Now before when we updated some data , we used to pass in the entire request here into the above
      // findByIdAndUpdate() method but in this case , we really only want to update the name and the email and so like this
      // we are sure that anything else basically being stripped away from the body because some hacker could ofcourse now
      // go ahead and add some additional fields to the HTML and then for example submit data like passwords and stuff like
      // this and so ofcourse we donot want to store this malicious data into our database and also passwords are handled
      // separately because remember we can should never update passwords using findByIdAndUpdate() because this is not
      // going to run the safe middleware which will take care of encrypting our passwords and this is the reason we have
      // seperate route in our API and also we have seperate form for updating the password in our user interface
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  ); // We have to actually protect this route as well then only
  // we will have this user on this request.

  res.status(200).render("account", {
    title: "Your Account",
    user: updatedUser, // Here the updated user data from above is passed into this account template.
  });
});
