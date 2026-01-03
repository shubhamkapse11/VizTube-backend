const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const tweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

module.exports = { Tweet: mongoose.model("Tweet", tweetSchema) };