import bcrypt from "bcrypt";
import { validateAuthUser } from "../utils/util.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    const data = { username, password, email, firstName, lastName };

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message: `Không thể thiếu: ${validateAuthUser(data)}`,
      });
    }

    // kiểm tra username tồn tại chưa
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({
        message: "username đã tồn tại",
      });
    }
    // mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10);

    // tạo user mới
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${lastName} ${firstName}`,
    });

    // return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi call signUp", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = { username, password };

    if (!username || !password) {
      return res.status(400).json({
        message: `Không thể thiếu: ${validateAuthUser(data)}`,
      });
    }

    // kiểm tra username tồn tại chưa
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: "username hoặc password không chính xác",
        statusCode: 401,
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res.status(401).json({
        message: "username hoặc password không chính xác",
        statusCode: 401,
      });
    }

    // nếu khớp, tạo access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );
    // tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    // tạo session mới để luw refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
    // trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // backend, frontend deploy riêng
      maxAge: REFRESH_TOKEN_TTL,
    });

    // trả access token về trong res
    return res.status(200).json({
      message: `User ${user.displayName} đã logged in`,
      accessToken,
    });
    // return
  } catch (error) {
    console.error("Lỗi khi call signIn", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      await Session.deleteOne({ refreshToken: token });

      res.clearCookie("refreshToken");
    }

    res.status(204).json({
      message: "logout thành công",
    });
  } catch (error) {
    console.error("Lỗi khi call signOut", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "Token không tồn tại",
      });
    }
    const sesstion = await Session.findOne({ refreshToken: token });

    if (!sesstion) {
      return res.status(403).json({
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    if (sesstion.expiresAt < new Date()) {
      return res.status(403).json({
        message: "Token đã hết hạn",
      });
    }
    const newAccessToken = jwt.sign(
      {
        userId: sesstion.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );

    return res.status(200).json({
      accessToken: newAccessToken,
      message: "Đã gia hạn thành công accesstoken",
    });
  } catch (error) {
    console.error("Lỗi khi call refreshToken", error);
    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};
