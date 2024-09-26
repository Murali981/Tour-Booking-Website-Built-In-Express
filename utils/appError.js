class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // As usual when we extend a parent class which is the builtIn error class then we will call the super() inorder
    // to call the parent constructor , We will send a message argument into the super(message) method because the message is the
    // only parameter that the builtIn Error class accepts.
    // Why didn't i set the this.message = message ? //////////////////////////////////////
    /*  Because we call the parent class which is Error (super(message)) and whatever we will pass into this parent class Error will
     be the message property. So by doing the parent call which is super(message) as we already set the message property to our 
      incoming message.  */
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // The errors that we create using this AppError class will be operational errors which are the errors that we can predict
    // will happen at sometime in the future like a user creating a tour without the required fields. So we will use this
    // AppError class inorder to create all the errors in our application
    this.isOperational = true; // All our errors will set this property to true.
    //// What do you mean by CAPTURING THE STACK TRACE ? //////////////////////////////////////////////////////////////////
    /* Each and every error get this stack trace "err.stack"  will show us where the error has happened */
    Error.captureStackTrace(this, this.constructor); // When a new object is created using the AppError class and a constructor
    // function is called then that function will is not gonna appear in the stack trace and will not pollute it.
  }
} // Here Error is a builtIn Error class.

module.exports = AppError;
