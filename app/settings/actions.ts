"use server";

import { writeClient } from "../../sanity/lib/write-client";
import { USER_BY_CLERK_ID_QUERY } from "../../sanity/lib/queries";

export interface UserSettingsPayload {
  clerkId: string;
  username: string;
  email: string;
  learningPreferences: {
    dailyGoalMinutes: number;
    difficultyLevel: "easy" | "medium" | "hard";
    reminderFrequency: "daily" | "weekly" | "never";
    socraticDepth: "surface" | "conceptual" | "deep";
  };
  notifications: {
    studyReminders: boolean;
    achievementAlerts: boolean;
    weeklyReports: boolean;
    reviewDueAlerts: boolean;
  };
}

export async function upsertUserSettings(payload: UserSettingsPayload) {
  // Use writeClient directly for both read and write — avoids defineLive auth requirements
  const existing = await writeClient.fetch(USER_BY_CLERK_ID_QUERY, {
    clerkId: payload.clerkId,
  });

  if (existing?._id) {
    await writeClient
      .patch(existing._id)
      .set({
        username: payload.username,
        email: payload.email,
        learningPreferences: payload.learningPreferences,
        notifications: payload.notifications,
      })
      .commit();
  } else {
    await writeClient.create({
      _type: "user",
      userId: payload.clerkId,
      username: payload.username,
      email: payload.email,
      learningPreferences: payload.learningPreferences,
      notifications: payload.notifications,
    });
  }
}
