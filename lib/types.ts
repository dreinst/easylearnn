export type SourceKind =
  | "aqf_unit"
  | "university"
  | "standard"
  | "framework"
  | "guide"
  | "certification"
  | "course"
  | "textbook";

export type Phase = {
  id: number; // 0 = sepanjang program, 1..6 = fase mingguan
  name: string;
  week_from: number | null;
  week_to: number | null;
  rationale: string;
};

export type Unit = {
  unit_code: string;
  unit_name: string;
  is_core: boolean;
  url: string;
};

export type UniversityRef = {
  institution: string;
  programme: string;
  module: string;
  url: string;
  catalogue: string; // tahun katalog atau entri yang dirujuk
};

export type Source = {
  id: string;
  title: string;
  description: string;
  url: string;
  kind: SourceKind;
  publisher: string; // lembaga penerbit
  year: string; // tahun terbit atau pembaruan terakhir
  accreditation: string; // universitas terakreditasi, badan pemerintah, badan standar, asosiasi industri
  embeddable: boolean | null; // null = belum dicek
};

export type Question = {
  id: string;
  stem: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export type Topic = {
  slug: string;
  title: string;
  curriculum_ref: string;
  phase_id: number;
  week_from: number | null;
  week_to: number | null;
  summary: string;
  units: Unit[];
  university: UniversityRef[];
  points: string[];
  evidence_brief: string;
  sources: Source[];
  questions: Question[];
  sort_order: number;
};

export type Content = {
  version: number;
  program_weeks: number;
  phases: Phase[];
  topics: Topic[];
};

export type Settings = {
  display_name: string;
  timezone: string;
  program_start: string | null; // YYYY-MM-DD
  remind_time: string; // HH:MM
  remind_push: boolean;
};

export type QuizAttempt = {
  id: string;
  topic: string;
  answers: number[];
  score: number;
  total: number;
  passed: boolean;
  attempted_at: string;
};

export type Evidence = {
  id: string;
  topic: string;
  title: string;
  note: string;
  link: string | null;
  file: string | null; // nama file lampiran di folder jurnal/lampiran
  journal_file: string; // nama file .md di folder jurnal
  submitted_at: string;
};

export type StudyDay = {
  day: string; // YYYY-MM-DD di zona waktu profil
  trigger: "quiz" | "evidence";
};

export type PushSubscriptionRecord = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  created_at: string;
};

export type ReminderLog = {
  day: string;
  channel: "push";
  status: "sent" | "skipped_studied" | "failed";
  detail: string;
  sent_at: string;
};

export type Progress = {
  settings: Settings;
  quiz_attempts: QuizAttempt[];
  evidence: Evidence[];
  study_days: StudyDay[];
  push_subscriptions: PushSubscriptionRecord[];
  reminder_log: ReminderLog[];
};

export type TopicStatus = {
  quiz_passed: boolean;
  evidence_done: boolean;
  done: boolean;
  best_score: number | null;
  attempts: number;
};
