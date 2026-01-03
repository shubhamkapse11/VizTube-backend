const mongoose = require("mongoose");
const { Video } = require("../models/video.model.js");
const { Subscription } = require("../models/subscription.model.js");
const { Like } = require("../models/like.model.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id;

    const channelStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $project: {
                likesCount: {
                    $size: "$likes"
                },
                views: 1
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$likesCount"
                },
                totalViews: {
                    $sum: "$views"
                },
                totalVideos: {
                    $sum: 1
                }
            }
        }
    ]);

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "subscribers"
        }
    ]);

    const stats = {
        totalSubscribers: subscribers[0]?.subscribers || 0,
        totalLikes: channelStats[0]?.totalLikes || 0,
        totalViews: channelStats[0]?.totalViews || 0,
        totalVideos: channelStats[0]?.totalVideos || 0
    };

    return res.status(200).json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;
    const videos = await Video.find({ owner: new mongoose.Types.ObjectId(userId) });
    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
})

module.exports = {
    getChannelStats,
    getChannelVideos
}