import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("CONEECTED TO MONGODB SUCCESSFULLY");
    } catch (error) {
        console.log("ERROR CONNECTING TO MONGODB", error);
        process.exit(1);
    }
}