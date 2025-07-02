import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";

dotenv.config();

// configuration settings cloudinary 
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET  ,
    });

const uploadonCloudinary = async(localFilePath) =>{
    try {
        if(!localFilePath) return null 
      const response = await  cloudinary.uploader.upload(
            localFilePath,
            {
            resource_type: "auto"
        })
        console.log("File uploaded on Cloudinary . File src: " + response.url)
        //deleteing the file from server once it uploaded 
        fs.unlinkSync(localFilePath )
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary = async(publicId) => {
    try {
        cloudinary.uploader.destroy(publicId)
        console.log("Deleting from cloudinary. Public id", publicId)
    } catch (error) {
        console.log("Error deleting from cloudinar", error)
        return null
    }
}
export {uploadonCloudinary , deleteFromCloudinary}

 