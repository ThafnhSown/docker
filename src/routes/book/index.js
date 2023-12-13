"use strict";

const express = require("express");
const BookController = require("../../controllers/book.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

router.post("/add", asyncHandler(BookController.addBook));
router.get("/search", asyncHandler(BookController.findAllBooksForUser))
router.get("/all", asyncHandler(BookController.getAllBook));
router.get("/author", asyncHandler(BookController.getBookByAuthor))
router.get("/:bookId", asyncHandler(BookController.findOneBook))

module.exports = router;
  