const path = require("path");

const express = require("express");

const morgan = require("morgan");

const rateLimit = require("express-rate-limit");

const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const xss = require("xss-clean");

const hpp = require("hpp");

const cookieParser = require("cookie-parser");

const compression = require("compression"); // This will expose a very simple middleware function which we have ti plug into our
// middleware stack

const cors = require("cors"); // This "cors" is a very simple middleware function that we need it in our application

const AppError = require("./utils/appError");

const globalErrorHandler = require("./controllers/errorController");

const tourRouter = require("./routes/tourRoutes");

const userRouter = require("./routes/userRoutes");

const reviewRouter = require("./routes/reviewRoutes");

const viewRouter = require("./routes/viewRoutes");

const bookingRouter = require("./routes/bookingRoutes");

const app = express(); // It will add a bunch of methods to the app variable by calling the express() such that from app we can call
// them.

app.enable("trust proxy"); // This is something built into express and this line is written for the heroku to tell it that
//  as this setting it correctly set then only this "req.headers["x-forwarded-proto"] === "https" " will correctly read the https value"
// from the request header.

app.set("view engine", "pug"); // Express supports most common engines out of the box and pug is one of them.So there
// no need to install "pug" (or) no need to require() it anywhere. All of this happens behind the scenes internally in
// express. So we define our view engine here and now we also have to define where these fields are actually located in our
// file system. So our PUG templates are actually called views in express and this is because these templates are infact the
// views in the ModelViewController(MVC) architecture and As we already have the controllers and the models folders and now
// it's actually the time to create the views folder.

app.set("views", path.join(__dirname, "views")); // Here we have to tell in which folder does the views located in. The first argument we will give is,
// the name of the folder which is "views" and in the second argument we will give the name of the path where is our views
// folder is located. The path that we provide in the second argument is always relative to the directory from where we have
// launched the node.js application and it is usually the root project folder but it might not be. So we shouldn't use dot(".")
// here but instead we have to use the directory name variable. We can do this by using a nice trick that we can use with the
// node which is using the "path" module , "path" is a builtIn node module which is a core module which is used to manipulate
// the path names. (const path = require("path"))

// 1) GLOBAL MIDDLEWARES

// IMPLEMENTING CORS
app.use(cors()); // Calling this cors() function will return a middleware function which will add a couple of different headers to our
// response. Here this middleware function will basically add some headers. This is how we will enable the cross-origin resource sharing
// for all the incoming requests. We can even configure the cors to enable only specific routes by passing the cors() into a middleware
// stack as below. This cors() function will set the "Access-Control-Allow-Origin" header to "*" which means everything no matter from
// where all these incoming requests are coming from.
// let us suppose we have our API at api.natours.com and then our FrontEnd app is running at "natours.com" and in this case all we want to
// do is , we want to allow access from this origin here and in this case we would use "app.use(cors({ origin: "https://www.natours.com" }))"
// Here we are allowing only this "URL" (or) "origin" which is "https://www.natours.com" to create requests to our API which is
// "api.natours.com" And still it is not over because this "app.use(cors())" will work (or) allow for only simple requests which are
// GET and POST requests and on the other hand we have so called "non-simple requests" which are "PUT" , "PATCH" , "DELETE" requests
// (or) also the requests that send cookies (or) using the "non-standard" headers and these non-simple requests require a so called
// pre-flight phase. So whenever there is a non-simple request then the browser will automatically issue the pre-flight phase. This is
// how it works => Before the real request actually happens and let's say a DELETE request then the browser first does an options request
// inorder to figure out if the actual request is safe to send and this means for us all the developers is that on our server we need to
// actually respond to this options request and Options is just another HTTP method just like GET , POST (or) DELETE. So basically
// when we get these options requests to our Server then we need to send back the same "Access-Control-Allow-Origin" header and this
// way the browser will know that the actual request and incase the actual request is the "DELETE" request is safe to perform and then
// it executes the "DELETE" request itself and this is implemented in the below line of code...
app.options("*", cors()); // This is another HTTP method that we can respond to , Because the browser will send a options request when there is
// a pre-flight phase. So we have to define the route which will handle the options. "*" means for all options requests to our server

// app.options("/api/v1/tours/:id" , cors()); => Here we are only allowing a specific optional requests to our server which is a
// PATCH , DELETE (or) PUT which will happen for a specific tour.

// app.use("/api/v1/tours" , cors() , tourRouter); => If you see in this route we are passing the cors() as a middleware function and it
// is enabled for this specific route only

/// SERVING THE STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public"))); // Here the express.static() is used to serve the static file and we have given it as a public
// folder form it has to serve the static files which are in the public folder like HTML , CSS and images files.
// We can access the overview.html file from the google browser by using the path localhost:3000/overview.html. But here you may
// get a doubt that why we are not giving the public in the this route to access the overview.html file (localhost:3000/public/overview.html)
// because when we open up a URL that can't find in any of our routes then it will look in the public folder that we have defined. And
// it sets that folder to the root . Now let's pretend that the root is now our public folder

/*  HOW TO SET THE SECURITY HTTP HEADERS ? */
/* To set this security HTTP headers we will use yet another middleware function which is coming from an NPM package
 and that npm package is called helmet and this is a stabdard in express development like whoever is using the express
  they will use this helmet package because again express doesn't use all the security best practices out of the box
  and so we have to basically manually go ahead */

// SETTING THE SECURITY HTTP HEADERS
app.use(helmet({ contentSecurityPolicy: false })); // This will then produce the middleware function that should put right here as we are calling the
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

app.use(
  express.urlencoded({
    extended: true, // This means that it will parse the extended syntax of the query string.
    limit: "10kb", // This is the maximum size of the data that can be sent to the server.
  }),
); // This method name is urlencoded because the way the form sends the data to the server
// is actually also called URL encoded. So here we need this urlencoded middleware to basically parse data coming from
// a url encoded form. We will pass some settings into the urlencoded({extended: true,limit:"10kb"})

app.use(cookieParser()); // This middleware parses the data from the cookies

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

// app.use((req, res, next) => {
//   console.log("Hello from the middleware");
//   next();
// }); // This Middleware is applied to each and every request because we didn't specify any route here.

app.use(compression()); // This will return a middleware function which is then again going to compress all the text that is
// sent to clients. This is not going to work for images because these images are already compressed. So for example a JPEG file
// is already compressed and this is only going to work for text. Once our website is deployed then we can actually test whether
// this compression is working or not (or) whether the compression is active (or) not ?

/// This is like a TESTING middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers); // This is how we can get access to the headers in express
  // console.log(req.cookies); // This is how we can get access to the cookies in express
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

app.use("/", viewRouter); // This viewRouter is mounted on the root URL("/") and so whenever it sees the route("/") it
// goes to the viewRouter
app.use("/api/v1/tours", tourRouter); // For this route we want to apply the tourRouter middleware
app.use("/api/v1/users", userRouter); // For this route we want to apply the userRouter middleware
app.use("/api/v1/reviews", reviewRouter); // For this route we want to apply the reviewRouter middleware
app.use("/api/v1/bookings", bookingRouter); // For this route we want to apply the bookingRouter middleware

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
