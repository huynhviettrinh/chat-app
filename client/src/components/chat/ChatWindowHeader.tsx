import GroupChatAvatar from "@/components/chat/GroupChatAvatar";
import StatusBadge from "@/components/chat/StatusBadge";
import UserAvatar from "@/components/chat/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useSocketStore } from "@/stores/useSocketStore";
import type { Conversation } from "@/types/chat";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId } = useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);
  if (!chat) {
    return (
      <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }
  let otherUser;
  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((u) => u._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;
    if (!otherUsers || !user) return;
  }
  return (
    <header className="sticky top-0 z-10 flex px-4 py-2 items-center bg-background">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />

        <div className="p-2 w-full flex items-center gap-3">
          <div className="relative">
            {chat.type === "direct" ? (
              <>
                <UserAvatar
                  type="sidebar"
                  name={otherUser?.displayName || "Moji"}
                  avatarUrl={otherUser?.avatarUrl || undefined}
                />
                <StatusBadge
                  status={
                    onlineUsers.includes(otherUser?._id!) ? "online" : "offline"
                  }
                />
              </>
            ) : (
              <GroupChatAvatar
                participants={chat.participants}
                type="sidebar"
              />
            )}
          </div>
          <h2 className="font-semibold text-foreground">
            {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
          </h2>
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;
