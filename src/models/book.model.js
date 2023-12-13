'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require("slugify");
const DOCUMENT_NAME = 'Book';
const COLLECTION_NAME = 'book';

// Declare the Schema of the Mongo model
const bookSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    author: {
      type: String,
      required: false,
    },
    year: {
      type: Number,
      required: false,
    },
    publisher: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    stock: {
      type: Number,
      required: false
    },
    slug: String,
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

bookSchema.index({ title: 'text'})
bookSchema.pre("save", function (next) {
  //add quantity, minPrice, maxPrice to product
  // this.slug = slugify(this.title, { lower: true });
  next();
});

//Export the model
module.exports = model(DOCUMENT_NAME, bookSchema);
