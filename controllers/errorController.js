const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400); // Here we are transforming the weird error that we are getting from the mongoose
  // into an operational error with a nice friendly message such that a human can read it
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.KeyValue.name;
  console.log(value);
  const message = `Duplicate Field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token, Please login again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please login again", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details to the client
  } else {
    // 1) Log error
    console.error("ERROR ��", err);

    // 2) Generic error message
    res.status(500).json({
      status: "error",
      message: "Something went wrong, please try again later.",
    });
  }
};

module.exports = (err, req, res, next) => {
  // This is  an error handling middleware which takes 4 arguments as input and the express understands
  // that this is an error handling middleware and it runs only when an error is happened
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 500; // 500 status code means it is an internal server error
  err.status = err.status || "error"; // err.status = err.status if it is defined otherwise it is an error.

  if (process.env.NODE_ENV === "development") {
    // let error = { ...err };
    sendErrorDev(err, res); // if NODE_ENV is development, send error in development mode.
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err }; // Destructuring the error
    // In development we don't care about this where we want to see all our errors so that we can basically fix them
    // but in production we want to send meaningful error messages to the clients.
    if (error.name === "CastError") {
      // If the error is "CastError", then we will pass the error into the handleCastErrorDB(error) function which will
      // return our AppError then the returned AppError will sent to the below sendErrorProd(error,res) function which
      // will eventually the client will get back as a response
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === "ValidationError") {
      // This "ValidationError" is created by mongoose and this ValidationError is coming from mongoose
      error = handleValidationErrorDB(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = handleJWTError(error);
    }

    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError(error);
    }

    sendErrorProd(error, res); // if NODE_ENV is production
  }
};
