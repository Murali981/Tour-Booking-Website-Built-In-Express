const User = require("../models/userModel");
const AppError = require("../utils/appError");

const catchAsync = require("../utils/catchAsync");

const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // Here the allowed fields is an array containing the name and email fields ["name", "email"] because we have used
  // the rest operator here.
  // Here we want to loop through the entire object and for each element check if it is one of the allowed fields and if yes
  // then simply add it to the new object and then we will gonna return the new object in the end.
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  }); // This is one of the easy ways to loop through an object in javascript. Here this Object.keys() function
  // will return an array containing all the key names which are the field names of this object and then we can loop through
  // them using the forEach() method
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id; // req.params.id is the getOne() function is going to use and then for getting this
  // getMe end point set the req.params.id = req.user.id
  next();
};

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     results: users.length,
//     data: {
//       users: users, // (or) you can simply leave it as tours . In tours:tours the right side tours will represent the tours variable
//       // that is coming from the fs.readFileSync() function and the left side tours is representing the tours as a resource in the
//       // path "/api/v1/tours"
//     },
//   }); // This type of formating the response data coming from the server is "JSEND data specification"
// });

exports.updateMe = async (req, res, next) => {
  // Step 1) Basically create an error if the user tries to update the password (or)Create error if the user POSTs
  // the password data.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. So please use /updateMyPassword",
        404, // Here 404 status code is for a bad request
      ),
    );
  }

  // Step 2) Update the user document
  // In the below findByIdAndUpdate() method why are we putting "x" instead of req.body , because we actually donot
  // want to update everything that is in the body , Because let us say the user puts in the req.body to update his
  // role from "user" to "admin" (req.body.role = "admin") then this would allow any user to change his/her role from
  // "user" to "admin" and ofcourse this could not be allowed (or) the user could also change his resetToken (or) the
  // resetTokenExpires should not be allowed . So doing this will be a huge mistake. So we need to make sure that
  // the object we pass into the findByIdAndUpdate() method should only contain the "name" and "email" because for now
  // these are the only fields that we want to allow to update. So basically we want to filter the body , So that
  // in the end it should only contain the name and email. So if the user tries to change his/her role from "user" to "admin
  // then it will be filtered out so that it never find it's way to the database.

  const filteredBody = filterObj(req.body, "name", "email"); // here we want our body to keep only the name and email

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // If the new:true then it returns the new object which is basically the updated object instead of the old
    // one and also set the runValidators to true.
    runValidators: true, // This will validate the updated user document.
  }); // This req.user.id is coming from the protect middleware.
  // await user.save(); // This will give you an error because "passwordConfirm" is a required field so it will give you
  // // this validation error if you use .save() method here. Instead we can use findByIdAndUpdate() method here because
  // // we are not dealing with passwords but we are dealing with the non-sensitive data like name (or) email , So we can use
  // // findByIdAndUpdate() method here.

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
}; // This is called updateMe handler because it is for updating the currently
// authenticated user , Here in this "updateMe" handler he can update his name and email address.

// When a user wants to actually delete his account then we actually do not delete that document from the database but
// instead we actually just set the account to "inactive" , So that the user might at some point in the future wants to
// reactivate the account and also so that we still can basically access the account in the future even if officially,
// let's say the account has been deleted. So to implement this , first of all we need to create a new property in our
// schema which is the active property. So to delete the user , We have to basically set the active property to false.

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    // Here the status code 204 means that after deleting the user , there is nothing will be
    // showed in the response
    status: "success",
    data: null,
  });
});

exports.getUser = factory.getOne(User);

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "This route is not yet defined.",
//   });
// };

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup instead",
  });
};

// Donot Update passwords with this
exports.updateUser = factory.updateOne(User);

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "This route is not yet defined.",
//   });
// };

exports.deleteUser = factory.deleteOne(User);

// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: "error",
//     message: "This route is not yet defined.",
//   });
// };
