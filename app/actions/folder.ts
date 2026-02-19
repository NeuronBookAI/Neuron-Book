"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { writeClient } from "../../sanity/lib/write-client";
import { getOrCreateSanityUser } from "../../lib/sanity-user";

export interface CreateFolderResult {
  success: boolean;
  folderId?: string;
  error?: string;
}

export async function createFolder(
  title: string,
  parentFolderId?: string | null
): Promise<CreateFolderResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const trimmed = title.trim();
    if (!trimmed) return { success: false, error: "Folder name is required" };

    const clerkUser = await currentUser();
    const sanityUserId = await getOrCreateSanityUser({
      clerkId: userId,
      name: clerkUser?.fullName ?? clerkUser?.username ?? "User",
      email: clerkUser?.primaryEmailAddress?.emailAddress ?? "",
    });

    const doc = {
      _type: "folder" as const,
      title: trimmed,
      user: { _type: "reference" as const, _ref: sanityUserId },
      ...(parentFolderId && {
        parentFolder: { _type: "reference" as const, _ref: parentFolderId },
      }),
    };

    const created = await writeClient.create(doc);
    revalidatePath("/library");
    return { success: true, folderId: created._id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create folder";
    return { success: false, error: msg };
  }
}
