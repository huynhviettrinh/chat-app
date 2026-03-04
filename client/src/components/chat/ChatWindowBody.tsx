import ChatWelcomeScreen from "@/components/chat/ChatWelcomeScreen";
import MessageItem from "@/components/chat/MessageItem";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import InfinitScroll from "react-infinite-scroll-component";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
    fetchMessages,
  } = useChatStore();

  const [lastMessageStatus, setLastMessageStatus] = useState<
    "delivered" | "seen"
  >("delivered");

  const messages = allMessages[activeConversationId!]?.items ?? [];
  const reversedMessages = [...messages].reverse();
  const key = `chat-scroll-${activeConversationId}`;

  const hasMore = allMessages[activeConversationId!]?.hasMore ?? false; // true/false
  // lấy ra convo được đang được chọn
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) return;

    const seenBy = selectedConvo?.seenBy ?? [];

    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);

  useLayoutEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }
    messagesEndRef.current.scrollIntoView({ block: "center" });
  }, [activeConversationId]);

  const fetchMoreMessages = async () => {
    if (!activeConversationId) {
      return;
    }
    try {
      await fetchMessages(activeConversationId);
    } catch (error) {
      console.error("Lỗi fetchMoreMessages", error);
    }
  };

  const handleScrollSave = () => {
    const container = containerRef.current;
    if (!container || !activeConversationId) {
      return;
    }
    sessionStorage.setItem(
      key,
      JSON.stringify({
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      }),
    );
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const item = sessionStorage.getItem(key);
    if (item) {
      const { scrollTop } = JSON.parse(item);
      requestAnimationFrame(() => {
        container.scrollTop = scrollTop;
      });
    }
  }, [messages.length]);

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

  return (
    <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        id="scrollableDiv"
        onScroll={handleScrollSave}
        className="flex flex-col-reverse h-full overflow-y-auto overflow-x-hidden beautifull-scrollbar"
      >
        <div ref={messagesEndRef}></div>

        <InfinitScroll
          dataLength={messages.length}
          next={fetchMoreMessages}
          hasMore={hasMore}
          scrollableTarget="scrollableDiv"
          loader={<p>Đang tải...</p>}
          inverse={true}
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            overflow: "visible",
          }}
        >
          {reversedMessages.map((m, i) => {
            return (
              <MessageItem
                key={m._id ?? i}
                message={m}
                index={i}
                messages={reversedMessages}
                selectedConvo={selectedConvo}
                lastMessageStatus={lastMessageStatus}
              />
            );
          })}
        </InfinitScroll>
      </div>
    </div>
  );
};

export default ChatWindowBody;
