import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import SettingsPanel from "@/components/dashboard/settings/SettingsPanel";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account preferences and security settings.
        </p>
      </div>

      <SettingsPanel
        initialName={profile?.fullName ?? user.user_metadata?.full_name ?? ""}
        email={user.email ?? ""}
      />

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-red-600">Danger Zone</h2>
        <p className="mb-4 text-sm text-slate-500">
          Deleting your account is permanent and cannot be undone. All your data will be removed.
        </p>
        <button
          type="button"
          disabled
          className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
