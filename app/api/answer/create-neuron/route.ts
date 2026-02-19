import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";
import { getOrCreateSanityUser } from "@/lib/sanity-user";

/** Map confidence score (1 | 3 | 5) to an initial mastery level (0–100). */
function toMasteryLevel(confidenceScore: number): number {
  if (confidenceScore >= 5) return 80;
  if (confidenceScore >= 3) return 50;
  return 20;
}

/** Derive a short concept title from the selected text or question. */
function deriveTitle(selectedText: string, question: string): string {
  if (selectedText.trim()) {
    // Take the first ~8 words from the selection as the concept label
    const words = selectedText.trim().split(/\s+/).slice(0, 8).join(" ");
    return words.length < selectedText.trim().length ? `${words}…` : words;
  }
  // Strip leading interrogative from the question
  return question
    .replace(/^(what|how|why|explain|describe|define)\s+/i, "")
    .split(/[.?!]/)[0]
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { selectedText = "", question = "", confidenceScore = 3 } =
    await req.json();

  const title = deriveTitle(selectedText, question);
  const masteryLevel = toMasteryLevel(Number(confidenceScore));

  const clerkUser = await currentUser();
  const sanityUserId = await getOrCreateSanityUser({
    clerkId: userId,
    name: clerkUser?.fullName ?? clerkUser?.username ?? "User",
    email: clerkUser?.primaryEmailAddress?.emailAddress ?? "",
  });

  const neuron = await writeClient.create({
    _type: "neuron",
    title,
    masteryLevel,
    user: { _type: "reference", _ref: sanityUserId },
    synapses: [],
  });

  return NextResponse.json({
    success: true,
    neuronId: neuron._id,
    title,
    masteryLevel,
  });
}
