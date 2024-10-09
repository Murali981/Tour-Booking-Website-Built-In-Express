const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");

const catchAsync = require("../utils/catchAsync");

const factory = require("./handlerFactory");

// CREATING A MULTER STORAGE
const multerStorage = multer.memoryStorage(); // Here the image will be stored as a buffer into the memory.

// CREATING A MULTER FILTER
const multerFilter = (req, file, cb) => {
  // The goal of this multerFilter() function is to test if the uploaded file is an image (or) not ? and if it is an image
  // then we pass "true" into the call-back function(cb()) and if it is not an image then we will pass false into the
  // call-back function along with an error and Again reiterating it we strictly don't allow files to be uploaded that are not
  // images and this is exactly this multerFilter is for....
  if (file.mimetype.startsWith("image")) {
    cb(null, true); // As if it starts with an image then we will pass "null" as a first argument indicating that there is
    // no error and "true" as the second argument saying that the uploaded file is an image
  } else {
    cb(new AppError("Not an image! Please upload only images", 400), false); // For this first argument here we will now
    // create an AppError() as we are all doing previously
  }
};

/* MULTER is a very popular middleware to handle multi-form data which is a form encoding that is used to upload files
from a form. Previously we have used a URL encoded form inorder to update the user data and for this we also had to include
a special middleware and multer is basically a middleware for multi-part form data. We will allow the user to upload a photo
on the /updateMe route. So instead of just being able to update the email and photo , users will also be able to upload there
user photos. To implement this multer middleware into our project , First we have to install multer into our project using the
command "npm install multer" */

// const upload = multer({
//   dest: "public/img/users", // This is exactly the folder where we want to save all the images that are being uploaded.
//   // Please make a point here that , Images are not directly uploaded into the database as we just upload them into our
//   // file system and then in the database , We will put a link basically to the image. So in this case , In each user document
//   // we will have the name of the uploaded file. We will use the above "upload" to create a middleware function that we can
//   // put it into the "/updateMe" route
// });

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter, // This is the function that is going to be executed for each file that is being uploaded.
});

exports.uploadTourImages = upload.fields([
  {
    name: "imageCover", // This is the name of the field in our form where we will be uploading our image.
    maxCount: 1, // This is the maximum number of images that we will be allowing to be uploaded.
  },
  {
    name: "images", // This is the name of the field in our form where we will be uploading our image.
    maxCount: 3, // This is the maximum number of images that we will be allowing to be uploaded.
  },
]); // Here we are passing multiple tour images. So this is the reason we have used fields() method
// here. and Each of the elements that we will pass into the fields() method is an object. And also we are using the fields()
// method because we are uploading a single image which is with the name "imageCover" and also multiple images which is with the
// name "images"

// upload.single("image"); When there is only one then it is simply upload a single image(req.file)
// upload.array("images", 5); When there are multiple images with the same name then it is upload.array("images",5) => Here 5 is
// maxCount (req.files)

/* We are creating the below middleware to process the above multiple tour images */

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // req.files =>  If we are uploading multiple files then multiple files will be on req.files.

  if (!req.files.imageCover || !req.files.images) {
    //
    return next(); // If no image is uploaded then we will skip this middleware and move on to the next middleware
  }

  // Step 1: Processing the cover image
  // Where do we actually get the coverImage ?
  // We will get the coverImage from req.files.imageCover

  // console.log(req.files.imageCover)
  //  imageCover: [
  //   {
  //     fieldname: 'imageCover',
  //     originalname: 'new-tour-1.jpg',
  //     encoding: '7bit',
  //     mimetype: 'image/jpeg',
  //     buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 1857218 more bytes>,
  //     size: 1857268
  //   }
  // ],
  // If you see the above one is a imageCover which is an array of objects . So in the below we are writing "req.files.imageCover[0].buffer"
  // to get the buffer of the first image which is cover image.
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`; // We can get the Id of the tour from req.params,id
  // and remember this route will always contains the ID of the tour
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333) // Here we are resizing the above selected cover image which is stored in the buffer to "3/2" ratio.
    // Width is 2000 pixels and height is 1333 pixels
    .toFormat("jpeg") // We are formatting it as a JPEG file
    .jpeg({ quality: 90 }) // With quality set to 90
    .toFile(`public/img/tours/${imageCoverFilename}`); // then we are saving the above resized cover image to this path which is
  // stored in imageCoverFilename variable above.

  // After the above step is finished then our update Tour handler will picks up the above image cover file name to update in the
  // current tour document
  req.body.imageCover = imageCoverFilename; // Now we are updating the imageCover field in the current tour document with the above image cover file name.
  // if you see the updateOne(tour) handler we are passing the entire req.body to update the tour document so to update this imageCover
  // on the tour document we are putting the "imageCover" field on the req.body so that this imageCover will also be sended to update
  // the tour document where when it is calling the below next middleware then this req.body contains the imageCover that has to be
  // updated for the ID of the tour document that we want to update and also please rememeber that this is called "imageCover" because
  //  in our tourSchema it is the same name which is there which is "imageCover". When it is doing the update , then it will match this
  // field in the body with the field in our database

  // Step 2: Processing the other images array
  req.body.images = []; // We are creating an empty array and in the below foreach loop in each iteration we will then push the
  // current filename to the above images array
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333) // Here we are resizing the above selected cover image which is stored in the buffer to "3/2" ratio.
        // Width is 2000 pixels and height is 1333 pixels
        .toFormat("jpeg") // We are formatting it as a JPEG file
        .jpeg({ quality: 90 }) // With quality set to 90
        .toFile(`public/img/tours/${filename}`); // then we are saving the above resized cover image to this path which is
      // stored in imageCoverFilename variable above.

      req.body.images.push(filename); // Now we are pushing the current filename to the images array.
    }),
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  // We are prefilling parts of the query object before we then reach the getAllTours handler
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getTour = factory.getOne(Tour, {
  path: "reviews",
  // select: ""
}); // Here the path property is the field that
//  we want to populate and also we can specify the select field to specify which field we want to actually get but we
// don't have any select field to get , that's why we don't need any select field here.

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

exports.getAllTours = factory.getAll(Tour);

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

exports.createTour = factory.createOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body); // Here the create() method also will return a Promise

//   res.status(201).json({
//     status: "success",
//     data: {
//       tour: newTour,
//     },
//   });

//   // try {
//   //   //   const newTour = new Tour({});
//   //   //   newTour.save();
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: "fail",
//   //     message: err.message,
//   //   });
//   // }
// });
// // ); // We are inside of a callback function that is gonna run in  the event loop as we can never ever block the
// // event loop . So that's why are writing the writeFile rather than writing writeFileSync() instead
// // };

exports.updateTour = factory.updateOne(Tour);

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

exports.deleteTour = factory.deleteOne(Tour);
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

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" }, // Here we are grouping by the difficulty and like this we calculate the
        // statistics for easy , medium and difficul tours. In this example , we grouped all the tours together by their
        // difficulty
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
  // } catch (err) {
  //   res.status(404).json({
  //     status: "fail",
  //     message: "Error deleting the tour",
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
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
  // } catch (err) {
  //   res.status(404).json({
  //     status: "fail",
  //     message: "Error deleting the tour",
  //   });
  // }
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params; // These all distance,center and unit will come from req.params. We are
  // using destructuring to get all the features at once
  const [lat, lng] = latlng.split(","); // This will create an array of two elements.

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1; // Here the radius is basically the distance that we want to have as the radius but converted to a
  // special unit called radians and inorder to get the radians we need to divide our distance by the radius of the earth.
  // The radius of the earth is different in miles than in kilometers. and in the above the value "3963.2" is the radius
  // of the earth in miles and if the radius in km then the value is "6378.1", Here the mongoDB expects the radius of the
  // sphere to be radians and radians we  get by dividing the distance by the radius of the earth

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide the latitude and longitude in the format lat,lng",
        400, // 400 status code for bad request
      ),
    );
  }

  // A Geo-spatial query works similar to a regualr query

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  }); // Here we will send the startLocation field in the geospatial point where each
  // tour starts and this is exactly what we are searching for , To the startLocation field we are sending an object with
  // the special operator available in mongo which is "$geoWithin" and this "$geoWithin" operator does exactly what it says
  // So it basically finds documents within a certain geometry and this geometry what we want to define as the next step.
  // So we want to find documents but where we want to actually want to find these documents , Well we want to find them inside
  // of a sphere that starts at this point "latlng" that we defined and which has the radius of "distance" that we have
  // defined. So again our example which is "Los-angeles" , where you have specified a distance of 250 miles then that means
  // you want to find all the tour documents within a sphere that has a radius of 250 miles . So all these information we
  // have to pass in to the "$geoWithin" operator and we do that by defining a center sphere and this "$centerSphere" operator
  // takes array of [] coordinates and of the radius and please rememeber that to the array we will specify another array
  // inside for specifying the latitude and longitude and also we have to first mention the longitude and then the latitude
  // in the array which is according to the mongoDB documentation . and in the radius field mongoDB expects a special unit
  // of radius which is called radians

  console.log(distance, lat, lng, unit);

  /* Another very important thing we will just to do basic queries, We need to first attribute an index to the field where
  the geo-spatial data that we are searching for is stored. So in this case we will add a start index to startLocation */

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params; // These all distance,center and unit will come from req.params. We are
  // using destructuring to get all the features at once
  const [lat, lng] = latlng.split(","); // This will create an array of two elements.

  const multiplier = unit === "mi" ? 0.000621371 : 0.001; // If the unit is in miles which is "mi" then we have
  // to multiply with this "0.000621371" number to convert it into miles and if the unit is not in miles then we have
  // to multiply with "0.001" to convert the distance into "kilometers" as we know that by default the distance is coming in
  // meters(m) which is a pretty long number.

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide the latitude and longitude in the format lat,lng",
        400, // 400 status code for bad request
      ),
    );
  }

  // Inorder to do calculations , We always use the aggregation pipeline and remember that this aggregation pipeline is called
  // on the model itself and in our case the Model is "Tour" itself

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier, // Here we can specify a number which is then going to be multiplied with all the
        // distances. Here we will specify "0.001" and this is same exactly when we want to divide it by "1000"
        // We know that if we didn't specify this "distanceMultiplier" property we are getting the distance in "meters"
        // But we want the distance to come in kilometers , So this is the reason we want to divide the distance/1000 then
        // it will be converted to kilometers. And you can see above in the distanceMultiplier field we have specified
        // the value as "0.001" which is same as dividing the distance by 1000(distance/1000).
      }, // This is the only geo-spatial aggregation pipeline stage that actually exists and this one should be
      // always first one in  the pipeline. Keep that in mind $geoNear always needs to be the first stage. Something it is
      // very important to note about $geoNear is that it requires that atleast one of our fields contains a geo-spatial
      // index. If there is only one field with geo-spatial index then this "$geoNear" stage will automatically use this
      // index to perform the calculation. But if you have multiple fields with geo-spatial indexes then you need to use
      // the keys parameter inorder to define the field that you want to define the field that you want to use for the
      // calculations. But again in this case, We have only one field and so automatically the startLocation field is going
      // to be used for the calculations. So what do we have to pass into the $geoNear, First we have to specify the
      // "near" property and "near" is the point from which to calculate the distances. So all the distances will be
      // calculated between this point that we have defined here and then all the startLocations and so this near point
      // is the point that we will pass into the function with this latitude and the longitude. Now we need to specify
      // this point actually as a geoJSON where we have to specify the "type" as "point" and then specify the coordinates
      // property in an array with the latitude and the longitude and remember here in this coordinates array the first
      // point will always be the "longitude" property and the second point is the "latitude" property and then multiply
      // both of them by 1 to simply convert them into numbers and the second one is the "distanceField" property and this
      // is the name of the field that will be created and where all the calculated distances will be stored.
    },
    {
      $project: {
        distance: 1, // Here 1 means we want to keep this in the output
        name: 1,
      }, // This project field will only keep the names that we want to see in the output
    },
  ]); // Remember into the aggregate() function, We will pass in an array with
  // all the stages of the aggregation pipeline that we want to define. Now for geo-spatial aggregation there is only one single
  // stage and that is called geoNear($geoNear)

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
