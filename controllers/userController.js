const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users: users, // (or) you can simply leave it as tours . In tours:tours the right side tours will represent the tours variable
      // that is coming from the fs.readFileSync() function and the left side tours is representing the tours as a resource in the
      // path "/api/v1/tours"
    },
  }); // This type of formating the response data coming from the server is "JSEND data specification"
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined.",
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined.",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined.",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined.",
  });
};
