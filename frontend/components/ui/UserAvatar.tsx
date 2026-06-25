import Image from "next/image";
import { getImageUrl } from "@/lib/image";

interface UserAvatarProps {
  name?: string | null;
  avatarPath?: string | null;
  size?: number;   // px
  className?: string;
}

export function UserAvatar({ name, avatarPath, size = 32, className = "" }: UserAvatarProps) {
  const url = getImageUrl(avatarPath);
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image
          src={url}
          alt={name ?? ""}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span
          className="text-gold-deep font-semibold select-none"
          style={{ fontSize: Math.max(10, size * 0.38) }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
