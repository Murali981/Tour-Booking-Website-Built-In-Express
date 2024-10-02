/* Functions that we write inside this file will return controllers */
// The goal here is to basically create a function which will then return a function

const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// The below deleteOne function will not only going to work for deleting of tours but also to delete reviews and users and
// in future we might have some other documents as well . We will pass Model into the below deleteOne function and create
// a new function and then this new function will right away return our async function as below which is wrapped inside the
// catchAsync() function
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404)); // Here we want to jump straight into the error handling middleware
    } // Here we are writing the return because we want to return the function immediately and not move on to the next line which
    // would be the below res block where it will try to send two responses

    res.status(204).json({
      status: "success",
      data: null,
    }); // In case when you are deleting anything then according to RESTful API you should not send any data back to the client.
    // } catch (err) {
    //   res.status(404).json({
    //     status: "fail",
    //     message: "Error deleting the tour",
    //   });
    // }

    // If the status code is 204 then it means that there is no content as we will not send any result back to the client after a
    // particular tour got deleted
  });

/* The below exports.deleteTour will work for only deleting tours but in the above exports.deleteOne = Model => catchAsync()
  function is like a generic Model will work for deleting tours , reviews and users and this deleteOne function works for
  every model */

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404)); // Here we want to jump straight into the error handling middleware
//   } // Here we are writing the return because we want to return the function immediately and not move on to the next line which
//   // would be the below res block where it will try to send two responses

//   res.status(204).json({
//     status: "success",
//     data: null,
//   }); // In case when you are deleting anything then according to RESTful API you should not send any data back to the client.
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: "fail",
//   //     message: "Error deleting the tour",
//   //   });
//   // }

//   // If the status code is 204 then it means that there is no content as we will not send any result back to the client after a
//   // particular tour got deleted
// });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // When you set the new to true then it will return the modified document rather than the original. defaults to false
      runValidators: true, // This runValidators to true makes sure that it will run the validators again as in the tourSchema we
      // have mentioned that price should be a number . So it has to be a number and it runs this validator check again....
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404)); // Here we want to jump straight into the error handling middleware
    } // Here we are writing the return because we want to return the function immediately and not move on to the next line which
    // would be the below res block where it will try to send two responses

    res.status(200).json({
      status: "success",
      data: {
        // We sent our data here as well as the envelope inside here is also so called data
        data: doc,
      },
    });
    // } catch (err) {
    //   res.status(404).json({
    //     status: "fail",
    //     message: "Error updating the tour",
    //   });
    // }
    //   if (req.params.id > tours.length) {
    //     // If the tour is undefined(!tour) then simply return the 404 response with invalid ID as a response from the server
    //     return res.status(404).json({
    //       status: "fail",
    //       message: "Invalid ID",
    //     });
    //   }
  });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true, // When you set the new to true then it will return the modified document rather than the original. defaults to false
//     runValidators: true, // This runValidators to true makes sure that it will run the validators again as in the tourSchema we
//     // have mentioned that price should be a number . So it has to be a number and it runs this validator check again....
//   });

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404)); // Here we want to jump straight into the error handling middleware
//   } // Here we are writing the return because we want to return the function immediately and not move on to the next line which
//   // would be the below res block where it will try to send two responses

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour: tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: "fail",
//   //     message: "Error updating the tour",
//   //   });
//   // }
//   //   if (req.params.id > tours.length) {
//   //     // If the tour is undefined(!tour) then simply return the 404 response with invalid ID as a response from the server
//   //     return res.status(404).json({
//   //       status: "fail",
//   //       message: "Invalid ID",
//   //     });
//   //   }
// });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body); // Here the create() method also will return a Promise

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });

    // try {
    //   //   const newTour = new Tour({});
    //   //   newTour.save();
    // } catch (err) {
    //   res.status(400).json({
    //     status: "fail",
    //     message: err.message,
    //   });
    // }
  });

// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body); // Here the create() method also will return a Promise

//     res.status(201).json({
//       status: "success",
//       data: {
//         tour: newTour,
//       },
//     });

//     // try {
//     //   //   const newTour = new Tour({});
//     //   //   newTour.save();
//     // } catch (err) {
//     //   res.status(400).json({
//     //     status: "fail",
//     //     message: err.message,
//     //   });
//     // }
//   });
//   // ); // We are inside of a callback function that is gonna run in  the event loop as we can never ever block the
//   // event loop . So that's why are writing the writeFile rather than writing writeFileSync() instead
//   // };

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // As we have populateOptions in the getOne function , We have to make some changes which are mentioned below
    // Basically we will first create the query and then if there is a populateOptions object then we will
    // add that to the query and then by the end we will await the query.
    let query = Model.findById(req.params.id); // Here we are storing it in a query variable.
    if (popOptions) {
      query = query.populate(popOptions); // Here we are manipulating the query and later we are updating the query variable
      // if there are popOptions.
    }
    const doc = await query;
    // try {
    // console.log(req.params.id);

    // const doc = await Model.findById(req.params.id).populate("reviews"); // Here the name of the field that we
    // want to populate is "reviews".
    // .populate({
    //   path: "guides",
    //   select: "-__v -passwordChangedAt", // Here in the select we are mentioning explicitly that while populating the
    //   // guides data , don't show the "__v" and "passwordChangedAt" fields in the response output
    // }); // Here we want to populate , So basically
    // // to fill up the field called guides in our Tours model where the guides field contains only references and so with
    // // populate we are gonna fill it up with the actual data and it is also occurs only in the query but not in the
    // // database
    // // Tour.findOne({_id:req.params.id})

    // console.log(doc);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404)); // Here we want to jump straight into the error handling middleware
    } // Here we are writing the return because we want to return the function immediately and not move on to the next line which
    // would be the below res block where it will try to send two responses

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
    // } catch (err) {
    //   res.status(404).json({
    //     status: "fail",
    //     message: "Error retrieving tour",
    //   });
    // }
    //   console.log(req.params); // req.params is where all the parameters of all the variables that we define here are stored . The variables
    //   // in the above URL are called parameters and they are available in req.params which are readily available such that we can use them.
    //   const id = req.params.id * 1; // when we multiply a string that looks like a number({id : "5"}) then it will automatically convert
    //   // this string to a number.
    //   const tour = tours.find((el) => el.id === Number(req.params.id));
    // const tour = tours.find((el) => el.id === id);
    //   if (id > tours.length) {
    //     return res.status(404).json({
    //       status: "fail",
    //       message: "Invalid ID",
    //     });
    //   }
    //   if (!tour) {
    //     // If the tour is undefined(!tour) then simply return the 404 response with invalid ID as a response from the server
    //     return res.status(404).json({
    //       status: "fail",
    //       message: "Invalid ID",
    //     });
    //   }
    // res.status(200).json({
    //   status: "success",
    //   // results: tours.length,
    //   data: {
    //     tour,
    //   },
    // }); // This type of formating the response data coming from the server is "JSEND data specification"
  });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // try {
//   // console.log(req.params.id);
//   const tour = await Tour.findById(req.params.id).populate("reviews"); // Here the name of the field that we
//   // want to populate is "reviews".
//   // .populate({
//   //   path: "guides",
//   //   select: "-__v -passwordChangedAt", // Here in the select we are mentioning explicitly that while populating the
//   //   // guides data , don't show the "__v" and "passwordChangedAt" fields in the response output
//   // }); // Here we want to populate , So basically
//   // // to fill up the field called guides in our Tours model where the guides field contains only references and so with
//   // // populate we are gonna fill it up with the actual data and it is also occurs only in the query but not in the
//   // // database
//   // // Tour.findOne({_id:req.params.id})

//   console.log(tour);

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404)); // Here we want to jump straight into the error handling middleware
//   } // Here we are writing the return because we want to return the function immediately and not move on to the next line which
//   // would be the below res block where it will try to send two responses

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: "fail",
//   //     message: "Error retrieving tour",
//   //   });
//   // }
//   //   console.log(req.params); // req.params is where all the parameters of all the variables that we define here are stored . The variables
//   //   // in the above URL are called parameters and they are available in req.params which are readily available such that we can use them.
//   //   const id = req.params.id * 1; // when we multiply a string that looks like a number({id : "5"}) then it will automatically convert
//   //   // this string to a number.
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
// });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // We will gonna check whether there is a tourId and if there is a tourId , then we will only search for the reviews
    // where the tour is equal to this tourId.
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId }; // If there is a tourId then we will filter the reviews by that tourId.
    }
    // try {
    // console.log(req.query);
    // BUILD OUR QUERY
    // 1A) FILTERING
    // const queryObj = { ...req.query }; // This three dots(...) will basically takes all the fields out of the object and this
    // // curly braces will simply create a new object which contains all the key-value pairs that were in our req.query object

    // const excludeFields = ["page", "sort", "limit", "fields"];
    // excludeFields.forEach((el) => delete queryObj[el]);
    // // In JavaScript if we set a variable to another object then that new variable will be a reference to the original object.

    // 1B) Advanced Filtering
    // let queryStr = JSON.stringify(queryObj); // Here we are converting the object to a string.
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr)); // This will convert back the string to object

    // {difficulty:"easy" , duration:{$gte: 5} , difficulty:"easy}
    // { duration: { gte: '5' }, difficulty: 'easy' }
    // gte , lte , gt , lt

    // console.log(req.query, queryObj); // This req.query gives us an object that is nicely formatted with the data from the query string
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: "easy",
    // }); // If we didn't pass any arguments into the find() function then it will return all the tours
    // const query = Tour.find()
    //   .where("duration")
    //   .equals(5)
    //   .where("difficulty")
    //   .equals("easy");

    // let query = Tour.find(JSON.parse(queryStr)); // Here this tour.find() will return a query and we store this query object in this
    // // query variable then we can keep on chaining more methods to it. More of these methods that are available on all documents
    // // through the query class.

    // 2) Sorting
    // if (req.query.sort) {
    //   //  req.query.sort gives the price
    //   const sortBy = req.query.sort.split(",").join(" ");
    //   //   console.log(sortBy);
    //   query = query.sort(sortBy);
    //   // sort("price ratingsAverage") => Here we are passing two fields to the sort() function
    // } else {
    //   query = query.sort("-createdAt");
    // }

    // 3) Field limiting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(",").join(" ");
    //   //   query = query.select("name duration price"); // It will select only these three field names and send back the result
    //   //   // which contains only these fields . The process of selecting only certain field names is called projecting.
    //   query = query.select(fields);
    // } else {
    //   query = query.select("-__v"); // Here the minus(-) is then not including but excluding. So here we are saying that we want
    //   // the data except with the field "__v". Here we are excluding only this field "__v" by specifying with a minus(-)
    // }

    // 4) Pagination
    // const page = req.query.page * 1 || 1; // This is a nice way of defining default values in javascript.
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit; // This number is all the results that come before the page that we are actually
    // // requesting now . Let us suppose we are requesting the page number 3 then our results gonna start at page number 21
    // // We want to skip 20 results before that
    // // page=2&limit=10 Here the user wants the page number 2 and 10 results per page. It means that the results are from
    // // one to ten on page 1 and 11 to 20 are on page 2
    // // query = query.skip(10).limit(10); // Here we are saying that we have to skip 10 results inorder to get the result number 11
    // // // Here if we requested the page number three then 20 results first have to be skipped(query.skip(20)) , So we will need
    // // // some way of calculating this skip value here based on the page and the limit.
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments(); // This is going to return the number of documents
    //   if (skip >= numTours) {
    //     throw new Error("This page doesnot exist");
    //   }
    // }

    // EXECUTE THE QUERY
    const features = new APIFeatures(Model.find(filter), req.query) // Here the req.query is coming from the express
      .filter()
      .sort()
      .limitFields()
      .paginate(); // We are creating a new object(or) instance for the APIFeatures class and store it in the
    // features variable and this features will have access to all the methods that we are going to define in the call definition
    // const doc = await features.query.explain(); // Here the .explain() is coming from the mongoDB where it gives
    // // all the details about the query like all the statistics about the query...

    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc, // (or) you can simply leave it as tours . In tours:tours the right side tours will represent the tours variable
        // that is coming from the fs.readFileSync() function and the left side tours is representing the tours as a resource in the
        // path "/api/v1/tours"
      },
    }); // This type of formating the response data coming from the server is "JSEND data specification"
    // } catch (err) {
    // res.status(404).json({
    //   status: "fail",
    //   message: err.message,
    // });
    // }
  });

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // try {
//   // console.log(req.query);
//   // BUILD OUR QUERY
//   // 1A) FILTERING
//   // const queryObj = { ...req.query }; // This three dots(...) will basically takes all the fields out of the object and this
//   // // curly braces will simply create a new object which contains all the key-value pairs that were in our req.query object

//   // const excludeFields = ["page", "sort", "limit", "fields"];
//   // excludeFields.forEach((el) => delete queryObj[el]);
//   // // In JavaScript if we set a variable to another object then that new variable will be a reference to the original object.

//   // 1B) Advanced Filtering
//   // let queryStr = JSON.stringify(queryObj); // Here we are converting the object to a string.
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   // console.log(JSON.parse(queryStr)); // This will convert back the string to object

//   // {difficulty:"easy" , duration:{$gte: 5} , difficulty:"easy}
//   // { duration: { gte: '5' }, difficulty: 'easy' }
//   // gte , lte , gt , lt

//   // console.log(req.query, queryObj); // This req.query gives us an object that is nicely formatted with the data from the query string
//   // const tours = await Tour.find({
//   //   duration: 5,
//   //   difficulty: "easy",
//   // }); // If we didn't pass any arguments into the find() function then it will return all the tours
//   // const query = Tour.find()
//   //   .where("duration")
//   //   .equals(5)
//   //   .where("difficulty")
//   //   .equals("easy");

//   // let query = Tour.find(JSON.parse(queryStr)); // Here this tour.find() will return a query and we store this query object in this
//   // // query variable then we can keep on chaining more methods to it. More of these methods that are available on all documents
//   // // through the query class.

//   // 2) Sorting
//   // if (req.query.sort) {
//   //   //  req.query.sort gives the price
//   //   const sortBy = req.query.sort.split(",").join(" ");
//   //   //   console.log(sortBy);
//   //   query = query.sort(sortBy);
//   //   // sort("price ratingsAverage") => Here we are passing two fields to the sort() function
//   // } else {
//   //   query = query.sort("-createdAt");
//   // }

//   // 3) Field limiting
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(",").join(" ");
//   //   //   query = query.select("name duration price"); // It will select only these three field names and send back the result
//   //   //   // which contains only these fields . The process of selecting only certain field names is called projecting.
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select("-__v"); // Here the minus(-) is then not including but excluding. So here we are saying that we want
//   //   // the data except with the field "__v". Here we are excluding only this field "__v" by specifying with a minus(-)
//   // }

//   // 4) Pagination
//   // const page = req.query.page * 1 || 1; // This is a nice way of defining default values in javascript.
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit; // This number is all the results that come before the page that we are actually
//   // // requesting now . Let us suppose we are requesting the page number 3 then our results gonna start at page number 21
//   // // We want to skip 20 results before that
//   // // page=2&limit=10 Here the user wants the page number 2 and 10 results per page. It means that the results are from
//   // // one to ten on page 1 and 11 to 20 are on page 2
//   // // query = query.skip(10).limit(10); // Here we are saying that we have to skip 10 results inorder to get the result number 11
//   // // // Here if we requested the page number three then 20 results first have to be skipped(query.skip(20)) , So we will need
//   // // // some way of calculating this skip value here based on the page and the limit.
//   // query = query.skip(skip).limit(limit);

//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments(); // This is going to return the number of documents
//   //   if (skip >= numTours) {
//   //     throw new Error("This page doesnot exist");
//   //   }
//   // }

//   // EXECUTE THE QUERY
//   const features = new APIFeatures(Tour.find(), req.query) // Here the req.query is coming from the express
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate(); // We are creating a new object(or) instance for the APIFeatures class and store it in the
//   // features variable and this features will have access to all the methods that we are going to define in the call definition
//   const tours = await features.query;

//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     results: tours.length,
//     data: {
//       tours: tours, // (or) you can simply leave it as tours . In tours:tours the right side tours will represent the tours variable
//       // that is coming from the fs.readFileSync() function and the left side tours is representing the tours as a resource in the
//       // path "/api/v1/tours"
//     },
//   }); // This type of formating the response data coming from the server is "JSEND data specification"
//   // } catch (err) {
//   // res.status(404).json({
//   //   status: "fail",
//   //   message: err.message,
//   // });
//   // }
// });
