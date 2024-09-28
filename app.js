const express = require("express");

const morgan = require("morgan");

const rateLimit = require("express-rate-limit");

const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const xss = require("xss-clean");

const hpp = require("hpp");

const AppError = require("./utils/appError");

const globalErrorHandler = require("./controllers/errorController");

const tourRouter = require("./routes/tourRoutes");

const userRouter = require("./routes/userRoutes");

const app = express(); // It will add a bunch of methods to the app variable by calling the express() such that from app we can call
// them.

// 1) GLOBAL MIDDLEWARES

/*  HOW TO SET THE SECURITY HTTP HEADERS ? */
/* To set this security HTTP headers we will use yet another middleware function which is coming from an NPM package
 and that npm package is called helmet and this is a stabdard in express development like whoever is using the express
  they will use this helmet package because again express doesn't use all the security best practices out of the box
  and so we have to basically manually go ahead */

// SETTING THE SECURITY HTTP HEADERS
app.use(helmet()); // This will then produce the middleware function that should put right here as we are calling the
// helmet() middleware function which will inturn return a function that's gonna be sitting here until it is called..
// It is best to use this helmet package early in the middleware stack so that these headers are really sure to be set.
// Try to put this helmet middleware on top of all the middlewares which is the first middleware to run

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Here the morgan is a logging middleware and calling this morgan with dev as the argument will return
  // a function similar to the below middleware function
}

/* WHAT IS RATE LIMITING ? */
/* Rate limiting is nothing but preventing TOO many requests from the same IP address  to our API and then this will 
  help us preventing attacks like denial of service, (or) brute force attacks and this rate-limiter will be implemented
  as a global middleware function . So basically what the rate limiter gonna do is , to count the no of requests coming 
  from one IP Address and when there are too many requests then block these requests and it makes sense to implement
   this rate-limiting in a global middleware and we do this implementation in app.js file and we will implement this
   rate-limiting using the npm package called express-rate-limit */

/* Creating a limiter */
const limiter = rateLimit({
  max: 100, // The maximum number of requests that can be made from a single IP address in a given time window is 100.
  windowMs: 60 * 60 * 1000, // The duration of the time window in milliseconds ,(1hour = 60sec * 1min = 60sec * 1sec = 1000milliseconds)
  // So this will allow 100 requests from the same IP Address in one hour
  message: "Too many requests from this IP, please try again in an hour!", // The message that will be sent to
  // the client in case of a rate limit exceeded.
}); // The limiter that we have created above is a middleware function and now we can use this "limiter" middleware function
// in the app.use()

/// LIMIT REQUESTS FROM SAME API
app.use("/api", limiter); // Now we are applying this "limiter" middleware function to the "/api" route only. And so this
// will effect all of the routes that basically starts with this URL which is "/api"

/// This is a body-parser , reading the data from the body into req.body
app.use(express.json({ limit: "10kb" })); // Here the express.json() is the middleware and middleware is basically a function that can modify the
// incoming request data . It is called middleware because it is standing between the request and the response . This is the step
// that the request goes through while it is being processed. The body that the request sends is added to the request object.
//  limit: "10kb"  means if the body is greater than 10 kilobytes then it will not accept.

/* WHAT IS DATA SANITIZATION ?  */
/* To clean all the data that comes into the application from malicious code. So,the code that is trying to attack our
application. In this case we are trying to defend two attacks which are NoSQL query injection and the another one
is cross-site-scripting attacks(XSS)  */

// The above middleware which is app.use(express.json({ limit: "10kb" })) reads the data into the req.body and only after
// that we can actually clean that data. So this is the perfect place for data sanitization.

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize()); // This mongoSanitize() function will return a middleware function that we can use. This middleware
// will look at the req.body , request query string and also the request.params and then it will basically filter out
// all of the dollar signs and dots because this is how the MongoDB operators are written. So by removing these operators
// these will not going to work

// DATA SANITIZATION AGAINST CROSS-SITE-SCRIPTING ATTACKS(XSS)
app.use(xss()); // This will clean any user input from malicious HTML code , Let us suppose (or) assume an attacker try
// to insert some malicious HTML code with some javascript code attached to it , If this would then later be injected
// into our HTML site then it would really create some damage then. So by using this middleware we prevent that
// basically by converting all these HTML symbols. As we discussed before , mongoose validation itself is actually a very
// good protection against XSS because it won't really allow any crazy stuff into our database as long as we use it correctly.
// Whenever you can just add some validation to your mongoose schemas and this should mostly protect you from cross-site
// scripting atleast on the server-side

/* WHAT IS PARAMETER POLLUTION ? */
/* Generally in parameter pollution this queryString is "/api/v1/tours?sort=duration&sort=price" where we have given
 sort two times where we have polluted our parameters , So to remove these duplicate values(In our example the duplicate key
  is sort) and we want to remove these duplicate values from the inputted query string. So we will remove these duplicate 
  values from the inputted query string by installing an NPM package called "HPP" which stands for HTTP Parameter Pollution */

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ], // whitelist is simply an array of properties for which we actually allow duplicates in the query string
  }),
); // This will clear up the query string

/// SERVING THE STATIC FILES
app.use(express.static(`${__dirname}/public`)); // Here the express.static() is used to serve the static file and we have given it as a public
// folder form it has to serve the static files which are in the public folder like HTML , CSS and images files.
// We can access the overview.html file from the google browser by using the path localhost:3000/overview.html. But here you may
// get a doubt that why we are not giving the public in the this route to access the overview.html file (localhost:3000/public/overview.html)
// because when we open up a URL that can't find in any of our routes then it will look in the public folder that we have defined. And
// it sets that folder to the root . Now let's pretend that the root is now our public folder

// app.use((req, res, next) => {
//   console.log("Hello from the middleware");
//   next();
// }); // This Middleware is applied to each and every request because we didn't specify any route here.

/// This is like a TESTING middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers); // This is how we can get access to the headers in express
  next();
});

// app.get("/", (req, res) => {
//   res.status(200).json({ msg: "Hello, World!", app: "Natours" });
// }); // This is a GET request handler that will respond with "Hello, World!" when a GET request is made to the root ("/") URL.
// // When you are calling the res.json({}) method then the express will automatically set the Content Type to "application/json"

// app.post("/", (req, res) => {
//   res.send("You can post to this endpoint...");
// });

// 2.) ROUTE HANDLERS

// app.get("/api/v1/tours", getAllTours); // This API endpoint will send back all the tours as a response back to the client. Here
// // tours is the resource . Here in this application we are building an API as well . The tours data is stored in the dev-data folder
// // and inside the data folder and then inside the data folder there is tours-simple.json file which contains all the information about
// // the tours that we are selling in our website(dev-data -> data -> tours-simple.json) . Only the call-back function in this route
// // will run inside the event loop . So in this you cannot have any blocking code. Please remember that the data we are reading is
// // from a file based API because we are getting the tours data from the tours-simple.json file which is in our current application.
// // And later we will store this tours JSON data in mongoDB and get that data back from the mongoDB as a response back to the client.

// app.get("/api/v1/tours/:id", getTour);

// app.post("/api/v1/tours", createTour);

// app.patch("/api/v1/tours/:id", updateTour);

// app.delete("/api/v1/tours/:id", deleteTour);

// 3.) ROUTES

app.use("/api/v1/tours", tourRouter); // For this route we want to apply the tourRouter middleware
app.use("/api/v1/users", userRouter); // For this route we want to apply the userRouter middleware

app.all("*", (req, res, next) => {
  // Here "*" stands for everything and here the "*" which catches all the urls which are coming to the server.
  // Please make a point that this is a middleware which will be executed when the user inputs a route which is not
  // existed on this server and also if you see ,  this middleware is placed at the end of this app.js file because if
  // any of the routes that are matched will be executed which are placed above this middleware but if none of the routes
  // matches then only this middleware will be executed sending a response "can't find this URL on this server" back to the user.
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`, // originalUrl is a property that we have on the request.
  //   // Here the originalUrl is the URL that is requested by the user
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`); // We are using a basic builtIn error constructor inorder to create an error. Here we can pass a string
  // // and this string will then be the error message property.
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // Express assumes that whatever we have passed into the next() method will be an error. So again , whenever we pass anything
  // into the next() function will assume that it is an error and then it will skip all the other middlewares in the middleware stack
  // and send the error that we have passed into the global error handling middleware.
}); // This app.all() will run for all the verbs like GET , POST , PATCH , DELETE etc....simply all the HTTP methods

app.use(globalErrorHandler);

// 4.) START THE SERVER

module.exports = app;
