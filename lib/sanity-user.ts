import { writeClient } from "../sanity/lib/write-client";
import { USER_BY_CLERK_ID_QUERY } from "../sanity/lib/queries";

/**
 * Returns the Sanity user document _id for the given Clerk user,
 * creating the document automatically on first login if it doesn't exist.
 */
export async function getOrCreateSanityUser(opts: {
  clerkId: string;
  name: string;
  email: string;
}): Promise<string> {
  const existing = await writeClient.fetch(USER_BY_CLERK_ID_QUERY, {
    clerkId: opts.clerkId,
  });

  if (existing?._id) return existing._id;

  const created = await writeClient.create({
    _type: "user",
    userId: opts.clerkId,
    username: opts.name,
    email: opts.email,
  });

  return created._id;
}
