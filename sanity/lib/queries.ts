import { defineQuery } from "next-sanity";

// ── User ──────────────────────────────────────────────────────────────────────

export const USER_BY_CLERK_ID_QUERY = defineQuery(`
  *[_type == "user" && userId == $clerkId][0] {
    _id,
    username,
    email,
    userId,
    learningPreferences {
      dailyGoalMinutes,
      difficultyLevel,
      reminderFrequency,
      socraticDepth
    },
    notifications {
      studyReminders,
      achievementAlerts,
      weeklyReports,
      reviewDueAlerts
    }
  }
`);

// ── Textbooks ─────────────────────────────────────────────────────────────────

export const ALL_TEXTBOOKS_QUERY = defineQuery(`
  *[_type == "textbook" && (user->userId == $clerkId || isDemo == true)] | order(isDemo asc, _createdAt desc) {
    _id,
    title,
    isDemo,
    file { asset->{ url } },
    folder[]->{ _id, title },
    neurons[]->{ _id, title, masteryLevel },
    user->{ _id, username }
  }
`);

export const RECENT_TEXTBOOKS_QUERY = defineQuery(`
  *[_type == "textbook" && (user->userId == $clerkId || isDemo == true)] | order(isDemo asc, _createdAt desc)[0..4] {
    _id,
    title,
    isDemo,
    file { asset->{ url } },
    folder[]->{ _id, title },
    neurons[]->{ _id }
  }
`);

// ── Folders ───────────────────────────────────────────────────────────────────

export const ALL_FOLDERS_QUERY = defineQuery(`
  *[_type == "folder" && user->userId == $clerkId] | order(title asc) {
    _id,
    title,
    parentFolder->{ _id, title },
    documents[]->{ _id, title, file { asset->{ url } }, neurons[]->{ _id } }
  }
`);

// ── Neurons ───────────────────────────────────────────────────────────────────

export const ALL_NEURONS_QUERY = defineQuery(`
  *[_type == "neuron" && user->userId == $clerkId] | order(title asc) {
    _id,
    title,
    masteryLevel,
    synapses[]->{ _id, title, masteryLevel }
  }
`);

export const NEURONS_WITH_MASTERY_QUERY = defineQuery(`
  *[_type == "neuron" && (user->userId == $clerkId || isDemo == true)] | order(isDemo asc, title asc) {
    _id,
    title,
    masteryLevel,
    isDemo,
    synapses[]->{ _id, title, masteryLevel },
    "mastery": *[_type == "mastery" && references(^._id)][0] {
      _id,
      srs { lastReviewed, nextReviewDate, confidence, interval }
    },
    "textbook": *[_type == "textbook" && references(^._id)][0] {
      _id,
      title,
      file { asset->{ url } }
    }
  }
`);

export const NEURON_STATS_QUERY = defineQuery(`
  {
    "totalNeurons": count(*[_type == "neuron" && user->userId == $clerkId]),
    "totalSynapses": count(*[_type == "neuron" && user->userId == $clerkId && defined(synapses)].synapses[]),
    "avgMastery": math::avg(*[_type == "neuron" && user->userId == $clerkId].masteryLevel)
  }
`);

// ── Mastery / SRS ─────────────────────────────────────────────────────────────

export const ALL_MASTERY_QUERY = defineQuery(`
  *[_type == "mastery" && user->userId == $clerkId] | order(srs.nextReviewDate asc) {
    _id,
    title,
    user->{ _id, username },
    srs {
      lastReviewed,
      nextReviewDate,
      confidence,
      interval,
      neurons[]->{ _id, title, masteryLevel }
    }
  }
`);

// ── Dashboard stats ───────────────────────────────────────────────────────────

export const DASHBOARD_STATS_QUERY = defineQuery(`
  {
    "neuronCount": count(*[_type == "neuron" && user->userId == $clerkId]),
    "textbookCount": count(*[_type == "textbook" && user->userId == $clerkId]),
    "masteryCount": count(*[_type == "mastery" && user->userId == $clerkId])
  }
`);
