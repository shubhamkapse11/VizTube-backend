import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema({
   content:{
    type:String,
    required:true
   },
   video:{
    type:Schema.Types.ObjectId,
    ref:"Video"
   },
   owner:{
    type:Object.Types.ObjectId,
    ref:"User"
   }
},
{timestamps:true})

commentSchema.plugin(mongooseAggregatePaginate);
export const Comments = mongoose.model("Comments" , commentSchema); 