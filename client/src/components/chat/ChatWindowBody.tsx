import ChatWelcomeScreen from "@/components/chat/ChatWelcomeScreen";
import MessageItem from "@/components/chat/MessageItem";
import { useChatStore } from "@/stores/useChatStore";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
  } = useChatStore();

  const messages = allMessages[activeConversationId!]?.items ?? [];

  // lấy ra convo được đang được chọn
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  if (!messages?.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Chưa có tin nhắn nào trong cuộc trò chuyện này.
      </div>
    );
  }

  // console.log(messages);

  return (
    <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden beautifull-scrollbar">
        {messages.map((m, i) => {
          return (
            <MessageItem
              key={m._id ?? i}
              message={m}
              index={i}
              messages={messages}
              selectedConvo={selectedConvo}
              lastMessageStatus="delivered"
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChatWindowBody;
