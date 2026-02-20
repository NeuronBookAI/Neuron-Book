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

export interface DeleteResult {
  success: boolean;
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

/**
 * Delete a textbook the current user owns.
 * Neurons referenced by the textbook are intentionally preserved.
 */
export async function deleteTextbook(textbookId: string): Promise<DeleteResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    // Verify ownership — only allow deleting own (non-demo) textbooks
    const book = await writeClient.fetch<{ _id: string; user?: { userId?: string }; isDemo?: boolean } | null>(
      `*[_type == "textbook" && _id == $id][0]{ _id, isDemo, user->{ userId } }`,
      { id: textbookId }
    );

    if (!book) return { success: false, error: "Textbook not found" };
    if (book.isDemo) return { success: false, error: "Demo content cannot be deleted" };
    if (book.user?.userId !== userId) return { success: false, error: "Not authorized" };

    // Remove this textbook from any folders that reference it
    const foldersWithBook = await writeClient.fetch<{ _id: string }[]>(
      `*[_type == "folder" && references($id)]{ _id }`,
      { id: textbookId }
    );
    if (foldersWithBook.length > 0) {
      const tx = writeClient.transaction();
      for (const folder of foldersWithBook) {
        tx.patch(folder._id, {
          unset: [`documents[_ref == "${textbookId}"]`],
        });
      }
      await tx.commit();
    }

    await writeClient.delete(textbookId);
    revalidatePath("/library");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete textbook";
    return { success: false, error: msg };
  }
}

/**
 * Delete a folder the current user owns.
 * Textbooks inside the folder are preserved (just unlinked from the folder).
 */
export async function deleteFolder(folderId: string): Promise<DeleteResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    // Verify ownership
    const folder = await writeClient.fetch<{ _id: string; user?: { userId?: string } } | null>(
      `*[_type == "folder" && _id == $id][0]{ _id, user->{ userId } }`,
      { id: folderId }
    );

    if (!folder) return { success: false, error: "Folder not found" };
    if (folder.user?.userId !== userId) return { success: false, error: "Not authorized" };

    // Move child folders to root (unset parentFolder)
    const childFolders = await writeClient.fetch<{ _id: string }[]>(
      `*[_type == "folder" && parentFolder._ref == $id]{ _id }`,
      { id: folderId }
    );
    if (childFolders.length > 0) {
      const tx = writeClient.transaction();
      for (const child of childFolders) {
        tx.patch(child._id, { unset: ["parentFolder"] });
      }
      await tx.commit();
    }

    await writeClient.delete(folderId);
    revalidatePath("/library");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete folder";
    return { success: false, error: msg };
  }
}
