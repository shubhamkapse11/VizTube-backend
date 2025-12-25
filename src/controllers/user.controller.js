import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  if (!username || !email) throw ApiError(400, "username or email is required");
  if (!password) {
    throw new ApiError(400, "username/email and password is required.");
  }
  const validUser = User.findOne({
    $or: [{ email }, { username }],
  });

  if (!validUser) {
    throw new ApiError(400, "user is not register.");
  }

  const isPassVaild = await validUser.isPasswordCorrect(password);

  if (!isPassVaild) {
    throw new ApiError(401, "Invaid user credential.");
  }

  const {accessToken , refreshToken} = await generateAccessTokenAndRefreshTokens(validUser._id)
  const loggedInUser = await User.findById(validUser._id).select("-password -refreshToken")
  
  const options = {
    httpOnly :true ,
    secure:true
  }

  return res.status(200)
  .cookie("accessToken" , accessToken , options)
  .cookie("refreshToken" ,refreshToken,options)
  .json(new ApiResponse(200 ,{
    user : loggedInUser , accessToken , refreshToken
  }, "user logged In successfully")
  )


});


const logOutUser = asyncHandler(async(req , res)=>{
 await User.findByIdAndUpdate(req.user._id,{
    $set :{ refreshToken : undefined}
  },{
    new:true
  })

   const options = {
    httpOnly :true ,
    secure:true
  }
 
  return res.status.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out"))

})


export { resgisterUser , loginUser ,logOutUser };
