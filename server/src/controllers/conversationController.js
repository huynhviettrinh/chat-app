import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { io } from "../socket/index.js";

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id;

    if (
      !type ||
      (type === "group" && !name) ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res.status(400).json({
        message: "Tên nhóm và danh sách thành viên là bắt buộc",
      });
    }

    let conversation;

    if (type === "direct") {
      const participantId = memberIds[0];
      conversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [userId, participantId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          type: "direct",
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date(),
        });
        await conversation.save();
      }
    }

    if (type === "group") {
      conversation = new Conversation({
        type: "group",
        participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],
        group: {
          name,
          createdBy: userId,
        },
        lastMessageAt: new Date(),
      });
      await conversation.save();
    }

    if (!conversation) {
      return res.status(400).json({
        message: "Conversation type không hợp lệ",
      });
    }

    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl" },
      {
        path: "seenBy",
        select: " displayName avatarUrl",
      },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const participants = (conversation.participants || []).map((p) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    }));

    const formatted = { ...conversation.toObject(), participants };

    if (type === "group") {
      memberIds.forEach((memId) => {
        io.to(memId).emit("new-group", formatted);
      });
    }

    return res.status(201).json({
      conversation: formatted,
    });
  } catch (error) {
    console.error("Lỗi khi tạo conversation", error);
    return res.status(500).json({
      message:
        "Lỗi hệ thống [func createConversation in conversationController]",
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "displayName avatarUrl",
      });

    const formatted = conversations.map((conversation) => {
      const participants = (conversation.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }));

      return {
        ...conversation.toObject(),
        participants,
        unreadCounts: conversation.unreadCounts || {},
      };
    });

    return res.status(201).json({ conversations: formatted });
  } catch (error) {
    console.error("Lỗi khi tạo get conversation", error);
    return res.status(500).json({
      message: "Lỗi hệ thống [func getConversations in conversationController]",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    const query = { conversationId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) }; // lấy thời gian từ cursor trở xuống (tin nhắn quá khứ)
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }
    messages.reverse();

    return res.status(200).json({ messages, nextCursor });
  } catch (error) {
    console.error("Lỗi khi tạo get Messages", error);
    return res.status(500).json({
      message: "Lỗi hệ thống [func getMessages in conversationController]",
    });
  }
};

export const getUserConversationsForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      {
        "participants.userId": userId,
      },
      { _id: 1 },
    );

    return conversations.map((c) => c._id.toString());
  } catch (error) {
    console.error(
      "Lỗi hệ thống [func getUserConversationsForSocketIO in conversationController]",
      error,
    );

    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thây conversation" });
    }

    const lastMessage = conversation.lastMessage;

    if (!lastMessage) {
      return res
        .status(200)
        .json({ message: "Không có tin nhắn để mark as seen" });
    }
    if (userId === lastMessage.senderId.toString()) {
      return res.status(200).json({ message: "Sender không cần mark as seen" });
    }
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $addToSet: { seenBy: userId },
        $set: { [`unreadCounts.${userId}`]: 0 },
      },
      {
        new: true, // trả về dữ liệu đã update
      },
    ).populate({
      path: "lastMessage.senderId",
      select: "displayName avatarUrl",
    });

    io.to(conversationId).emit("read-message", {
      conversation: updated,
      lastMessage: {
        _id: updated?.lastMessage._id,
        content: updated?.lastMessage.content,
        createdAt: updated?.lastMessage.createdAt,
        senderId: {
          _id: updated.lastMessage.senderId._id,
          displayName: updated.lastMessage.senderId.displayName,
        },
      },
    });

    return res.status(200).json({
      message: "Marked as seen",
      seenBy: updated?.seenBy || [],
      myUnreadCount: updated?.unreadCounts[userId] || 0,
    });
  } catch (error) {
    console.error("Lỗi khi markAsSeen", error);
    return res.status(500).json({
      message: "Lỗi hệ thống [func markAsSeen in conversationController]",
    });
  }
};
