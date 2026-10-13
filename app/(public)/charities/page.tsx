import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, CheckCircle2, Clock, MapPin, ExternalLink } from "lucide-react";
import { Prisma } from "@prisma/client";

// Force dynamic rendering to avoid database connection during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Charities() {
  let organizations: Array<{
    id: string;
    name: string;
    description: string | null;
    type: string;
    verificationStatus: string;
    address: string | null;
    city: string | null;
    state: string | null;
    _count: { campaigns: number };
    campaigns: Array<{
      id: string;
      title: string;
      currentAmount: Prisma.Decimal;
      goalAmount: Prisma.Decimal;
    }>;
  }> = [];
  
  try {
    organizations = await prisma.organization.findMany({
      where: {
        verificationStatus: {
          in: ["APPROVED", "UNDER_REVIEW"],
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        verificationStatus: true,
        address: true,
        city: true,
        state: true,
        _count: {
          select: {
            campaigns: true,
          },
        },
        campaigns: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
            title: true,
            currentAmount: true,
            goalAmount: true,
          },
          take: 3,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    organizations = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-700 mb-4">
            💚 Partner Organizations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the verified charitable organizations making a difference through our platform. 
            Every donation supports their important work in the community.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-green-600">
                {organizations.filter(org => org.verificationStatus === "APPROVED").length}
              </p>
              <p className="text-gray-600 mt-1">Verified Organizations</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">
                {organizations.reduce((sum, org) => sum + org._count.campaigns, 0)}
              </p>
              <p className="text-gray-600 mt-1">Total Campaigns</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">
                {organizations.filter(org => org.campaigns.length > 0).length}
              </p>
              <p className="text-gray-600 mt-1">Active Organizations</p>
            </div>
          </div>
        </div>

        {/* Organizations Grid */}
        {organizations.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto">
            <Building2 className="w-20 h-20 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              No Organizations Yet
            </h2>
            <p className="text-gray-600 mb-8">
              We&apos;re currently onboarding charitable organizations. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <Building2 className="w-10 h-10" />
                    {org.verificationStatus === "APPROVED" ? (
                      <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-semibold">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-yellow-400/30 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-semibold">Under Review</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{org.name}</h2>
                  <p className="text-green-100 text-sm">{org.type}</p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Location */}
                  {(org.city || org.state) && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">
                        {[org.city, org.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {org.description || "Supporting important causes in our community."}
                  </p>

                  {/* Campaign Count */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Active Campaigns</span>
                    <span className="text-lg font-bold text-green-600">
                      {org.campaigns.length}
                    </span>
                  </div>

                  {/* Active Campaigns Preview */}
                  {org.campaigns.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                        Current Campaigns
                      </p>
                      <div className="space-y-2">
                        {org.campaigns.map((campaign) => {
                          const currentAmt = Number(campaign.currentAmount);
                          const goalAmt = Number(campaign.goalAmount);
                          const progress = Math.min(
                            Math.round((currentAmt / goalAmt) * 100),
                            100
                          );
                          return (
                            <Link
                              key={campaign.id}
                              href={`/campaigns/${campaign.id}`}
                              className="block p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                            >
                              <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
                                {campaign.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-600"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600">{progress}%</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* View Organization Button */}
                  <Link
                    href={`/admin/organizations/${org.id}`}
                    className="block w-full py-3 px-4 bg-green-600 text-white text-center font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Organization
                    <ExternalLink className="inline-block w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16 p-12 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Want to Partner With Us?
          </h2>
          <p className="text-gray-600 mb-8">
            If you represent a charitable organization and want to create campaigns on our platform, 
            we&apos;d love to hear from you.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-colors shadow-lg hover:shadow-xl"
          >
            Become an Organizer
          </Link>
        </div>
      </div>
    </div>
  );
}
