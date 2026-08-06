import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/dashboard/profile/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account details.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Avatar card */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700">
              {(profile?.fullName ?? user.email ?? "U").slice(0, 1).toUpperCase()}
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              {profile?.fullName ?? "—"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            <span className={[
              "mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-semibold",
              profile?.role === "ADMIN"     ? "bg-purple-100 text-purple-700" :
              profile?.role === "ORGANIZER" ? "bg-emerald-100 text-emerald-700" :
                                              "bg-blue-100 text-blue-700",
            ].join(" ")}>
              {profile?.role ?? "DONOR"}
            </span>

            <dl className="mt-5 space-y-3 text-left border-t border-slate-100 pt-5">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Member since</dt>
                <dd className="mt-0.5 text-sm text-slate-600">
                  {profile?.createdAt
                    ? profile.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Email verified</dt>
                <dd className={`mt-0.5 text-sm font-medium ${user.email_confirmed_at ? "text-emerald-600" : "text-amber-600"}`}>
                  {user.email_confirmed_at ? "Verified" : "Pending"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">User ID</dt>
                <dd className="mt-0.5 truncate font-mono text-xs text-slate-400">{user.id}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Edit form */}
        <div className="xl:col-span-2">
          <ProfileForm
            initialData={{
              fullName: profile?.fullName ?? user.user_metadata?.full_name ?? "",
              email: user.email ?? "",
              avatarUrl: profile?.avatarUrl ?? null,
            }}
          />
        </div>
      </div>
    </div>
  );
}
