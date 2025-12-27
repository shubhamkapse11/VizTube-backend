import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mon"

const videoSchema = new mongoose.Schema(
    {

        videoFile: {
            type: string,
            required: true,

        },
        thumbnail: {
            type: string,
            required: true
        },
        title: {
            type: string,
            required: true
        },
        description: {
            type: string,
            required: true
        },
        duration: {
            type: Number, // cloudinary 
            required: true,
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)