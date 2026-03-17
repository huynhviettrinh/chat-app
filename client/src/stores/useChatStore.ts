import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false, // convo loadling
      messageLoading: false,
      loading: false,

      setActiveConversation: (id) => set({ activeConversationId: id }),

      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        });
      },

      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchConversations();
          console.log(conversations);

          set({ conversations, convoLoading: false });
        } catch (error) {
          console.error(
            "Lỗi xảy ra tại: fetchConversations [useChatStore.ts]",
            error,
          );
          set({ convoLoading: false });
        }
      },

      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();
        const convoId = conversationId ?? activeConversationId;

        if (!convoId) return;

        const current = messages?.[convoId];

        const nextCursor =
          current?.nextCursor === undefined ? "" : current?.nextCursor;

        if (nextCursor === null) return;

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          );

          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));

          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed;

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor, // trả về boolean null => false, undifine => false, "abc" => true
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error(
            "Lỗi xảy ra tại: fetchMessages [useChatStore.ts]",
            error,
          );
        } finally {
          set({ messageLoading: false });
        }
      },

      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            activeConversationId || undefined,
            imgUrl,
          );

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error(
            "Lỗi xảy ra tại: sendDirectMessage [useChatStore.ts]",
            error,
          );
        }
      },

      sendGroupMessage: async (conversationId, content, imgUrl?) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendGroupMessage(
            content,
            conversationId || undefined,
            imgUrl,
          );

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error(
            "Lỗi xảy ra tại: sendGroupMessage [useChatStore.ts]",
            error,
          );
        }
      },

      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();

          message.isOwn = message.senderId === user?._id;
          const convId = message.conversationId;

          let prevItems = get().messages[convId]?.items ?? [];

          if (prevItems.length === 0) {
            await fetchMessages(convId);
            prevItems = get().messages[convId]?.items ?? [];
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }

            return {
              messages: {
                ...state.messages,
                [convId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convId].hasMore,
                  nextCursor: state.messages[convId].nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra tại: addMessage [useChatStore.ts]", error);
        }
      },

      updateConversation: async (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c,
          ),
        }));
      },

      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();

          if (!activeConversationId || !user) {
            return;
          }

          const convo = conversations.find(
            (c) => c._id === activeConversationId,
          );
          if (!convo) {
            return;
          }

          if ((convo.unreadCounts?.[user._id] ?? 0) === 0) {
            return;
          }

          await chatService.markAsSeen(activeConversationId);

          set((state) => {
            return {
              conversations: state.conversations.map((c) =>
                c._id === activeConversationId && c.lastMessage
                  ? {
                      ...c,
                      unreadCounts: { ...c.unreadCounts, [user._id]: 0 },
                    }
                  : c,
              ),
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra tại: markAsSeen [useChatStore.ts]", error);
        }
      },

      addConvo: (convo) => {
        set((state) => {
          const exists = state.conversations.some(
            (c) => c._id.toString() === convo._id.toString(),
          );

          return {
            conversations: exists
              ? state.conversations
              : [convo, ...state.conversations],
            activeConversationId: convo._id,
          };
        });
      },

      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true });
          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds,
          );
          get().addConvo(conversation);
          set({ activeConversationId: conversation._id });
          useSocketStore
            .getState()
            .socket?.emit("join-conversation", conversation._id);
        } catch (error) {
          console.error(
            "Lỗi xảy ra tại: createConversation [useChatStore.ts]",
            error,
          );
        } finally {
          set({ loading: false });
        }
      },
    }),

    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
);
