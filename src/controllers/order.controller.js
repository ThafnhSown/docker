"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const OrderService = require("../services/order.service");

class OrderController {
  static addNewUserOrder = async (req, res, next) => {
    return new Created({
      message: "Create orders successfully!",
      metadata: await OrderService.addNewUserOrder({
        userId: req.body.userId,
        bookId: req.body.bookId,
        quantity: req.body.quantity
      }),
    }).send(res);
  };

//   static getShopOrders = async (req, res) => {
//     return new SuccessResponse({
//       message: "Get shop orders successfully!",
//       metadata: await OrderService.getShopOrders({
//         userId: req.user.userId,
//       }),
//     }).send(res);
//   };

//   static getOrderByIdForShop = async (req, res, next) => {
//     return new SuccessResponse({
//       message: "Get order successfully!",
//       metadata: await OrderService.getOrderByIdForShop({
//         userId: req.user.userId,
//         orderId: req.params.id,
//       }),
//     }).send(res);
//   };

//   static confirmOrders = async (req, res, next) => {
//     return new SuccessResponse({
//       message: "Confirm order successfully!",
//       metadata: await OrderService.confirmOrders({
//         shopId: req.user.userId,
//         orderIds: req.body.orderIds,
//         io: res.io
//       }),
//     }).send(res);
//   };

//   static shippingOrders = async (req, res, next) => {
//     return new SuccessResponse({
//       message: "Shipping order successfully!",
//       metadata: await OrderService.shippingOrders({
//         shopId: req.user.userId,
//         orderIds: req.body.orderIds,
//         io: res.io
//       }),
//     }).send(res);
//   };

//   static rejectOrder = async (req, res, next) => {
//     return new SuccessResponse({
//       message: "Reject order successfully!",
//       metadata: await OrderService.rejectOrder({
//         shopId: req.user.userId,
//         orderId: req.body.orderId,
//         reason: req.body.reason,
//         io: res.io
//       }),
//     }).send(res);
//   };

//   static cancelOrder = async (req, res, next) => {
//     return new SuccessResponse({
//       message: "Cancel order successfully!",
//       metadata: await OrderService.cancelOrder({
//         userId: req.user.userId,
//         orderId: req.body.orderId,
//         reason: req.body.reason,
//         io: res.io
//       }),
//     }).send(res);
//   };

//   static getAndFilterOrder = async (req, res, next) => {
//     return new SuccessResponse({
//       message: "Filter order successfully!",
//       metadata: await OrderService.getAndFilterOrder({
//         shopId: req.user.userId,
//         body: req.query,
//       }),
//     }).send(res);
//   };

//   static getUserOrders = async (req, res, next) => {
//     return new SuccessResponse({
//       message: "Get orders successfully!",
//       metadata: await OrderService.getUserOrders({
//         userId: req.user.userId,
//         status: req.query.status,
//       }),
//     }).send(res);
//   };
}

module.exports = OrderController;
