import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "../../src/components/Sidebar";
import { mockSidebarItems } from "../../src/data/mock";
import { sanityFetch } from "../../sanity/lib/live";
import { USER_BY_CLERK_ID_QUERY } from "../../sanity/lib/queries";
import SettingsForm from "./SettingsForm";

export default async function Settings() {
  const user = await currentUser();
  if (!user) redirect("/");

  const clerkId = user.id;
  const clerkName = user.fullName ?? user.username ?? "User";
  const clerkEmail = user.primaryEmailAddress?.emailAddress ?? "";

  const { data: sanityUser } = await sanityFetch({
    query: USER_BY_CLERK_ID_QUERY,
    params: { clerkId },
  });

  return (
    <div className="min-h-screen glass-bg">
      <div className="flex h-screen p-6 space-x-6">
        <Sidebar items={mockSidebarItems} />

        <div className="flex-1 glass-panel rounded-3xl p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400 mb-8">Manage your account and learning preferences.</p>

          <SettingsForm
            clerkId={clerkId}
            clerkName={clerkName}
            clerkEmail={clerkEmail}
            sanityUser={sanityUser ?? null}
          />
        </div>
      </div>
    </div>
  );
}

