import type { StreakInfo } from "@/lib/streak";

export default function StreakBadge({ streak, days, compact = false }: { streak: StreakInfo; days: { day: string; studied: boolean }[]; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "rounded-lg border border-line bg-white p-4"}`}>
      <div className="flex items-center gap-1" title="7 hari terakhir">
        {days.map((d) => (
          <span
            key={d.day}
            className={`h-3 w-3 rounded-full ${d.studied ? "bg-orange" : "bg-line"}`}
            title={`${d.day}: ${d.studied ? "belajar" : "tidak"}`}
          />
        ))}
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-navy">
          {streak.count} hari
          <span className="ml-1 font-normal text-mute">streak</span>
        </div>
        {!compact && (
          <div className="text-xs text-mute">
            {streak.studied_today ? "Hari ini sudah tercatat." : streak.at_risk ? "Akan putus malam ini kalau belum kuis atau unggah bukti." : "Belum ada hari belajar berturut."}
          </div>
        )}
        {compact && streak.at_risk && <div className="text-[11px] text-amber-700">akan putus malam ini</div>}
      </div>
    </div>
  );
}
