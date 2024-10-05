const express = require("express");

const userController = require("../controllers/userController");

const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword); // This will receive only the email address
router.patch("/resetPassword/:token", authController.resetPassword); // This will receive the token as well as the new password

// Protects all routes after this middleware
router.use(authController.protect); // As we already know that middlewares run in sequence . So what this
// router.use(authController.protect) will do is , It will protect all the routes that comes after this line and if
// the user successfully logs in by using the authController.protect middleware then only the next() will be called
// and all the below routes will be called. So you can remove the "authController.protect" middleware from all the below
// routes as they all are already protected from this middleware

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword,
); // This "/updateMyPassword" route will be only work for logged in users , So we need to use the authController.protect
// middleware which will also put the user object on the request object and then once the user has verified that
// he is a logged in user with the "authController.protect" middleware then the next() will be called to the next middleware
// which is the "authController.updatePassword" middleware

router.get(
  "/me",
  // authController.protect,
  userController.getMe,
  userController.getUser,
);
router.patch(
  "/updateMe",
  // authController.protect,
  userController.updateMe,
); // Again this is a protected route as only the authenticated user is allowed to
// update his/her data of the current user. All of this is really secure because the ID of the user that is gonna be updated
// comes from the request.user which was set by this protect middleware which inturn got the ID from the Json Web Token and
// since no one can change the ID of the JSON Web Token without knowing the secret.

router.delete(
  "/deleteMe",
  //  authController.protect,
  userController.deleteMe,
);

router.use(authController.restrictTo("admin")); // This route will only work for admin users. So now by adding
// this restrictTo("admin") middleware , All the below routes can only be accessed by admins.

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
