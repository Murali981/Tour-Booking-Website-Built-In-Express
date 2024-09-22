const Tour = require("../models/tourModel");

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
    const queryObj = { ...req.query }; // This three dots(...) will basically takes all the fields out of the object and this
    // curly braces will simply create a new object which contains all the key-value pairs that were in our req.query object

    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    // In JavaScript if we set a variable to another object then that new variable will be a reference to the original object.

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj); // Here we are converting the object to a string.
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr)); // This will convert back the string to object

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

    let query = Tour.find(JSON.parse(queryStr)); // Here this tour.find() will return a query and we store this query object in this
    // query variable then we can keep on chaining more methods to it. More of these methods that are available on all documents
    // through the query class.

    // 2) Sorting
    if (req.query.sort) {
      //  req.query.sort gives the price
      const sortBy = req.query.sort.split(",").join(" ");
      //   console.log(sortBy);
      query = query.sort(sortBy);
      // sort("price ratingsAverage") => Here we are passing two fields to the sort() function
    } else {
      query = query.sort("-createdAt");
    }

    // 3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      //   query = query.select("name duration price"); // It will select only these three field names and send back the result
      //   // which contains only these fields . The process of selecting only certain field names is called projecting.
      query = query.select(fields);
    } else {
      query = query.select("-__v"); // Here the minus(-) is then not including but excluding. So here we are saying that we want
      // the data except with the field "__v". Here we are excluding only this field "__v" by specifying with a minus(-)
    }

    // EXECUTE THE QUERY
    const tours = await query;

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
