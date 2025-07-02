import dotenv from "dotenv";
import {app} from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path : "./.env"  // configuring the path 
})
const PORT = process.env.PORT || 8001;  // can use any port in case if 8001 is not available . 

connectDB()
.then(()=>{
    app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
    })
})
.catch((error)=>{
    console.log("MongoDb connection error", error)
})

