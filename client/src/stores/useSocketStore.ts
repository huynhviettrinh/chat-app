import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "@/stores/useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL; // url server chạy socket

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSoket = get().socket;

    if (existingSoket) return;

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });
    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
    });

    // online users status
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // new message
    socket.on(
      "new-message",
      ({ message, conversation: conversationSeleced, unreadCounts }) => {
        useChatStore.getState().addMessage(message);
        const lastMessage = {
          _id: conversationSeleced.lastMessage._id,
          content: conversationSeleced.lastMessage.content,
          createdAt: conversationSeleced.lastMessage.createdAt,
          senderId: {
            _id: conversationSeleced.lastMessage.senderId,
            displayName: "",
            avatarUrl: null,
          },
        };
        const updateConversation = {
          ...conversationSeleced,
          lastMessage,
          unreadCounts,
        };

        if (
          useChatStore.getState().activeConversationId ===
          message.conversationId
        ) {
          useChatStore.getState().markAsSeen();
        }

        useChatStore.getState().updateConversation(updateConversation);
      },
    );

    // read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      console.log("read-message");

      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };
      useChatStore.getState().updateConversation(updated);
    });
  },

  disConnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
