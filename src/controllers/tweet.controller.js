const mongoose = require("mongoose");
const { isValidObjectId } = require("mongoose");
const { Tweet } = require("../models/tweet.model.js");
const { User } = require("../models/user.model.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "content is required")
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })
    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 })
    // sort tweets by createdAt in descending order 
    return res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId try again")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweet trying to delete")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet deleted successfully"))
})

module.exports = {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
