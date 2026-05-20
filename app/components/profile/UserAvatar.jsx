import { initialsFromName } from "@/lib/dashboard-format";

/**
 * @param {{
 *   name: string;
 *   avatarUrl?: string | null;
 *   className?: string;
 *   textClassName?: string;
 * }} props
 */
export function UserAvatar({
  name,
  avatarUrl,
  className = "w-11 h-11 rounded-full",
  textClassName = "text-sm",
}) {
  if (avatarUrl) {
    return (
      <img
        key={avatarUrl}
        src={avatarUrl}
        alt=""
        className={`object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      className={`bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold font-manrope ${className} ${textClassName}`}
      aria-hidden={!name}
    >
      {initialsFromName(name)}
    </span>
  );
}
