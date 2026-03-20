import { create } from "zustand";
import type { UserState } from "@/types/store";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { useChatStore } from "@/stores/useChatStore";

export const useUserStore = create<UserState>((set, get) => ({
  loadingAvatar: false,
  updateAvatarUrl: async (formData) => {
    try {
      set({ loadingAvatar: true });
      const { user, setUser } = useAuthStore.getState();
      const data = await userService.uploadAvatar(formData);
      if (user) {
        setUser({
          ...user,
          avatarUrl: data.avatarUrl,
        });

        useChatStore.getState().fetchConversations();
      }
    } catch (err) {
      console.error("Lỗi khi update avatar url updateAvatarUrl", err);
      toast.error("Error update avatar");
    } finally {
      set({ loadingAvatar: false });
    }
  },
}));
