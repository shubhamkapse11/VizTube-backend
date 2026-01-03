const mongoose = require("mongoose");
const { isValidObjectId } = require("mongoose");
const { Like } = require("../models/like.model.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

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
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                video: 1
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

module.exports = {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}