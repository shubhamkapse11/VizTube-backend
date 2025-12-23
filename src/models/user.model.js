import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// we use pre-hook to encrypt and save before saving to db

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      // required : false
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  const res = await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (){
   return  jwt.sign({
        _id : this._id ,
        email:this.email,
        username : this.username,
        fullname : this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
       expiresIn : process.env.ACCESS_TOKEN_EXPIRY 
    }
)
 }

userSchema.methods.generateRefreshToken = function (){
     const token =   jwt.sign({
        _id : this._id ,
        // email:this.email,
        // username : this.username,
        // fullname : this.fullname,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
       expiresIn : process.env.REFRESH_TOCKEN_EXPIRY 
    }
)
return token ;
}


export const User = mongoose.model("User", userSchema);
