const express = require("express");

const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");

const userRouter = require("./routes/userRoutes");

const app = express(); // It will add a bunch of methods to the app variable by calling the express() such that from app we can call
// them.

// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Here the morgan is a logging middleware and calling this morgan with dev as the argument will return
  // a function similar to the below middleware function
}

app.use(express.json()); // Here the express.json() is the middleware and middleware is basically a function that can modify the
// incoming request data . It is called middleware because it is standing between the request and the response . This is the step
// that the request goes through while it is being processed. The body that the request sends is added to the request object.

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

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

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

// 4.) START THE SERVER

module.exports = app;
