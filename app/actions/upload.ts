"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { writeClient } from "../../sanity/lib/write-client";
import { getOrCreateSanityUser } from "../../lib/sanity-user";

export interface UploadTextbookResult {
  success: boolean;
  textbookId?: string;
  fileUrl?: string;
  title?: string;
  error?: string;
}

export async function uploadTextbook(formData: FormData): Promise<UploadTextbookResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null)?.trim();
    const folderId = (formData.get("folderId") as string | null) || null;

    if (!file) return { success: false, error: "No file provided" };
    if (!title) return { success: false, error: "Title is required" };

    // Ensure Sanity user doc exists
    const clerkUser = await currentUser();
    const sanityUserId = await getOrCreateSanityUser({
      clerkId: userId,
      name: clerkUser?.fullName ?? clerkUser?.username ?? "User",
      email: clerkUser?.primaryEmailAddress?.emailAddress ?? "",
    });

    // Upload the PDF as a Sanity file asset
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await writeClient.assets.upload("file", buffer, {
      filename: file.name,
      contentType: "application/pdf",
    });

    const doc = {
      _type: "textbook" as const,
      title,
      file: {
        _type: "file" as const,
        asset: { _type: "reference" as const, _ref: asset._id },
      },
      user: { _type: "reference" as const, _ref: sanityUserId },
      ...(folderId && {
        folder: [{ _type: "reference" as const, _ref: folderId, _key: folderId }],
      }),
    };

    const created = await writeClient.create(doc);
    revalidatePath("/library");
    revalidatePath("/dashboard");
    return { success: true, textbookId: created._id, fileUrl: asset.url, title };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return { success: false, error: msg };
  }
}
