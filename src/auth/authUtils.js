"use strict";

const JWT = require("jsonwebtoken");
const {
  REFRESH_TOKEN_EXPIRATION,
  ACCESS_TOKEN_EXPIRATION,
  HEADER,
} = require("../constant");
const { AuthFailureError } = require("../core/error.response");
const KeyStoreService = require("../services/keyToken.service");

const authentication = async (req, res, next) => {
  /**
   * work flows:
   * check userId
   * get accessToken
   * verify accessToken
   * check userId in dbs
   * check keyStore with userId
   * => next
   */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");
  const keyStore = await KeyStoreService.findByUserId(userId);
  if (!keyStore) throw new AuthFailureError("Invalid request");

  const authorization = req.headers[HEADER.AUTHORIZATION];
  if (!authorization) throw new AuthFailureError("Invalid request");

  const accessToken = authorization.split(" ")[1];
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid request");

    req.keyStore = keyStore;
    req.user = decodeUser;
    next();
  } catch (error) {
    throw new AuthFailureError("Invalid request");
  }
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // generate access token
    const accessToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });

    // generate refresh token
    const refreshToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) console.log("error verifying access token: ", err);
      console.log("decode: ", decode);
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("error generate token: ", error);
  }
};

module.exports = { createTokenPair, authentication };
