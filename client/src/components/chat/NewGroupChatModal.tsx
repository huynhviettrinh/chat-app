import IniviteSuggestionList from "@/components/newGroupChat/IniviteSuggestionList";
import SelectedUsersList from "@/components/newGroupChat/SelectedUsersList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/types/user";
import { UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NewGroupChatModal = () => {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [invitedUsers, setInvitedUser] = useState<Friend[]>([]);

  const { friends, getFriends } = useFriendStore();
  const { loading, createConversation } = useChatStore();

  const handleGetFriends = async () => {
    await getFriends();
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(search.toLowerCase()) &&
      !invitedUsers.some((u) => friend._id === u._id),
  );

  const handleSelectFriend = (friend: Friend) => {
    setInvitedUser([...invitedUsers, friend]);
    setSearch("");
  };
  const handleRemoveFriend = (friend: Friend) => {
    setInvitedUser((prev) => {
      const filter = prev.filter((f) => f._id !== friend._id);
      return filter;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (invitedUsers.length === 0) {
        toast.warning("Bạn phải mời ít nhất một thành viên vào nhóm");
        return;
      }

      const listMemberIds = invitedUsers.map((u) => u._id);

      await createConversation("group", groupName, listMemberIds);

      setSearch("");
      setGroupName("");
      setInvitedUser([]);
    } catch (error) {
      console.error("Lỗi submit new group", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleGetFriends}
          className="flex z-10 justify-center items-center size-5 
        rounded-full hover:bg-sidebar-accent transition cursor-pointer"
        >
          <Users />
          <span className="sr-only">Tạo nhóm</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-[425px] border-none">
        <DialogHeader>
          <DialogTitle className="capitalize">Tạo nhóm chat mới</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-semibold">
              Tên nhóm
            </Label>
            <Input
              id="groupName"
              placeholder="Gõ tên nhóm vào đây..."
              className="glass border-border/50
              focus:border-primary/50 transition-smooth"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required={true}
            />
          </div>

          {/* mời thành viên */}
          <div className="space-y-2">
            <Label htmlFor="invite" className="text-sm font-semibold">
              Mời thành viên
            </Label>

            <Input
              id="invite"
              placeholder="Tìm theo tên hiển thị..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />

            {/* danh sách gợi ý */}
            {search && filteredFriends.length > 0 && (
              <IniviteSuggestionList
                filteredFriends={filteredFriends}
                onSelect={handleSelectFriend}
              />
            )}

            {/* danh sách user đã chọn */}
            <SelectedUsersList
              invitedUsers={invitedUsers}
              onRemove={handleRemoveFriend}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
            >
              {loading ? (
                <span>Đang tạo...</span>
              ) : (
                <>
                  <UserPlus className="size-4 mr-2" />
                  Tạo nhóm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupChatModal;
