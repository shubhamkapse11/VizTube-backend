const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const likeSchema = new mongoose.Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    }
}, { timestamps: true })

module.exports = { Like: mongoose.model("Like", likeSchema) };