import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Không tìm thấy access token",
      });
    }
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (error, decodeUser) => {
        if (error) {
          console.error(error);
          return res.status(403).json({
            message: "Accesstoken hết hạn hoặc không đúng",
          });
        }
        const user = await User.findById(decodeUser.userId).select(
          "-hashedPassword",
        );

        if (!user) {
          return res.status(404).json({
            message: "Người dùng không tồn tại",
          });
        }

        req.user = user;
        next();
      },
    );
  } catch (error) {
    console.error("lỗi khi xác minh JWT trong authMiddleware", error);
    return res.status(500).json({
      message: "lỗi hệ thống",
    });
  }
};
