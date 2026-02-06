import ChatCard from "@/components/chat/ChatCard";
import StatusBadge from "@/components/chat/StatusBadge";
import UnreadCountBadge from "@/components/chat/UnreadCountBadge";
import UserAvatar from "@/components/chat/UserAvatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const { activeConversationId, setActiveConversation, messages } =
    useChatStore();
  if (!user) return null;

  const otherUser = convo.participants.find((p) => p._id !== user._id);

  if (!otherUser) return null;

  const unreadCount = convo.unreadCounts[user._id];
  const lastMessage = convo.lastMessage?.content ?? "";

  const handleSelectConversation = async (id: string) => {
    console.log(id);

    setActiveConversation(id);
    if (!messages[id]) {
      //  toaosdosaod
    }
  };

  return (
    <ChatCard
      convoId={convo._id}
      name={otherUser.displayName ?? ""}
      timestamp={
        convo.lastMessage?.createdAt
          ? new Date(convo.lastMessage.createdAt)
          : undefined
      }
      isActive={activeConversationId === convo._id}
      onSelect={handleSelectConversation}
      unreadCount={unreadCount}
      leftSection={
        <>
          <UserAvatar
            type="sidebar"
            name={otherUser.displayName ?? ""}
            avatarUrl={
              otherUser.avatarUrl ?? "https://github.com/evilrabbit.png"
            }
          />
          <StatusBadge status="online" />
          {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
        </>
      }
      subtitle={
        <p
          className={cn(
            "text-sm truncate",
            unreadCount > 0
              ? "font-medium text-foreground"
              : "text-muted-foreground",
          )}
        >
          {" "}
          {lastMessage}
        </p>
      }
    />
  );
};

export default DirectMessageCard;
