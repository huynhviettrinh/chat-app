import UserAvatar from "@/components/chat/UserAvatar";
import type { FriendRequest } from "@/types/user";
import type { ReactNode } from "react";

interface RequestItemProps {
  requestInfo: FriendRequest;
  actions: ReactNode;
  type: "sent" | "received";
}

const FriendRequestItem = ({
  requestInfo,
  actions,
  type,
}: RequestItemProps) => {
  if (!requestInfo) return;

  const info = type === "sent" ? requestInfo.to : requestInfo.from;
  if (!info) {
    return;
  }

  return (
    <div
      className="flex items-center justify-between 
  rounded-lg shadow-md border-primary-foreground p-3"
    >
      <div className="flex items-center gap-3">
        <UserAvatar
          name={info.displayName}
          type="sidebar"
          avatarUrl={info.avatarUrl}
        />
        <div>
          <p className="font-medium">{info.displayName}</p>
          <p className="text-sm text-muted-foreground">@{info.username}</p>
        </div>
      </div>

      {actions}
    </div>
  );
};

export default FriendRequestItem;
