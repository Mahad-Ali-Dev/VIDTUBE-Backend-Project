import mongooes from "mongoose";
import {DB_NAME} from "../constants.js";
// two things while establishing the connection in db 
// 1) should handle the error 
// 2) should use async function for connection 
const connectDB = async()=>{
    try {

        const connectionInstance = await mongooes.connect
        (`${process.env.MONGODB_URL}`);

        console.log(`\n MongoDb connected ! DB host : ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("MongoDB Connction error" , error)
        process.exit(1)
    }
}

export default connectDB ;