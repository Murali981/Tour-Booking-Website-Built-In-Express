// // const fs = require("fs");

// const Tour = require("../models/tourModel");

// // const tours = JSON.parse(
// //   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// // ); // Here __dirname is the folder where the current
// // // script is located which is our app.js file which is located in the starter folder which represents our current directory name.
// // // The JSON.parse(tours-simple.json) function will take the tours-simple.json data as input and it will automatically converted to JSON
// // // object (or) an array of javascript objects

// // exports.checkId = (req, res, next, val) => {
// //   console.log(`Tour id is: ${val}`);
// //   if (req.params.id * 1 > tours.length) {
// //     // If the tour is undefined(!tour) then simply return the 404 response with invalid ID as a response from the server
// //     return res.status(404).json({
// //       status: "fail",
// //       message: "Invalid ID",
// //     }); // If we didn't have this return statement here then the express would send this response back but it will still continue
// //     // running the code in this function . So after sending the response it will still hit the next() function below and it
// //     // would move on to the next() middleware and then it will send another response to the client. So the above return statement
// //     // makes sure that it will finish and it makes sure that it will never call this next() function again
// //   }
// //   next(); // If the id is valid then we call the next middleware function
// // };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: "fail",
//       message: "Missing name or price",
//     });
//   }
//   next(); // If the body is valid then we call the next middleware function
// };

// exports.getTour = (req, res) => {
//   console.log(req.params); // req.params is where all the parameters of all the variables that we define here are stored . The variables
//   // in the above URL are called parameters and they are available in req.params which are readily available such that we can use them.

//   const id = req.params.id * 1; // when we multiply a string that looks like a number({id : "5"}) then it will automatically convert
//   // this string to a number.

//   //   const tour = tours.find((el) => el.id === Number(req.params.id));
//   // const tour = tours.find((el) => el.id === id);

//   //   if (id > tours.length) {
//   //     return res.status(404).json({
//   //       status: "fail",
//   //       message: "Invalid ID",
//   //     });
//   //   }

//   //   if (!tour) {
//   //     // If the tour is undefined(!tour) then simply return the 404 response with invalid ID as a response from the server
//   //     return res.status(404).json({
//   //       status: "fail",
//   //       message: "Invalid ID",
//   //     });
//   //   }

//   // res.status(200).json({
//   //   status: "success",
//   //   // results: tours.length,
//   //   data: {
//   //     tour,
//   //   },
//   // }); // This type of formating the response data coming from the server is "JSEND data specification"
// };

// exports.getAllTours = (req, res) => {
//   console.log(req.requestTime);
//   res.status(200).json({
//     status: "success",
//     requestedAt: req.requestTime,
//     // results: tours.length,
//     // data: {
//     //   tours: tours, // (or) you can simply leave it as tours . In tours:tours the right side tours will represent the tours variable
//     //   // that is coming from the fs.readFileSync() function and the left side tours is representing the tours as a resource in the
//     //   // path "/api/v1/tours"
//     // },
//   }); // This type of formating the response data coming from the server is "JSEND data specification"
// };

// exports.createTour = (req, res) => {
//   // Here the request object will hold all the data related to our post route (or) request that we are sending to the server.
//   // Out of the box , Express does not put the body data on the request object . So inorder to have the data available , We have to
//   // pass something called as middleware . So we aill include the middleware on the top of the file.
//   //
//   // const newId = tours[tours.length - 1].id + 1;
//   // const newTour = Object.assign({ id: newId }, req.body); // This allows us to create a new object by merging two existing objects together
//   // console.log(newTour);

//   // tours.push(newTour);
//   // fs.writeFile(
//   //   `${__dirname}/dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours), // Here tours is normal plain javascript object and so we need to convert  that
//   //   (err) => {
//   res.status(201).json({
//     status: "success",
//     // data: {
//     //   tour: newTour,
//     // },
//   });
// };
// // ); // We are inside of a callback function that is gonna run in  the event loop as we can never ever block the
// // event loop . So that's why are writing the writeFile rather than writing writeFileSync() instead
// // };

// exports.updateTour = (req, res) => {
//   //   if (req.params.id > tours.length) {
//   //     // If the tour is undefined(!tour) then simply return the 404 response with invalid ID as a response from the server
//   //     return res.status(404).json({
//   //       status: "fail",
//   //       message: "Invalid ID",
//   //     });
//   //   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour: "<Updated tour here>",
//     },
//   });
// };

// exports.deleteTour = (req, res) => {
//   res.status(204).json({
//     // If the status code is 204 then it means that there is no content as we will not send any result back to the client after a
//     // particular tour got deleted
//     status: "success",
//     data: {
//       tour: null,
//     },
//   });
// };
