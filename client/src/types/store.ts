import type { Conversation, Message } from "@/types/chat";
import type { User } from "@/types/user";
import type { Socket } from "socket.io-client";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  clearState: () => void;

  setAccessToken: (accessToken: string) => Promise<void>;

  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;

  signIn: (username: string, password: string) => Promise<void>;

  signOut: () => Promise<void>;

  fetchMe: () => Promise<void>;

  refreshToken: () => Promise<void>;
}
export interface ThemeState {
  isDark: boolean;
  toogleThem: () => void;
  setTheme: (dark: boolean) => void;
}
export interface ChatState {
  conversations: Conversation[];
  messages: Record<
    string,
    {
      items: Message[];
      hasMore: boolean;
      nextCursor?: string | null;
    }
  >;
  activeConversationId: string | null; // lưu id cuộc trò chuyện đang mở
  convoLoading: boolean;
  messageLoading: boolean;

  reset: () => void;

  setActiveConversation: (id: string | null) => void;

  fetchConversations: () => Promise<void>;

  fetchMessages: (conversationId?: string) => Promise<void>;

  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string,
  ) => Promise<void>;

  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string,
  ) => Promise<void>;

  addMessage: (message: Message) => Promise<void>;

  updateConversation: (conversation: any) => Promise<void>;

  markAsSeen: () => Promise<void>;
}
export interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disConnectSocket: () => void;
}
