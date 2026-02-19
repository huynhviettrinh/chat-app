import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SocketState } from "@/types/store";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,

  connectSocket: () => {
    console.log("connectSocket");

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
  },

  disConnectSocket: () => {
    console.log("disConnectSocket");

    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
