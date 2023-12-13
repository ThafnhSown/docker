"use strict";
const express = require("express");
const { authentication } = require("../../auth/authUtils");
const orderController = require("../../controllers/order.controller");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");

// router.use(asyncHandler(authentication));
router.post("/add", asyncHandler(orderController.addNewUserOrder));


module.exports = router;
