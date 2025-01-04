import mongoose from "mongoose";

const connectDB= async()=>{
    try {
        if(!process.env.MONGO_URI)console.log("HAI RAM")
        const conn=await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected');
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;