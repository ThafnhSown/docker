"use strict";

const express = require("express");
const UserController = require("../../controllers/user.controller");
const AccessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();
const { authentication } = require("../../auth/authUtils");

// router.use(asyncHandler(authentication));
router.post("/register", asyncHandler(UserController.registerAsAdmin));
router.post("/auth/signup", AccessController.signUp);
module.exports = router;
