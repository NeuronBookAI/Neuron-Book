import { defineField, defineType } from "sanity";
import { User } from "lucide-react";

export const userType = defineType({
  name: "user",
  title: "User Profile",
  type: "document",
  icon: User,
  fields: [
    defineField({
      name: "username",
      title: "User Name",
      type: "string",
    }),
    defineField({
      name: "userId",
      title: "Clerk User ID",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "ownedTextbooks",
      title: "My Library",
      type: "array",
      of: [{ type: "reference", to: [{ type: "textbook" }] }],
    }),
    defineField({
      name: "learningPreferences",
      title: "Learning Preferences",
      type: "object",
      fields: [
        defineField({
          name: "dailyGoalMinutes",
          title: "Daily Goal (minutes)",
          type: "number",
          initialValue: 30,
        }),
        defineField({
          name: "difficultyLevel",
          title: "Difficulty Level",
          type: "string",
          options: {
            list: [
              { title: "Easy", value: "easy" },
              { title: "Medium", value: "medium" },
              { title: "Hard", value: "hard" },
            ],
          },
          initialValue: "medium",
        }),
        defineField({
          name: "reminderFrequency",
          title: "Reminder Frequency",
          type: "string",
          options: {
            list: [
              { title: "Daily", value: "daily" },
              { title: "Weekly", value: "weekly" },
              { title: "Never", value: "never" },
            ],
          },
          initialValue: "daily",
        }),
        defineField({
          name: "socraticDepth",
          title: "Socratic Question Depth",
          type: "string",
          options: {
            list: [
              { title: "Surface (recall)", value: "surface" },
              { title: "Conceptual (why/how)", value: "conceptual" },
              { title: "Deep (synthesis)", value: "deep" },
            ],
          },
          initialValue: "conceptual",
        }),
      ],
    }),
    defineField({
      name: "notifications",
      title: "Notifications",
      type: "object",
      fields: [
        defineField({
          name: "studyReminders",
          title: "Study Reminders",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "achievementAlerts",
          title: "Achievement Alerts",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "weeklyReports",
          title: "Weekly Reports",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "reviewDueAlerts",
          title: "Review Due Alerts",
          type: "boolean",
          initialValue: true,
        }),
      ],
    }),
  ],
});
