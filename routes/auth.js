const express = require('express');
const router = express.Router();
const {upload} = require("../middleware/multer")
const { register, login , getMe , getUsers , getProfileImage , uploadProfileImage, getUserById, updateProfile} = require('../controllers/user');
const asyncHandler = require("express-async-handler")
const {authRequired} =require("../middleware/auth");


router.post("/register",asyncHandler(register));
router.post("/upload", authRequired("user") , upload.single('file') , asyncHandler(uploadProfileImage))
router.post("/login",asyncHandler(login))
router.put("/me",authRequired("user"),asyncHandler(updateProfile))
router.get("/me",authRequired("user"),asyncHandler(getMe))
router.get("/users",asyncHandler(getUsers))
router.get("/users/:id",asyncHandler(getUserById))
router.get("/:id/profileimage",asyncHandler(getProfileImage))

module.exports = router; 