// controllers/adminUserController.js
const User = require("../models/User");
const { createError } = require("../utils/createError");

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search = "", sortBy = "createdAt", order = "desc", role, verified } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
    if (role) filter.role = role;
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;

    const sortObj = {};
    sortBy.split(",").forEach((field) => {
      if (field) sortObj[field] = order === "asc" ? 1 : -1;
    });

    const users = await User.find(filter).sort(sortObj).skip(skip).limit(limit).select("-password");
    const total = await User.countDocuments(filter);

    res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id
const getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(createError(404, "User not found"));
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select("-password");
    if (!updated) return next(createError(404, "User not found"));
    res.json({ message: "User updated successfully", user: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError(404, "User not found"));

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/dashboard
const adminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVerified = await User.countDocuments({ isVerified: true });
    const totalUnverified = totalUsers - totalVerified;

    const usersPerRole = await User.aggregate([
      { $group: { _id: "$role", total: { $sum: 1 } } },
      { $project: { role: "$_id", total: 1, _id: 0 } },
    ]);

    const usersPerMonth = await User.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
      { $project: { year: "$_id.year", month: "$_id.month", total: 1, _id: 0 } },
    ]);

    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt");

    res.json({
      totalUsers,
      totalVerified,
      totalUnverified,
      usersPerRole,
      usersPerMonth,
      latestUsers,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  adminDashboard,
};
