const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

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
