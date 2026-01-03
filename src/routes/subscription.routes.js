const { Router } = require('express');
const {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} = require("../controllers/subscription.controller.js")
const {verifyJWT} = require("../middlewares/auth.middleware.js")

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

module.exports = router