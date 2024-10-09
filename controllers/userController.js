const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

const catchAsync = require("../utils/catchAsync");

const factory = require("./handlerFactory");

// // CREATING A MULTER STORAGE
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   }, // Here the destination is a call-back function and this callback function has
//   // access to the current request , currently uploaded file and also to a call-back function and this callback function
//   // is like a next() function in express and we are calling it as "cb" here which stands for callback function and this
//   // callback function doesn't come from express.
//   filename: (req, file, cb) => {
//     // user-47987598-84353457945.jpeg => This type of file name guarantees that no two images will have the same filename
//     // user-userId-current-timestamp => if we have used only the userId then multiple uploads by the same user would override
//     // the previous image and also if we used the user only with the timestamp then if two users are uploading the image
//     // at the same time then they would get exactly the same filename.
//     // Below we will extract the filename from the uploaded file
//     const ext = file.mimetype.split("/")[1]; // mimetype: "image/jpeg".
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); // Here "null" indicates that there is no error
//   },
// });

// CREATING A MULTER STORAGE
const multerStorage = multer.memoryStorage(); // Here the image will be stored as a buffer into the memory.

// CREATING A MULTER FILTER
const multerFilter = (req, file, cb) => {
  // The goal of this multerFilter() function is to test if the uploaded file is an image (or) not ? and if it is an image
  // then we pass "true" into the call-back function(cb()) and if it is not an image then we will pass false into the
  // call-back function along with an error and Again reiterating it we strictly don't allow files to be uploaded that are not
  // images and this is exactly this multerFilter is for....
  if (file.mimetype.startsWith("image")) {
    cb(null, true); // As if it starts with an image then we will pass "null" as a first argument indicating that there is
    // no error and "true" as the second argument saying that the uploaded file is an image
  } else {
    cb(new AppError("Not an image! Please upload only images", 400), false); // For this first argument here we will now
    // create an AppError() as we are all doing previously
  }
};

/* MULTER is a very popular middleware to handle multi-form data which is a form encoding that is used to upload files
from a form. Previously we have used a URL encoded form inorder to update the user data and for this we also had to include
a special middleware and multer is basically a middleware for multi-part form data. We will allow the user to upload a photo
on the /updateMe route. So instead of just being able to update the email and photo , users will also be able to upload there
user photos. To implement this multer middleware into our project , First we have to install multer into our project using the
command "npm install multer" */

// const upload = multer({
//   dest: "public/img/users", // This is exactly the folder where we want to save all the images that are being uploaded.
//   // Please make a point here that , Images are not directly uploaded into the database as we just upload them into our
//   // file system and then in the database , We will put a link basically to the image. So in this case , In each user document
//   // we will have the name of the uploaded file. We will use the above "upload" to create a middleware function that we can
//   // put it into the "/updateMe" route
// });

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter, // This is the function that is going to be executed for each file that is being uploaded.
});

exports.uploadUserPhoto = upload.single("photo"); // This "upload.single()" is saying that we want to upload only a single image and to this single() method
// we are going to pass the name of the field that is going to hold the image to upload.

/*  In this we will learn about Image processing and manipulation with node.js and in this particaular case , We will resize and convert 
our images. So everywhere in our user interface , We assume that the uploaded images are squares so that we can display them in circles and
this works when there are only squares but offcourse in the real world users rarely going to upload images that are squares and so our job
 is to actually resize images to make them squares
 */

// We will add another middleware before the updateme and then that middleware will take care of the actual image processing

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // At this point we already have the file on our request atleast if there was an upload and if there was no upload then ofcourse we
  // don't want to do anything.
  if (!req.file) {
    return next(); // If there was no file on the request then we don't want to do anything and we will simply call the next middleware.
  }

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Doing Image Resizing using the Sharpe Package using the npm command "npm i sharp" . ///
  // sharp third party npm library is really nice and easy to use image processing library for node.js and helps in resizing images in a
  // very simple way.
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); // To this sharp() function we have to pass in the file that we want to do image processing. Now when doing image processing
  // right after uploading a file then it is always best to not even save  the file to the disk but instead save it to memory. So to
  // do this we have to do changes in multer configuration which is just the multer storage. Then the file is available at
  // req.file.buffer. Calling a sharpe() function like this will create an object on which we can chain multiple methods  inorder to
  // do image processing. The first method we want to chain to this sharpe() method is resize() where we can specify the width and the
  // height , So we are specifying the width and height to be 500 as we know that if the image has to be square then it should have
  // same width and height. Now this , it will crop the image so that it covers this entire 500 times 500 square(500 x 500) and we can
  // change this default behaviour if we want to.

  next();
});

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
  // console.log(req.file);
  // console.log(req.body);

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
  if (req.file) {
    filteredBody.photo = req.file.filename; // Here we are adding the filename of the uploaded image to the user document.
    // We will only store the image name to our documents and not the entire path to the image. In this line which is
    // filteredBody.photo = req.file.filename => We are adding the photo property to the object that is going to be
    // updated in the below filteredBody and this photo property is equal to the file.filename
  }

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
