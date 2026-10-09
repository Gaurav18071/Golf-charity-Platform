import { Metadata } from "next";
import { User, Mail, Calendar, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and edit your profile information",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your profile information
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              A
            </div>
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
              <User className="h-4 w-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">Admin Demo</h2>
            <p className="text-muted-foreground">admin@golfcharity.com</p>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Admin</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <button className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="mt-1">Admin Demo</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="mt-1">admin@golfcharity.com</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <p className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Admin
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Account Activity</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Login
              </label>
              <p className="mt-1">Just now</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Total Donations
              </label>
              <p className="mt-1">View history →</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Campaigns Created
              </label>
              <p className="mt-1">View campaigns →</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
