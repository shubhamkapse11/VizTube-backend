const { Router } = require('express');
const {
    getChannelStats,
    getChannelVideos,
} = require("../controllers/dashboard.controller.js")
const {verifyJWT} = require("../middlewares/auth.middleware.js")

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

module.exports = router