const { Router } = require('express');
const {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} = require("../controllers/comment.controller.js")
const {verifyJWT} = require("../middlewares/auth.middleware.js")

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

module.exports = router