const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { createError } = require("../utils/createError");
const { transporter } = require("../config/mail");


// Generate JWT and set cookie
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

// Register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return next(createError(400, "User already exists"));

    const user = await User.create({ name, email, password, role });

    // Send verification email
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const link = `${process.env.CLIENT_URL}/verify/${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Verify your account",
      html: `<h2>Hi ${user.name}</h2><p>Click <a href="${link}">here</a> to verify your account</p>`,
    });

    res.status(201).json({ message: "Registered! Check email to verify." });
  } catch (err) {
    next(err);
  }
};

// Verify email
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(createError(404, "User not found"));
    if (user.isVerified) return res.json({ message: "User already verified" });
    user.isVerified = true;
    await user.save();
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    next(createError(400, "Invalid or expired token"));
  }
};

// Login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(createError(401, "Invalid credentials"));
    if (!user.isVerified) return next(createError(401, "Please verify email first"));
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return next(createError(401, "Invalid credentials"));
    generateToken(res, user._id);
    res.json({
      message: "Logged in successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// Logout
const logoutUser = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out" });
};

// Request password reset
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(createError(404, "User not found"));
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href="${link}">here</a> to reset password</p>`,
    });
    res.json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(createError(404, "User not found"));
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(createError(400, "Invalid or expired token"));
  }
};

// Change password (logged in)
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return next(createError(404, "User not found"));
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return next(createError(400, "Old password incorrect"));
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
};
