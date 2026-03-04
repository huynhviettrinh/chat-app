import User from "../models/User.js";

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
