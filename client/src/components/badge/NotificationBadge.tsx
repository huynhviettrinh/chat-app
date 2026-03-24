const NotificationBadge = ({ numb }: { numb: number }) => {
  return (
    <div className="absolute flex -top-1 left-5 z-10 size-4 rounded-full border-2 border-card bg-red-500 items-center justify-center">
      <span className="text-white text-[10px]">{numb}</span>
    </div>
  );
};

export default NotificationBadge;
