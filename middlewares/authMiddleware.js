const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createError } = require("../utils/createError");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) return next(createError(401, "Not authorized"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(createError(401, "Not authorized"));
    req.user = user;
    next();
  } catch (err) {
    next(createError(401, "Token invalid"));
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return next(createError(403, "Admin only"));
  next();
};

const isTeacher = (req, res, next) => {
  if (req.user?.role !== "teacher") return next(createError(403, "Teacher only"));
  next();
};

const isStudent = (req, res, next) => {
  if (req.user?.role !== "student") return next(createError(403, "Student only"));
  next();
};

module.exports = { protect, isAdmin, isTeacher, isStudent };
