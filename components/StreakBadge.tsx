import type { StreakInfo } from "@/lib/streak";
import Icon from "@/components/Icon";

export default function StreakBadge({ streak }: { streak: StreakInfo }) {
  const tone = streak.count > 0 ? "bg-accent/10 text-accent" : "bg-navy/5 text-mute";
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${tone}`}
      title={streak.studied_today ? "Hari ini sudah tercatat." : streak.at_risk ? "Akan putus malam ini kalau belum kuis." : "Belum ada hari belajar berturut."}
    >
      <Icon name="fire" className="h-3.5 w-3.5" />
      <span>{streak.count} hari</span>
      <span className="hidden sm:inline">beruntun</span>
      {streak.at_risk && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber" aria-label="akan putus malam ini" />}
    </div>
  );
}
