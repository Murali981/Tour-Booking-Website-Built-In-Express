const fs = require("fs");

const express = require("express");

const app = express(); // It will add a bunch of methods to the app variable by calling the express() such that from app we can call
// them

// app.get("/", (req, res) => {
//   res.status(200).json({ msg: "Hello, World!", app: "Natours" });
// }); // This is a GET request handler that will respond with "Hello, World!" when a GET request is made to the root ("/") URL.
// // When you are calling the res.json({}) method then the express will automatically set the Content Type to "application/json"

// app.post("/", (req, res) => {
//   res.send("You can post to this endpoint...");
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
); // Here __dirname is the folder where the current
// script is located which is our app.js file which is located in the starter folder which represents our current directory name.
// The JSON.parse(tours-simple.json) function will take the tours-simple.json data as input and it will automatically converted to JSON
// object (or) an array of javascript objects

app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours: tours, // (or) you can simply leave it as tours . In tours:tours the right side tours will represent the tours variable
      // that is coming from the fs.readFileSync() function and the left side tours is representing the tours as a resource in the
      // path "/api/v1/tours"
    },
  }); // This type of formating the response data coming from the server is "JSEND data specification"
}); // This API endpoint will send back all the tours as a response back to the client. Here
// tours is the resource . Here in this application we are building an API as well . The tours data is stored in the dev-data folder
// and inside the data folder and then inside the data folder there is tours-simple.json file which contains all the information about
// the tours that we are selling in our website(dev-data -> data -> tours-simple.json) . Only the call-back function in this route
// will run inside the event loop . So in this you cannot have any blocking code. Please remember that the data we are reading is
// from a file based API because we are getting the tours data from the tours-simple.json file which is in our current application.
// And later we will store this tours JSON data in mongoDB and get that data back from the mongoDB as a response back to the client.

const PORT = 3000;

app.listen(PORT, () => {
  console.log("App is listening on port 3000");
});
