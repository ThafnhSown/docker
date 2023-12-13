"use strict";

const bookModel = require("../models/book.model")
const authorModel = require("../models/author.model")
const { BadRequestError, NotFoundError } = require("../core/error.response")

const {findOneBook, findAllBook, searchBookByDay, findAllBooksForUser } = require("../models/repositories/book.repo")
class BookService {
   static async addBook(body) {
    const {
        title,
        author, 
        year,
        publisher, 
        image
    } = body;

    const newBook = await bookModel.create({
      title,
      author, 
      year,
      publisher,
      image
    });

    return newBook;
   }
   static async findOneBook({ bookId }) {
    const foundBook = await findOneBook({ bookId , unSelect: ["__v"]});
    if(!foundBook) throw new NotFoundError("Cannot find this book")
    return foundBook
   }
   
   static async getAllBook({
    limit = 0,
    page = 1,
    sort = "ctime",
   }) {
    return await findAllBook({
      limit,
      sort,
      page,
      select: ["title", "author", "year", "publisher", "image"],
    })
   }
   static async findAllBooksForUser({
    limit=10, title, page=1, sort='ctime'
   }) {
    return await findAllBooksForUser({
      limit, title, page, sort, select: ["title", "author", "year", "publisher", "image"]
    })
   }
  
  static async searchBookByDay({day}) {
    return await searchBookByDay({day});
  }
  static async getBookByAuthor({author}) {
    await bookModel.aggregate([
      {
        $sort: { year: 1}
      }
    ])
    const book = await bookModel.aggregate([
      {
        $match: { author: author}
      },
      {
        $project: {title: 1, image: 1, year: 1}
      },
      {
        $sort: {year: 1}
      }
    ])

    return await book
  }
}



module.exports = BookService;