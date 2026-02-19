"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "../../sanity/lib/write-client";
import { getOrCreateSanityUser } from "../../lib/sanity-user";
import { auth, currentUser } from "@clerk/nextjs/server";

/** Update the masteryLevel (0–100) directly on a neuron document */
export async function updateNeuronMastery(neuronId: string, masteryLevel: number) {
  await writeClient.patch(neuronId).set({ masteryLevel }).commit();
  revalidatePath("/network");
}

/** Delete a neuron document */
export async function deleteNeuron(neuronId: string) {
  await writeClient.delete(neuronId);
  revalidatePath("/network");
}

/** Create a brand-new neuron document scoped to the current user */
export async function createNeuron(payload: {
  title: string;
  masteryLevel: number;
  synapseIds: string[];
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const clerkUser = await currentUser();
  const sanityUserId = await getOrCreateSanityUser({
    clerkId: userId,
    name: clerkUser?.fullName ?? clerkUser?.username ?? "User",
    email: clerkUser?.primaryEmailAddress?.emailAddress ?? "",
  });

  await writeClient.create({
    _type: "neuron",
    title: payload.title,
    masteryLevel: payload.masteryLevel,
    user: { _type: "reference", _ref: sanityUserId },
    synapses: payload.synapseIds.map((id) => ({
      _type: "reference",
      _ref: id,
      _key: id,
    })),
  });
  revalidatePath("/network");
}
