import EmojiPicker from "@/components/chat/EmojiPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { ImagePlus, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const { sendDirectMessage, sendGroupMessage } = useChatStore();

  const [value, setValue] = useState("");

  if (!user) return;

  const sendMessage = async () => {
    if (!value.trim()) return;
    const currentValue = value;
    setValue("");
    try {
      if (selectedConvo.type === "direct") {
        const recipientId = selectedConvo.participants.find(
          (u) => u._id !== user?._id,
        )?._id;
        await sendDirectMessage(recipientId!, currentValue);
      } else {
        await sendGroupMessage(selectedConvo._id, currentValue);
      }
    } catch (error) {
      console.error("Lỗi tại func sendMessage [Mesageinput.tsx]", error);
      toast.error("Lỗi xảy ra khi gửi tin nhắn. Bạn hãy thử lại!");
    }
  };

  const enterSendMessage = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-primary/10 transition-smooth"
      >
        <ImagePlus className="size-4" />
      </Button>

      <div className="flex-1 relative">
        <Input
          onKeyDown={enterSendMessage}
          className="pr-20 h-9 bg-white border-border/50 
          focus:border-primary/50 transition-smooth resize-none"
          value={value}
          placeholder="Soạn tin nhắn..."
          onChange={(e) => setValue(e.target.value)}
        />
        <div
          className="absolute right-2 top-1/2 transform
         -translate-y-1/2 flex items-center gap-1"
        >
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-primary/10 transition-smooth"
          >
            <div>
              <EmojiPicker onChange={(emoji) => setValue(`${value}${emoji}`)} />
            </div>
          </Button>
        </div>
      </div>
      <Button
        className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
        disabled={!value.trim()}
        onClick={sendMessage}
      >
        <Send className="size-4 text-white" />
      </Button>
    </div>
  );
};

export default MessageInput;
