const express = require("express");

const userController = require("../controllers/userController");

const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword); // This will receive only the email address
router.patch("/resetPassword/:token", authController.resetPassword); // This will receive the token as well as the new password

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword,
); // This "/updateMyPassword" route will be only work for logged in users , So we need to use the authController.protect
// middleware which will also put the user object on the request object and then once the user has verified that
// he is a logged in user with the "authController.protect" middleware then the next() will be called to the next middleware
// which is the "authController.updatePassword" middleware

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
