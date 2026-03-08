import type { FriendState } from "@/types/store";
import { friendService } from "@/services/friendService";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
  loading: false,

  async searchByUsername(username) {
    try {
      set({ loading: true });
      const user = await friendService.searchByUserName(username);
      return user;
    } catch (error) {
      console.error("Lỗi khi chạy searchByUsername [useFriendStore.ts]", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  async addFriend(to, message) {
    try {
      set({ loading: true });
      const resultMessage = await friendService.sendFriendRequest(to, message);
      return resultMessage;
    } catch (error) {
      console.error("Lỗi khi chạy addFriend [useFriendStore.ts]", error);
      return "Lỗi khi gửi kết bạn. Hãy thử lại";
    } finally {
      set({ loading: false });
    }
  },
}));
