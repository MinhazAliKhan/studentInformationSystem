const express = require("express");
const { protect, isAdmin } = require("../middlewares/authMiddleware");
const { getAllUsers, getSingleUser, updateUser, deleteUser, adminDashboard } = require("../controllers/adminUserController");

const router = express.Router();

router.get("/users", protect, isAdmin, getAllUsers);
router.get("/users/:id", protect, isAdmin, getSingleUser);
router.put("/users/:id", protect, isAdmin, updateUser);
router.delete("/users/:id", protect, isAdmin, deleteUser);
router.get("/dashboard", protect, isAdmin, adminDashboard);

module.exports = router;
