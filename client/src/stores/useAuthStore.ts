import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";
import { useChatStore } from "@/stores/useChatStore";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        useChatStore.getState().reset();
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("chat-storage");
        sessionStorage.clear();
      },

      signUp: async (username, password, email, firstName, lastName) => {
        try {
          set({ loading: true });

          await authService.signUp(
            username,
            password,
            email,
            firstName,
            lastName,
          );
          toast.success("Đăng ký thành công");
        } catch (error) {
          console.error(error);
          toast.error("Đăng ký không thành công");
        } finally {
          set({ loading: false });
        }
      },
      signIn: async (username, password) => {
        try {
          set({ loading: true });

          get().clearState();
          useChatStore.getState().reset();

          const { accessToken, message } = await authService.signIn(
            username,
            password,
          );

          get().setAccessToken(accessToken);

          await get().fetchMe();
          useChatStore.getState().fetchConversations();

          toast.success("Chào mừng quay lại với Moji");
          return message;
        } catch (error) {
          console.error(error);
          toast.error("Đăng nhập không thành công");
        } finally {
          set({ loading: false });
        }
      },
      signOut: async () => {
        try {
          get().clearState();
          await authService.signOut();
          toast.success("Logout thành công");
        } catch (error) {
          console.error(error);
          toast.error("Lỗi xảy ra khi logout");
        }
      },

      fetchMe: async () => {
        try {
          set({ loading: true });
          const user = await authService.fetchMe();
          set({ user });
        } catch (error) {
          console.error(error);
          toast.error("Lỗi xảy ra khi lấy dữ liệu người dùng");
        } finally {
          set({ loading: false });
        }
      },

      refreshToken: async () => {
        try {
          set({ loading: true });
          const { user, fetchMe, setAccessToken } = get();
          const accessToken = await authService.refreshToken();
          setAccessToken(accessToken);

          if (!user) {
            fetchMe();
          }
        } catch (error) {
          console.error(
            "Lỗi xảy ra khi lấy refreshToken [stores / useAuthStore.ts]",
            error,
          );
          toast.error("Phiên đăng nhập đã hết hạn vui lòng đăng nhập lại");

          get().clearState();
        } finally {
          set({ loading: false });
        }
      },

      setAccessToken: async (accessToken: string) => {
        set({ accessToken });
      },

      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }), // chỉ persist user mới lưu vào local storage
    },
  ),
);
