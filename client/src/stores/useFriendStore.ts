import type { FriendState } from "@/types/store";
import { friendService } from "@/services/friendService";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
  loading: false,
  receivedList: [],
  sentList: [],

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

  async getAllFriendRequests() {
    try {
      set({ loading: true });
      const result = await friendService.getAllFriendRequests();
      if (!result) return;
      const { received, sent } = result;
      set({ receivedList: received, sentList: sent });
    } catch (error) {
      console.error(
        "Lỗi khi chạy getAllFriendRequests [useFriendStore.ts]",
        error,
      );
    } finally {
      set({ loading: false });
    }
  },

  async acceptRequests(requestId) {
    try {
      set({ loading: true });
      await friendService.acceptRequests(requestId);
      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }));
    } catch (error) {
      console.error("Lỗi khi chạy acceptRequests [useFriendStore.ts]", error);
    } finally {
      set({ loading: false });
    }
  },

  async declineRequests(requestId) {
    try {
      set({ loading: true });
      await friendService.declineRequests(requestId);
      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }));
    } catch (error) {
      console.error("Lỗi khi chạy declineRequests [useFriendStore.ts]", error);
    } finally {
      set({ loading: false });
    }
  },
}));
