const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const { model } = require("mongoose");

const subscriptionSchema = new Schema(
    {
        subscriber:{
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User"
        },

         channel :{
            type: Schema.Types.ObjectId, // one whom 'subscripber' is subscribing
            ref: "User"
        }


}, {timestamps:true})

module.exports = { Subscription: mongoose.model("Subscription" , subscriptionSchema) }