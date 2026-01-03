const mongoose = require("mongoose");
const { isValidObjectId } = require("mongoose");
const { Comment } = require("../models/comment.model.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Parse page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const comments = await Comment.find({ video: videoId })
        .select("content") // Select only the content field
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    if (!comments || comments.length === 0) {
        throw new ApiError(404, "No comments found for this video")
    }

    // ApiResponse(statusCode, data, message)
    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });

    if (!comment) {
        throw new ApiError(500, "Failed to add comment");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
})


const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not the owner of this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true,
            // runValidators: false
            // by default does NOT run validators findByIdAndUpdate
        }
    );

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})



const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const deleteComment = await Comment.deleteOne({ _id: commentId })
    if (deleteComment.deletedCount === 0) {
        throw new ApiError(404, "something went wrong while deleting");
    }
    return res.status(200).json(new ApiResponse(200, deleteComment, "success"))
})

module.exports = {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
