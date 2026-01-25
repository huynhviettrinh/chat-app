import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSRING, {
      dbName: "moji",
    });

    console.log("Connect DB succeed");
  } catch (error) {
    console.log("Error connect DB", error);
    process.exit(1);
  }
};
