"use strict";

const { Types } = require("mongoose");

const getAcceptArray = (source, unAccept) => {
  let newArr = [];
  console.log("unAccept: ", unAccept);
  source.forEach((e) => {
    console.log("test: ", e, unAccept.includes(e));
    if (!unAccept.includes(e)) {
      newArr.push(e);
    }
  });

  return newArr;
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const getUnselectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    }
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      removeUndefinedObject(obj[key]);
    }
  });
  return obj;
};

const convertToObjectIdMongodb = (id) => new Types.ObjectId(id);

module.exports = {
  getSelectData,
  getUnselectData,
  removeUndefinedObject,
  convertToObjectIdMongodb,
  getAcceptArray,
};
