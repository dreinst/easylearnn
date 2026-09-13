import "server-only";
import { redirect } from "next/navigation";
import { getProgress } from "./data";
import type { Progress, Settings } from "./types";

type Started = Progress & { settings: Settings & { program_start: string } };

/**
 * Layout dan page dirender paralel oleh Next, jadi page yang memakai tanggal mulai
 * harus menjaga dirinya sendiri, tidak cukup mengandalkan redirect di layout.
 */
export async function getStartedProgress(): Promise<Started> {
  const p = await getProgress();
  if (!p.settings.program_start) redirect("/roadmap");
  return p as Started;
}
