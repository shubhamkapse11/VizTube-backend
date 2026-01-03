const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/ApiError.js");
const { User } = require("../models/user.model.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (err) {
    throw new ApiError(
      500,
      "somthing wrong while generating refresh and access token"
    );
  }
};

const resgisterUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation
  // check if user already exist or not  hy username and email.
  // upload them to cloudinary , avatar
  // create user object - create entry in the db
  // remove password and refresh token  feild from  response
  // check for user creation
  // return response

  const { fullname, email, username, password } = req.body;

  // if(fullName ==""){
  //     ApiError(400 ,"fullname is required" )
  // }

  if (
    [fullname, email, username, password].some((feild) => feild?.trim() === "")
  ) {
    ApiError(400, "all feild are required");
  }
  //  console.log("emai=l", email ,"password=", password, "done")

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email  or username already exist ");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImgLocalPath =  req.files?.coverImage[0]?.path;
  let coverImgLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImgLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
  //  if(!coverImgLocalPath){
  //   throw new  ApiError(400 , "coverimg file is required");
  // }

  const avatarImg = await uploadOnCloudinary(avatarLocalPath);
  const coverImg = await uploadOnCloudinary(coverImgLocalPath);

  if (!avatarImg) {
    throw new ApiError(400, "avatarImg is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatarImg,
    coverImage: coverImg || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while restering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //check pass.
  //access and refresh token
  //send cookies

  const { email, username, password } = req.body;
  if (!username && !email) throw ApiError(400, "username or email is required");
  // if (!(username || email)) throw ApiError(400, "username or email is required");

  if (!password) {
    throw new ApiError(400, "username/email and password is required.");
  }
  const validUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!validUser) {
    throw new ApiError(400, "user is not register.");
  }

  const isPassVaild = await validUser.isPasswordCorrect(password);

  if (!isPassVaild) {
    throw new ApiError(401, "Invaid user credential.");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshTokens(validUser._id);
  const loggedInUser = await User.findById(validUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged In successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {

  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshAccessToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unautharized request");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshTokens(user._id)

    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed")

      )
  }
  catch (err) {
    throw new ApiError(401, err?.message || "invalid refresh token")
  }


});

const changeCurrentPassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "oldPassword and newPassword are required")
  }
  const user = await User.findById(req.user._id);
  const isPassValid = await user.isPasswordCorrect(oldPassword);
  if (!isPassValid) {
    throw new ApiError(400, "Invalid old password")
  }
  user.password = newPassword
  user.save({ validateBeforeSave: false })

  return res.status(200)
    .json(new ApiResponse(200, {}, "password successfully changed"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountdetails = asyncHandler(async (req, res) => {
  const { fullname, username } = req.body;
  if (!fullname || !username) {
    throw new ApiError(400, "All fieldsare required")
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email
      }
    },
    { new: true }
  ).select("-password")
  return res.status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required")
  }

  const avatarImg = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarImg) {
    throw new ApiError(400, "somthing went wrong while uploading avatar image")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatarImg
      }
    },
    { new: true }
  ).select("-password ")

  return res.status(200).json(new ApiResponse(200, user, "avatar image updated successfully"))

}

)

const updateUserCoverImg = asyncHandler(async (req, res) => {

  const coverImgLocalPath = req.file?.path;
  if (!coverImgLocalPath) {
    throw new ApiError(400, "coverImg file is required")
  }

  const coverImage = await uploadOnCloudinary(coverImgLocalPath);
  if (!coverImage) {
    throw new ApiError(400, "somthing went wrong while uploading avatar image")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage
      }
    },
    { new: true }
  ).select("-password ")
  return res.status(200).json(new ApiResponse(200, user, "cover image updated successfully"))

}
)

const getUserChannelProfile = asyncHandler(async (req, res) => {

  const { username } = req.params
  if (username?.trim()) {
    throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribeTo"
      }
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelSubscribeToCount: { $size: "$subscribeTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    { //values you wan to provide  only provide nessary and required values
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribeToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }


  ])
  // aggregation return array
  if (!channel || channel.length === 0) {
    throw new ApiError(404, "channel not found")
  }

  return res.status(200).json(new ApiResponse(200, channel[0], "channel profile fetched successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {

  const user = await User.aggregate([
    {
      $match: {
        // used mongoose here because req.user._id is string and _id in db is object id
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
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
          {//optional : to convert array to object
            $addFields: {
              owner: { $arrayElemAt: ["$owner", 0] } //{$first:"$owner"}
            }
          }
        ]
      }
    }
  ])

  return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "watch history fetched successfully"))

})

module.exports = {
  getUserChannelProfile, resgisterUser, loginUser, logOutUser,
  refreshAccessToken, getCurrentUser, changeCurrentPassword,
  updateAccountdetails, updateUserAvatar, updateUserCoverImg, getWatchHistory
};
