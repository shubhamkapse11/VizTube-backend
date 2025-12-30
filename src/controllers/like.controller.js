import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Unliked video successfully"))
    } else {
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })
        return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Liked video successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Unliked comment successfully"))
    } else {
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })
        return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Liked comment successfully"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "invalid id")
    }
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        res.status(200).json(new ApiResponse(200, { isLiked: false }, "unliked tweet successfully."))
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        res.status(200).json(new ApiResponse(200, { isLiked: true }, "liked tweet successfully."))
    }


}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized")
    }
const likedVideos = await Like.aggregate([

  // 1️⃣ Filter likes:
  // - Only likes done by the current logged-in user
  // - Ensure the like is related to a video (not null / exists)
  {
    $match: {
      likedBy: mongoose.Types.ObjectId(req.user._id),
      video: { $exists: true, $ne: null }
    }
  },

  // 2️⃣ Join Like collection with Videos collection
  // - Match Like.video with Videos._id
  // - Store matched video document inside "videoDetails" array
  {
    $lookup: {
      from: "videos",
      localField: "video",
      foreignField: "_id",
      as: "videoDetails"
    }
  },

  // 3️⃣ Convert videoDetails array into a single object
  // - Removes array wrapper from lookup result
  {
    $unwind: "$videoDetails"
  },

  // 4️⃣ Replace the whole document with videoDetails
  // - Removes Like data
  // - Final output becomes only video document
  {
    $replaceRoot: { newRoot: "$videoDetails" }
  }

]);


    return res.status(200).json(new ApiResponse(200, likedVideos, "Fetched liked videos successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}