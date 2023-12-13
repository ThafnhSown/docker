"use strict";

const { BadRequestError } = require("../core/error.response");
const { findOneBook, updateStock } = require("../models/repositories/book.repo")
const orderModel = require("../models/order.model")

class OrderService {
  static async addNewUserOrder({ userId, bookId, quantity }) {    
    const foundBook = await findOneBook({ bookId, unSelect: ["__v"]})
      let productList = [];
      let totalPrice = 0;   
          if (foundBook.stock >= quantity) {
            productList.push({
              bookId: bookId,
              quantity: quantity,
            });
            totalPrice += 1;
          } else
            throw new BadRequestError(
              `${foundBook.title} đã hết hàng, vui lòng chọn lại`
            );
        //create order list
        const result = await Promise.all([
          await updateStock({
            id: bookId,
            quantity: quantity
          }), 
          await orderModel.create({
            userId: userId,
            book: productList[0],
            status: "PENDING",
          })
        ])
    return result;
  }
}

module.exports = OrderService;
