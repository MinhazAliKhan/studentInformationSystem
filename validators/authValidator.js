const { body } = require("express-validator");

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
  body("role").optional().isIn(["admin", "teacher", "student"]).withMessage("Invalid role"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Valid email required"),
];

const resetPasswordValidation = [
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 chars"),
];

const changePasswordValidation = [
  body("oldPassword").notEmpty().withMessage("Old password required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 chars"),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
};
