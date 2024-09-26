module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // Here fn is an async function and remember that asynchronous functions return promises and when
    // there is an error inside of an async function then it basically means that the promise gets rejected. So we are catching the error
    // in the catch() block and inside the catch block we are passing the error to the next function which will pass the error to the
    // global error middleware.
  };
}; // The goal of this function is to simply catch the asynchronous errors
