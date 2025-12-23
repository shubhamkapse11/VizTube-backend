import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: "", // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFile) => {
  try {
    if (!localFile) return null;

    // upload file on cloudinary
   const response = await cloudinary.uploader.upload(localFile, {
      resource_type: "auto",
    });
    console.log("file finally uploaded on cloudinary ",response)
   return  response.url

  } catch (err) {
    fs.unlink(localFile)
    console.log("err while uloading on cloudinary");
  }
};

export {uploadOnCloudinary}