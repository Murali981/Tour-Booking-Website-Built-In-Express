class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  } // This constructor will automatically called as soon as we create a new object out of this class.

  filter() {
    const queryObj = { ...this.queryString }; // This three dots(...) will basically takes all the fields out of the object and this
    // curly braces will simply create a new object which contains all the key-value pairs that were in our req.query object

    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    // In JavaScript if we set a variable to another object then that new variable will be a reference to the original object.
    let queryStr = JSON.stringify(queryObj); // Here we are converting the object to a string.
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr)); // This will convert back the string to object.
    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr)); // Here this tour.find() will return a query and we store this query object in this
    // // query variable then we can keep on chaining more methods to it. More of these methods that are available on all documents
    // // through the query class.
    return this; // Here this is simply the entire object
  }

  sort() {
    if (this.queryString.sort) {
      //  req.query.sort gives the price
      const sortBy = this.queryString.sort.split(",").join(" ");
      //   console.log(sortBy);
      this.query = this.query.sort(sortBy);
      // sort("price ratingsAverage") => Here we are passing two fields to the sort() function
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this; // Here this is simply the entire object
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      //   query = query.select("name duration price"); // It will select only these three field names and send back the result
      //   // which contains only these fields . The process of selecting only certain field names is called projecting.
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); // Here the minus(-) is then not including but excluding. So here we are saying that we want
      // the data except with the field "__v". Here we are excluding only this field "__v" by specifying with a minus(-)
    }

    return this; // Here this is simply the entire object
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // This is a nice way of defining default values in javascript.
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // This number is all the results that come before the page that we are actually
    // requesting now . Let us suppose we are requesting the page number 3 then our results gonna start at page number 21
    // We want to skip 20 results before that
    // page=2&limit=10 Here the user wants the page number 2 and 10 results per page. It means that the results are from
    // one to ten on page 1 and 11 to 20 are on page 2
    // query = query.skip(10).limit(10); // Here we are saying that we have to skip 10 results inorder to get the result number 11
    // // Here if we requested the page number three then 20 results first have to be skipped(query.skip(20)) , So we will need
    // // some way of calculating this skip value here based on the page and the limit.
    this.query = this.query.skip(skip).limit(limit);

    return this; // Here this is simply the entire object
  }
}

module.exports = APIFeatures; // This will be available to other files in our project to use this class.
// This is a good practice to create a separate file for each functionality.
// This makes our code more organized and easier to maintain.
