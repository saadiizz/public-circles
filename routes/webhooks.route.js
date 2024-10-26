const express = require("express");
const createError = require("http-errors");
const webhookDebugger = require("debug")("debug:webhook");
const axios = require("axios");

const { webhooksController } = require("../controllers");
const { EMAIL_STATS } = require("./models");

const router = express.Router();

router.post("/email-events", async (req, res, next) => {
  try {
    const messageType = req.headers["x-amz-sns-message-type"];

    // Parse the incoming SNS message
    const body = req.body;

    if (messageType === "Notification") {
      const message = JSON.parse(body.Message);

      let statDoc = await EMAIL_STATS.findOne({
        fromEmailAddress: message.mail.source,
        toEmailAddress: message.mail.destination[0],
      });

      if (!statDoc) {
        throw createError(400, { errorMessage: "Stats document missing!" });
      }

      statDoc.details = message;

      console.log(statDoc);

      await statDoc.save();
    } else if (messageType === "SubscriptionConfirmation") {
      const subscribeURL = body.SubscribeURL;

      await axios.get(subscribeURL);
    }
    res.sendStatus(200);
  } catch (err) {
    // sendErrorReportToSentry(error);
    console.log(err);

    webhookDebugger(err);

    next(err);
  }
});

module.exports = router;
