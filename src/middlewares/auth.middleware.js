import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    const deCodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     const user = User.findById(deCodedToken._id)
    if (!user) {
      //todo : discuss about frontend
      throw new ApiError(401, "invalid access token");
    }
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, err.message || "invalid access token");
  }
});
