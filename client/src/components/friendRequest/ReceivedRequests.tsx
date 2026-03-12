import FriendRequestItem from "@/components/friendRequest/FriendRequestItem";
import { Button } from "@/components/ui/button";
import { useFriendStore } from "@/stores/useFriendStore";
import { toast } from "sonner";

const ReceivedRequests = () => {
  const { receivedList, acceptRequests, declineRequests, loading } =
    useFriendStore();
  if (!receivedList || receivedList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Bạn chưa có lời mời kết bạn nào!
      </p>
    );
  }

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequests(requestId);
      toast.success("Đã đồng ý kết bạn thành công");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineRequests(requestId);
      toast.info("Đã từ chối kết bạn");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="space-y-3 mt-4">
      <>
        {receivedList.map((req) => (
          <FriendRequestItem
            key={req._id}
            requestInfo={req}
            type="received"
            actions={
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleAccept(req._id)}
                  disabled={loading}
                >
                  Chấp nhận
                </Button>
                <Button
                  size="sm"
                  variant="destructiveOutline"
                  onClick={() => handleDecline(req._id)}
                  disabled={loading}
                >
                  Từ chối
                </Button>
              </div>
            }
          />
        ))}
      </>
    </div>
  );
};

export default ReceivedRequests;
