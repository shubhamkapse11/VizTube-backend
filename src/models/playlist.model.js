const mongoose = require("mongoose");
const { Schema } = mongoose;

const playlistSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        videos: [{
            type: Schema.Types.ObjectId,
            ref: "Video"
        }],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }, { timestamps: true })

module.exports = { Playlist: mongoose.model("Playlist", playlistSchema) };