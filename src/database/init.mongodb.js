"user strict";

const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const {
  db: { host, port, name },
} = require("../config/config.mongodb");
const connectString = `mongodb+srv://sonidabezt:kobukovu1710@cluster0.6xyvvse.mongodb.net/`;

class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    mongoose.set("debug", { color: true });
    mongoose
      .connect(connectString, {
        maxPoolSize: 50,
      })
      .then((_) => {
        console.log("Connect database successfully!");
        // count number of connections ->
        // countConnect();
      })
      .catch((err) => console.log("Error connecting: ", err));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
instanceMongodb.book = require('../models/book.model')(mongoose, mongoosePaginate)

module.exports = instanceMongodb;
