import ChatCard from "@/components/chat/ChatCard";
import GroupChatAvatar from "@/components/chat/GroupChatAvatar";
import UnreadCountBadge from "@/components/chat/UnreadCountBadge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  const { user } = useAuthStore();
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();

  if (!user) return null;
  const unreadCount = convo.unreadCounts[user._id];
  const lastMessage = convo.lastMessage?.content ?? "";
  const nameGroup = convo.group?.name ?? "";
  let senderLastMessage;
  if (convo.lastMessage?.senderId._id !== user._id) {
    senderLastMessage = convo.lastMessage?.senderId.displayName.split(" ")[0];
  } else {
    senderLastMessage = "Bạn";
  }

  const handleSelectConversation = async (id: string) => {
    console.log(id);

    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages(id);
    }
  };

  return (
    <ChatCard
      convoId={convo._id}
      name={nameGroup ?? ""}
      numMember={convo.participants.length}
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
          {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
          <GroupChatAvatar participants={convo.participants} type="chat" />
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
          {senderLastMessage}
          {": "}
          {lastMessage}
        </p>
      }
    />
  );
};

export default GroupChatCard;
