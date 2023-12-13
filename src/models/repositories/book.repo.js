'use strict'

const books = require("../book.model")
const { isEmpty } = require("lodash");
const {
    getSelectData, getUnselectData, convertToObjectIdMongodb,
  } = require("../../utils/index");


const findOneBook = async({ bookId, unSelect }) => {
    return await books.findById(bookId).select(getUnselectData(unSelect)).exec()
}
const findAllBook = async ({
    limit=18, 
    page=1,
    sort="ctime",
    filter={},
}) => {
    const skip = limit*(page-1);
    const sortBy = sort === "ctime"?{year:-1} : {year:1};
    const documents = await books.find(filter).sort(sortBy).limit(limit).skip(skip).lean().exec();
    return documents
}
const findAllBooksForUser = async ({
    limit, title, page, sort, select
}) => {
    const skip = limit*(page - 1)
    const sortBy = sort === "ctime" ? { _id : -1} : { _id: 1 }
    let bookFilter = {}
    if(!isEmpty(title)) {
        const regexSearch = new RegExp(title)
        bookFilter.title = { $regex: regexSearch, $options: "i" }
    }
    const [book, count] = await Promise.all([
        books.aggregate([
            { $match: bookFilter },
            { $sort: sortBy },
            { $skip: skip },
            { $limit: limit },    
            { $project: getSelectData(select) },
        ]).exec(),books.countDocuments(bookFilter),
    ]);

    return { book, count };
}

const searchBook = async({ keywords }) => {
    const regexSearch = new RegExp(keywords);
    const res = await books.find({
        author: {
            $regex: new RegExp(regexSearch)
        },
    },)
    // { score: { $meta: "textScore" } })
    // .sort({ score: { $meta: "textScore" } })
    .lean().exec();
    return res;
}

const searchBookByDay = async( {day} ) => {
    const res = await books.aggregate([
        {
            $match: {
                "createdAt": {"$gte": new Date(day), $lt : new Date(day) }
            }
        }
    ])

    return res;
}

const updateStock = async({ id, quantity }) => {
    const foundBook = await books.findById(id)
    return await books.findOneAndUpdate({
        _id: convertToObjectIdMongodb(id),  
    },
    {
        $inc: { stock: -quantity}
    }
    ).exec()
}


module.exports = { findOneBook, findAllBook, searchBook, searchBookByDay, findAllBooksForUser, updateStock }