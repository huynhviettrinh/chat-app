import FriendListModal from "@/components/CreateNewChat/FriendListModal";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useFriendStore } from "@/stores/useFriendStore";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

const CreateNewChat = () => {
  const [stateDialog, setStateDialog] = useState(false);
  const { getFriends } = useFriendStore();
  const handleGetFriends = async () => {
    await getFriends();
  };

  return (
    <div className="flex gap-2">
      <Dialog
        open={stateDialog}
        onOpenChange={(value) => {
          setStateDialog(value);
        }}
      >
        <Card
          className="flex-1 p-3 glass hover:shadow-soft transition-smooth cursor-pointer group/card"
          onClick={() => {
            handleGetFriends();
            setStateDialog(true);
          }}
        >
          <DialogTrigger>
            <div className="flex items-center gap-4">
              <div
                className="size-8 bg-gradient-chat rounded-full flex items-center 
              justify-center group-hover/card:scale-110 transition-bounce"
              >
                <MessageCircle className="size-4 text-white" />
              </div>
              <span className="text-sm font-medium capitalize">
                Gửi tin nhắn mới
              </span>
            </div>
          </DialogTrigger>
        </Card>

        <FriendListModal setStateDialog={setStateDialog} />
      </Dialog>
    </div>
  );
};

export default CreateNewChat;
