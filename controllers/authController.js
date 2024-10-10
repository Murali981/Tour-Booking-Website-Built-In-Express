const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

// const signToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   }); // Here the _id is the payload that we use to sign the token
// };

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

/* WHAT ARE COOKIES ? */
/* Cookie is just a small piece of text that the server can send to clients. Then when the client receives a 
 cookie then it will automatically store it and then automatically send it back along with all the future requests
  to the same server. So again Browser automatically stores a cookie that it receives and sends it back in all the 
  future requests to that server where it  came from */

/* HOW TO ACTUALLY CREATE AND SEND A COOKIE ? */
/* Inorder to send a cookie , Attach it to the response object like this "res.cookie()" */

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ), // Here we are adding the current date to 90 which means 90 days and then converting the 90 days to milliseconds
    // by multiplying it with 24(1day = 24 hours) * 60(1hour = 60min) * 60(1min = 60sec) * 1000(1sec = 1000milliseconds)
    // secure: true, // Secure to true means it will send the cookie only in encrypted connection
    httpOnly: true, // This means the cookie can only be accessed by the server and not by the client. In simple words
    // this cookie cannot be modified (or) accessed in any way by the browser and this is important inorder to prevent
    // these cross-site scripting attacks. Whenever we set the httpOnly to true then it will basically receive the cookie,
    // store it and then send it automatically along with every request . If we try to test this cookie , it will not
    // work because we are not using "https" but we are using "http" . Because of the cookie set to true the cookie
    // would not be created and not be sent to the client and we only want to activate this secure:true in production
    // only . So we basically want to export this entire thing into a separate variable
    secure: req.secure || req.headers["x-forwarded-proto"] === "https", // This line is same as writing the below if statement
  };

  // // if (process.env.NODE_ENV === "production") {
  // if (req.secure || req.headers["x-forwarded-proto"] === "https") {
  //   // The problem with the above if statement is , When we are in production then it doesnot mean that the connection is actually
  //   // secure because not all the deployed applications are automatically set to "https". So we need to change the above if statement.
  //   // In express , We have a secure property on request and only when the connection is secure then this req.secure will be true but
  //   // the problem in heroku is , this req.secure === true will not work because heroku proxies will redirect (or) modifies all the
  //   // incoming requests into our application before they actually reach our app. So inorder to make this work on heroku , We need to
  //   // test if the x forward proto header is set to https and this is what heroku does internally
  //   cookieOptions.secure = true; // This line will make sure that the cookie is only sent over an encrypted connection
  // }

  res.cookie("jwt", token, cookieOptions); // The first argument in this res.cookie() is the name of the cookie which is jwt
  // and the second argument is "the data that we actually  want to send in the cookie" and the data that we actually
  // want to send is the token variable that we have just generated. And the third argument is the couple of options we
  // specify , The first option we gonna specify is the "expires" property and basically this expires property will make it
  // so that the browser (or) the client in general will delete the cookie after it has expired. So we set the expiration-date
  // similar to the one we set in the JSON Web Token , We are creating a seperate variable for that.

  // Remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  //   const newUser = await User.create({
  //     name: req.body.name,
  //     email: req.body.email,
  //     password: req.body.password,
  //     passwordConfirm: req.body.passwordConfirm,
  //     passwordChangedAt: req.body.passwordChangedAt,
  //     role: req.body.role,
  //   }); // This create() function will return a promise , So we are awaiting on it.

  // Check if the email already exists
  const existingUser = await User.findOne({ email: req.body.email });

  if (existingUser) {
    return res.status(400).json({
      status: "fail",
      message: "Email already exists. Please use a different email.",
    });
  }

  console.log(req.body);
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get("host")}/me`;
  console.log(url); // This is just to see the URL that we are going to use to send the email
  await new Email(newUser, url).sendWelcome(); // We are making this await because we will only move to the next step when the email
  // has been sent successfully. And also please remember that in the above sendWelcome() is an async function

  createSendToken(newUser, 201, req, res);

  // Before we try the above function , Please remember that this is an async function and so we need to think about
  // an error handler here. Here we have to wrap the entire above function that we have just created into the
  // catchAsync() function . The reason we have created this createAsync() function because there is no need to write
  // try/catch block manually for every async function.
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; // This is object destructuring

  // 1) Check if the email and password exists (or) not
  if (!email || !password) {
    // We will simply create a new error here and our global error handling middleware will then pick it up and send back
    // the error to the client.
    return next(new AppError("Please provide the email and password", 400)); // Here after calling the next middleware , We
    // want to make sure that this login function finishes right away
  }

  // 2) Check if the user exists && password is correct
  const user = await User.findOne({ email }).select("+password"); // Here "select" is used only to select a
  // couple of fields from the database that we need. Now in this case that is by default not selected , We need to use "+"
  // and then the name of the field. In this way it will be back in the output. Now we got the password explicitly that
  // is stored in the database. And then we have to compare this stored encrypted password with the password that is
  // inputted by the user while trying to login which is a plain password . Now the question here is how you will
  // compare these two passwords. In Node.js we have a built-in module called "bcryptjs" which is used to hash passwords.
  // So bcryptjs is used to compare the hashed password with the plain password.

  // Here correctPassword() is an asynchronous function , So
  // we have to await on it.

  if (!user || !(await user.correctPassword(password, user.password))) {
    // if the user(!user) doesnot exist then it will simply return the below error and if the user exists in the
    // database but the password does not match then it will return the below error otherwise it will go to the
    // below line of code which sends the response back to the client.
    return next(new AppError("Incorrect email (or) password", 401)); // status code 401 means unauthorized
  }

  // 3) If everything is ok , then send the jsonwebtoken back to the client
  createSendToken(user, 200, req, res);
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  // This middleware is only for rendered pages and so the goal here is not to protect any route. So there will never be
  // an error in this middleware
  // 1) Getting the token and check if it exists (or) not ?
  if (req.cookies.jwt) {
    try {
      // If there is no cookie then there is no logged in user then the next() middleware will be immediately called which
      // is present outside this if condition and we will not put the currentUser on res.locals.user but if there is a cookie
      // then we will go through all the below verification steps and in the end if none of them called then the next()
      // middleware in the stack which means that there is a logged in user and so therefore we put that user on res.locals.user
      // and like this we will get access to this user in our pug templates
      // For our entire rendered website the token will always only be sent using the cookie and never the authorization
      // header and the authorization header is only for the API

      // 1) Verification of the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      ); // Now as a third argument this function actually
      // requires a callback  function and this callback function gonna run as soon  as the verification is completed . You can see that this
      // verify is an asynchronous function. It will verify the token and after the verification of token then it will call
      // a callback function that we can specify . We have been working with promises all the time. So here in this verify()
      // function , We are going to promisifying this function and as jwt.verify() function will return a promise. Node.js
      // has a builtIn promisify() function.

      // promisify(jwt.verify) will return a promise and then we are calling the function with (token, process.env.JWT_SECRET) and
      // calling this (token, process.env.JWT_SECRET) function will return a promise and so we are awaiting on it by using the
      // await keyword and storing the result into a decoded variable...And here the decoded variable result will be the
      // decoded JSON web token.

      console.log(decoded);

      /* Below 3 and 4 steps are necessary to ensure security but generally people stop here after doing the above 1 and 2 steps */
      // Why the below 3 and 4 steps are necessary to ensure security ? ////////
      /*  For example , what happens if the user is deleted in the mean time ? where the token will still exist but if the user
   is no longer existent well we then don't want the user to login (or) even worse What if the user has actually changed
   his password after the token has been issued ?  Well in this condition also it should not work ? For example imagine
   somebody has stolen the JSON Web Token from a user but then inorder to protect against in this situation the user changes
   his password And so ofcourse the old token that was issued before the password change  should no longer be valid. So it
   should not accepted to access the protected routes. These all the above we are gonna implement in the below steps 
   3 and 4    */

      // 2) Check if the user actually exists in the database (or) not ?

      const currentUser = await User.findById(decoded.id); // It is not the new user but the old user based on the decoded id.

      if (!currentUser) {
        return next();
      }

      // 3) Check if the user has changed the password after the token was issued.
      // To implement the above 4th step we will create another instance method , which is a method that is available on all
      // the documents.
      console.log(currentUser.changedPasswordAfter(decoded.iat));
      const getCurrentUser = await currentUser.changedPasswordAfter(
        decoded.iat,
      );
      if (getCurrentUser) {
        // This will return true if the user has changed the password
        return next();
      }

      // There is a logged in user
      // We can do res.locals.any-variable and as you can see , you can put any variable in there and then our pug templates
      // will get access to them. So if i say res.locals.user then inside of a template there will be a variable called user.
      // So again each and every pug template will have access to res.locals and whetever we put here will then be a variable
      // inside of these templates. So it is little bit like passing data into the template using the render() function.
      res.locals.user = currentUser;
      return next(); // When all the above conditions are satisified then only this next() method will be called by giving access
      // to the protected route which is getAllTours() method in this case.
    } catch (err) {
      return next(); // We are saying that there is no logged in user
    }
  }
  next(); // If there is no cookie then the next middleware will be called right away.
};

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true, // we don't want the token to be accessible from the front-end (javascript)
  }); // on the response object we are setting the cookie with the same name "jwt"
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it exists (or) not ?
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError(
        "You are not logged in! Please login to get the access",
        401,
      ),
    );
  }
  // 2) Verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // Now as a third argument this function actually
  // requires a callback  function and this callback function gonna run as soon  as the verification is completed . You can see that this
  // verify is an asynchronous function. It will verify the token and after the verification of token then it will call
  // a callback function that we can specify . We have been working with promises all the time. So here in this verify()
  // function , We are going to promisifying this function and as jwt.verify() function will return a promise. Node.js
  // has a builtIn promisify() function.

  // promisify(jwt.verify) will return a promise and then we are calling the function with (token, process.env.JWT_SECRET) and
  // calling this (token, process.env.JWT_SECRET) function will return a promise and so we are awaiting on it by using the
  // await keyword and storing the result into a decoded variable...And here the decoded variable result will be the
  // decoded JSON web token.

  console.log(decoded);

  /* Below 3 and 4 steps are necessary to ensure security but generally people stop here after doing the above 1 and 2 steps */
  // Why the below 3 and 4 steps are necessary to ensure security ? ////////
  /*  For example , what happens if the user is deleted in the mean time ? where the token will still exist but if the user
   is no longer existent well we then don't want the user to login (or) even worse What if the user has actually changed
   his password after the token has been issued ?  Well in this condition also it should not work ? For example imagine
   somebody has stolen the JSON Web Token from a user but then inorder to protect against in this situation the user changes
   his password And so ofcourse the old token that was issued before the password change  should no longer be valid. So it
   should not accepted to access the protected routes. These all the above we are gonna implement in the below steps 
   3 and 4    */

  // 3) Check if the user actually exists in the database (or) not ?

  const currentUser = await User.findById(decoded.id); // It is not the new user but the old user based on the decoded id.
  console.log(currentUser);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist",
        401,
      ),
    );
  }

  // 4) Check if the user has changed the password after the token was issued.
  // To implement the above 4th step we will create another instance method , which is a method that is available on all
  // the documents.

  const getCurrentUser = await currentUser.changedPasswordAfter(decoded.iat);
  console.log(getCurrentUser);
  if (getCurrentUser) {
    // This will return true if the user has changed the password
    return next(
      new AppError(
        "User recently has changed the password! Please login again",
        401,
      ),
    );
  }

  // GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser; // Here we are assigning  the currentUser to the req.user so that we can then use it in the next
  // middleware function. Because , remember this req object is the one which travels from middleware to middleware . So if
  // we want to pass the data from one middleware to the next middleware then we can simply put some stuff on this req object.
  // So that this data will be available at a later point.
  res.locals.user = currentUser;
  // Here we are storing the currentUser in the request object which can be accessed in any of the
  // middleware functions and controllers that are called after this protect middleware function.
  // console.log(req.user);
  // console.log(decoded);
  // console.log(token);
  // console.log(req.headers);
  // console.log(req.path);
  // console.log(req.method);
  // console.log(req.protocol);
  // console.log(req.get("host"));
  // console.log(req.get("Referer"));
  // console.log(req.get("User-Agent"));
  // console.log(req.secure);
  // console.log(req.ip);
  // console.log(req.originalUrl);
  // console.log(req.body);
  // console.log(req.query);
  next(); // When all the above conditions are satisified then only this next() method will be called by giving access
  // to the protected route which is getAllTours() method in this case
});

// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     // roles => ["admin","lead-guide"] , When we will give access to the user for a certain route ? We will give access
//     // to a certain user when the user-role is inside of this roles array that we have passed in...
//     if (!roles.includes(req.user.role)) {
//       // This is the place where the current user role is stored
//       // We are getting this req.user.role from the above protect middleware function
//       // where we have set the req.user = currentUser.
//       return next(
//         new AppError(
//           "You donot have the permission to perform this action",
//           403,
//         ), // Status code 403 means forbidden
//       );
//     }
//   };
// };

/// Sometimes simply Authenticating (or) logging a user in is really not enough . So in the below we will gonna implement
// Authorization as well . So imagine a act of deleting a tour from our database . So not every user is allowed to delete
// the tour even the user is logged in . So we basically need to authorize only certain types of users to perform certain
// actions and so this is exactly what authorization is...It is simply verifying if a certain user has the rights to interact
// with a certain resource. So again reiterating it , with authorization we basically check if a certain user is allowed to
// access a certain resource even he is logged in. So not all logged in users will be able to perform the same actions in our
// API . This is very common scenario that every web application has to implement in there API routes testing. So in the
// below we are building another middleware to restrict certain routes to certain user roles.

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles => ["admin","lead-guide"] , When we will give access to the user for a certain route ? We will give access
    // to a certain user when the user-role is inside of this roles array that we have passed in...
    if (!roles.includes(req.user.role)) {
      // This is the place where the current user role is stored
      // We are getting this req.user.role from the above protect middleware function
      // where we have set the req.user = currentUser.
      return next(
        new AppError(
          "You donot have the permission to perform this action",
          403, // Status code 403 means forbidden
        ),
      );
    }
    next(); // When all the above conditions are satisified then only this next() method will be called by giving access
  };
// Generally we can't pass arguments to a middleware function but we want to pass the roles
// that who want to access this resource . In this case we want the "admin" and the "lead-guide" to delete the tours. So
// we want a way to basically pass the arguments into the middleware function . So here we will create a wrapper function
// which will then return the middleware function that we actually want to create. Here we want to pass arbitrary no of
// arguments which is basically of roles . So here we can user the rest parameter syntax which was introduced in ES6.
// (...roles) => This will create an array of all the arguments that were specified and right away we will return a
// new function

/* IMPLEMENTING THE PASSWORD RESET FUNCTIONALITY  */
// You will generally provide your email address and then you will get an email with a link and where you can click
// on the link and it will take you to a new page and then you can enter your password and this is very standard procedure

/* To Implement the above password reset functionality the below two steps have to be followed */

// 1) User sends a post request to a forgot password route only with his email address and then this will create a
// reset token and send this reset token to the email address that the user has provided , Here a token is a simple
// random token but not a JSON Web Token

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user based on the POSTed email address.
  const user = await User.findOne({
    email: req.body.email,
  }); // Here we are not using findById() because we don't know the user's ID

  if (!user) {
    return next(
      new AppError("There is no user associated with this email address", 404), // We already know 404 status code means
      // user is not found
    );
  }

  // 2) Generate the random reset token

  /* To generate a random reset token we will create another instance method on the user because this is all related
    to the user data itself . So we will write this instance method in userModel.js file where our userSchema is 
    located */

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false }); // This will deactivate all the validators that we have specified
  // in our userSchema

  // 3) Send it to the user's email address

  try {
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    // Ideally the user will click on the email link

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined; // These both steps will just modify the data but it will not save the data.
    await user.save({ validateBeforeSave: false }); // Here in this step it will save the data

    return next(
      new AppError(
        "There was an error sending the email. Try again later",
        500,
      ), // Here the error is happened on the server side , So the status code is 500 which is something starting with 5
    );
  }
});

/// 2) User then sends this reset token from his email address along with the new password inorder to update his password.

exports.resetPassword = catchAsync(async (req, res, next) => {
  /* BELOW STEPS ARE INVOLVED FOR RESETTING THE PASSWORD */

  /* Step 1) Get the user based on the token*/
  // For implementing the step 1 we have to the encrypt the token first and then compare it with the encrypted token that
  // is already stored in the database.

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex"); // Here we have encrypted the token coming from the url (/:token)

  // Now we are getting the user based on this token , Because this is actually the only thing that we know about the
  // user right now as we have no email address and we have nothing . So this token is the only thing that can identify
  // the user. So now we can query the database based on this token and then it will find the user based on this token

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Here we are checking whether the token has expired (or) not
  }); // This will find the user who has the token
  // that is sent via URL. But here we are not taking the token expiration date into consideration

  // Step 2) If the token has not expired, and there is a user, Set the new password
  if (!user) {
    return next(new AppError("Token is invalid (or) expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined; // We are setting it to undefined means we are deleting the passwordResetToken
  // from the database.
  user.passwordResetExpires = undefined; // We are setting it to undefined means we are deleting the passwordResetExpires
  // from the database.
  /* The above all four steps will modify the document but they will not get saved in the database. So in the below 
   step we are saving the data into the database */
  await user.save(); // In this case we don't want to turn off the validators because indeed we need to validate,
  // For example we want the validator to confirm if the password is equal to the passwordConfirm and so that this validator
  // automatically does all the work for us.

  // Step 3) Update the changedPasswordAt property for the user
  // Step 4) Log the user in, Send the JWT back to the client
  createSendToken(user, 200, req, res);
  // Here we are creating the new token and sometimes it happens that this token
  // is created a bit before the changed password timestamp has actually been created
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // This update password functionality is only for logged in users but we still need the user pass his current password.
  // Inorder to confirm the user actually is who says he is just as a security measure because imagine that someone
  // would find our computer open and be able to change the password (or) update the password on the sites that you have
  // currently open without being prompted for a password again and this would basically log you out of all your
  // existing applications which would be ofcourse a terrible experience and as a security measure , we always need to
  // ask for the current password before updating the password.
  // 1) Get the user from the collection

  const user = await User.findById(req.user.id).select("+password"); // As the logged in user can only update the password,
  // So the current user will be on our request object which is coming from the request middleware and please remember that
  // we need to explicitly ask for the password with the help of select("+password") because by default the password is
  // not included in the output as we defined it on our userSchema , Please check it for reference. And we need this password
  // from the database because we want to compare it to the user's input password matches with the password that is stored
  // in the database (or) not ?

  // 2) Check if the POSTed current password is correct (or) not ?
  // Basically we want to create an error if the password doesnot matches.
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    // Here the correctPassword() is a instance
    // method that we have created in our userModel.js file and this instance method is available on all the created documents.
    return next(new AppError("Your current password is incorrect", 401));
  }
  // 3) If the POSTed current password is correct then update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // After calling this save() method the password and passwordConfirm fields will be updated and saved
  // in the database permanently. Here also we are not turning off the validation as we want the validation to happen.
  /* Why we didn't used findByIdAndUpdate() here ? */
  // That is for two reasons one is it will work only for save() because the "this" will not point to the current object
  // in the memory if we have used the findByIdAndUpdate() instead of save() where you have written this.password which
  // will be undefined as it will not point to anything if we use findByIdAndUpdate() and also there are two pre() middlewares
  // are running , one is for encrypting the password and another one is for storing the current timestamp for
  // changedPasswordAt property these both pre() middlewares will not work if we use findByIdAndUpdate()

  // 4) Log the user in, send the JWT back to the user
  createSendToken(user, 200, req, res);
});
