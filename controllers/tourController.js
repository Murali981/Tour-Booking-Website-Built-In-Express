const Tour = require("../models/tourModel");

const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopTours = (req, res, next) => {
  // We are prefilling parts of the query object before we then reach the getAllTours handler
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id:req.params.id})

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Error retrieving tour",
    });
  }
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
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
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
    const features = new APIFeatures(Tour.find(), req.query) // Here the req.query is coming from the express
      .filter()
      .sort()
      .limitFields()
      .paginate(); // We are creating a new object(or) instance for the APIFeatures class and store it in the
    // features variable and this features will have access to all the methods that we are going to define in the call definition
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours: tours, // (or) you can simply leave it as tours . In tours:tours the right side tours will represent the tours variable
        // that is coming from the fs.readFileSync() function and the left side tours is representing the tours as a resource in the
        // path "/api/v1/tours"
      },
    }); // This type of formating the response data coming from the server is "JSEND data specification"
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    //   const newTour = new Tour({});
    //   newTour.save();

    const newTour = await Tour.create(req.body); // Here the create() method also will return a Promise

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
// ); // We are inside of a callback function that is gonna run in  the event loop as we can never ever block the
// event loop . So that's why are writing the writeFile rather than writing writeFileSync() instead
// };

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // When you set the new to true then it will return the modified document rather than the original. defaults to false
      runValidators: true, // This runValidators to true makes sure that it will run the validators again as in the tourSchema we
      // have mentioned that price should be a number . So it has to be a number and it runs this validator check again....
    });

    res.status(200).json({
      status: "success",
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Error updating the tour",
    });
  }
  //   if (req.params.id > tours.length) {
  //     // If the tour is undefined(!tour) then simply return the 404 response with invalid ID as a response from the server
  //     return res.status(404).json({
  //       status: "fail",
  //       message: "Invalid ID",
  //     });
  //   }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    }); // In case when you are deleting anything then according to RESTful API you should not send any data back to the client.
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Error deleting the tour",
    });
  }

  // If the status code is 204 then it means that there is no content as we will not send any result back to the client after a
  // particular tour got deleted
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" }, // Here we are saying that we want everything in one group
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      //   {
      //     $match: { _id: { $ne: "EASY" } },
      //   },
    ]); // aggregation pipeline really is a mongoDB feature but mongoose of course gives access to it so that we can
    // use it in the mongoose driver . Using our tour model inorder to access the tour collection. Aggregation pipeline is like a
    // regular query and so using the aggregation pipeline is just like a regular query . The difference is that in aggregations we can
    // manipulate the data in a couple of different steps. To define these steps we pass in a array of so-called stages. Our documents
    // will go through this array step by step in a sequential manner and each of the elements in this array will be one of the stages.
    // There are a ton of stages we can choose from here. "Match" is like a filter of certain documents.

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Error deleting the tour",
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // This is the trick to transform the year into number. Just keep in mind that we have
    // given the 2021 as date in this req.params.year route which is "http://localhost:3000/api/v1/tours/monthly-plan/2021". So
    // if you see in the above rote we have selected the date(or) year as 2021

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates", // unwind  will basically deconstruct an array field from the info documents and then output one document
        // for each element in the array. So it will split the array into multiple documents. We basically want to have one tour for
        // each of these dates in the array . And this "$unwind" stage can be useful in so many cases. In the above , the field that
        // we want to unwind is "startDates"
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // We want our date to be greater than (or) equal to January 1st 2021
            $lte: new Date(`${year}-12-31`), // We want our date to be lesser than (or) equal to December 31st 2021
          },
        }, // $match operator is basically to select documents which is just to do a query.
      },
      {
        $group: {
          _id: { $month: "$startDates" }, // We want to extract the month from the $startDates. Here we are grouping it by the month
          numTourStarts: { $sum: 1 }, // The real information that we want for each of the month is how many tours start in that month. For this
          // what we gonna do is basically count the amount of tours that have a certain month. In this we will use a "$sum" operator
          // and then for each of the documents we will add 1.
          tours: { $push: "$name" }, // Here we want to create an array and we do that by using push and then what we are gonna push into that
          // array is as each document goes through this pipeline is simply the "$name" field of the document. In this case is , the name of
          // the tour
        },
      },
      {
        $addFields: { month: "$_id" }, // Here simply the name of the field and the value
      },
      {
        $project: { _id: 0 }, // How this "$project" works is , We will give each of the field names a zero (or) a one. We can say "_id" and
        // set it to zero . So it makes sures that id no longer shows up in the result. If i put one instead of zero then it will
        // show up
      },
      {
        $sort: {
          numTourStarts: -1, // "-1" for descending and "1" for ascending
        },
      },
      {
        $limit: 12, // It makes sure that only six documents are allowed here
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Error deleting the tour",
    });
  }
};
