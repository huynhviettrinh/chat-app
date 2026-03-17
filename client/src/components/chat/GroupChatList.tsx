import GroupChatCard from "@/components/chat/GroupChatCard";
import { useChatStore } from "@/stores/useChatStore";

const GroupChatList = () => {
  const { conversations } = useChatStore();
  if (!conversations) return;
  const groupChats = conversations.filter((conv) => conv.type === "group");

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {groupChats.map((convo) => (
        <GroupChatCard key={convo._id} convo={convo} />
      ))}
    </div>
  );
};

export default GroupChatList;
