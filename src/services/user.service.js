"use strict";

const { USER_ROLE } = require("../constant");
const userModel = require("../models/user.model");
const { ForBiddenError, BadRequestError } = require("../core/error.response")

const selectOptions = {
  email: 1,
  password: 1,
  name: 1,
  verify: 1,
  roles: 1,
  oauthId: 1,
  oauthStrategy: 1,
};

class UserService {
  static findByEmail = async ({ email, select = selectOptions }) => {
    return await userModel
      .findOne({ email: email })
      .select(select)
      .lean()
      .exec();
  };

  static findByUserId = async ({ userId, select = selectOptions }) => {
    return await userModel
      .findOne({ _id: userId })
      .select(select)
      .lean()
      .exec();
  };

  static createUser = async ({
    name,
    email,
    password,
    roles = [USER_ROLE.USER],
  }) => {
    return await userModel.create({
      name,
      email,
      password,
      roles,
    });
  };

  static createByOAuth = async ({
    name,
    email,
    oauthId,
    oauthStrategy,
    roles = [USER_ROLE.USER],
  }) => {
    return await userModel.create({
      name,
      email,
      roles,
      oauthId,
      oauthStrategy,
    });
  };

  static findByOAuthId = async (strategy, id, select = selectOptions) => {
    return await userModel
      .findOne({
        oauthId: id,
        oauthStrategy: strategy,
      })
      .select(select)
      .exec();
  };
  static registerAsAdmin = async({ userId }) => {
    const foundUser = await userModel.findById(userId).exec()
    if(!foundUser) throw new ForBiddenError("User not found")
    if(foundUser.isAdmin) throw new BadRequestError("User already registered as admin")

    foundUser.isAdmin = true;
    foundUser.roles.push(USER_ROLE.ADMIN)

    return await foundUser.save()

  }
}

module.exports = UserService;
