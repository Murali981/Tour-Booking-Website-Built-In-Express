const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  // Here in the below line we want to log the error to the console so that it shows up in the logs in our server , then
  // it gives us a way to fix the problem and then we want to gracefully shutdown the server
  console.log("UNCAUGHT EXCEPTION 🔥🔥 Shutting down...");
  console.log(err.name, err.message);

  process.exit(1); // Here zero(0) stands for success and one(1) stands for uncaught exception . Here this process.exit() will
  // abort all the requests that are currently still running (or) pending
  // After the server is closed then this call-back function will run
});

/* In the above UNCAUGHT EXCEPTION handler is placed at the top of the server.js file because anything occurs will caught
 by this error handler but if it is placed at a random place in this server.js file then if any uncaught exception
  occurs like console.log(x) where x is not defined anywhere in our code and assume that this console.log(x) is
  placed below the above uncaught exception error handler then it cannot be caught by this error handler that's 
  why we are placing this uncaught exception error handler on top of this server.js file.  */

dotenv.config({ path: "./config.env" }); // This line loads the environment variables from the.env file where our configuration
// file is located. This dotenv.config() function will read (or) load the environment variables from the config.env file and save
// them in the node.js environment variables.

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    // The above mongoose.connect() function will return a promise , So to resolve the promise , We are using the
    // then() function and this then function will have an access to the con variable where it can access the connections object on it.
    // console.log(con.connections);
    console.log("DB Connection is successfully established");
  })
  .catch(() => {
    console.log("Error");
  });

// Creating a model using mongoose ? //
// A Model is like a blue print to create documents , So it is like creating classes in JavaScript which are like blueprints
// which we use to create objects out of them , To do CRUD operations we basically need a mongoose model. And inorder to create a model
// we need a schema . We use schema to describe our data , setting default  values , to validate the data . Below we will create a
// Tour schema to describe our tours

// const tourSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "A tour must have a name"],
//     unique: true,
//   },
//   rating: {
//     type: Number,
//     default: 4.5,
//   },
//   price: {
//     type: Number,
//     required: [true, "A tour must have a price"],
//   },
// });

// const Tour = mongoose.model("Tour", tourSchema); // Try to use Upper cases in model names and variables which is a convention to follow

// const testTour = new Tour({
//   name: "The Park Camper",
//   rating: 4.7,
//   price: 497,
// }); // This testTour document that we have just created is an instance of the tour model . So on the testTour instance we can use
// // a couple of methods to interact with the database

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("Error :", err);
//   }); // This will save it in the tours collection of the database and this save() method will return a promise where we
// // can consume it . The result value of the promise that the save() method returns is the final document as it is in the database.

// console.log(app.get("env")); // It will print "development" in the console refering that we are currently in the development environment.
// // This app.get("env") will get us the environment variable .Environment variables are global variables that are used to define the
// // environment in which a node.app is running . This one is set by express but node.js itself sets a lot of environments and please
// // remember that this .env variable was actuall set by express but node.js itself sets a lot of environment variables.

// console.log(process.env);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});

/// HOW TO HANDLE UNHANDLED REJECTIONS ///////////////
/* Each time when there is an unhandled rejection then somewhere in our application a process object will emit an object
called  unhandled rejection and so we can subscribe to that event just like this below*/

process.on("unhandledRejection", (err) => {
  // Here in the below line we want to log the error to the console so that it shows up in the logs in our server , then
  // it gives us a way to fix the problem and then we want to gracefully shutdown the server
  console.log("UNHANDLED REJECTION 🔥🔥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {}); // After the server is closed then this call-back function will run
  process.exit(1); // Here zero(0) stands for success and one(1) stands for uncaught exception . Here this process.exit() will
  // abort all the requests that are currently still running (or) pending
});

// In the above unhandled rejection crashing the application is optional as we did above but when there is an uncaught
// exception then we really need to crash our application because after there was an uncaught exception then the entire
// node process is in a so called unclean state . So to fix this the process needs to terminate and then it needs to be
// restarted. But again in a production we should have a tool in place which will restart the application after crashing
// and many hosting services do that out of the box automatically.

/* In node.js it is not really a good practice  to just blindly rely on the above two Error handlers which are
  UNHANDLED REJECTION and UNCAUGHT EXCEPTION . So ideally errors should be handled right where they occur
  So for example , in the problem connecting to the database where we should add a catch handler and not just simply rely
   on the unhandled rejection call-back that we have above and some people even say we shouldn't even use them at
   all  */
