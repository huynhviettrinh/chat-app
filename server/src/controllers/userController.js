import User from "../models/User.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe controller", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const searchUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "Không nhận được username" });
    }

    const user = await User.findOne({ username }).select(
      "_id displayName username avatarUrl",
    );

    return res.status(200).json({ user });
  } catch (error) {
    console.error(
      "Lỗi khi gọi searchUserByUsername [userController.js]",
      error,
    );
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const file = req.file.buffer;
    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }
    const result = await uploadImageFromBuffer(file);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatarUrl: result.secure_url,
        avatarId: result.public_id,
      },
      {
        new: true, // tra ve user da dc cap nhat
      },
    ).select("avatarUrl");

    if (!updatedUser.avatarUrl) {
      return res.status(400).json({
        message: "Avatar null",
      });
    }

    return res.status(200).json({
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    console.error("Lỗi khi gọi uploadAvatar [userController.js]", error);
    return res.status(500).json({
      message: "Upload avatar failed",
    });
  }
};
