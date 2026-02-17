import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useThemeStore } from "@/stores/useThemeStore";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { PopoverContent } from "@radix-ui/react-popover";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { isDark } = useThemeStore();

  return (
    <div>
      <Popover>
        <PopoverTrigger className="cursor-pointer">
          <Smile className="size-4" />
        </PopoverTrigger>

        <PopoverContent
          side="right"
          // sideOffset={40}
          className="bg-transparent border-none shadow-none drop-shadow-none mb-15 "
        >
          <Picker
            theme={isDark ? "dark" : "light"}
            data={data}
            onEmojiSelect={(emoji: any) => onChange(emoji.native)}
            emojiSize={24}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
