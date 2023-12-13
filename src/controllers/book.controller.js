'use strict';

const BookService = require("../services/book.service");
const { Created, SuccessResponse } = require("../core/success.response")
const { NotFoundError } = require("../core/error.response")
class BookController {
    static addBook = async(req,res, next) => {
      return new Created({
        message: "Adding a new Book",
        metadata: await BookService.addBook({
          ...req.body,
        })
      }).send(res);
    }
    static findOneBook = async(req, res) => {
      new SuccessResponse({
        message: "oke",
        metadata: await BookService.findOneBook({
          bookId: req.params.bookId,
        })
      }).send(res)
    }
    static getAllBook = async(req,res) => {
      new SuccessResponse({
        message: "find all oke",
        metadata: await BookService.getAllBook(req.query),
      }).send(res);
    }
    static findAllBooksForUser = async (req, res) => {
      new SuccessResponse({
        message: "find all books for user",
        metadata: await BookService.findAllBooksForUser({
          title: req.query.title,
          limit: req.query.pageSize,
          page: req.query.page,
        })
      }).send(res)
    }
    static searchBook = async(req,res) => {
      new SuccessResponse({
        message: "Searching success",
        metadata: await BookService.searchBook(req.params),
      }).send(res);
    }
    static searchBookByDay = async(req, res) => {
      new SuccessResponse({
        message: "Searching success",
        metadata: await BookService.searchBookByDay(req.params)
      }).send(res)
    }
    static getBookByAuthor = async(req, res) => {
      new SuccessResponse({
        message: "it's ok",
        metadata: await BookService.getBookByAuthor({author: req.query.author})
      }).send(res)
    }
}

module.exports = BookController;