import FriendRequestItem from "@/components/friendRequest/FriendRequestItem";
import { useFriendStore } from "@/stores/useFriendStore";

const SentRequests = () => {
  const { sentList } = useFriendStore();
  if (!sentList)
    return (
      <p className="text-sm text-muted-foreground">
        Bạn chưa gửi lời mời kết bạn nào!
      </p>
    );

  return (
    <div className="space-y-3 mt-4">
      <>
        {sentList.map((req) => (
          <FriendRequestItem
            key={req._id}
            requestInfo={req}
            type="sent"
            actions={
              <p className="text-muted-foreground text-sm">
                Đang chờ trả lời...
              </p>
            }
          />
        ))}
      </>
    </div>
  );
};

export default SentRequests;
