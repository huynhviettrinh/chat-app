import UserAvatar from "@/components/chat/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message } from "@/types/chat";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const prev = messages[index - 1];
  const next = messages[index + 1];

  const isGroupBreak =
    index === 0 ||
    message.senderId !== prev.senderId ||
    // thời gian tin mới nhất và tin sau đó mà lớn hơn 5ph thì tạo mới
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      60000;

  const isShowTime =
    new Date(next?.createdAt).getTime() -
      new Date(message.createdAt).getTime() >
      60000 || message.senderId !== next?.senderId;

  const paricipant = selectedConvo.participants.find(
    (u) => u._id.toString() === message.senderId.toString(),
  );

  return (
    <div
      className={cn(
        "flex gap-2 message-bounce mt-1", // message-bounce hiệu ứng animation mờ và nhỏ -> rõ và lớn dần
        message.isOwn ? "justify-end" : "justify-start",
      )}
    >
      {/* Avatar */}
      {!message.isOwn && (
        <div className="w-8">
          {isGroupBreak && (
            <UserAvatar
              name={paricipant?.displayName ?? "Moji"}
              type="chat"
              avatarUrl={paricipant?.avatarUrl ?? undefined}
            />
          )}
        </div>
      )}

      {/* Content tin nhắn */}
      <div
        className={cn(
          "max-w-xs lg:max-w-md space-y-0 flex flex-col",
          message.isOwn ? "items-end" : "items-start",
        )}
      >
        <Card
          className={cn(
            "p-3",
            message.isOwn ? "chat-bubble-sent" : "bg-chat-bubble-received",
          )}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </Card>

        {/* Time */}
        {isShowTime && (
          <span
            className={cn(
              "text-sm text-muted-foreground px-1",
              message._id !== selectedConvo.lastMessage?._id ? "mb-4" : "",
            )}
          >
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        )}

        {/* Seen / delivered */}
        {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-1.5 py-0.5 h-4 border-0",
              lastMessageStatus === "seen"
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {lastMessageStatus}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
