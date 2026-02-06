import UserAvatar from "@/components/chat/UserAvatar";
import { AvatarGroup } from "@/components/ui/avatar";
import type { Participant } from "@/types/chat";
import { Ellipsis } from "lucide-react";

interface GroupChatAvatarProps {
  participants: Participant[];
  type: "chat" | "sidebar";
}

const GroupChatAvatar = ({ participants, type }: GroupChatAvatarProps) => {
  const avatars = [];
  const limit = Math.min(participants.length, 4);

  for (let index = 0; index < limit; index++) {
    const member = participants[index];

    avatars.push(
      <UserAvatar
        key={index}
        type={type}
        name={member.displayName}
        avatarUrl={member.avatarUrl ?? undefined}
      />,
    );
  }

  return (
    <div
      className="relative flex -space-x-2 *:data-[slot=avatar]:ring-background 
    *:data-[slot=avatar]:ring-2"
    >
      {avatars}

      {/* nếu nhiều hơn 4 avatar thì render dấu ... */}
      {avatars.length > 4 && (
        <div
          className="flex items-center z-10 justify-center size-8 rounded-full
       bg-muted ring-2 ring-background text-muted-foreground"
        >
          <Ellipsis className="size-4" />
        </div>
      )}
    </div>
  );
};

export default GroupChatAvatar;
