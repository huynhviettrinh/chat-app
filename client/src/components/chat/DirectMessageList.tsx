import DirectMessageCard from "@/components/chat/DirectMessageCard";
import { useChatStore } from "@/stores/useChatStore";

const DirectMessageList = () => {
  const { conversations } = useChatStore();

  if (!conversations) return;
  const directConversation = conversations.filter(
    (conv) => conv.type === "direct",
  );

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversation.map((convo) => (
        <DirectMessageCard key={convo._id} convo={convo} />
      ))}
    </div>
  );
};

export default DirectMessageList;
