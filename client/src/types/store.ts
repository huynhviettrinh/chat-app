import type { Conversation, Message } from "@/types/chat";
import type { Friend, FriendRequest, User } from "@/types/user";
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

  setUser: (user: User) => void;
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
  loading: boolean;

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

  addConvo: (convo: Conversation) => void;

  createConversation: (
    type: "group" | "direct",
    name: string,
    memberIds: string[],
  ) => Promise<void>;
}
export interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disConnectSocket: () => void;
}
export interface FriendState {
  friends: Friend[];
  loading: boolean;
  receivedList: FriendRequest[];
  sentList: FriendRequest[];
  searchByUsername: (username: string) => Promise<User | null>;
  addFriend: (to: string, message?: string) => Promise<string>;
  getAllFriendRequests: () => Promise<void>;
  acceptRequests: (requestId: string) => Promise<void>;
  declineRequests: (requestId: string) => Promise<void>;
  getFriends: () => Promise<void>;
}
export interface UserState {
  loadingAvatar: boolean;
  updateAvatarUrl: (formData: FormData) => Promise<void>;
}
