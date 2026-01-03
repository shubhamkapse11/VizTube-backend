const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const commentSchema = new mongoose.Schema({
   content: {
      type: String,
      required: true
   },
   video: {
      type: Schema.Types.ObjectId,
      ref: "Video"
   },
   owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
   }
},
   { timestamps: true })

commentSchema.plugin(mongooseAggregatePaginate);
module.exports = { Comment: mongoose.model("Comment", commentSchema) }; 