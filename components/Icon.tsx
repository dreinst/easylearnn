const PATHS = {
  check: "M20 6 9 17l-5-5",
  "check-circle": "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-13 0 2 2 4-4",
  lock: "M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z",
  flag: "M4 22V4h12l-1 4 1 4H4",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14v4l3 2",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4 13h4",
  "arrow-right": "M5 12h14m-6-6 6 6-6 6",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z",
  quiz: "M9 11h6M9 15h4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  chevron: "m6 9 6 6 6-6",
  user: "M20 21a8 8 0 1 0-16 0m8-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  download: "M12 3v12m-5-5 5 5 5-5M5 21h14",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  menu: "M4 6h16M4 12h16M4 18h16",
  fire: "M12 22c4.4 0 7-3 7-7 0-3-2-5-3-6 0 2-1 3-2 3 0-3-1-6-4-8 0 3-2 5-4 7-1 1-1 2-1 4 0 4 2.6 7 7 7z",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
