import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// console.log(
//   process.env.CLOUDINARY_CLOUD_NAME,
//   process.env.CLOUDINARY_API_KEY,
//   process.env.CLOUDINARY_API_SECRET , "aaaaaaa"
// );
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFile) => {
  try {
    if (!localFile) return null;
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFile, {
      resource_type: "auto",
    });
    console.log("file finally uploaded on cloudinary ", response);
    // Delete local file after upload
    await fs.promises.unlink(localFile);
    return response.url;
  } catch (err) {
    // Try to delete the file if upload fails
    try {
      if (localFile) await fs.promises.unlink(localFile);
    } catch (delErr) {
      console.error("Error deleting file after failed upload:", delErr);
    }
    console.error("err while uploading on cloudinary", err);
    throw err;
  }
};

export {uploadOnCloudinary}