"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "../../sanity/lib/write-client";

/** Update the masteryLevel (0–100) directly on a neuron document */
export async function updateNeuronMastery(neuronId: string, masteryLevel: number) {
  await writeClient
    .patch(neuronId)
    .set({ masteryLevel })
    .commit();
  revalidatePath("/network");
}

/** Delete a neuron document */
export async function deleteNeuron(neuronId: string) {
  await writeClient.delete(neuronId);
  revalidatePath("/network");
}

/** Create a brand-new neuron document */
export async function createNeuron(payload: {
  title: string;
  masteryLevel: number;
  synapseIds: string[];
}) {
  await writeClient.create({
    _type: "neuron",
    title: payload.title,
    masteryLevel: payload.masteryLevel,
    synapses: payload.synapseIds.map((id) => ({
      _type: "reference",
      _ref: id,
      _key: id,
    })),
  });
  revalidatePath("/network");
}
