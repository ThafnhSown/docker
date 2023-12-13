'use strict'

const { Schema, model } = require("mongoose")
const DOCUMENT_NAME = "Author"
const COLLECTION_NAME = "author"

const authorSchema = new Schema({
    author: {
        type: String,
        require: true
    }
},
{
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, authorSchema)