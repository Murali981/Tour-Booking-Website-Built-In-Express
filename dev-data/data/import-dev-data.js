const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Tour = require("../../models/tourModel");

dotenv.config({ path: "./config.env" }); // This line loads the environment variables from the.env file where our configuration
// file is located. This dotenv.config() function will read (or) load the environment variables from the config.env file and save
// them in the node.js environment variables.

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
  });

// Reading the JSON file from tours-simple.json

const tours = fs.readFileSync(`${__dirname}/tours-simple.json`, "utf8"); // It will return a JSON data and it will be get stored in the tours
// variable

// IMPORTING THE DATA INTO THE DATABASE

const importData = async () => {
  try {
    const data = JSON.parse(tours); // We are converting the JSON into an array of javascript objects

    await Tour.create(data);

    console.log("Data has been successfully loaded");
  } catch (error) {
    console.error("Error importing data", error);
  }
  process.exit(); // It will terminate the script and exit the process.
};

// DELETING ALL DATA FROM THE DATABASE

const deleteData = async () => {
  try {
    await Tour.deleteMany(); // It will basically delete all the data from the Tour collection

    console.log("Data has been successfully deleted");
  } catch (error) {
    console.error("Error deleting data", error);
  }
  process.exit(); // It will terminate the script and exit the process.
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

console.log(process.argv);
