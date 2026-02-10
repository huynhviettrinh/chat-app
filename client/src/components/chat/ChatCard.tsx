import { Card } from "@/components/ui/card";
import { formatOnlineTime, cn } from "@/lib/utils";
import { MoreHorizontal, Users } from "lucide-react";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subtitle: React.ReactNode;
  numMember?: number;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subtitle,
  numMember,
}: ChatCardProps) => {
  return (
    <Card
      // key={convoId}
      className={cn(
        "border-none p-3 cursor-pointer transition-smooth glass hover:bg-muted/30",
        isActive &&
          "ring-2 ring-primary/50 bg-gradient-to-tr from-primary-glow/10 to-primary-foreground", //bg-linear-to-tr
      )}
      onClick={() => onSelect(convoId)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">{leftSection}</div>

        <div className="flex-1 min-w-0 ">
          <></>

          {/* Tên friend / group */}
          <div className="flex items-center justify-between">
            <h3
              className={cn(
                "font-medium text-lg truncate",
                unreadCount && unreadCount > 0 && "text-foreground",
              )}
            >
              {name}
            </h3>

            <span className="text-base text-muted-foreground">
              {timestamp ? formatOnlineTime(timestamp) : ""}
            </span>
          </div>
          {numMember && (
            <div className="flex items-center text-xs">
              {" "}
              <p className="text-muted-foreground mr-0.5">{numMember}</p>
              <Users className="size-3 text-muted-foreground" />
            </div>
          )}

          {/* Tin nhắn */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {subtitle}
            </div>
            <MoreHorizontal
              className="size-4 text-muted-foreground opacity-0 
            group-hover:opacity-100 hover:size-5 transition-smooth"
            />
          </div>
          <></>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;
