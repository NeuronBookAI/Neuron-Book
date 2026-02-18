"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "../../sanity/lib/write-client";

export interface UploadTextbookResult {
  success: boolean;
  textbookId?: string;
  error?: string;
}

export async function uploadTextbook(formData: FormData): Promise<UploadTextbookResult> {
  try {
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null)?.trim();
    const folderId = (formData.get("folderId") as string | null) || null;

    if (!file) return { success: false, error: "No file provided" };
    if (!title) return { success: false, error: "Title is required" };

    // Upload the PDF as a Sanity file asset
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await writeClient.assets.upload("file", buffer, {
      filename: file.name,
      contentType: "application/pdf",
    });

    // Build the textbook document
    const doc = {
      _type: "textbook" as const,
      title,
      file: {
        _type: "file" as const,
        asset: { _type: "reference" as const, _ref: asset._id },
      },
      ...(folderId && {
        folder: [{ _type: "reference" as const, _ref: folderId, _key: folderId }],
      }),
    };

    const created = await writeClient.create(doc);
    revalidatePath("/library");
    revalidatePath("/dashboard");
    return { success: true, textbookId: created._id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return { success: false, error: msg };
  }
}
