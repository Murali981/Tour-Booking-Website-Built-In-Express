const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");

const bcrypt = require("bcryptjs");

// name , email , photo , password and passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name."],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"], // We are using enum here to only allow certain types of roles and
    // these roles will be specific to the application's domain which means what type of application you are using
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password; // compare the entered password with the confirmed password
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Date, // This passwordChangedAt field will always get changed whenever someone changes the password.
  // Most of the people will not create this field in there schema.
  passwordResetToken: String,
  passwordResetExpires: Date, // This passwordResetExpires will be expired after a certain amount of time.
  active: {
    type: Boolean,
    default: true, // Any user that has created a new account is an active user and so the boolean is set to true and also
    // we don't want to show this in the output , which means we basically want to hide this implementation detail from
    // the user as we don't want anyone to know that this active flag is here. So this is the reason we want the select field to be
    // false.
    select: false, // This is the reason we are using select: false here.
  },
});

// Mongoose middleware is the perfect usecase to store passwords in encryped form in the mongo database
// The one that we are gonna use is the pre-save middleware which is basically the document middleware.

userSchema.pre("save", async function (next) {
  // We only want to encrypt the password only when it is updated (or) created for the first time.
  if (!this.isModified("password")) {
    // Here this refers to the current document and in this case it is the current user. Please remember that
    // we have methods on all the documents and one of the method that we are using is "isModified()" used when
    // a certain field is modified.
    return next(); // If the password is not modified, we just move on to the next middleware function.
  }
  this.password = await bcrypt.hash(this.password, 12); // Here 12 is a cost parameter into this bcrypt.hash() function here
  // and this is basically a measure of how CPU intensive this operation will be and the default value for this cost parameter
  // is 10. The higher the cost parameter is then basically the more CPU intensive the process will be and better the
  // password will be encrypted. Here this .hash() function will return a promise as this is an async function , So
  // we have to await on this bcrypt.hash() function.

  this.passwordConfirm = undefined; // We only need this passwordConfirm for the validation that we have implemented above.
  // Again reiterating it which is once the password gots validated which is after checking both passord and passwordConfirm
  // inputted values are same then our work is done . So after the validation check is passed successfully then we will
  // encrypt the password and once the encryption of password is done then we will make the passwordConfirm as undefined
  // because it should not be persisted on the database.

  next();
}); // This is a pre-middleware on save , The reason why we are doing like this is , The middleware
// function that we gonna specify here is.., So the encryption is then gonna happen between the moment that we have
// received the data and the moment where it is actually persisted to the database. This is where the pre-save middleware
// runs (Between getting the data and saving it to the database).

userSchema.pre("save", function (next) {
  // Again this function gonna run before a new  document actuall gets saved into the database..
  // When exactly do we actually want to set the passwordChangedAt property to right now.
  // Well we only want it when we actually modified the password property.

  if (!this.isModified("password") || this.isNew) {
    return next(); // If the password is not modified, we just move on to the next middleware function without
    // modifying the passwordChangedAt property. But what about creating a new document. When we create a new document
    // then we did actually modify the password and then we would set the passwordChangedAt property as in the
    // current implementation we actually would but there is something else we can use here . So basically we want
    // to exit the middleware function rightaway if the password is not been modified (or) if the document is new then
    // we can use the isNew property available in the mongoDB documentation.
  }
  this.passwordChangedAt = Date.now() - 1000; // Here the 1000 means 1000milliseconds = 1second
  next(); // some problem occurs when saving it to the database is a bit slower than issuing the web token making it
  // so that the changed password timestamp is set sometimes a bit after the JSON Web Token has been created and so
  // that will then make it so that the user will not be able to login using the new token, Because remember the whole
  // reason this timestamp here actually exists is so that we can compare it with the timestamp on the JSON Web Token.
  // In the above , we are putting the  passwordChangedAt one second in the past which will not be 100% accurate but that's
  // not a problem at all because one second here doesn't make any difference at all . So putting this passwordChangedAt
  // one second in the past will then ensure that the user is always created after the password has been changed
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }); // Here all the documents where the active property which is not set to false
  // will show up in the result.
  next();
}); // This will happen something before a query and the query will be a find query
// So this is what it makes the query middleware. This is a regular expression "/^find/" which means we are looking for words
// (or) strings that starts with find . Please remember that this is a query middleware , So here the "this" keyword points
// to the current query but not the current document

/* What is an Instance Method ? */
// An Instance Method is a method that is available on all documents of a certain collection. It is defined on the
// userSchema
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword); // This compare function will simply return true if
  // the both passwords are the same and returns false if not. And again we cannot compare them manually because the
  // candidate password is not hashed which is the original password that is coming from the user but the user password
  // is hashed . So without the bcrypt.compare() function there is no way of comparing them
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  // Here the this method in the instance always points to the current document and here we have the access to the
  // properties . Now we have to create a field in our schema for the date where the password has been changed. So now
  // we are adding a new field "passwordChangedAt" to our schema.
  console.log(this.passwordChangedAt);
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    ); // Here 10 represents the base which is a decimal number
    console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp; // If JWTTimestamp is less than changedTimeStamp then the user has
    // changed his password after the JWTTimestamp was issued. Otherwise he hasn't changed the password
  }
  return false; // Here we will pass the JWTTimestamp as it  says when this JWTTimestamp has been issued, By default we will
  // return false from this method and that will mean that  the user has not changed his password after the token was issued.
};

userSchema.methods.createPasswordResetToken = function () {
  // The passwordResetToken should be a random string but at the same time it doesn't need to be as cryptographically strong
  // as the password hash that we have created before . So we can use the simple randomBytes() function from the builtIn
  // crypto module.

  const resetToken = crypto.randomBytes(32).toString("hex"); // here 32 is the total number of characters in our generated string.
  // This resetToken will be send to the user and so it is like a reset password that the user can use to create a new real
  // password. So only the user who has access to this resetToken and infact it behaves like a kind of password and since it
  // is a password , it means that if a hacker can get access to our database then that's gonna allow the hacker to gain access
  // to the account by setting a new password . So again if we simply store this token in our database and if any hacker gains
  // access to our database and this hacker can steal the token from the database and with this token the hacker can create a
  // new password using this token instead of the actual user doing it . So the hacker then effectively control our account.
  // So finally just like a password you should never store a plain reset token in the database but we will encrypt this reset
  // token before storing it in the database. Here the encryption need not be  so strong as the password as these reset tokens
  // are less dangerous , So we will use the builtIn crypto module to encrypt this reset token.

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Here we are setting
  // the passwordResetExpires to 10 minutes from now.

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
