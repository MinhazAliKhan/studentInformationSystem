const express = require("express");
const {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validateMiddleware");

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} = require("../validators/authValidator");

const router = express.Router();

router.post("/register", registerValidation, validate, registerUser);
router.get("/verify/:token", verifyEmail); // token validated in controller (JWT)
router.post("/login", loginValidation, validate, loginUser);
router.post("/logout", logoutUser);

router.post("/forgot-password", forgotPasswordValidation, validate, requestPasswordReset);
router.post("/reset-password/:token", resetPasswordValidation, validate, resetPassword);
router.put("/change-password", protect, changePasswordValidation, validate, changePassword);

module.exports = router;
