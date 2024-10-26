const jwt = require("jsonwebtoken");
// const sentry = require("@sentry/node");

const { User } = require("../models");
const {
  constants: { RESPONSE_MESSAGES },
} = require("../utils");
// const sendErrorReportToSentry = require("../utils/send-error-report-to-sentry");

const { JWT_SECRET } = process.env;

const createToken = (data) => jwt.sign(data, JWT_SECRET);

const decodeToken = (token) => jwt.verify(token, JWT_SECRET);

const verifyToken = async (req, res, next) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    return res
      .status(401)
      .json({ message: RESPONSE_MESSAGES.TOKEN_IS_REQUIRED, data: {} });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: RESPONSE_MESSAGES.TOKEN_IS_REQUIRED, data: {} });
  }

  try {
    const decodedToken = decodeToken(token);

    const { _id: userId } = decodedToken;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: RESPONSE_MESSAGES.INVALID_TOKEN,
        data: {},
      });
    }

    // sentry.setUser(user);
    req.user = user;

    next();
  } catch (err) {
    // sendErrorReportToSentry(err);
    console.log(err);

    return res.status(401).json({
      message: RESPONSE_MESSAGES.INVALID_TOKEN,
      data: {},
    });
  }
};

module.exports = { verifyToken, createToken, decodeToken };
