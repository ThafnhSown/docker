'use strict'

const { SuccessResponse } = require('../core/success.response')
const UserService = require("../services/user.service")

class UserController {
    static registerAsAdmin = async(req,res,next) => {
        return new SuccessResponse({
            message: await UserService.registerAsAdmin({
                userId: req.user.userId
            })
        }).send(res)
    }
}

module.exports = UserController