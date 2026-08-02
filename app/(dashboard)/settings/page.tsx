import { createClient } from "@/src/lib/supabase/server";
import SettingsForm from "@/src/components/dashboard/settings/SettingsForm";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? await prisma.profile.findUnique({ where: { id: user.id } })
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and platform preferences.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Form */}
        <div className="xl:col-span-2">
          <SettingsForm
            initialData={{
              fullName: profile?.fullName ?? user?.user_metadata?.full_name ?? "",
              email: user?.email ?? "",
              avatarUrl: profile?.avatarUrl ?? null,
              role: profile?.role ?? "DONOR",
              verificationStatus: profile?.verificationStatus ?? "PENDING",
            }}
          />
        </div>

        {/* Account info sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              Account Info
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  User ID
                </dt>
                <dd className="mt-0.5 truncate font-mono text-xs text-slate-600">
                  {user?.id ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email verified
                </dt>
                <dd className="mt-0.5 text-slate-600">
                  {user?.email_confirmed_at ? (
                    <span className="font-medium text-emerald-600">Yes</span>
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role
                </dt>
                <dd className="mt-0.5">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    {profile?.role ?? "DONOR"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Verification
                </dt>
                <dd className="mt-0.5">
                  {profile?.verificationStatus === "VERIFIED" ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Verified
                    </span>
                  ) : profile?.verificationStatus === "REJECTED" ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Rejected
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Member since
                </dt>
                <dd className="mt-0.5 text-slate-600">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-base font-semibold text-red-600">
              Danger Zone
            </h2>
            <p className="text-sm text-slate-500">
              Deleting your account is permanent and cannot be undone.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
