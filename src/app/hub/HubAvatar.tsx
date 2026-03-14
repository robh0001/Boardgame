"use client";

type HubAvatarProps = {
  name: string;
  moving?: boolean;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function HubAvatar({ name, moving = false }: HubAvatarProps) {
  const initials = initialsFromName(name);

  return (
    <div
      className={`relative flex h-16 w-14 items-end justify-center ${
        moving ? "translate-y-[1px]" : ""
      }`}
    >
      <div className="absolute bottom-0 h-3 w-10 rounded-full bg-black/30 blur-[3px]" />
      <div className="absolute bottom-3 h-7 w-8 rounded-t-[999px] rounded-b-xl bg-[linear-gradient(180deg,#38bdf8_0%,#2563eb_100%)]" />
      <div className="absolute bottom-9 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(180deg,#ffffff_0%,#dbeafe_100%)] text-[10px] font-extrabold text-slate-900 shadow-sm">
        {initials}
      </div>
      <div className="absolute bottom-5 left-[18px] h-4 w-[2px] rounded-full bg-slate-900" />
      <div className="absolute bottom-5 right-[18px] h-4 w-[2px] rounded-full bg-slate-900" />
    </div>
  );
}