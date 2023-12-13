"use strict";

const express = require("express");
const AccessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const verifyAccessToken = require("../../middleware/verifyAccessToken");
const verifyRefreshToken = require("../../middleware/verifyRefreshToken");
const router = express.Router();

router.post("/signup", AccessController.signUp);
router.post("/login", asyncHandler(AccessController.logIn));
router.get("/oauth/success", asyncHandler(AccessController.oauthSuccess));
router.post("/logout", [
  asyncHandler(verifyRefreshToken),
  asyncHandler(AccessController.handleLogout),
]);
router.get("/auth/profile", [
    asyncHandler(verifyAccessToken),
    asyncHandler(AccessController.handleProfile),
  ]);

module.exports = router;
