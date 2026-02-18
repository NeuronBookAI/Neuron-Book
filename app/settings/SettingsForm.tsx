"use client";

import { useState, useTransition } from "react";
import { upsertUserSettings, UserSettingsPayload } from "./actions";
import { SanityUser } from "../../src/types/sanity";

interface Props {
  clerkId: string;
  clerkName: string;
  clerkEmail: string;
  sanityUser: SanityUser | null;
}

const DAILY_GOALS = [15, 30, 45, 60, 90];
const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
] as const;
const REMINDER_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "never", label: "Never" },
] as const;
const DEPTH_OPTIONS = [
  { value: "surface", label: "Surface (recall)" },
  { value: "conceptual", label: "Conceptual (why/how)" },
  { value: "deep", label: "Deep (synthesis)" },
] as const;

export default function SettingsForm({ clerkId, clerkName, clerkEmail, sanityUser }: Props) {
  const prefs = sanityUser?.learningPreferences;
  const notifs = sanityUser?.notifications;

  const [username, setUsername] = useState(sanityUser?.username ?? clerkName);
  const [dailyGoal, setDailyGoal] = useState(prefs?.dailyGoalMinutes ?? 30);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(prefs?.difficultyLevel ?? "medium");
  const [reminder, setReminder] = useState<"daily" | "weekly" | "never">(prefs?.reminderFrequency ?? "daily");
  const [socraticDepth, setSocraticDepth] = useState<"surface" | "conceptual" | "deep">(prefs?.socraticDepth ?? "conceptual");

  const [studyReminders, setStudyReminders] = useState(notifs?.studyReminders ?? true);
  const [achievementAlerts, setAchievementAlerts] = useState(notifs?.achievementAlerts ?? true);
  const [weeklyReports, setWeeklyReports] = useState(notifs?.weeklyReports ?? false);
  const [reviewDueAlerts, setReviewDueAlerts] = useState(notifs?.reviewDueAlerts ?? true);

  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const payload: UserSettingsPayload = {
      clerkId,
      username,
      email: clerkEmail,
      learningPreferences: { dailyGoalMinutes: dailyGoal, difficultyLevel: difficulty, reminderFrequency: reminder, socraticDepth },
      notifications: { studyReminders, achievementAlerts, weeklyReports, reviewDueAlerts },
    };
    startTransition(async () => {
      await upsertUserSettings(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Display Name</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-400/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">Email</label>
            <div className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-gray-400 text-sm">
              {clerkEmail}
              <span className="ml-2 text-xs text-gray-500">(managed by Clerk)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Preferences */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Learning Preferences</h3>
        <div className="space-y-5">
          {/* Daily Goal */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">
              Daily Goal — <span className="text-teal-400">{dailyGoal} min</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {DAILY_GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setDailyGoal(g)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    dailyGoal === g
                      ? "bg-teal-400 text-[#0a0f12]"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {g} min
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Difficulty Level</label>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setDifficulty(o.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    difficulty === o.value
                      ? "bg-teal-400 text-[#0a0f12]"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Frequency */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Reminder Frequency</label>
            <div className="flex gap-2">
              {REMINDER_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setReminder(o.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    reminder === o.value
                      ? "bg-teal-400 text-[#0a0f12]"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Socratic Depth */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Socratic Question Depth</label>
            <div className="flex gap-2 flex-wrap">
              {DEPTH_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setSocraticDepth(o.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    socraticDepth === o.value
                      ? "bg-teal-400 text-[#0a0f12]"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-panel rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Notifications</h3>
        <div className="space-y-4">
          {(
            [
              { label: "Study Reminders", value: studyReminders, set: setStudyReminders },
              { label: "Achievement Alerts", value: achievementAlerts, set: setAchievementAlerts },
              { label: "Weekly Reports", value: weeklyReports, set: setWeeklyReports },
              { label: "Review Due Alerts", value: reviewDueAlerts, set: setReviewDueAlerts },
            ] as const
          ).map(({ label, value, set }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{label}</span>
              <button
                onClick={() => (set as (v: boolean) => void)(!value)}
                className={`w-12 h-6 rounded-full transition-colors relative ${value ? "bg-teal-500" : "bg-gray-600"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-7" : "left-1"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-[#0a0f12] px-6 py-2.5 rounded-xl font-semibold transition-all"
        >
          {isPending ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="text-teal-400 text-sm">✓ Settings saved</span>}
      </div>
    </div>
  );
}
