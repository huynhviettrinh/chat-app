import ChatWelcomeScreen from "@/components/chat/ChatWelcomeScreen";
import ChatWindowBody from "@/components/chat/ChatWindowBody";
import ChatWindowHeader from "@/components/chat/ChatWindowHeader";
import ChatWindowSkeleton from "@/components/chat/ChatWindowSkeleton";
import MessageInput from "@/components/chat/MessageInput";
import { SidebarInset } from "@/components/ui/sidebar";
import { useChatStore } from "@/stores/useChatStore";

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading: loading,
  } = useChatStore();

  const selectConvo =
    conversations.find((convo) => convo._id === activeConversationId) ?? null;
  if (!selectConvo) {
    return <ChatWelcomeScreen />;
  }
  if (loading) {
    return <ChatWindowSkeleton />;
  }

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
      {/* Header */}
      <ChatWindowHeader chat={selectConvo} />

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground">
        <ChatWindowBody />
      </div>
      {/* Footer */}
      <MessageInput selectedConvo={selectConvo} />
    </SidebarInset>
  );
};

export default ChatWindowLayout;
