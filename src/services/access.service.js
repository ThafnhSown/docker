"use strict";

const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const UserService = require("./user.service");
const bcrypt = require("bcrypt");
const createKeys = require("../utils/createKey");
const crypto = require("node:crypto");
const { createTokenPair } = require("../auth/authUtils");
const KeyStoreService = require("./keyToken.service");
const getInfoData = require("../utils/getInfoData");
const verifyJWT = require("../utils/verifyJWT");
const { REFRESH_TOKEN_EXPIRATION, USER_ROLE } = require("../constant");
// const { createClient } = require("redis")
// const redisClient = createClient("redis://redis:6379")
// redisClient.on("error", (err) => {
//   console.log(err.message)
// })

// redisClient.connect().then( ()=> {
//   console.log("connected to redis")
// }).catch((err) => {
//   console.log(err.message)
// })

class AccessService {
  static signUp = async (req, res) => {
    const { name, email, password } = req.body;
    // check if email has already been registered
    const foundUser = await UserService.findByEmail({ email });
    if (foundUser) {
      throw new BadRequestError("Error: User has already been registered");
    }
    // hash password
    const passwordHash = await bcrypt.hash(password, 10);
    //create new account
    const newUser = await UserService.createUser({
      name,
      email,
      password: passwordHash,
    });

    // create user successfully
    if (newUser) {
      // create public key, private key
      const { privateKey, publicKey } = createKeys();
      console.log({ privateKey, publicKey });

      // create token pair
      const publicKeyObject = crypto.createPublicKey(publicKey);
      const privateKeyObject = crypto.createPrivateKey(privateKey);

      const tokens = await createTokenPair(
        {
          userId: newUser._id,
          email: email,
          roles: [USER_ROLE.USER],
        },
        publicKeyObject,
        privateKeyObject
      );

      const keyStore = await KeyStoreService.createKeyToken({
        userId: newUser._id,
        privateKey,
        publicKey,
        refreshToken: tokens.refreshToken,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: Key token is not available");
      }

      res.cookie("jwt", tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
      });

      return {
        code: "abc",
        user: await getInfoData({
          fields: ["_id", "name", "email"],
          object: newUser,
        }),
        tokens,
      };
    }
    return {
      code: 400,
      metadata: null,
    };
  };

  static logIn = async (req, res) => {
    const { email, password } = req.body;
    const cookies = req.cookies;
    // check if user exists
    const foundUser = await UserService.findByEmail({ email });
    if (!foundUser)
      throw new AuthFailureError("Error: Email or password is not correct");

    if (foundUser.oauthId) {
      throw new AuthFailureError(
        "This email has been used in other login methods"
      );
    }
    // compare password
    const match = bcrypt.compare(password, foundUser.password);
    if (!match) throw new AuthFailureError("Error: Unauthorized!");

    // create public key, private key
    const keyStore = await KeyStoreService.findByUserId(foundUser._id);
    if (!keyStore) throw new AuthFailureError("Error: User not found!");

    // create token pair
    const publicKeyObject = crypto.createPublicKey(keyStore.publicKey);
    const privateKeyObject = crypto.createPrivateKey(keyStore.privateKey);

    const tokens = await createTokenPair(
      {
        userId: foundUser._id,
        email: foundUser.email,
        roles: foundUser.roles,
      },
      publicKeyObject,
      privateKeyObject
    );

    const userKeyStore = await KeyStoreService.findByUserId(foundUser._id);

    const newRefreshTokens = !cookies?.jwt
      ? userKeyStore.refreshToken
      : userKeyStore.refreshToken.filter((rt) => rt !== cookies.jwt);

    // update keyToken schema
    await KeyStoreService.updateKeyToken({
      userId: foundUser._id,
      oldRefreshToken: !cookies?.jwt ? null : cookies.jwt,
      refreshToken: [...newRefreshTokens, tokens.refreshToken],
    });

    // clear old refresh token in cookies
    if (cookies?.jwt) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    // create secure cookie with refresh token
    res.cookie("jwt", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return {
      user: getInfoData({
        object: foundUser,
        fields: ["_id", "email", "roles", "verify"],
      }),
      tokens,
    };
  };

  static refreshToken = async (req, res) => {
    console.log("req", req.cookies);
    const refreshToken = req.cookies?.jwt;

    // check if user exists
    const holderToken = await KeyStoreService.findByRefreshToken(refreshToken);
    console.log("refreshToken: ", refreshToken, holderToken);
    if (!holderToken) throw new AuthFailureError("User not found!");

    // check valid refresh token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    // check if user not found
    const foundUser = await UserService.findByEmail({ email });
    if (!foundUser) throw new AuthFailureError("Unauthorized!");

    // check if refreshToken has been used previously
    const foundKeyTokenUsed = await KeyStoreService.findByRefreshTokenUsed(
      refreshToken
    );

    if (foundKeyTokenUsed) {
      // delete all tokens
      await KeyStoreService.removeAllTokens(foundKeyTokenUsed.userId);
      throw new ForbiddenError("Something went wrong, please try again!");
    }

    // create new tokens
    const tokens = await createTokenPair(
      { userId: userId, email: email, roles: foundUser.roles },
      holderToken.publicKey,
      holderToken.privateKey
    );

    //update tokens
    console.log("update tokens", holderToken, refreshToken);
    await holderToken
      .updateOne({
        refreshToken: [
          ...holderToken.refreshToken.filter((token) => token !== refreshToken),
          tokens.refreshToken,
        ],
        $push: {
          refreshTokenUsed: refreshToken, //token has been used
        },
      })
      .exec();

    // clear old refresh token in cookies
    if (req.cookies?.jwt) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    // create secure cookie with refresh token
    res.cookie("jwt", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return {
      user: getInfoData({
        fields: ["_id", "name", "email", "roles"],
        object: foundUser,
      }),
      accessToken: tokens.accessToken,
    };
  };

  // static logout = async (res, { keyStore, refreshToken }) => {
  //   // await updateKeyToken({
  //   //   userId: keyStore.userId,
  //   //   refreshToken: keyStore.refreshToken.filter((rt) => rt !== refreshToken),
  //   //   oldRefreshToken: refreshToken,
  //   // });

  //   redisClient.get(keyStore.userId, (err, data) => {
  //     if(err) {
  //       res.send({ err})
  //     }
  //     if(data !== null) {
  //       const parsedData = JSON.parse(data)
  //       parsedData[keyStore.userId].push(token)
  //       redisClient.setEx(keyStore.userId, 3600, JSON.stringify(parsedData))
  //       return res.send({
  //         status: "success",
  //         message: "log out"
  //       })
  //     }
  //     redisClient.setex(userId, 3600, JSON.stringify(blacklistData));
  //   return response.send({
  //       status: 'success',
  //       message: 'Logout successful',
  //   });
  // });
  
  //   res.clearCookie("jwt", {
  //     httpOnly: true,
  //     sameSite: "None",
  //     secure: true,
  //   });

  //   return {};
  // };

  static getProfile = async ({ accessToken, keyStore }) => {
    const user = await UserService.findByUserId({ userId: keyStore.userId });
    if (!user) throw new AuthFailureError("Unauthorized");

    return {
      user: getInfoData({
        fields: ["_id", "name", "email", "roles"],
        object: user,
      }),
    };
  };

  static oauthSuccess = async (req, res) => {
    console.log("req:: ", req);
    const cookies = req.cookies;
    if (req.user) {
      const userInfo = await UserService.findByUserId({ userId: req.user._id });
      if (!userInfo) throw new AuthFailureError("Unauthorized");

      // create public key, private key
      const keyStore = await KeyStoreService.findByUserId(userInfo._id);
      if (!keyStore) throw new AuthFailureError("Error: User not found!");

      // create token pair
      const publicKeyObject = crypto.createPublicKey(keyStore.publicKey);
      const privateKeyObject = crypto.createPrivateKey(keyStore.privateKey);

      const tokens = await createTokenPair(
        {
          userId: userInfo._id,
          email: userInfo.email,
          roles: userInfo.roles,
        },
        publicKeyObject,
        privateKeyObject
      );

      const userKeyStore = await KeyStoreService.findByUserId(userInfo._id);

      const newRefreshTokens = !cookies?.jwt
        ? userKeyStore.refreshToken
        : userKeyStore.refreshToken.filter((rt) => rt !== cookies.jwt);

      // update keyToken schema
      await KeyStoreService.updateKeyToken({
        userId: userInfo._id,
        oldRefreshToken: !cookies?.jwt ? null : cookies.jwt,
        refreshToken: [...newRefreshTokens, tokens.refreshToken],
      });

      // clear old refresh token in cookies
      if (cookies?.jwt) {
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
      }

      res.cookie("jwt", tokens.refreshToken, COOKIE_OPTIONS);

      res.cookie("userId", userInfo._id, COOKIE_OPTIONS);

      console.log("here");

      return {
        user: getInfoData({
          object: userInfo,
          fields: [
            "_id",
            "email",
            "name",
            "roles",
            "verify",
          ],
        }),
        tokens,
      };
    } else throw new BadRequestError("Bad request");
  };
}

module.exports = AccessService;
