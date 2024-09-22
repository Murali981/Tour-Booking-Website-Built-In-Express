const mongoose = require("mongoose");
const dotenv = require("dotenv");

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
  .then((con) => {
    // The above mongoose.connect() function will return a promise , So to resolve the promise , We are using the
    // then() function and this then function will have an access to the con variable where it can access the connections object on it.
    // console.log(con.connections);
    console.log("DB Connection is successfully established");
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

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
